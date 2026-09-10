import { err, ok, type Result } from '@core/shared/Result';
import {
  calculateSavingsPlan,
  monthsSavedByIncreasingContribution,
  type SavingsFrequency,
  type SavingsPlanResult,
} from '../domain/SavingsGoal';

export interface SavingsInput {
  readonly goalAmount: number;
  readonly currentAmount: number;
  readonly periodicContribution: number;
  readonly frequency: SavingsFrequency;
}

export interface SavingsOutput extends SavingsPlanResult {
  /** Sugerencia motivacional: meses que se ganan aumentando 25% el aporte. */
  readonly monthsSavedWithBoost: number | null;
  readonly boostedContribution: number;
}

const BOOST_FACTOR = 1.25;

export class CalculateSavingsPlanUseCase {
  execute(input: SavingsInput): Result<SavingsOutput, string> {
    if (!Number.isFinite(input.goalAmount) || input.goalAmount <= 0) {
      return err('La meta de ahorro debe ser mayor a cero.');
    }
    if (!Number.isFinite(input.currentAmount) || input.currentAmount < 0) {
      return err('El ahorro actual no puede ser negativo.');
    }
    if (!Number.isFinite(input.periodicContribution) || input.periodicContribution < 0) {
      return err('El aporte periódico no puede ser negativo.');
    }

    const plan = calculateSavingsPlan(
      input.goalAmount,
      input.currentAmount,
      input.periodicContribution,
      input.frequency,
    );

    const boostedContribution = input.periodicContribution * BOOST_FACTOR;
    const monthsSavedWithBoost = input.periodicContribution > 0
      ? monthsSavedByIncreasingContribution(
          input.goalAmount,
          input.currentAmount,
          input.periodicContribution,
          boostedContribution,
          input.frequency,
        )
      : null;

    return ok({ ...plan, monthsSavedWithBoost, boostedContribution });
  }
}
