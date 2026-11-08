import type { DailyRate } from '../DailyRate';

/** Puerto: copia local del último histórico conocido, para poder mostrarlo sin conexión. */
export interface RateHistoryCache {
    save(entries: readonly DailyRate[]): void;
    load(): readonly DailyRate[];
}