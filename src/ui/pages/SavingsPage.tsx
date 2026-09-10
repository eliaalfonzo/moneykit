import { useMemo, useState } from 'react';
import { Lightbulb, PiggyBank } from 'lucide-react';
import { Card } from '@ui/components/ui/Card';
import { Input } from '@ui/components/ui/Input';
import { Dropdown } from '@ui/components/ui/Dropdown';
import { EmptyState } from '@ui/components/ui/EmptyState';
import { container } from '@composition/container';
import type { SavingsFrequency } from '@core/savings/domain/SavingsGoal';
import { formatNumber } from '@core/shared/Money';

const FREQUENCIES: { value: SavingsFrequency; label: string }[] = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
];

function formatMonths(months: number): string {
  if (months < 1) return `${Math.ceil(months * 30)} días`;
  return `${formatNumber(months, 1)} meses`;
}

/** Planificación matemática de una meta de ahorro (sin intereses ni inversión). */
export function SavingsPage() {
  const [goal, setGoal] = useState('1000');
  const [current, setCurrent] = useState('250');
  const [contribution, setContribution] = useState('100');
  const [frequency, setFrequency] = useState<SavingsFrequency>('monthly');

  const outcome = useMemo(() => {
    return container.calculateSavingsPlan.execute({
      goalAmount: parseFloat(goal.replace(',', '.')) || 0,
      currentAmount: parseFloat(current.replace(',', '.')) || 0,
      periodicContribution: parseFloat(contribution.replace(',', '.')) || 0,
      frequency,
    });
  }, [goal, current, contribution, frequency]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Calculadora de ahorro</h1>
        <p className="mt-1 text-muted">Define tu meta y descubre cuánto te falta y en cuánto tiempo la alcanzarías.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card className="flex flex-col gap-5">
          <Input label="Meta de ahorro" inputMode="decimal" suffix="$" value={goal} onChange={(e) => setGoal(e.target.value)} />
          <Input label="Ahorro actual" inputMode="decimal" suffix="$" value={current} onChange={(e) => setCurrent(e.target.value)} />
          <Input
            label="Aporte periódico"
            inputMode="decimal"
            suffix="$"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
          />
          <Dropdown
            label="Frecuencia"
            value={frequency}
            onChange={(value) => setFrequency(value as SavingsFrequency)}
            options={FREQUENCIES.map((option) => ({ value: option.value, label: option.label }))}
          />
        </Card>

        <Card className="flex flex-col gap-5">
          {!outcome.ok ? (
            <EmptyState icon={PiggyBank} title="Revisa los datos" description={outcome.error} />
          ) : (
            <div className="flex flex-col gap-5 animate-fade-slide-up">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink">Tu progreso</span>
                  <span className="font-bold text-brand-600">{formatNumber(outcome.value.progressPercentage, 0)}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-[width] duration-500 ease-out"
                    style={{ width: `${Math.min(outcome.value.progressPercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Stat label="Te faltan" value={`$${formatNumber(outcome.value.remainingAmount)}`} />
                <Stat
                  label="Tiempo estimado"
                  value={
                    outcome.value.isGoalReached
                      ? '¡Meta alcanzada! 🎉'
                      : outcome.value.monthsNeeded !== null
                        ? formatMonths(outcome.value.monthsNeeded)
                        : 'Aumenta tu aporte'
                  }
                />
              </div>

              {outcome.value.monthsSavedWithBoost !== null && outcome.value.monthsSavedWithBoost > 0.1 && (
                <div className="flex items-start gap-2.5 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Si aumentas tu aporte a ${formatNumber(outcome.value.boostedContribution)}, alcanzarías tu
                    meta aproximadamente {formatMonths(outcome.value.monthsSavedWithBoost)} antes.
                  </span>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-ink">{value}</p>
    </div>
  );
}