import { describe, expect, it } from 'vitest';
import {
    applyNextBusinessDayRule,
    selectLastDays,
    toCaracasIsoDate,
    type DailyRate,
} from '@core/ratehistory/domain/DailyRate';
import { GetRecentRateHistoryUseCase } from '@core/ratehistory/application/GetRecentRateHistoryUseCase';
import { parseHistory } from '@infrastructure/http/FetchBcvHistoryApi';
import type { RateHistoryRepository } from '@core/ratehistory/domain/ports/RateHistoryRepository';
import { err, ok } from '@core/shared/Result';

// Noviembre 2026: jueves 5, viernes 6, sábado 7, domingo 8, lunes 9.
const THURSDAY: DailyRate = { date: '2026-11-05', rate: 500.4444, effectiveDate: '2026-11-05' };
const FRIDAY: DailyRate = { date: '2026-11-06', rate: 500.5555, effectiveDate: '2026-11-06' };
// La fuente rellena sábado y domingo con la tasa del viernes:
const SATURDAY_FILLED: DailyRate = { date: '2026-11-07', rate: 500.5555, effectiveDate: '2026-11-06' };
const SUNDAY_FILLED: DailyRate = { date: '2026-11-08', rate: 500.5555, effectiveDate: '2026-11-06' };
const MONDAY: DailyRate = { date: '2026-11-09', rate: 501.2222, effectiveDate: '2026-11-09' };

describe('applyNextBusinessDayRule', () => {
    it('el sábado y el domingo usan la tasa del lunes, no la del cierre del viernes', () => {
        const result = applyNextBusinessDayRule([THURSDAY, FRIDAY, SATURDAY_FILLED, SUNDAY_FILLED, MONDAY]);
        const byDate = Object.fromEntries(result.map((entry) => [entry.date, entry]));

        expect(byDate['2026-11-06']?.rate).toBe(500.5555); // el viernes conserva la suya
        expect(byDate['2026-11-07']).toMatchObject({ rate: 501.2222, rateDate: '2026-11-09' });
        expect(byDate['2026-11-08']).toMatchObject({ rate: 501.2222, rateDate: '2026-11-09' });
        expect(byDate['2026-11-09']?.rate).toBe(501.2222);
    });

    it('funciona aunque la fuente no informe la fecha de vigencia (usa el calendario)', () => {
        const result = applyNextBusinessDayRule([
            { date: '2026-11-06', rate: 500.5555 },
            { date: '2026-11-07', rate: 500.5555 },
            { date: '2026-11-08', rate: 500.5555 },
            { date: '2026-11-09', rate: 501.2222 },
        ]);
        expect(result.find((e) => e.date === '2026-11-07')?.rate).toBe(501.2222);
    });

    it('los feriados entre semana también usan la tasa del siguiente día hábil', () => {
        const holiday: DailyRate = { date: '2026-11-10', rate: 501.2222, effectiveDate: '2026-11-09' };
        const nextDay: DailyRate = { date: '2026-11-11', rate: 502.0001, effectiveDate: '2026-11-11' };
        const result = applyNextBusinessDayRule([MONDAY, holiday, nextDay]);
        expect(result.find((e) => e.date === '2026-11-10')).toMatchObject({ rate: 502.0001, rateDate: '2026-11-11' });
    });

    it('si la tasa del lunes aún no existe, deja la última conocida e indica de qué día es', () => {
        const result = applyNextBusinessDayRule([FRIDAY, SATURDAY_FILLED]);
        expect(result.find((e) => e.date === '2026-11-07')).toMatchObject({ rate: 500.5555, rateDate: '2026-11-06' });
    });
});

