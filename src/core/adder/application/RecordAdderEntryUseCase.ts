import { err, ok, type Result } from '@core/shared/Result';

export type AdderSign = '+' | '-';

/**
 * Caso de uso: valida el texto que la persona escribió y lo convierte en
 * un monto con signo, listo para agregarse a la lista de entradas.
 * Centraliza la validación para que la página (React) no tenga que
 * parsear ni decidir qué es un monto válido.
 */
export class RecordAdderEntryUseCase {
  execute(rawAmount: string, sign: AdderSign): Result<number, string> {
    const parsed = parseFloat(rawAmount.replace(',', '.'));

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return err('Anota un monto válido mayor a cero.');
    }

    return ok(sign === '-' ? -parsed : parsed);
  }
}