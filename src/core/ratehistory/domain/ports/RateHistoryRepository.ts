import type { Result } from '@core/shared/Result';
import type { DailyRate } from '../DailyRate';

/** Puerto: de dónde sale el histórico de tasas oficiales (la app no sabe si es una API, un archivo, etc.). */
export interface RateHistoryRepository {
    fetchHistory(): Promise<Result<readonly DailyRate[], string>>;

    /**
     * Tasa oficial que el BCV ya publicó para una fecha concreta (normalmente
     * futura, p. ej. la del lunes consultada desde el fin de semana).
     * Devuelve error si todavía no existe.
     */
    fetchSnapshot(date: string): Promise<Result<DailyRate, string>>;
}