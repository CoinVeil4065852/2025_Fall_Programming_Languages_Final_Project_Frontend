import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';

type ThemeCtx = {
  choice: ThemeChoice;
  setChoice: (c: ThemeChoice) => void;
};

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [choice, setChoice] = useState<ThemeChoice>(() => {
    try {
      const s = localStorage.getItem('theme_choice') as ThemeChoice | null;
      return s ?? 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme_choice', choice);
    } catch {}
  }, [choice]);

  const value = useMemo(() => ({ choice, setChoice }), [choice]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useThemeChoice = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeChoice must be used inside ThemeProvider');
  return ctx;
}

export default ThemeContext;
