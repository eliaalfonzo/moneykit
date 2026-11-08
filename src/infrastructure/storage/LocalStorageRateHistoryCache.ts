import type { RateHistoryCache } from '@core/ratehistory/domain/ports/RateHistoryCache';
import type { DailyRate } from '@core/ratehistory/domain/DailyRate';
import { safeLocalStorage } from './SafeLocalStorage';

const STORAGE_KEY = 'moneykit:rate-history:v2';

export class LocalStorageRateHistoryCache implements RateHistoryCache {
    save(entries: readonly DailyRate[]): void {
        safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }

    load(): readonly DailyRate[] {
        const raw = safeLocalStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw) as DailyRate[];
        } catch {
            return [];
        }
    }
}