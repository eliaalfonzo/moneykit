export interface CalculatorHistoryRepository {
  getAll(): readonly string[];
  add(entry: string): readonly string[];
  clear(): void;
}
