import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
  setDark: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggle: () => {},
  setDark: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('loadsaathi-theme');
      if (stored) return stored === 'dark';
    } catch {
      // storage may be blocked (private mode / iframe) — fall through to OS preference
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Keep native controls (scrollbars, form inputs, select dropdowns) in sync
    root.style.colorScheme = isDark ? 'dark' : 'light';
    // Update the browser/mobile status-bar chrome color
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', isDark ? '#050816' : '#ea580c');
    }
    try {
      localStorage.setItem('loadsaathi-theme', isDark ? 'dark' : 'light');
    } catch { /* storage may be unavailable (private mode) */ }
  }, [isDark]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      try {
        const stored = localStorage.getItem('loadsaathi-theme');
        if (!stored) {
          setIsDark(e.matches);
        }
      } catch {
        setIsDark(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggle = useCallback(() => setIsDark(prev => !prev), []);
  const setDark = useCallback((v: boolean) => setIsDark(v), []);

  const value = useMemo(() => ({ isDark, toggle, setDark }), [isDark, toggle, setDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
