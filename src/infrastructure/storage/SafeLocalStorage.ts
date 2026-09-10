/**
 * Envoltorio defensivo sobre `window.localStorage`.
 * Centraliza el try/catch (Safari en modo privado, cuotas excedidas,
 * SSR sin `window`, etc.) para que el resto de adaptadores no repitan
 * ese manejo de errores (DRY).
 */
export class SafeLocalStorage {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): boolean {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  }
}

export const safeLocalStorage = new SafeLocalStorage();
