import { Coins, Menu, Moon, Sun } from 'lucide-react';
import type { Theme } from '@ui/hooks/useTheme';
import { ToolsMenu } from './ToolsMenu';

interface MobileHeaderProps {
  onOpenMenu: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

/** Header propio de móvil: hamburguesa + marca + toggle de tema. */
export function MobileHeader({ onOpenMenu, theme, onToggleTheme }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menú"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5 active:scale-95"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-1.5">
        <Coins className="h-4 w-4 text-brand-500" />
        <span className="font-extrabold tracking-tight text-ink">MoneyKit</span>
      </div>

      {/* Grupo de la derecha: menú desplegable de herramientas (compacto,
          con degradado) + toggle de tema. Van agrupados para no romper el
          "justify-between" de 3 columnas del header. */}
      <div className="flex items-center gap-2">
        <ToolsMenu compact />
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Cambiar tema"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5 active:scale-95"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}