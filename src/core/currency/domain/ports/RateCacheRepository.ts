import type { ExchangeRateTable } from '../ExchangeRate';

/**
 * Puerto de persistencia local para la última tabla de tasas conocida.
 * Permite a la aplicación seguir funcionando sin conexión o cuando la
 * API de tasas falla.
 */
export interface RateCacheRepository {
  save(table: ExchangeRateTable): void;
  load(base: string): ExchangeRateTable | undefined;
}
