import type { CalculatorHistoryRepository } from '@core/calculator/domain/ports/CalculatorHistoryRepository';
import { safeLocalStorage } from './SafeLocalStorage';

const STORAGE_KEY = 'moneykit:calculator:history';

export class LocalStorageCalculatorHistory implements CalculatorHistoryRepository {
  getAll(): readonly string[] {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }

  add(entry: string): readonly string[] {
    const updated = [entry, ...this.getAll()];
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  clear(): void {
    safeLocalStorage.removeItem(STORAGE_KEY);
  }
}
