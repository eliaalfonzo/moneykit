import { describe, expect, it } from 'vitest';
import { CalculateDiscountUseCase } from '@core/discount/application/CalculateDiscountUseCase';

describe('CalculateDiscountUseCase', () => {
  const useCase = new CalculateDiscountUseCase();

  it('calcula el desglose con descuento e impuesto', () => {
    const result = useCase.execute({
      originalPrice: 80,
      discountPercentage: 25,
      taxPercentage: 16,
      taxEnabled: true,
      currency: 'USD',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.discountAmount).toBe(20);
    expect(result.value.subtotal).toBe(60);
    expect(result.value.taxAmount).toBeCloseTo(9.6);
    expect(result.value.total).toBeCloseTo(69.6);
  });

  it('ignora el impuesto cuando está desactivado', () => {
    const result = useCase.execute({
      originalPrice: 100,
      discountPercentage: 10,
      taxPercentage: 16,
      taxEnabled: false,
      currency: 'USD',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.total).toBe(90);
  });

  it('rechaza un descuento fuera de rango', () => {
    const result = useCase.execute({
      originalPrice: 100,
      discountPercentage: 150,
      taxPercentage: 0,
      taxEnabled: false,
      currency: 'USD',
    });
    expect(result.ok).toBe(false);
  });
});
