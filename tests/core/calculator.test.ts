import { describe, expect, it } from 'vitest';
import { CalculatorEngine, INITIAL_CALCULATOR_STATE } from '@core/calculator/domain/CalculatorEngine';

describe('CalculatorEngine', () => {
  const engine = new CalculatorEngine();

  it('encadena una suma simple: 500 + 3 = 503', () => {
    let state = engine.inputDigit(INITIAL_CALCULATOR_STATE, '5');
    state = engine.inputDigit(state, '0');
    state = engine.inputDigit(state, '0');
    state = engine.chooseOperator(state, '+');
    state = engine.inputDigit(state, '3');
    const { state: result, historyEntry } = engine.evaluate(state);

    expect(result.displayValue).toBe('503');
    expect(historyEntry).toBe('500 + 3 = 503');
  });

  it('borra el último dígito con deleteLastDigit', () => {
    let state = engine.inputDigit(INITIAL_CALCULATOR_STATE, '1');
    state = engine.inputDigit(state, '2');
    state = engine.inputDigit(state, '3');
    state = engine.deleteLastDigit(state);
    expect(state.displayValue).toBe('12');
  });

  it('vuelve a "0" si se borra el único dígito restante', () => {
    const state = engine.inputDigit(INITIAL_CALCULATOR_STATE, '7');
    const result = engine.deleteLastDigit(state);
    expect(result.displayValue).toBe('0');
    expect(result.overwrite).toBe(true);
  });

  it('redondea el ruido de coma flotante (0.1 + 0.2)', () => {
    let state = engine.inputDigit(INITIAL_CALCULATOR_STATE, '0');
    state = engine.inputDigit(state, '.');
    state = engine.inputDigit(state, '1');
    state = engine.chooseOperator(state, '+');
    state = engine.inputDigit(state, '0');
    state = engine.inputDigit(state, '.');
    state = engine.inputDigit(state, '2');
    const { state: result } = engine.evaluate(state);

    expect(result.displayValue).toBe('0.3');
  });

  it('permite encadenar operadores sin presionar "="', () => {
    let state = engine.inputDigit(INITIAL_CALCULATOR_STATE, '2');
    state = engine.chooseOperator(state, '+');
    state = engine.inputDigit(state, '3');
    state = engine.chooseOperator(state, '×');
    state = engine.inputDigit(state, '4');
    const { state: result } = engine.evaluate(state);

    // (2 + 3) encadenado, luego × 4 => 5 × 4 = 20
    expect(result.displayValue).toBe('20');
  });

  it('acumula la expresión COMPLETA en pantalla, no solo el último paso', () => {
    let state = engine.inputDigit(INITIAL_CALCULATOR_STATE, '5');
    state = engine.inputDigit(state, '0');
    state = engine.inputDigit(state, '0');
    state = engine.chooseOperator(state, '+');
    expect(state.expression).toBe('500 +');

    state = engine.inputDigit(state, '2');
    state = engine.inputDigit(state, '0');
    state = engine.chooseOperator(state, '-');
    // Antes del fix, esto se "recortaba" y solo mostraba "520 -".
    expect(state.expression).toBe('500 + 20 -');

    state = engine.inputDigit(state, '5');
    const { historyEntry } = engine.evaluate(state);
    expect(historyEntry).toBe('500 + 20 - 5 = 515');
  });
});