import type { CalculatorHistoryRepository } from '../domain/ports/CalculatorHistoryRepository';

const MAX_ENTRIES = 20;

/**
 * Caso de uso: gestionar el historial de operaciones de la calculadora
 * rápida, delegando la persistencia real al puerto inyectado.
 */
export class CalculatorHistoryUseCase {
  constructor(private readonly repository: CalculatorHistoryRepository) {}

  list(): readonly string[] {
    return this.repository.getAll();
  }

  record(entry: string): readonly string[] {
    const updated = this.repository.add(entry);
    return updated.slice(0, MAX_ENTRIES);
  }

  clear(): void {
    this.repository.clear();
  }
}
