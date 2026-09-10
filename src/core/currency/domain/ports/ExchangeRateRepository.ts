import type { Result } from '@core/shared/Result';
import type { ExchangeRateTable } from '../ExchangeRate';

/**
 * Puerto (driven port) que el dominio necesita para obtener tasas de
 * cambio actualizadas. La aplicación no sabe ni le importa si detrás hay
 * un `fetch` a una API REST, un websocket o un archivo local: solo conoce
 * este contrato (Dependency Inversion Principle).
 */
export interface ExchangeRateRepository {
  /**
   * Obtiene la tabla de tasas más reciente para la moneda base indicada.
   * Debe rechazar/retornar error de forma controlada ante fallas de red,
   * nunca lanzar excepciones no tipadas hacia la capa de aplicación.
   */
  fetchLatestRates(base: string): Promise<Result<ExchangeRateTable, string>>;
}
