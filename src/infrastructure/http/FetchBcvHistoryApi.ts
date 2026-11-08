import { err, ok, type Result } from '@core/shared/Result';
import type { RateHistoryRepository } from '@core/ratehistory/domain/ports/RateHistoryRepository';
import { ISO_DATE_PATTERN, type DailyRate } from '@core/ratehistory/domain/DailyRate';

const HISTORY_URL = 'https://bcv.today/api/v1/history.json';
const SNAPSHOT_BASE_URL = 'https://bcv.today/api/v1/history';
const HISTORY_TIMEOUT_MS = 10000;
const SNAPSHOT_TIMEOUT_MS = 6000;

function toNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    return NaN;
}

function toEntry(item: unknown, fallbackDate?: string): DailyRate | null {
    if (!item || typeof item !== 'object') return null;
    const record = item as Record<string, unknown>;

    const rawDate = [record.date, record.effective_date, fallbackDate].find((v) => typeof v === 'string') as
        | string
        | undefined;
    const date = rawDate?.slice(0, 10);
    const nestedRates = record.rates as Record<string, unknown> | undefined;
    const rate = toNumber(record.USD ?? record.usd ?? nestedRates?.USD);

    if (!date || !ISO_DATE_PATTERN.test(date) || !Number.isFinite(rate) || rate <= 0) return null;

    // Fecha de vigencia oficial: permite saber qué días son "rellenados" (fines de semana, feriados).
    const rawEffective = typeof record.effective_date === 'string' ? record.effective_date.slice(0, 10) : undefined;
    const effectiveDate = rawEffective && ISO_DATE_PATTERN.test(rawEffective) ? rawEffective : undefined;

    return effectiveDate ? { date, rate, effectiveDate } : { date, rate };
}

/**
 * Convierte la respuesta de la API en una lista de tasas. Es tolerante con
 * la forma del JSON (lista directa, lista dentro de un campo, o un objeto
 * indexado por fecha) y descarta lo que no tenga fecha y tasa válidas.
 */
export function parseHistory(json: unknown): DailyRate[] {
    let items: Array<[unknown, string | undefined]> = [];

    if (Array.isArray(json)) {
        items = json.map((item) => [item, undefined]);
    } else if (json && typeof json === 'object') {
        const record = json as Record<string, unknown>;
        const nested = ['history', 'data', 'entries', 'items', 'rates', 'results']
            .map((key) => record[key])
            .find(Array.isArray) as unknown[] | undefined;
        items = nested
            ? nested.map((item) => [item, undefined])
            : Object.entries(record).map(([key, value]) => [value, key]);
    }

    return items.map(([item, key]) => toEntry(item, key)).filter((entry): entry is DailyRate => entry !== null);
}

async function getJson(url: string, timeoutMs: number): Promise<Result<unknown, string>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) return err(`El servicio de tasas respondió con estado ${response.status}.`);
        return ok<unknown, string>(await response.json());
    } catch {
        return err('No se pudo consultar el servicio de tasas.');
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Adaptador: histórico oficial USD/VES del BCV desde bcv.today (archivos
 * JSON estáticos, sin claves). La tasa se entrega tal cual, sin redondear.
 */
export class FetchBcvHistoryApi implements RateHistoryRepository {
    async fetchHistory(): Promise<Result<readonly DailyRate[], string>> {
        const json = await getJson(HISTORY_URL, HISTORY_TIMEOUT_MS);
        if (!json.ok) return json;

        const entries = parseHistory(json.value);
        return entries.length > 0 ? ok(entries) : err('No se pudo leer el histórico de tasas.');
    }

    /** Tasa oficial ya publicada para una fecha (el BCV la publica antes de que empiece a regir). */
    async fetchSnapshot(date: string): Promise<Result<DailyRate, string>> {
        const json = await getJson(`${SNAPSHOT_BASE_URL}/${date}.json`, SNAPSHOT_TIMEOUT_MS);
        if (!json.ok) return json;

        const entry = toEntry(json.value, date);
        if (!entry) return err(`No hay tasa publicada para ${date}.`);
        return ok({ date, rate: entry.rate, effectiveDate: date });
    }
}