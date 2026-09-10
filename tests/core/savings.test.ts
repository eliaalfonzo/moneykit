import { describe, expect, it } from 'vitest';
import { calculateSavingsPlan } from '@core/savings/domain/SavingsGoal';

describe('calculateSavingsPlan', () => {
  it('calcula el progreso y el remanente', () => {
    const plan = calculateSavingsPlan(1000, 250, 100, 'monthly');
    expect(plan.progressPercentage).toBe(25);
    expect(plan.remainingAmount).toBe(750);
    expect(plan.isGoalReached).toBe(false);
  });

  it('marca la meta como alcanzada cuando el ahorro actual la cubre', () => {
    const plan = calculateSavingsPlan(500, 500, 100, 'monthly');
    expect(plan.isGoalReached).toBe(true);
    expect(plan.remainingAmount).toBe(0);
  });

  it('retorna null en meses si el aporte es cero', () => {
    const plan = calculateSavingsPlan(1000, 0, 0, 'monthly');
    expect(plan.monthsNeeded).toBeNull();
  });
});
