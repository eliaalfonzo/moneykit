import type { AdderEntriesRepository } from '@core/adder/domain/ports/AdderEntriesRepository';
import type { AdderEntry } from '@core/adder/domain/AdderEntry';
import { safeLocalStorage } from './SafeLocalStorage';

const STORAGE_KEY = 'moneykit:adder:entries';

export class LocalStorageAdderEntries implements AdderEntriesRepository {
  load(): readonly AdderEntry[] {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as AdderEntry[];
    } catch {
      return [];
    }
  }

  save(entries: readonly AdderEntry[]): void {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  clear(): void {
    safeLocalStorage.removeItem(STORAGE_KEY);
  }
}