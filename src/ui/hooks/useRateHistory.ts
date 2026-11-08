import { useCallback, useEffect, useState } from 'react';
import { container } from '@composition/container';
import type { DailyRate } from '@core/ratehistory/domain/DailyRate';

export type RateHistoryStatus = 'loading' | 'online' | 'stale' | 'error';

export function useRateHistory() {
    const [entries, setEntries] = useState<readonly DailyRate[]>([]);
    const [status, setStatus] = useState<RateHistoryStatus>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setStatus('loading');
        setErrorMessage(null);

        const result = await container.getRecentRateHistory.execute();
        if (!result.ok) {
            setErrorMessage(result.error);
            setStatus('error');
            return;
        }
        setEntries(result.value.entries);
        setStatus(result.value.fromCache ? 'stale' : 'online');
    }, []);

    useEffect(() => {
        // Muestra al instante lo último guardado mientras se consulta la API.
        const cached = container.getRecentRateHistory.loadCached();
        if (cached.length > 0) setEntries(cached);
        void refresh();
    }, [refresh]);

    return { entries, status, errorMessage, refresh };
}