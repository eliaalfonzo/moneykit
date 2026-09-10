import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { MobileDrawer } from './MobileDrawer';
import { FabMenu } from './FabMenu';
import { ToolsMenu } from './ToolsMenu';
import { useTheme } from '@ui/hooks/useTheme';
import { useOnlineStatus } from '@ui/hooks/useOnlineStatus';
import { StatusBanner } from '@ui/components/ui/StatusBanner';
import { Moon, Sun } from 'lucide-react';

/** Cascarón de la aplicación: sidebar/drawer + contenido enrutado + FAB. */
export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col">
        <MobileHeader onOpenMenu={() => setDrawerOpen(true)} theme={theme} onToggleTheme={toggleTheme} />

        <div className="hidden items-center justify-end gap-3 border-b border-border bg-surface px-8 py-3 lg:flex">
          <ToolsMenu />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-ink/5 hover:text-ink active:scale-95"
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
        </div>

        {!isOnline && (
          <div className="px-4 pt-4 lg:px-8">
            <StatusBanner tone="offline">
              Sin conexión. Puedes seguir usando las calculadoras; la tasa de cambio podría no estar
              actualizada.
            </StatusBanner>
          </div>
        )}

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28 lg:px-8 lg:py-10 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <FabMenu />
    </div>
  );
}
