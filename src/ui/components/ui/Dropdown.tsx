import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  meta?: string;
  icon?: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Selector personalizado (no <select> nativo) con apertura animada,
 * flecha que rota y cierre al hacer click fuera / presionar Escape.
 */
export function Dropdown({ label, options, value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

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
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-brand-500/50"
      >
        <span className="flex items-center gap-2 truncate font-semibold text-ink">
          {selected?.icon && <span className="text-lg leading-none">{selected.icon}</span>}
          <span className="truncate">{selected?.label ?? 'Selecciona'}</span>
          {selected?.meta && <span className="text-xs font-normal text-muted">{selected.meta}</span>}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Siempre montado (no {open && ...}) y animado por clases: es lo que
          permite que la transición se vea también al CERRAR, no solo al abrir. */}
      <ul
        role="listbox"
        aria-hidden={!open}
        style={{ transformOrigin: 'top' }}
        className={[
          'absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-border bg-surface p-1.5 shadow-soft-xl',
          'transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-95 opacity-0',
        ].join(' ')}
      >
        {options.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              role="option"
              tabIndex={open ? 0 : -1}
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                option.value === value
                  ? 'bg-brand-500/10 font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                  : 'text-ink hover:bg-ink/5'
              }`}
            >
              {option.icon && <span className="text-lg leading-none">{option.icon}</span>}
              <span className="truncate">{option.label}</span>
              {option.meta && <span className="ml-auto text-xs text-muted">{option.meta}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}