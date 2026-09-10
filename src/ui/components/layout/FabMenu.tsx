import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { FAB_ITEMS } from './navigation';

/**
 * Botón flotante móvil que despliega las herramientas una por una con
 * una pequeña animación de entrada en cascada (escala + fade + stagger),
 * y rota su icono "+" al abrirse.
 */
export function FabMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    // pointer-events-none en el contenedor: así el rectángulo invisible que
    // ocupan los 5 botones de herramientas (aunque estén con opacity-0 al
    // estar cerrado) YA NO bloquea los toques de lo que hay debajo. Cada
    // botón recupera el click por su cuenta con pointer-events-auto.
    <div className="pointer-events-none fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3 lg:hidden">
      {FAB_ITEMS.map(({ path, label, icon: Icon }, index) => (
        <button
          key={path}
          type="button"
          onClick={() => {
            setOpen(false);
            navigate(path);
          }}
          style={{
            transitionDelay: open ? `${index * 35}ms` : '0ms',
          }}
          className={[
            'flex items-center gap-2.5 rounded-full border border-border bg-surface py-2.5 pl-4 pr-3 text-sm font-semibold text-ink shadow-soft-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
            open
              ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none translate-y-2 scale-90 opacity-0',
          ].join(' ')}
        >
          {label}
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              index % 2 === 0
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                : 'bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400'
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
        </button>
      ))}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Cerrar herramientas' : 'Abrir herramientas'}
        aria-expanded={open}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-soft-xl transition-all duration-300 hover:brightness-105 active:scale-95"
      >
        <Plus className={`h-6 w-6 transition-transform duration-300 ${open ? 'rotate-45' : 'rotate-0'}`} />
      </button>
    </div>
  );
}