import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { FAB_ITEMS } from './navigation';

interface ToolsMenuProps {
  /** Versión compacta (solo ícono, sin texto) para el header móvil. */
  compact?: boolean;
}

/**
 * Menú desplegable de acceso rápido a las herramientas. Se usa tanto en
 * la barra superior de escritorio (versión completa, con texto) como en
 * el header móvil (versión compacta, solo el ícono) — es el MISMO
 * componente e interacción en ambos casos, solo cambia el "disparador".
 */
export function ToolsMenu({ compact = false }: ToolsMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Abrir menú de herramientas"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-soft transition-transform duration-200 active:scale-90"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface py-1.5 pl-2 pr-3.5 text-sm font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-500/50"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white">
            <LayoutGrid className="h-3.5 w-3.5" />
          </span>
          Herramientas
          <ChevronDown className={`h-4 w-4 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Se mantiene siempre montado y se anima con clases (opacity + scale)
          en vez de {open && (...)}. Eso es justo lo que permite una
          transición fluida tanto al ABRIR como al CERRAR: si se
          desmontara del DOM de golpe, no habría tiempo para que la
          transición de salida se reproduzca. */}
      <div
        role="menu"
        aria-hidden={!open}
        style={{ transformOrigin: 'top right' }}
        className={[
          'absolute right-0 z-20 mt-2 w-60 rounded-xl border border-border bg-surface p-1.5 shadow-soft-xl',
          'transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-95 opacity-0',
        ].join(' ')}
      >
        {FAB_ITEMS.map(({ path, label, icon: Icon }, index) => (
          <button
            key={path}
            type="button"
            role="menuitem"
            tabIndex={open ? 0 : -1}
            onClick={() => {
              setOpen(false);
              navigate(path);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-ink/5"
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                index % 2 === 0
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                  : 'bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400'
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}