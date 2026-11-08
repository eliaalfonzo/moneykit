/** Tasa oficial USD → VES de un día concreto (fecha en formato AAAA-MM-DD). */
export interface DailyRate {
    readonly date: string;
    readonly rate: number;
    /** Fecha de vigencia oficial que informa la fuente (sirve para detectar días "rellenados"). */
    readonly effectiveDate?: string;
    /**
     * Fecha de la tasa oficial que realmente rige ese día. Si es distinta de
     * `date`, ese día usa la tasa de otro día (p. ej. el sábado usa la del lunes).
     */
    readonly rateDate?: string;
}

export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Fecha de hoy en Caracas (AAAA-MM-DD), que es el día que le importa a la tasa del BCV. */
export function toCaracasIsoDate(moment: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Caracas',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(moment);
}

/** Suma (o resta) días a una fecha AAAA-MM-DD, sin depender de la zona horaria del dispositivo. */
export function addDays(isoDate: string, days: number): string {
    const moment = new Date(`${isoDate}T00:00:00Z`);
    moment.setUTCDate(moment.getUTCDate() + days);
    return moment.toISOString().slice(0, 10);
}

function isWeekend(isoDate: string): boolean {
    const weekday = new Date(`${isoDate}T00:00:00Z`).getUTCDay();
    return weekday === 0 || weekday === 6;
}

/**
 * ¿Ese día tiene tasa propia publicada por el BCV? Los sábados, domingos y
 * feriados NO: la fuente los rellena con la tasa del último día hábil.
 */
export function hasOwnRate(entry: DailyRate): boolean {
    return entry.effectiveDate ? entry.effectiveDate === entry.date : !isWeekend(entry.date);
}

/**
 * Regla del BCV: los días sin tasa propia (sábado, domingo, feriados) se
 * manejan con la tasa publicada para el SIGUIENTE día hábil (la del lunes),
 * no con la del cierre del viernes. Si esa tasa aún no está disponible, se
 * deja la última conocida y `rateDate` lo indica con claridad.
 */
export function applyNextBusinessDayRule(entries: readonly DailyRate[]): DailyRate[] {
    const byDate = new Map<string, DailyRate>();
    for (const entry of entries) {
        if (Number.isFinite(entry.rate) && entry.rate > 0) byDate.set(entry.date, entry);
    }
    const ascending = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));

    // Se recorre del más reciente al más antiguo para saber cuál es la próxima tasa oficial.
    const resolved: DailyRate[] = [];
    let nextOfficial: DailyRate | undefined;

    for (const entry of [...ascending].reverse()) {
        if (hasOwnRate(entry)) {
            resolved.push({ ...entry, rateDate: entry.date });
            nextOfficial = entry;
        } else if (nextOfficial) {
            resolved.push({ ...entry, rate: nextOfficial.rate, rateDate: nextOfficial.date });
        } else {
            resolved.push({ ...entry, rateDate: entry.effectiveDate ?? entry.date });
        }
    }

    return resolved.reverse();
}

/**
 * Se queda con los últimos `count` días (del más reciente al más antiguo),
 * ignorando fechas futuras, valores inválidos y fechas repetidas.
 */
export function selectLastDays(entries: readonly DailyRate[], today: string, count: number): DailyRate[] {
    const byDate = new Map<string, DailyRate>();
    for (const entry of entries) {
        if (entry.date <= today && Number.isFinite(entry.rate) && entry.rate > 0) {
            byDate.set(entry.date, entry);
        }
    }
    return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);
}