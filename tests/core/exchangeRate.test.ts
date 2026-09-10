import { describe, expect, it } from 'vitest';
import { crossRate } from '@core/currency/domain/ExchangeRate';
import { ConvertCurrencyUseCase } from '@core/currency/application/ConvertCurrencyUseCase';

const table = {
  base: 'USD',
  rates: { USD: 1, VES: 92.25, EUR: 0.92 },
  fetchedAt: new Date().toISOString(),
};

describe('crossRate', () => {
  it('calcula la tasa cruzada entre dos monedas distintas de la base', () => {
    const rate = crossRate(table, 'EUR', 'VES');
    expect(rate).toBeCloseTo(92.25 / 0.92);
  });

  it('devuelve 1 cuando origen y destino son iguales', () => {
    expect(crossRate(table, 'USD', 'USD')).toBe(1);
  });

  it('devuelve undefined si falta la tasa', () => {
    expect(crossRate(table, 'XXX', 'USD')).toBeUndefined();
  });
});

describe('ConvertCurrencyUseCase', () => {
  const useCase = new ConvertCurrencyUseCase();

  it('convierte una cantidad usando la tabla de tasas', () => {
    const result = useCase.execute(table, 500, 'VES', 'USD');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.convertedAmount).toBeCloseTo(500 / 92.25);
  });

  it('rechaza montos negativos', () => {
    const result = useCase.execute(table, -10, 'USD', 'VES');
    expect(result.ok).toBe(false);
  });
});
