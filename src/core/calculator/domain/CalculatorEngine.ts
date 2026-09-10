export type CalculatorOperator = '+' | '-' | '×' | '÷';

export interface CalculatorState {
  readonly displayValue: string;
  readonly previousValue: number | null;
  readonly operator: CalculatorOperator | null;
  readonly overwrite: boolean;
  /**
   * Representación textual de TODA la operación en curso, p. ej.
   * "500 + 20 − 5 ×". Se usa para mostrar la cuenta completa en pantalla,
   * no solo el último paso encadenado.
   */
  readonly expression: string;
}

export const INITIAL_CALCULATOR_STATE: CalculatorState = {
  displayValue: '0',
  previousValue: null,
  operator: null,
  overwrite: true,
  expression: '',
};

function applyOperator(a: number, b: number, operator: CalculatorOperator): number {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b === 0 ? NaN : a / b;
  }
}

/**
 * Redondea a 12 cifras significativas para eliminar el ruido de coma
 * flotante (p. ej. 0.1 + 0.2 = 0.30000000000000004) sin truncar números
 * legítimamente grandes o pequeños.
 */
function roundResult(value: number): number {
  if (!Number.isFinite(value)) return value;
  return parseFloat(value.toPrecision(12));
}

/** Reemplaza el último operador de una expresión ya construida (p. ej. al cambiar de "+" a "×"). */
function replaceLastOperator(expression: string, operator: CalculatorOperator): string {
  return `${expression.slice(0, -1)}${operator}`;
}

/**
 * Máquina de estados pura de una calculadora básica de encadenamiento
 * (estilo calculadora de bolsillo). Cada método devuelve un nuevo estado
 * sin mutar el anterior (inmutabilidad -> fácil de testear y depurar).
 */
export class CalculatorEngine {
  inputDigit(state: CalculatorState, digit: string): CalculatorState {
    if (state.overwrite) {
      return { ...state, displayValue: digit === '.' ? '0.' : digit, overwrite: false };
    }
    if (digit === '.' && state.displayValue.includes('.')) return state;
    if (state.displayValue === '0' && digit !== '.') {
      return { ...state, displayValue: digit };
    }
    return { ...state, displayValue: state.displayValue + digit };
  }

  /** Borra el último dígito escrito (tecla "Backspace" / retroceso). */
  deleteLastDigit(state: CalculatorState): CalculatorState {
    if (state.overwrite) return state;

    const trimmed = state.displayValue.slice(0, -1);
    if (trimmed === '' || trimmed === '-') {
      return { ...state, displayValue: '0', overwrite: true };
    }
    return { ...state, displayValue: trimmed };
  }

  toggleSign(state: CalculatorState): CalculatorState {
    const value = parseFloat(state.displayValue) * -1;
    return { ...state, displayValue: String(value) };
  }

  inputPercentage(state: CalculatorState): CalculatorState {
    const value = parseFloat(state.displayValue) / 100;
    return { ...state, displayValue: String(value), overwrite: true };
  }

  chooseOperator(state: CalculatorState, operator: CalculatorOperator): CalculatorState {
    const currentValue = parseFloat(state.displayValue);

    // Primer operador de la cuenta: "500" + "+" => expresión = "500 +"
    if (state.previousValue === null) {
      return {
        ...state,
        previousValue: currentValue,
        operator,
        overwrite: true,
        expression: `${currentValue} ${operator}`,
      };
    }

    // El usuario presionó un operador y luego cambió de opinión sin
    // escribir un número nuevo: solo se reemplaza el operador, no se
    // vuelve a acumular la expresión.
    if (state.overwrite) {
      return { ...state, operator, expression: replaceLastOperator(state.expression, operator) };
    }

    // Paso normal de la cadena: se calcula el resultado parcial y se
    // AGREGA (no se reemplaza) el nuevo número y operador a la expresión
    // completa, para que en pantalla se vea toda la cuenta.
    const result = roundResult(applyOperator(state.previousValue, currentValue, state.operator as CalculatorOperator));
    return {
      previousValue: result,
      operator,
      displayValue: String(result),
      overwrite: true,
      expression: `${state.expression} ${currentValue} ${operator}`,
    };
  }

  /** Ejecuta "=" y retorna el nuevo estado junto con una entrada de historial opcional. */
  evaluate(state: CalculatorState): { state: CalculatorState; historyEntry: string | null } {
    if (state.operator === null || state.previousValue === null) {
      return { state, historyEntry: null };
    }

    const currentValue = parseFloat(state.displayValue);
    const result = roundResult(applyOperator(state.previousValue, currentValue, state.operator));
    const historyEntry = `${state.expression} ${currentValue} = ${result}`;

    return {
      state: { displayValue: String(result), previousValue: null, operator: null, overwrite: true, expression: '' },
      historyEntry,
    };
  }

  clear(): CalculatorState {
    return INITIAL_CALCULATOR_STATE;
  }
}