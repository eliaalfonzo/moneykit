/**
 * Una entrada anotada en la Sumadora. El signo ya viene incluido en
 * `amount` (positivo = suma, negativo = resta), así el resto del dominio
 * no necesita saber nada de "signos": solo suma números.
 */
export interface AdderEntry {
  readonly id: string;
  readonly amount: number;
}

/** Total acumulado de todas las entradas anotadas hasta el momento. */
export function sumEntries(entries: readonly AdderEntry[]): number {
  return entries.reduce((total, entry) => total + entry.amount, 0);
}