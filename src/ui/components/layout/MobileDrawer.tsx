import { NavLink } from 'react-router-dom';
import { Coins, X } from 'lucide-react';
import { NAV_ITEMS } from './navigation';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Drawer lateral animado para móvil: fondo oscurecido + panel que entra
 * desde la izquierda. Se desmonta del DOM (visualmente) cuando está
 * cerrado para no interferir con el foco/tab-order del resto de la app.
 */
export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-40 lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        className={`absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-surface px-4 py-6 shadow-soft-xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-soft">
              <Coins className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-ink">MoneyKit</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-ink/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors',
                  isActive ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400' : 'text-muted hover:bg-ink/5 hover:text-ink',
                ].join(' ')
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <p className="mt-auto px-2 pt-4 text-[11px] text-muted/70">Desarrollado por Elia</p>
      </aside>
    </div>
  );
}