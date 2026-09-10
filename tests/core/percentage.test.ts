import { describe, expect, it } from 'vitest';
import { CalculatePercentageUseCase } from '@core/percentage/application/PercentageUseCases';

describe('CalculatePercentageUseCase', () => {
  const useCase = new CalculatePercentageUseCase();

  it('calcula el porcentaje de una cantidad', () => {
    const result = useCase.execute({ mode: 'of', valueA: 15, valueB: 500 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.result).toBe(75);
  });

  it('calcula qué porcentaje representa una parte de un total', () => {
    const result = useCase.execute({ mode: 'isWhatPercent', valueA: 250, valueB: 1000 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.result).toBe(25);
  });

  it('aumenta una cantidad en un porcentaje', () => {
    const result = useCase.execute({ mode: 'increase', valueA: 500, valueB: 15 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.result).toBe(575);
  });

  it('disminuye una cantidad en un porcentaje', () => {
    const result = useCase.execute({ mode: 'decrease', valueA: 500, valueB: 15 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.result).toBe(425);
  });

  it('rechaza valores no numéricos', () => {
    const result = useCase.execute({ mode: 'of', valueA: NaN, valueB: 500 });
    expect(result.ok).toBe(false);
  });
});
