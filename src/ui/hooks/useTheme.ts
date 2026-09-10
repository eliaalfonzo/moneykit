import { useCallback, useEffect, useState } from 'react';
import { safeLocalStorage } from '@infrastructure/storage/SafeLocalStorage';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'moneykit:theme';

function getPreferredTheme(): Theme {
  const stored = safeLocalStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Hook que gestiona el tema claro/oscuro y lo sincroniza con <html class="dark">. */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    safeLocalStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
