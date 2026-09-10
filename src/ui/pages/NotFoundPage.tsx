import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '@ui/components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <EmptyState icon={Compass} title="Página no encontrada" description="La herramienta que buscas no existe o cambió de lugar." />
      <Link to="/" className="text-sm font-semibold text-brand-600 hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
