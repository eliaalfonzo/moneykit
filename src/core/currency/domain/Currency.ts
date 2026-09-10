/**
 * Catálogo de monedas soportadas por la aplicación. Vive en el dominio
 * porque es una regla de negocio (qué monedas ofrecemos), no un detalle
 * de infraestructura.
 */
export interface CurrencyInfo {
  readonly code: string;
  readonly name: string;
  readonly symbol: string;
  readonly flag: string;
}

export const SUPPORTED_CURRENCIES: readonly CurrencyInfo[] = [
  { code: 'VES', name: 'Bolívar venezolano', symbol: 'Bs', flag: '🇻🇪' },
  { code: 'USD', name: 'Dólar estadounidense', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'Libra esterlina', symbol: '£', flag: '🇬🇧' },
  { code: 'CAD', name: 'Dólar canadiense', symbol: 'CA$', flag: '🇨🇦' },
  { code: 'BRL', name: 'Real brasileño', symbol: 'R$', flag: '🇧🇷' },
  { code: 'COP', name: 'Peso colombiano', symbol: 'COL$', flag: '🇨🇴' },
  { code: 'MXN', name: 'Peso mexicano', symbol: 'MX$', flag: '🇲🇽' },
  { code: 'ARS', name: 'Peso argentino', symbol: 'AR$', flag: '🇦🇷' },
  { code: 'JPY', name: 'Yen japonés', symbol: '¥', flag: '🇯🇵' },
  { code: 'CHF', name: 'Franco suizo', symbol: 'Fr', flag: '🇨🇭' },
];

export function findCurrency(code: string): CurrencyInfo | undefined {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code);
}

export function isSupportedCurrency(code: string): boolean {
  return SUPPORTED_CURRENCIES.some((c) => c.code === code);
}
