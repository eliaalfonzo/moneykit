import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

/** Superficie base con borde, sombra suave y elevación opcional al hover. */
export function Card({ children, hoverable = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl border border-border bg-surface p-5 shadow-soft transition-all duration-200',
        hoverable ? 'hover:-translate-y-0.5 hover:shadow-soft-lg' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
