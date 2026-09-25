import { describe, expect, it } from 'vitest';
import { sumEntries } from '@core/adder/domain/AdderEntry';
import { RecordAdderEntryUseCase } from '@core/adder/application/RecordAdderEntryUseCase';

describe('sumEntries', () => {
  it('suma varias entradas positivas', () => {
    const total = sumEntries([
      { id: '1', amount: 50 },
      { id: '2', amount: 20 },
      { id: '3', amount: 30 },
    ]);
    expect(total).toBe(100);
  });

  it('resta las entradas negativas', () => {
    const total = sumEntries([
      { id: '1', amount: 100 },
      { id: '2', amount: -25 },
    ]);
    expect(total).toBe(75);
  });

  it('devuelve 0 para una lista vacía', () => {
    expect(sumEntries([])).toBe(0);
  });
});

describe('RecordAdderEntryUseCase', () => {
  const useCase = new RecordAdderEntryUseCase();

  it('acepta un monto positivo con signo "+"', () => {
    const result = useCase.execute('50', '+');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(50);
  });

  it('convierte a negativo un monto con signo "-"', () => {
    const result = useCase.execute('20', '-');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(-20);
  });

  it('acepta coma decimal', () => {
    const result = useCase.execute('12,5', '+');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(12.5);
  });

  it('rechaza un monto vacío o no numérico', () => {
    expect(useCase.execute('', '+').ok).toBe(false);
    expect(useCase.execute('abc', '+').ok).toBe(false);
  });

  it('rechaza cero o negativos como monto anotado (el signo va aparte)', () => {
    expect(useCase.execute('0', '+').ok).toBe(false);
    expect(useCase.execute('-5', '+').ok).toBe(false);
  });
});