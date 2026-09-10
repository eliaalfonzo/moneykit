export type SavingsFrequency = 'weekly' | 'biweekly' | 'monthly';

const PERIODS_PER_MONTH: Record<SavingsFrequency, number> = {
  weekly: 4.345, // semanas promedio por mes
  biweekly: 2.1725,
  monthly: 1,
};

export interface SavingsPlanResult {
  readonly progressPercentage: number;
  readonly remainingAmount: number;
  readonly periodsNeeded: number | null; // null => la meta nunca se alcanza con el aporte actual
  readonly monthsNeeded: number | null;
  readonly isGoalReached: boolean;
}

/**
 * Calcula el progreso y el tiempo estimado para alcanzar una meta de
 * ahorro, dado un aporte periódico constante. Es planificación matemática
 * simple: no modela intereses ni inversión (regla de negocio explícita
 * del producto).
 */
export function calculateSavingsPlan(
  goalAmount: number,
  currentAmount: number,
  periodicContribution: number,
  frequency: SavingsFrequency,
): SavingsPlanResult {
  const remainingAmount = Math.max(goalAmount - currentAmount, 0);
  const progressPercentage = goalAmount > 0
    ? Math.min((currentAmount / goalAmount) * 100, 100)
    : 100;
  const isGoalReached = remainingAmount <= 0;

  if (isGoalReached) {
    return { progressPercentage, remainingAmount: 0, periodsNeeded: 0, monthsNeeded: 0, isGoalReached };
  }

  if (periodicContribution <= 0) {
    return { progressPercentage, remainingAmount, periodsNeeded: null, monthsNeeded: null, isGoalReached };
  }

  const periodsNeeded = Math.ceil(remainingAmount / periodicContribution);
  const monthsNeeded = periodsNeeded / PERIODS_PER_MONTH[frequency];

  return { progressPercentage, remainingAmount, periodsNeeded, monthsNeeded, isGoalReached };
}

/** Meses que se ahorran al pasar de un aporte periódico a otro mayor. */
export function monthsSavedByIncreasingContribution(
  goalAmount: number,
  currentAmount: number,
  currentContribution: number,
  increasedContribution: number,
  frequency: SavingsFrequency,
): number | null {
  const before = calculateSavingsPlan(goalAmount, currentAmount, currentContribution, frequency);
  const after = calculateSavingsPlan(goalAmount, currentAmount, increasedContribution, frequency);

  if (before.monthsNeeded === null || after.monthsNeeded === null) return null;
  return Math.max(before.monthsNeeded - after.monthsNeeded, 0);
}
