import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, ArrowUpDown, ListPlus, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Card } from '@ui/components/ui/Card';
import { Input } from '@ui/components/ui/Input';
import { Dropdown } from '@ui/components/ui/Dropdown';
import { EmptyState } from '@ui/components/ui/EmptyState';
import { StatusBanner } from '@ui/components/ui/StatusBanner';
import { container } from '@composition/container';
import { useExchangeRates } from '@ui/hooks/useExchangeRates';
import { SUPPORTED_CURRENCIES, findCurrency } from '@core/currency/domain/Currency';
import { sumEntries, type AdderEntry } from '@core/adder/domain/AdderEntry';
import type { AdderSign } from '@core/adder/application/RecordAdderEntryUseCase';
import { Money } from '@core/shared/Money';

const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((currency) => ({
  value: currency.code,
  label: `${currency.code} — ${currency.name}`,
  icon: currency.flag,
}));

/** Bandera de una moneda por su código (p. ej. "USD" -> 🇺🇸), para mostrarla junto a los montos. */
function flagFor(code: string): string {
  return findCurrency(code)?.flag ?? '💱';
}

/** Genera un id simple y único para cada entrada (solo se usa como key/identificador local). */
function createEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Sumadora: para ir anotando montos que te van dictando (uno por uno) y
 * ver el TOTAL acumulado al instante, tanto en la moneda en la que te los
 * dictan como convertido a otra moneda — sin tener que sumar aparte y
 * después ir al conversor.
 */
