/**
 * ExchangeRateTable — entidad que representa un conjunto de tasas
 * respecto a una moneda base, en un instante dado.
 */
export interface ExchangeRateTable {
  readonly base: string;
  readonly rates: Readonly<Record<string, number>>;
  readonly fetchedAt: string; // ISO date string — serializable para localStorage
}

/**
 * Calcula la tasa cruzada entre dos monedas cualesquiera a partir de una
 * tabla de tasas cuya base puede ser distinta de ambas.
 */
export function crossRate(
  table: ExchangeRateTable,
  from: string,
  to: string,
): number | undefined {
  if (from === to) return 1;

  const rateFromBaseToFrom = from === table.base ? 1 : table.rates[from];
  const rateFromBaseToTarget = to === table.base ? 1 : table.rates[to];

  if (rateFromBaseToFrom === undefined || rateFromBaseToTarget === undefined) {
    return undefined;
  }

  // 1 base = rateFromBaseToFrom "from" => 1 "from" = (1 / rateFromBaseToFrom) base
  // => 1 "from" = (1 / rateFromBaseToFrom) * rateFromBaseToTarget "to"
  return rateFromBaseToTarget / rateFromBaseToFrom;
}
