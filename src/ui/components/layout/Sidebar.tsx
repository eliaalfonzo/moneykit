import { NavLink } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { NAV_ITEMS } from './navigation';

/** Barra lateral fija para escritorio/tablet ancho. Oculta en móvil (ver MobileDrawer). */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-soft">
          <Coins className="h-5 w-5" />
        </div>
        <span className="text-lg font-extrabold tracking-tight text-ink">MoneyKit</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150',
                isActive
                  ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                  : 'text-muted hover:bg-ink/5 hover:text-ink',
              ].join(' ')
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <p className="px-2 text-xs text-muted">
        Tasas de cambio referenciales. No constituye asesoría financiera.
      </p>
    </aside>
  );
}