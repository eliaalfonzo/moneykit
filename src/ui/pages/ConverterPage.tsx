import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, RefreshCw } from 'lucide-react';
import { Card } from '@ui/components/ui/Card';
import { Dropdown } from '@ui/components/ui/Dropdown';
import { Input } from '@ui/components/ui/Input';
import { Skeleton } from '@ui/components/ui/Skeleton';
import { StatusBanner } from '@ui/components/ui/StatusBanner';
import { useExchangeRates } from '@ui/hooks/useExchangeRates';
import { useToast } from '@ui/context/ToastContext';
import { container } from '@composition/container';
import { SUPPORTED_CURRENCIES } from '@core/currency/domain/Currency';
import { crossRate } from '@core/currency/domain/ExchangeRate';
import { formatNumber } from '@core/shared/Money';

const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((currency) => ({
  value: currency.code,
  label: `${currency.code} — ${currency.name}`,
  icon: currency.flag,
}));

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'hace instantes';
  if (minutes === 1) return 'hace 1 minuto';
  if (minutes < 60) return `hace ${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'hace 1 hora';
  return `hace ${hours} horas`;
}

/** Herramienta protagonista: conversor de monedas con tasa en vivo y respaldo local. */
export function ConverterPage() {
  const { table, status, errorMessage, refresh } = useExchangeRates();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('500');
  const [from, setFrom] = useState('VES');
  const [to, setTo] = useState('USD');
  const [, forceTick] = useState(0);

  // Refresca el texto "hace X minutos" cada 30s sin volver a pedir la API.
  useEffect(() => {
    const interval = window.setInterval(() => forceTick((tick) => tick + 1), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const conversion = useMemo(() => {
    if (!table) return null;
    const numericAmount = parseFloat(amount.replace(',', '.'));
    const result = container.convertCurrency.execute(table, Number.isNaN(numericAmount) ? 0 : numericAmount, from, to);
    return result.ok ? result.value : null;
  }, [table, amount, from, to]);

  const conversionError = useMemo(() => {
    if (!table) return null;
    const numericAmount = parseFloat(amount.replace(',', '.'));
    const result = container.convertCurrency.execute(table, Number.isNaN(numericAmount) ? 0 : numericAmount, from, to);
    return result.ok ? null : result.error;
  }, [table, amount, from, to]);

  const unitRate = useMemo(() => {
    if (!table) return null;
    return crossRate(table, from, to) ?? null;
  }, [table, from, to]);

  function handleSwap() {
    setFrom(to);
    setTo(from);
  }

  async function handleCopy() {
    if (conversion === null) return;
    await navigator.clipboard.writeText(formatNumber(conversion.convertedAmount));
    showToast('Resultado copiado', 'success');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Conversor de monedas</h1>
        <p className="mt-1 text-muted">Consulta cuánto equivale una cantidad entre dos monedas.</p>
      </div>

      <Card className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Dropdown label="Moneda origen" options={CURRENCY_OPTIONS} value={from} onChange={setFrom} />
          <Dropdown label="Moneda destino" options={CURRENCY_OPTIONS} value={to} onChange={setTo} />
        </div>

        <Input
          label="Cantidad"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0"
          errorMessage={conversionError ?? undefined}
        />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Intercambiar monedas"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/50 active:scale-95"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          {status === 'loading' && !table ? (
            <Skeleton className="h-10 w-2/3" />
          ) : conversion ? (
            <div key={`${conversion.convertedAmount}-${to}`} className="animate-fade-slide-up">
              <p className="flex items-baseline gap-2 text-3xl font-extrabold text-ink">
                {formatNumber(conversion.convertedAmount)}
                <span className="text-lg font-bold text-muted">{to}</span>
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-500"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar resultado
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted">Introduce una cantidad para ver el resultado.</p>
          )}
        </div>

        {table && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
            <span>
              1 {from} = {formatNumber(unitRate ?? 0, 6)} {to} · Actualizado {formatRelativeTime(table.fetchedAt)}
            </span>
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-1.5 font-semibold text-ink transition-colors hover:text-brand-600"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        )}
      </Card>

      {status === 'online' && <StatusBanner tone="success">Tasa actualizada correctamente.</StatusBanner>}
      {(status === 'stale' || status === 'error') && errorMessage && (
        <StatusBanner tone="error">
          ⚠️ No se pudo actualizar la tasa. {status === 'stale' ? 'Usando la última guardada localmente.' : ''}
        </StatusBanner>
      )}
    </div>
  );
}
