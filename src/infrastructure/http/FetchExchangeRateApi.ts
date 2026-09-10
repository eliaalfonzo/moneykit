import { err, ok, type Result } from '@core/shared/Result';
import type { ExchangeRateRepository } from '@core/currency/domain/ports/ExchangeRateRepository';
import type { ExchangeRateTable } from '@core/currency/domain/ExchangeRate';

interface OpenErApiResponse {
  result: 'success' | 'error';
  base_code: string;
  rates: Record<string, number>;
  time_last_update_utc: string;
  'error-type'?: string;
}

const API_BASE_URL = 'https://open.er-api.com/v6/latest';
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Adaptador (driven adapter) que implementa `ExchangeRateRepository`
 * consultando la API pública open.er-api.com mediante `fetch`.
 * Es el único lugar de todo el proyecto que sabe que existe HTTP,
 * JSON o esta API en particular — si mañana cambiamos de proveedor,
 * solo se toca este archivo (Single Responsibility + DIP).
 */
export class FetchExchangeRateApi implements ExchangeRateRepository {
  async fetchLatestRates(base: string): Promise<Result<ExchangeRateTable, string>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}/${base}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        return err(`La API de tasas respondió con estado ${response.status}.`);
      }

      const data = (await response.json()) as OpenErApiResponse;

      if (data.result !== 'success' || !data.rates) {
        return err(data['error-type'] ?? 'La API de tasas devolvió una respuesta inválida.');
      }

      return ok({
        base: data.base_code,
        rates: data.rates,
        fetchedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return err('La consulta a la API de tasas tardó demasiado (tiempo de espera agotado).');
      }
      return err('No se pudo conectar con la API de tasas de cambio.');
    } finally {
      clearTimeout(timeout);
    }
  }
}
