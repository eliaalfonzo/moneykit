import { CalendarClock, History, RefreshCw } from 'lucide-react';
import { Card } from '@ui/components/ui/Card';
import { Skeleton } from '@ui/components/ui/Skeleton';
import { StatusBanner } from '@ui/components/ui/StatusBanner';
import { useRateHistory } from '@ui/hooks/useRateHistory';
import { HISTORY_DAYS } from '@core/ratehistory/application/GetRecentRateHistoryUseCase';
import { formatRate } from '@core/shared/Money';

/** "2026-11-06" -> partes legibles, sin depender de la zona horaria del dispositivo. */
function describeDate(isoDate: string): { weekday: string; dayMonth: string; year: string } {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
    const format = (options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('es-VE', { timeZone: 'UTC', ...options }).format(date);

    const weekday = format({ weekday: 'long' });
    return {
        weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
        dayMonth: format({ day: 'numeric', month: 'long' }),
        year: format({ year: 'numeric' }),
    };
}

/** Informativo: tasa oficial (BCV) de los últimos 5 días, con todos sus decimales. */
export function RateHistorySection() {
    const { entries, status, errorMessage, refresh } = useRateHistory();
    const isLoadingFirstTime = status === 'loading' && entries.length === 0;

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink lg:text-2xl">
                        <History className="h-5 w-5 text-accent-500" />
                        Tasa del dólar · últimos {HISTORY_DAYS} días
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                        Tasa oficial del BCV (Bs. por cada 1 USD). Los sábados, domingos y feriados rige la tasa del siguiente día
                        hábil. Solo informativo.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void refresh()}
                    aria-label="Actualizar histórico"
                    className="shrink-0 rounded-xl border border-border p-2.5 text-ink transition-colors hover:border-brand-500/50"
                >
                    <RefreshCw className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {status === 'stale' && (
                <StatusBanner tone="offline">
                    No se pudo actualizar. Mostrando las últimas tasas guardadas en este dispositivo.
                </StatusBanner>
            )}
            {status === 'error' && errorMessage && <StatusBanner tone="error">{errorMessage}</StatusBanner>}

            {isLoadingFirstTime ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: HISTORY_DAYS }, (_, index) => (
                        <Skeleton key={index} className="h-24 w-full rounded-2xl" />
                    ))}
                </div>
            ) : (
                <ul className="flex flex-col gap-3">
                    {entries.map((entry, index) => {
                        const { weekday, dayMonth, year } = describeDate(entry.date);
                        const isLatest = index === 0;

                        // Si ese día usa la tasa de otro día (p. ej. sábado -> tasa del lunes), se aclara.
                        const usesAnotherDay = entry.rateDate !== undefined && entry.rateDate !== entry.date;
                        const rateDay = usesAnotherDay && entry.rateDate ? describeDate(entry.rateDate) : null;

                        return (
                            <li key={entry.date}>
                                <Card
                                    className={`flex items-center justify-between gap-4 ${isLatest
                                            ? 'bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-500/10 dark:to-accent-500/10'
                                            : ''
                                        }`}
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                            {weekday}
                                            {isLatest && <span className="ml-2 text-brand-600 dark:text-brand-400">· Más reciente</span>}
                                        </p>
                                        <p className="text-2xl font-extrabold leading-tight text-ink">{dayMonth}</p>
                                        <p className="text-sm text-muted">{year}</p>

                                        {rateDay && (
                                            <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
                                                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                                                Rige la tasa del {rateDay.weekday.toLowerCase()} {rateDay.dayMonth}
                                            </p>
                                        )}
                                    </div>

                                    <p className="shrink-0 text-right font-mono text-3xl font-extrabold leading-none text-ink">
                                        {formatRate(entry.rate)}
                                        <span className="ml-1.5 text-base font-bold text-muted">Bs</span>
                                    </p>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}