import { err, ok, type Result } from '@core/shared/Result';
import type { ExchangeRateRepository } from '../domain/ports/ExchangeRateRepository';
import type { RateCacheRepository } from '../domain/ports/RateCacheRepository';
import type { ExchangeRateTable } from '../domain/ExchangeRate';

export interface RefreshOutcome {
  readonly table: ExchangeRateTable;
  /** true si los datos vienen de la última copia en caché por un fallo de red/API */
  readonly fromCache: boolean;
}

/**
 * Caso de uso: refrescar las tasas de cambio.
 * Orquesta el puerto remoto y el puerto de caché, aplicando la regla de
 * negocio "si la API falla, sigo funcionando con la última tasa conocida".
 * No conoce `fetch` ni `localStorage`: solo las abstracciones (SRP + DIP).
 */
export class RefreshExchangeRatesUseCase {
  constructor(
    private readonly remoteRates: ExchangeRateRepository,
    private readonly cache: RateCacheRepository,
  ) {}

  async execute(base: string): Promise<Result<RefreshOutcome, string>> {
    const remoteResult = await this.remoteRates.fetchLatestRates(base);

    if (remoteResult.ok) {
      this.cache.save(remoteResult.value);
      return ok({ table: remoteResult.value, fromCache: false });
    }

    const cached = this.cache.load(base);
    if (cached) {
      return ok({ table: cached, fromCache: true });
    }

    return err(remoteResult.error);
  }

  /** Devuelve la última tasa conocida sin intentar red (para el arranque en frío). */
  loadCached(base: string): ExchangeRateTable | undefined {
    return this.cache.load(base);
  }
}
