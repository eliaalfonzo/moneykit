import { err, ok, type Result } from '@core/shared/Result';
import { calculateDiscountBreakdown, type DiscountBreakdown } from '../domain/DiscountCalculation';

export interface DiscountInput {
  readonly originalPrice: number;
  readonly discountPercentage: number;
  readonly taxPercentage: number;
  readonly taxEnabled: boolean;
  readonly currency: string;
}

export class CalculateDiscountUseCase {
  execute(input: DiscountInput): Result<DiscountBreakdown, string> {
    if (!Number.isFinite(input.originalPrice) || input.originalPrice < 0) {
      return err('Introduce un precio original válido.');
    }
    if (
      !Number.isFinite(input.discountPercentage) ||
      input.discountPercentage < 0 ||
      input.discountPercentage > 100
    ) {
      return err('El descuento debe estar entre 0% y 100%.');
    }
    if (input.taxEnabled && (!Number.isFinite(input.taxPercentage) || input.taxPercentage < 0)) {
      return err('Introduce un porcentaje de impuesto válido.');
    }

    return ok(
      calculateDiscountBreakdown(
        input.originalPrice,
        input.discountPercentage,
        input.taxPercentage,
        input.taxEnabled,
      ),
    );
  }
}
