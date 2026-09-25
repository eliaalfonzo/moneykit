import type { AdderEntry } from '../AdderEntry';

/**
 * Puerto de persistencia de la sesión de la Sumadora en curso. Existe
 * para que, si la persona recarga la página sin querer a mitad de una
 * cuenta larga, no pierda lo que ya llevaba anotado.
 */
export interface AdderEntriesRepository {
  load(): readonly AdderEntry[];
  save(entries: readonly AdderEntry[]): void;
  clear(): void;
}