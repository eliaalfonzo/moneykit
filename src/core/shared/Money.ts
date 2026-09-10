/**
 * Money — value object inmutable para cantidades monetarias.
 * Evita errores de redondeo/comparación de floats dispersos por la app
 * y centraliza el formateo en un único lugar (SRP).
 */
export class Money {
  private constructor(private readonly amount: number, private readonly currency: string) {}

  static of(amount: number, currency: string): Money {
    if (!Number.isFinite(amount)) {
      throw new RangeError('El monto debe ser un número finito.');
    }
    return new Money(amount, currency.toUpperCase());
  }

  get value(): number {
    return this.amount;
  }

  get currencyCode(): string {
    return this.currency;
  }

  add(other: number): Money {
    return Money.of(this.amount + other, this.currency);
  }

  multiply(factor: number): Money {
    return Money.of(this.amount * factor, this.currency);
  }

  format(locale = 'es-VE'): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: this.currency,
        maximumFractionDigits: 2,
      }).format(this.amount);
    } catch {
      // Algunas monedas simuladas (p. ej. no ISO) caen aquí.
      return `${this.amount.toFixed(2)} ${this.currency}`;
    }
  }
}

/** Formatea un número plano con separadores de miles y hasta N decimales. */
export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat('es-VE', {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}
