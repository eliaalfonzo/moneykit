import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-soft hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  secondary:
    'bg-surface border border-border text-ink hover:border-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
  ghost: 'bg-transparent text-muted hover:bg-ink/5 hover:text-ink active:scale-[0.98]',
  danger: 'bg-danger/10 text-danger hover:bg-danger/15 active:scale-[0.98]',
};

/** Botón base con estados hover/active y microinteracción de presión. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', ...rest }, ref) => (
    <button
      ref={ref}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
        VARIANT_CLASSES[variant],
        className,
      ].join(' ')}
      {...rest}
    />
  ),
);
Button.displayName = 'Button';