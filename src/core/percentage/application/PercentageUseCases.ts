import { err, ok, type Result } from '@core/shared/Result';
import {
  decreaseByPercentage,
  increaseByPercentage,
  percentageOf,
  whatPercentageIs,
} from '../domain/PercentageOperations';

export type PercentageMode = 'of' | 'isWhatPercent' | 'increase' | 'decrease';

export interface PercentageInput {
  readonly mode: PercentageMode;
  readonly valueA: number; // porcentaje, o "parte" según el modo
  readonly valueB: number; // cantidad base, o "total" según el modo
}

export interface PercentageOutput {
  readonly mode: PercentageMode;
  readonly result: number;
  readonly explanation: string;
}

function validate(input: PercentageInput): Result<true, string> {
  if (!Number.isFinite(input.valueA) || !Number.isFinite(input.valueB)) {
    return err('Completa ambos campos con números válidos.');
  }
  return ok(true);
}

/**
 * Caso de uso único que enruta entre las 4 variantes de la calculadora de
 * porcentajes (Open/Closed: agregar un nuevo modo no rompe los existentes).
 */
export class CalculatePercentageUseCase {
  execute(input: PercentageInput): Result<PercentageOutput, string> {
    const validation = validate(input);
    if (!validation.ok) return validation;

    const { mode, valueA, valueB } = input;

    switch (mode) {
      case 'of':
        return ok({
          mode,
          result: percentageOf(valueA, valueB),
          explanation: `${valueA}% de ${valueB}`,
        });
      case 'isWhatPercent':
        return ok({
          mode,
          result: whatPercentageIs(valueA, valueB),
          explanation: `${valueA} representa este % de ${valueB}`,
        });
      case 'increase':
        return ok({
          mode,
          result: increaseByPercentage(valueA, valueB),
          explanation: `${valueA} + ${valueB}%`,
        });
      case 'decrease':
        return ok({
          mode,
          result: decreaseByPercentage(valueA, valueB),
          explanation: `${valueA} - ${valueB}%`,
        });
    }
  }
}
