import type { RateCacheRepository } from '@core/currency/domain/ports/RateCacheRepository';
import type { ExchangeRateTable } from '@core/currency/domain/ExchangeRate';
import { safeLocalStorage } from './SafeLocalStorage';

const STORAGE_KEY_PREFIX = 'moneykit:rates:';

/**
 * Adaptador que persiste la última tabla de tasas conocida en
 * localStorage, indexada por moneda base. Implementa el puerto
 * `RateCacheRepository` sin que la aplicación conozca el mecanismo.
 */
export class LocalStorageRateCache implements RateCacheRepository {
  save(table: ExchangeRateTable): void {
    safeLocalStorage.setItem(STORAGE_KEY_PREFIX + table.base, JSON.stringify(table));
  }

  load(base: string): ExchangeRateTable | undefined {
    const raw = safeLocalStorage.getItem(STORAGE_KEY_PREFIX + base);
    if (!raw) return undefined;

    try {
      return JSON.parse(raw) as ExchangeRateTable;
    } catch {
      return undefined;
    }
  }
}
