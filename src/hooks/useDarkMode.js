import { useEffect } from 'react';

/**
 * Syncs the app's dark mode class with the system preference (prefers-color-scheme).
 * Also listens for changes in real-time.
 */
export function useDarkMode() {
  useEffect(() => {
    const applyTheme = (isDark) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(mq.matches);

    const handler = (e) => applyTheme(e.matches);
    mq.addEventListener('change', handler);

    return () => mq.removeEventListener('change', handler);
  }, []);
}