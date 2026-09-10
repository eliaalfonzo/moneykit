import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, WifiOff } from 'lucide-react';

export type BannerTone = 'success' | 'error' | 'offline';

const TONE_STYLES: Record<BannerTone, string> = {
  success: 'border-brand-500/30 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
  error: 'border-danger/30 bg-danger/5 text-danger',
  offline: 'border-warning/30 bg-warning/5 text-warning',
};

const TONE_ICON: Record<BannerTone, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
  error: <AlertTriangle className="h-4 w-4 shrink-0" />,
  offline: <WifiOff className="h-4 w-4 shrink-0" />,
};

interface StatusBannerProps {
  tone: BannerTone;
  children: ReactNode;
}

/** Aviso de estado (tasa actualizada / error de API / sin conexión), nunca un alert(). */
export function StatusBanner({ tone, children }: StatusBannerProps) {
  return (
    <div
      role="status"
      className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium leading-snug animate-fade-in ${TONE_STYLES[tone]}`}
    >
      {TONE_ICON[tone]}
      <span>{children}</span>
    </div>
  );
}