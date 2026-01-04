'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { LudoTheme, THEMES, DEFAULT_THEME_ID, getTheme } from '@/config/ludoThemes';

interface ThemeContextType {
  theme: LudoTheme;
  themeId: string;
  setThemeId: (id: string) => void;
  availableThemes: LudoTheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function LudoThemeProvider({ children }: { children: ReactNode }) {
  // Theme is now controlled by the room host, starts with default
  const [themeId, setThemeIdState] = useState<string>(DEFAULT_THEME_ID);

  // Set theme (called when receiving socket event from host)
  const setThemeId = useCallback((id: string) => {
    if (THEMES[id]) {
      setThemeIdState(id);
    }
  }, []);

  const theme = getTheme(themeId);
  const availableThemes = Object.values(THEMES);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeId,
        setThemeId,
        availableThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useLudoTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useLudoTheme must be used within a LudoThemeProvider');
  }
  return context;
}
