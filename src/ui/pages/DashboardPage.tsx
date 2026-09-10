import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Card } from '@ui/components/ui/Card';
import { Skeleton } from '@ui/components/ui/Skeleton';
import { StatusBanner } from '@ui/components/ui/StatusBanner';
import { useExchangeRates } from '@ui/hooks/useExchangeRates';
import { FAB_ITEMS } from '@ui/components/layout/navigation';
import { formatNumber } from '@core/shared/Money';

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Pantalla de inicio tipo dashboard: saludo + accesos directos + pulso de tasas. */
export function DashboardPage() {
  const { table, status, errorMessage, refresh } = useExchangeRates();
  const usdToVes = table?.rates.VES;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink lg:text-3xl">
          {greetingForNow()} 👋
        </h1>
        <p className="mt-1 text-muted">¿Qué necesitas calcular hoy?</p>
      </div>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tasa de referencia</p>
          {status === 'loading' && !table ? (
            <Skeleton className="mt-2 h-7 w-40" />
          ) : (
            <p className="mt-1 text-xl font-extrabold text-ink">
              1 USD = {usdToVes ? formatNumber(usdToVes) : '—'} VES
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-border px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-500/50 sm:self-end"
          >
            <RefreshCw className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
            Actualizar tasa
          </button>
          {status === 'online' && <StatusBanner tone="success">Tasa actualizada.</StatusBanner>}
          {status === 'stale' && <StatusBanner tone="error">{errorMessage}</StatusBanner>}
          {status === 'error' && <StatusBanner tone="error">{errorMessage}</StatusBanner>}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {FAB_ITEMS.map(({ path, label, icon: Icon }, index) => (
          <Link key={path} to={path}>
            <Card hoverable className="flex h-full flex-col items-center gap-3 py-7 text-center">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  index % 2 === 0
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                    : 'bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400'
                }`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="font-semibold text-ink">{label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}