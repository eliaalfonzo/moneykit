import {
  ArrowLeftRight,
  Calculator,
  LayoutDashboard,
  Percent,
  PiggyBank,
  Tag,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

/** Fuente única de verdad para la navegación: sidebar, drawer, FAB y dashboard la reutilizan. */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'Inicio', icon: LayoutDashboard },
  { path: '/conversor', label: 'Conversor', icon: ArrowLeftRight },
  { path: '/porcentajes', label: 'Porcentajes', icon: Percent },
  { path: '/descuentos', label: 'Descuentos', icon: Tag },
  { path: '/ahorro', label: 'Ahorro', icon: PiggyBank },
  { path: '/calculadora', label: 'Calculadora', icon: Calculator },
];

/** Subconjunto que se ofrece en el FAB móvil (excluye "Inicio"). */
export const FAB_ITEMS: readonly NavItem[] = NAV_ITEMS.filter((item) => item.path !== '/');
