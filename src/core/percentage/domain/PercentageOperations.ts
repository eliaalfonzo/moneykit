/**
 * Reglas de negocio puras de porcentajes. Cada función es determinista y
 * sin efectos secundarios: fáciles de razonar y de testear (SRP).
 */

/** ¿Cuánto es el X% de una cantidad? */
export function percentageOf(percentage: number, amount: number): number {
  return (percentage / 100) * amount;
}

/** ¿Qué porcentaje representa `part` sobre `whole`? */
export function whatPercentageIs(part: number, whole: number): number {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}

/** Aumenta `amount` en un `percentage`%. */
export function increaseByPercentage(amount: number, percentage: number): number {
  return amount * (1 + percentage / 100);
}

/** Disminuye `amount` en un `percentage`%. */
export function decreaseByPercentage(amount: number, percentage: number): number {
  return amount * (1 - percentage / 100);
}
