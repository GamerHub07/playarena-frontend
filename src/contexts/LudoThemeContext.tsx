'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { LudoTheme, DEFAULT_THEME_ID, getTheme } from '@/config/ludoThemes';

// Lazy-load theme list only when needed (for theme selector)
let cachedThemeList: LudoTheme[] | null = null;

function getAvailableThemes(): LudoTheme[] {
  if (!cachedThemeList) {
    // Dynamically import and cache - only happens once when theme selector opens
    const { THEMES } = require('@/config/ludoThemes');
    cachedThemeList = Object.values(THEMES) as LudoTheme[];
  }
  return cachedThemeList;
}

// Lightweight theme metadata for selector (avoids loading full theme data)
export interface ThemePreview {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
}

// Pre-computed minimal theme previews for the selector
const THEME_PREVIEWS: ThemePreview[] = [
  { id: 'vintage', name: 'Vintage Classic', description: 'Classic wooden board game aesthetic', primaryColor: '#8B7355' },
  { id: 'modern', name: 'Modern Dark', description: 'Sleek, contemporary dark theme', primaryColor: '#3b82f6' },
  { id: 'ocean', name: 'Ocean Deep', description: 'Tranquil underwater adventure', primaryColor: '#1ABC9C' },
  { id: 'nature', name: 'Forest Garden', description: 'Calming natural green tones', primaryColor: '#27AE60' },
  { id: 'royal', name: 'Royal Palace', description: 'Luxurious purple and gold royalty', primaryColor: '#DAA520' },
];

interface ThemeContextType {
  theme: LudoTheme;
  themeId: string;
  setThemeId: (id: string) => void;
  availableThemes: LudoTheme[];
  themePreviews: ThemePreview[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function LudoThemeProvider({ children }: { children: ReactNode }) {
  // Theme is now controlled by the room host, starts with default
  const [themeId, setThemeIdState] = useState<string>(DEFAULT_THEME_ID);

  // Set theme (called when receiving socket event from host)
  const setThemeId = useCallback((id: string) => {
    // Validate theme exists before setting
    const validIds = THEME_PREVIEWS.map(t => t.id);
    if (validIds.includes(id)) {
      setThemeIdState(id);
    }
  }, []);

  // Memoize the current theme - only recalculates when themeId changes
  const theme = useMemo(() => getTheme(themeId), [themeId]);

  // Lazy load full themes only when accessed (for theme selector)
  const availableThemes = useMemo(() => getAvailableThemes(), []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme,
    themeId,
    setThemeId,
    availableThemes,
    themePreviews: THEME_PREVIEWS,
  }), [theme, themeId, setThemeId, availableThemes]);

  return (
    <ThemeContext.Provider value={contextValue}>
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
