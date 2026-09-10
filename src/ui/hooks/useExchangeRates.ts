import { useCallback, useEffect, useState } from 'react';
import { container } from '@composition/container';
import type { ExchangeRateTable } from '@core/currency/domain/ExchangeRate';

export type RateStatus = 'idle' | 'loading' | 'online' | 'stale' | 'error';

export interface ExchangeRatesState {
  table: ExchangeRateTable | null;
  status: RateStatus;
  errorMessage: string | null;
  refresh: () => Promise<void>;
}

const BASE_CURRENCY = 'USD';

/**
 * Hook de aplicación: expone el estado de la tabla de tasas a la UI,
 * delegando toda la lógica de negocio en `RefreshExchangeRatesUseCase`.
 * El componente que lo use no sabe si detrás hay `fetch` o `localStorage`.
 */
export function useExchangeRates(): ExchangeRatesState {
  const [table, setTable] = useState<ExchangeRateTable | null>(null);
  const [status, setStatus] = useState<RateStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);

    const result = await container.refreshExchangeRates.execute(BASE_CURRENCY);

    if (!result.ok) {
      setErrorMessage(result.error);
      setStatus('error');
      return;
    }

    setTable(result.value.table);
    setStatus(result.value.fromCache ? 'stale' : 'online');
    if (result.value.fromCache) {
      setErrorMessage('No se pudo actualizar la tasa. Mostrando la última disponible.');
    }
  }, []);

  useEffect(() => {
    const cached = container.refreshExchangeRates.loadCached(BASE_CURRENCY);
    if (cached) setTable(cached);
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { table, status, errorMessage, refresh };
}
