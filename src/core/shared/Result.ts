/**
 * Result<T, E> — modela explícitamente éxito/fracaso sin recurrir a
 * excepciones para flujo de control. Fuerza a quien consume el resultado
 * a manejar ambos casos (principio de diseño "hacer los errores imposibles
 * de ignorar").
 */
export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T, E = string>(value: T): Result<T, E> => ({ ok: true, value });
export const err = <T = never, E = string>(error: E): Result<T, E> => ({ ok: false, error });
