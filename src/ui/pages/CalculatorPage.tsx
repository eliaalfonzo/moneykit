import { useEffect, useState } from 'react';
import { Delete, History, Trash2 } from 'lucide-react';
import { Card } from '@ui/components/ui/Card';
import { container } from '@composition/container';
import {
  INITIAL_CALCULATOR_STATE,
  type CalculatorOperator,
  type CalculatorState,
} from '@core/calculator/domain/CalculatorEngine';

type KeyKind = 'digit' | 'operator' | 'action';
interface KeypadKey {
  label: string;
  kind: KeyKind;
  value: string;
  /** Ícono opcional en vez de texto (p. ej. ⌫), para que se vea prolijo. */
  icon?: typeof Delete;
}

// Grilla pareja de 4×5 = 20 celdas para 20 teclas. A propósito NO se usa
// ningún "col-span" (el "0" antes ocupaba 2 columnas pegado al ".", y esa
// combinación era justo la rayita/artefacto visual raro que se veía al
// lado del cero). Ahora todas las teclas son de 1 celda, parejas.
const KEYPAD: KeypadKey[] = [
  { label: 'AC', kind: 'action', value: 'clear' },
  { label: '⌫', kind: 'action', value: 'delete', icon: Delete },
  { label: '%', kind: 'action', value: 'percent' },
  { label: '÷', kind: 'operator', value: '÷' },
  { label: '7', kind: 'digit', value: '7' },
  { label: '8', kind: 'digit', value: '8' },
  { label: '9', kind: 'digit', value: '9' },
  { label: '×', kind: 'operator', value: '×' },
  { label: '4', kind: 'digit', value: '4' },
  { label: '5', kind: 'digit', value: '5' },
  { label: '6', kind: 'digit', value: '6' },
  { label: '−', kind: 'operator', value: '-' },
  { label: '1', kind: 'digit', value: '1' },
  { label: '2', kind: 'digit', value: '2' },
  { label: '3', kind: 'digit', value: '3' },
  { label: '+', kind: 'operator', value: '+' },
  { label: '±', kind: 'action', value: 'sign' },
  { label: '0', kind: 'digit', value: '0' },
  { label: '.', kind: 'digit', value: '.' },
  { label: '=', kind: 'action', value: 'equals' },
];

// Mapea teclas físicas del teclado a las mismas acciones del keypad en pantalla.
const KEYBOARD_MAP: Record<string, { kind: KeyKind; value: string }> = {
  0: { kind: 'digit', value: '0' },
  1: { kind: 'digit', value: '1' },
  2: { kind: 'digit', value: '2' },
  3: { kind: 'digit', value: '3' },
  4: { kind: 'digit', value: '4' },
  5: { kind: 'digit', value: '5' },
  6: { kind: 'digit', value: '6' },
  7: { kind: 'digit', value: '7' },
  8: { kind: 'digit', value: '8' },
  9: { kind: 'digit', value: '9' },
  '.': { kind: 'digit', value: '.' },
  ',': { kind: 'digit', value: '.' },
  '+': { kind: 'operator', value: '+' },
  '-': { kind: 'operator', value: '-' },
  '*': { kind: 'operator', value: '×' },
  x: { kind: 'operator', value: '×' },
  '/': { kind: 'operator', value: '÷' },
  Enter: { kind: 'action', value: 'equals' },
  '=': { kind: 'action', value: 'equals' },
  Escape: { kind: 'action', value: 'clear' },
  '%': { kind: 'action', value: 'percent' },
};

/** Reduce el tamaño de la tipografía a medida que crece el número para que nunca se corte. */
function fontSizeClassFor(value: string): string {
  if (value.length > 14) return 'text-xl';
  if (value.length > 11) return 'text-2xl';
  if (value.length > 8) return 'text-3xl';
  return 'text-4xl';
}

