export interface DiscountBreakdown {
  readonly originalPrice: number;
  readonly discountPercentage: number;
  readonly discountAmount: number;
  readonly subtotal: number;
  readonly taxPercentage: number;
  readonly taxAmount: number;
  readonly total: number;
  readonly savedAmount: number;
}

/**
 * Calcula el desglose completo de un precio con descuento e impuesto
 * opcional. Regla de negocio: el impuesto se aplica siempre sobre el
 * subtotal ya descontado, nunca sobre el precio original.
 */
export function calculateDiscountBreakdown(
  originalPrice: number,
  discountPercentage: number,
  taxPercentage: number,
  taxEnabled: boolean,
): DiscountBreakdown {
  const discountAmount = originalPrice * (discountPercentage / 100);
  const subtotal = originalPrice - discountAmount;
  const taxAmount = taxEnabled ? subtotal * (taxPercentage / 100) : 0;
  const total = subtotal + taxAmount;

  return {
    originalPrice,
    discountPercentage,
    discountAmount,
    subtotal,
    taxPercentage: taxEnabled ? taxPercentage : 0,
    taxAmount,
    total,
    savedAmount: discountAmount,
  };
}
