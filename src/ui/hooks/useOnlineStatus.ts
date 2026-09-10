import { useEffect, useState } from 'react';

/**
 * Hook de infraestructura de navegador: refleja `navigator.onLine` y se
 * actualiza con los eventos `online`/`offline`. Aísla el acceso a APIs
 * del navegador para que el resto de la UI solo consuma un booleano.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