/** Calculadora tradicional integrada, con historial persistido en localStorage. */
export function CalculatorPage() {
  const [state, setState] = useState<CalculatorState>(INITIAL_CALCULATOR_STATE);
  const [history, setHistory] = useState<readonly string[]>(() => container.calculatorHistory.list());

  function handleKey(kind: KeyKind, value: string) {
    const engine = container.calculatorEngine;

    if (kind === 'digit') {
      setState((current) => engine.inputDigit(current, value));
      return;
    }

    if (kind === 'operator') {
      setState((current) => engine.chooseOperator(current, value as CalculatorOperator));
      return;
    }

    switch (value) {
      case 'clear':
        setState(engine.clear());
        return;
      case 'sign':
        setState((current) => engine.toggleSign(current));
        return;
      case 'percent':
        setState((current) => engine.inputPercentage(current));
        return;
      case 'delete':
        setState((current) => engine.deleteLastDigit(current));
        return;
      case 'equals': {
        // El registro en el historial es un efecto secundario (escribe en
        // localStorage) y NO debe vivir dentro del "updater" funcional de
        // setState: React.StrictMode invoca esa función dos veces a
        // propósito en desarrollo para detectar efectos impuros, y eso
        // duplicaba cada operación en el historial. Por eso se calcula
        // todo a partir del estado actual y el efecto se dispara UNA sola vez.
        const { state: nextState, historyEntry } = engine.evaluate(state);
        setState(nextState);
        if (historyEntry) {
          setHistory(container.calculatorHistory.record(historyEntry));
        }
        return;
      }
    }
  }

  // Soporte de teclado físico: escribir números y operar sin tocar la pantalla.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Backspace') {
        event.preventDefault();
        handleKey('action', 'delete');
        return;
      }
      const mapped = KEYBOARD_MAP[event.key];
      if (mapped) {
        event.preventDefault();
        handleKey(mapped.kind, mapped.value);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function handleClearHistory() {
    container.calculatorHistory.clear();
    setHistory([]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Calculadora rápida</h1>
        <p className="mt-1 text-muted">Para esas cuentas de último momento, sin salir de MoneyKit.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="flex flex-col gap-5">
          {/* Pantalla: SIEMPRE fondo oscuro fijo (bg-screen), no depende del
              tema claro/oscuro de la app, así el texto blanco nunca queda
              invisible sobre un fondo que también se vuelve claro. Ya no
              tiene ningún botón/ícono flotando encima: solo texto. */}
          <div className="flex min-h-[104px] flex-col justify-between gap-2 rounded-2xl bg-screen px-5 py-4 text-right">
            {/* Línea de la operación COMPLETA: no se corta ni se reemplaza
                en cada paso — crece con toda la cuenta
                ("500 + 20 − 5 ×") y hace scroll horizontal si no cabe. */}
            <span className="block min-h-[1.25rem] overflow-x-auto whitespace-nowrap text-sm font-medium tracking-wide text-zinc-400">
              {state.expression || '\u00A0'}
            </span>
            <p
              key={state.displayValue}
              className={`animate-fade-in overflow-x-auto whitespace-nowrap font-mono font-bold leading-none text-white ${fontSizeClassFor(state.displayValue)}`}
            >
              {state.displayValue}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {KEYPAD.map((key) => (
              <button
                key={key.label}
                type="button"
                onClick={() => handleKey(key.kind, key.value)}
                aria-label={key.value === 'delete' ? 'Borrar último dígito' : undefined}
                className={[
                  'flex items-center justify-center rounded-xl py-3.5 text-lg font-semibold transition-all duration-150 active:scale-95',
                  key.kind === 'operator'
                    ? 'bg-brand-500 text-white hover:bg-brand-600'
                    : key.value === 'equals'
                      ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white hover:brightness-105'
                      : key.kind === 'action'
                        ? 'bg-ink/5 text-ink hover:bg-ink/10'
                        : 'border border-border bg-surface text-ink hover:border-brand-500/40',
                ].join(' ')}
              >
                {key.icon ? <key.icon className="h-5 w-5" /> : key.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <History className="h-4 w-4" />
              Historial
            </span>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                aria-label="Borrar historial"
                className="text-muted transition-colors hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Tus últimas operaciones aparecerán aquí.</p>
          ) : (
            <ul className="flex flex-col gap-1.5 overflow-auto">
              {history.map((entry, index) => (
                <li
                  key={`${entry}-${index}`}
                  className="overflow-x-auto whitespace-nowrap rounded-lg border border-border px-3 py-2 font-mono text-sm text-ink"
                >
                  {entry}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}