describe('selectLastDays', () => {
    const sample = [THURSDAY, FRIDAY, SATURDAY_FILLED, SUNDAY_FILLED, MONDAY];

    it('devuelve del más reciente al más antiguo y sin fechas futuras', () => {
        const result = selectLastDays(sample, '2026-11-08', 5);
        expect(result.map((e) => e.date)).toEqual(['2026-11-08', '2026-11-07', '2026-11-06', '2026-11-05']);
    });

    it('conserva todos los decimales de la tasa', () => {
        expect(selectLastDays([MONDAY], '2026-11-09', 1)[0]?.rate).toBe(501.2222);
    });
});

describe('toCaracasIsoDate', () => {
    it('usa la fecha de Caracas (UTC-4), no la de UTC', () => {
        expect(toCaracasIsoDate(new Date('2026-11-07T02:00:00Z'))).toBe('2026-11-06');
    });
});

describe('parseHistory', () => {
    it('lee una lista directa con USD y conserva la fecha de vigencia', () => {
        expect(parseHistory([{ date: '2026-05-11', effective_date: '2026-05-11', USD: 500.4606 }])).toEqual([
            { date: '2026-05-11', rate: 500.4606, effectiveDate: '2026-05-11' },
        ]);
    });

    it('lee una lista dentro de un campo y descarta entradas inválidas', () => {
        const json = { history: [{ date: '2026-05-11', USD: 500.4606 }, { date: 'x', USD: 1 }, { date: '2026-05-10' }] };
        expect(parseHistory(json)).toHaveLength(1);
    });

    it('lee un objeto indexado por fecha', () => {
        expect(parseHistory({ '2026-05-11': { USD: 500.4606 } })).toEqual([{ date: '2026-05-11', rate: 500.4606 }]);
    });
});

describe('GetRecentRateHistoryUseCase', () => {
    const saturday = { now: () => new Date('2026-11-07T15:00:00Z') }; // sábado 7, mediodía en Caracas
    const wednesday = { now: () => new Date('2026-11-04T15:00:00Z') };
    const noCache = { save: () => undefined, load: (): readonly DailyRate[] => [] };

    function repository(history: readonly DailyRate[], snapshots: Record<string, DailyRate> = {}) {
        const requested: string[] = [];
        const repo: RateHistoryRepository = {
            fetchHistory: async () => ok(history),
            fetchSnapshot: async (date) => {
                requested.push(date);
                const snapshot = snapshots[date];
                return snapshot ? ok(snapshot) : err('no publicada');
            },
        };
        return { repo, requested };
    }

    it('el sábado busca la tasa del lunes aunque el histórico todavía no la incluya', async () => {
        const { repo, requested } = repository([THURSDAY, FRIDAY, SATURDAY_FILLED], { '2026-11-09': MONDAY });
        const result = await new GetRecentRateHistoryUseCase(repo, noCache, saturday).execute();

        expect(requested).toEqual(['2026-11-08', '2026-11-09']);
        expect(result.ok && result.value.entries[0]).toMatchObject({
            date: '2026-11-07',
            rate: 501.2222,
            rateDate: '2026-11-09',
        });
        // La tasa del lunes no aparece como un día más del historial (todavía es futuro).
        expect(result.ok && result.value.entries.map((e) => e.date)).toEqual(['2026-11-07', '2026-11-06', '2026-11-05']);
    });

    it('entre semana no hace consultas adicionales', async () => {
        const { repo, requested } = repository([THURSDAY, FRIDAY]);
        await new GetRecentRateHistoryUseCase(repo, noCache, wednesday).execute();
        expect(requested).toEqual([]);
    });

    it('usa la copia guardada si la API falla', async () => {
        const cached = [{ date: '2026-11-06', rate: 500.5555 }];
        const repo: RateHistoryRepository = {
            fetchHistory: async () => err('sin red'),
            fetchSnapshot: async () => err('sin red'),
        };
        const result = await new GetRecentRateHistoryUseCase(
            repo,
            { save: () => undefined, load: () => cached },
            saturday,
        ).execute();
        expect(result.ok && result.value.fromCache).toBe(true);
    });
});