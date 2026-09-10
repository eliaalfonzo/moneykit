import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  suffix?: string;
}

/** Campo numérico/texto con label, sufijo opcional y mensaje de error inline (sin alert()). */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, errorMessage, suffix, className = '', id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <label htmlFor={inputId} className="block">
        {label && (
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
            {label}
          </span>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={[
              'w-full rounded-xl border bg-surface px-4 py-3 font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-muted/70',
              errorMessage ? 'border-danger' : 'border-border focus:border-brand-500',
              suffix ? 'pr-14' : '',
              className,
            ].join(' ')}
            {...rest}
          />
          {suffix && (
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-muted">
              {suffix}
            </span>
          )}
        </div>
        {errorMessage && <p className="mt-1.5 text-xs font-medium text-danger">{errorMessage}</p>}
      </label>
    );
  },
);
Input.displayName = 'Input';