export function AdderPage() {
  const { table, status, errorMessage } = useExchangeRates();

  const [entries, setEntries] = useState<readonly AdderEntry[]>(() => container.adderSession.load());
  const [amount, setAmount] = useState('');
  const [sign, setSign] = useState<AdderSign>('+');
  const [inputError, setInputError] = useState<string | null>(null);
  // Por defecto: dólares -> bolívares (igual que el Conversor). El botón
  // de invertir de aquí abajo permite cambiarlo al vuelo en cualquier momento.
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('VES');

  // Cada cambio en la lista se guarda al instante, así si recarga la
  // página a mitad de una cuenta larga no pierde lo que llevaba anotado.
  useEffect(() => {
    container.adderSession.save(entries);
  }, [entries]);

  const total = useMemo(() => sumEntries(entries), [entries]);

  const convertedTotal = useMemo(() => {
    if (!table) return null;
    const result = container.convertCurrency.execute(table, Math.abs(total), sourceCurrency, targetCurrency);
    return result.ok ? (total < 0 ? -result.value.convertedAmount : result.value.convertedAmount) : null;
  }, [table, total, sourceCurrency, targetCurrency]);

  function handleAddEntry() {
    const result = container.recordAdderEntry.execute(amount, sign);
    if (!result.ok) {
      setInputError(result.error);
      return;
    }

    setEntries((current) => [...current, { id: createEntryId(), amount: result.value }]);
    setAmount('');
    setInputError(null);
  }

  function handleRemoveEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function handleUndoLast() {
    setEntries((current) => current.slice(0, -1));
  }

  function handleClearAll() {
    setEntries([]);
    container.adderSession.clear();
  }

  /** Invierte "moneda de las cantidades" <-> "convertir total a" sin tener que reabrir los dos selectores. */
  function handleSwapCurrencies() {
    setSourceCurrency(targetCurrency);
    setTargetCurrency(sourceCurrency);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Sumadora</h1>
        <p className="mt-1 text-muted">
          Anota cada monto que te vayan dictando y mira el total acumulado al instante, en la moneda que
          necesites.
        </p>
      </div>

      {/* Los dos selectores de moneda con el botón de invertir justo en
          medio: en escritorio quedan en fila con la flecha ⇄ entre ambos;
          en pantallas angostas se apilan con la flecha ⇅ centrada entre uno y otro. */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Dropdown
            label="Moneda de las cantidades"
            options={CURRENCY_OPTIONS}
            value={sourceCurrency}
            onChange={setSourceCurrency}
          />
        </div>

        <button
          type="button"
          onClick={handleSwapCurrencies}
          aria-label="Invertir monedas"
          className="mx-auto flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border border-border bg-surface text-ink shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-500/50 active:scale-95 sm:mx-0 sm:mb-[13px] sm:self-auto"
        >
          <ArrowUpDown className="h-5 w-5 sm:hidden" />
          <ArrowLeftRight className="hidden h-5 w-5 sm:block" />
        </button>

        <div className="flex-1">
          <Dropdown
            label="Convertir total a"
            options={CURRENCY_OPTIONS}
            value={targetCurrency}
            onChange={setTargetCurrency}
          />
        </div>
      </div>

      <Card className="flex flex-col gap-4">
        {/* Fila para anotar: signo + monto + agregar. Pensada para escribir
            rápido y presionar Enter mientras te van dictando números. */}
        <div className="flex items-end gap-2">
          <div className="flex shrink-0 overflow-hidden rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setSign('+')}
              aria-pressed={sign === '+'}
              aria-label="Sumar"
              className={`flex h-[52px] w-11 items-center justify-center transition-colors ${
                sign === '+' ? 'bg-brand-500 text-white' : 'bg-surface text-muted hover:text-ink'
              }`}
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setSign('-')}
              aria-pressed={sign === '-'}
              aria-label="Restar"
              className={`flex h-[52px] w-11 items-center justify-center border-l border-border transition-colors ${
                sign === '-' ? 'bg-danger text-white' : 'bg-surface text-muted hover:text-ink'
              }`}
            >
              <Minus className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1">
            <Input
              inputMode="decimal"
              placeholder={`Monto en ${sourceCurrency} ${flagFor(sourceCurrency)}`}
              value={amount}
              errorMessage={inputError ?? undefined}
              onChange={(event) => {
                setAmount(event.target.value);
                if (inputError) setInputError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddEntry();
                }
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleAddEntry}
            aria-label="Agregar monto"
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-soft transition-all duration-200 hover:brightness-105 active:scale-95"
          >
            <ListPlus className="h-5 w-5" />
          </button>
        </div>

        {/* Lista de lo anotado hasta ahora, con opción de borrar cada línea
            por si se anotó algo mal (muy común cuando te van dictando). */}
        {entries.length === 0 ? (
          <EmptyState
            icon={ListPlus}
            title="Todavía no hay nada anotado"
            description="Escribe el primer monto de arriba y presiona Enter o el botón +."
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {entries.length} {entries.length === 1 ? 'monto anotado' : 'montos anotados'}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleUndoLast}
                  className="flex items-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-ink"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Deshacer último
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Limpiar todo
                </button>
              </div>
            </div>

            <ul className="flex max-h-56 flex-col gap-1 overflow-auto">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className={`flex items-center gap-1.5 font-mono font-semibold ${entry.amount < 0 ? 'text-danger' : 'text-ink'}`}>
                    <span className="text-base leading-none">{flagFor(sourceCurrency)}</span>
                    {entry.amount > 0 ? '+' : ''}
                    {Money.of(entry.amount, sourceCurrency).format()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEntry(entry.id)}
                    aria-label="Quitar este monto"
                    className="text-muted transition-colors hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* El total: siempre en la moneda de las cantidades, Y convertido a
          la otra moneda elegida — para que no haya que ir al Conversor
          por separado. Con banderas bien grandes para ubicarse de un vistazo. */}
      <Card className="flex flex-col gap-4 bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-500/10 dark:to-accent-500/10">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Total</span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span className="text-base leading-none">{flagFor(sourceCurrency)}</span>
              En {sourceCurrency}
            </p>
            <p key={total} className="animate-fade-slide-up text-3xl font-extrabold text-ink">
              {Money.of(total, sourceCurrency).format()}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span className="text-base leading-none">{flagFor(targetCurrency)}</span>
              Convertido a {targetCurrency}
            </p>
            {convertedTotal !== null ? (
              <p key={convertedTotal} className="animate-fade-slide-up text-3xl font-extrabold text-ink">
                {Money.of(convertedTotal, targetCurrency).format()}
              </p>
            ) : (
              <p className="text-lg font-semibold text-muted">No disponible sin conexión</p>
            )}
          </div>
        </div>

        {status === 'stale' && errorMessage && <StatusBanner tone="error">{errorMessage}</StatusBanner>}
        {status === 'error' && errorMessage && <StatusBanner tone="error">{errorMessage}</StatusBanner>}
      </Card>
    </div>
  );
}