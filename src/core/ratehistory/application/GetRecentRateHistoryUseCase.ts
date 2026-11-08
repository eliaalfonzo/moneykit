import { err, ok, type Result } from '@core/shared/Result';
import type { DateProvider } from '@core/shared/DateProvider';
import {
    addDays,
    applyNextBusinessDayRule,
    hasOwnRate,
    selectLastDays,
    toCaracasIsoDate,
    type DailyRate,
} from '../domain/DailyRate';
import type { RateHistoryRepository } from '../domain/ports/RateHistoryRepository';
import type { RateHistoryCache } from '../domain/ports/RateHistoryCache';

/** Siempre 5 días, para no complicarnos. */
export const HISTORY_DAYS = 5;

/** Cuántos días hacia adelante se busca la próxima tasa oficial (cubre fines de semana largos y feriados). */
const UPCOMING_LOOKAHEAD_DAYS = 7;

export interface RateHistoryOutcome {
    readonly entries: readonly DailyRate[];
    /** true si no se pudo consultar la API y se muestra la última copia guardada. */
    readonly fromCache: boolean;
}

/**
 * Caso de uso: obtener la tasa oficial de los últimos 5 días.
 *
 * - Sábados, domingos y feriados muestran la tasa publicada para el
 *   siguiente día hábil (la del lunes), que es la que realmente se usa.
 * - Si la API falla, usa la última copia guardada en el dispositivo.
 */
export class GetRecentRateHistoryUseCase {
    constructor(
        private readonly remote: RateHistoryRepository,
        private readonly cache: RateHistoryCache,
        private readonly dates: DateProvider,
    ) { }

    async execute(): Promise<Result<RateHistoryOutcome, string>> {
        const today = toCaracasIsoDate(this.dates.now());
        const remoteResult = await this.remote.fetchHistory();

        if (remoteResult.ok) {
            const withUpcoming = await this.withUpcomingRate(remoteResult.value, today);
            const entries = selectLastDays(applyNextBusinessDayRule(withUpcoming), today, HISTORY_DAYS);

            if (entries.length > 0) {
                this.cache.save(entries);
                return ok({ entries, fromCache: false });
            }
        }

        const cached = this.cache.load();
        if (cached.length > 0) return ok({ entries: cached, fromCache: true });

        return err(remoteResult.ok ? 'No hay tasas disponibles por ahora.' : remoteResult.error);
    }

    loadCached(): readonly DailyRate[] {
        return this.cache.load();
    }

    /**
     * Si hoy es sábado, domingo o feriado, el histórico puede no incluir aún
     * la tasa del lunes (el BCV la publica el viernes en la tarde pero rige
     * a partir de ese día). Se busca directamente la próxima tasa publicada.
     */
    private async withUpcomingRate(entries: readonly DailyRate[], today: string): Promise<readonly DailyRate[]> {
        const todayEntry = applyNextBusinessDayRule(entries).find((entry) => entry.date === today);
        const isUnresolved = todayEntry && !hasOwnRate(todayEntry) && (todayEntry.rateDate ?? todayEntry.date) <= today;
        if (!isUnresolved) return entries;

        for (let offset = 1; offset <= UPCOMING_LOOKAHEAD_DAYS; offset += 1) {
            const snapshot = await this.remote.fetchSnapshot(addDays(today, offset));
            if (snapshot.ok) return [...entries, snapshot.value];
        }
        return entries;
    }
}