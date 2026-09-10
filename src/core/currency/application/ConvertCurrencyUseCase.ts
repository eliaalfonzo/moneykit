import { err, ok, type Result } from '@core/shared/Result';
import { crossRate, type ExchangeRateTable } from '../domain/ExchangeRate';

export interface ConversionResult {
  readonly amount: number;
  readonly from: string;
  readonly to: string;
  readonly rate: number;
  readonly convertedAmount: number;
}

/**
 * Caso de uso: convertir una cantidad de una moneda a otra usando una
 * tabla de tasas ya disponible (obtenida vía RefreshExchangeRatesUseCase).
 * Es lógica pura, sin efectos secundarios: 100% testeable sin mocks.
 */
export class ConvertCurrencyUseCase {
  execute(
    table: ExchangeRateTable,
    amount: number,
    from: string,
    to: string,
  ): Result<ConversionResult, string> {
    if (!Number.isFinite(amount) || amount < 0) {
      return err('Introduce una cantidad válida mayor o igual a cero.');
    }

    const rate = crossRate(table, from, to);
    if (rate === undefined) {
      return err(`No hay tasa disponible para convertir ${from} → ${to}.`);
    }

    return ok({
      amount,
      from,
      to,
      rate,
      convertedAmount: amount * rate,
    });
  }
}
