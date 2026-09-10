import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Estado vacío ilustrado: invita a actuar en lugar de mostrar un hueco en blanco. */
export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}