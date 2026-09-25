import type { AdderEntriesRepository } from '../domain/ports/AdderEntriesRepository';
import type { AdderEntry } from '../domain/AdderEntry';

/**
 * Caso de uso: guarda y recupera la sesión de la Sumadora en curso,
 * delegando el almacenamiento real al puerto inyectado (en la práctica,
 * `localStorage`). Así la página (React) nunca depende del adaptador
 * concreto, solo de este caso de uso.
 */
export class AdderSessionUseCase {
  constructor(private readonly repository: AdderEntriesRepository) {}

  load(): readonly AdderEntry[] {
    return this.repository.load();
  }

  save(entries: readonly AdderEntry[]): void {
    this.repository.save(entries);
  }

  clear(): void {
    this.repository.clear();
  }
}