import { useMemo, useState } from 'react';
import { Percent } from 'lucide-react';
import { Card } from '@ui/components/ui/Card';
import { Input } from '@ui/components/ui/Input';
import { EmptyState } from '@ui/components/ui/EmptyState';
import { container } from '@composition/container';
import type { PercentageMode } from '@core/percentage/application/PercentageUseCases';
import { formatNumber } from '@core/shared/Money';

const MODES: { value: PercentageMode; label: string; labelA: string; labelB: string; suffixA?: string; suffixB?: string }[] = [
  { value: 'of', label: '¿Cuánto es?', labelA: 'Porcentaje', labelB: 'De la cantidad', suffixA: '%' },
  { value: 'isWhatPercent', label: '¿Qué % representa?', labelA: 'Parte', labelB: 'Del total' },
  { value: 'increase', label: 'Aumentar cantidad', labelA: 'Cantidad', labelB: 'Aumento', suffixB: '%' },
  { value: 'decrease', label: 'Disminuir cantidad', labelA: 'Cantidad', labelB: 'Disminución', suffixB: '%' },
];

/** Calculadora de porcentajes con 4 modos independientes (SRP por modo, un único caso de uso). */
export function PercentagePage() {
  const [mode, setMode] = useState<PercentageMode>('of');
  const [valueA, setValueA] = useState('15');
  const [valueB, setValueB] = useState('500');

  const activeMode = MODES.find((m) => m.value === mode) ?? MODES[0];

  const outcome = useMemo(() => {
    const numericA = parseFloat(valueA.replace(',', '.'));
    const numericB = parseFloat(valueB.replace(',', '.'));
    return container.calculatePercentage.execute({
      mode,
      valueA: Number.isNaN(numericA) ? NaN : numericA,
      valueB: Number.isNaN(numericB) ? NaN : numericB,
    });
  }, [mode, valueA, valueB]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Calculadora de porcentajes</h1>
        <p className="mt-1 text-muted">Elige la operación que necesitas resolver.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMode(option.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              option.value === mode
                ? 'bg-brand-500 text-white shadow-soft'
                : 'border border-border bg-surface text-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Card className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={activeMode?.labelA}
            inputMode="decimal"
            value={valueA}
            suffix={activeMode?.suffixA}
            onChange={(event) => setValueA(event.target.value)}
          />
          <Input
            label={activeMode?.labelB}
            inputMode="decimal"
            value={valueB}
            suffix={activeMode?.suffixB}
            onChange={(event) => setValueB(event.target.value)}
          />
        </div>

        <div className="rounded-2xl border border-border bg-bg p-6">
          {outcome.ok ? (
            <div key={outcome.value.result} className="animate-fade-slide-up text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {outcome.value.explanation}
              </p>
              <p className="mt-2 flex items-center justify-center gap-2 text-4xl font-extrabold text-ink">
                {formatNumber(outcome.value.result)}
                {mode === 'isWhatPercent' && <Percent className="h-7 w-7 text-brand-500" />}
              </p>
            </div>
          ) : (
            <EmptyState
              icon={Percent}
              title="Completa los campos"
              description={outcome.error}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
