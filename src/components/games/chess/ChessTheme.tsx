'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════
// THEME DEFINITIONS - 6 Premium Chess Themes
// ═══════════════════════════════════════════════════════════════

export interface ChessTheme {
    id: string;
    name: string;
    lightSquare: string;
    darkSquare: string;
    selectedSquare: string;
    lastMoveLight: string;
    lastMoveDark: string;
    checkHighlight: string;
    validMoveIndicator: string;
    boardBorder: string;
    previewColors: [string, string]; // For mini preview in selector
}

export const CHESS_THEMES: Record<string, ChessTheme> = {
    classic: {
        id: 'classic',
        name: 'Classic',
        lightSquare: '#f0d9b5',
        darkSquare: '#b58863',
        selectedSquare: '#829769',
        lastMoveLight: '#cdd26a',
        lastMoveDark: '#aaa23a',
        checkHighlight: '#e74c3c',
        validMoveIndicator: 'rgba(0,0,0,0.2)',
        boardBorder: '#4a3728',
        previewColors: ['#f0d9b5', '#b58863'],
    },
    ocean: {
        id: 'ocean',
        name: 'Ocean Blue',
        lightSquare: '#dee3e6',
        darkSquare: '#4e7a9e',
        selectedSquare: '#6baed6',
        lastMoveLight: '#9ecae1',
        lastMoveDark: '#3182bd',
        checkHighlight: '#d62728',
        validMoveIndicator: 'rgba(0,0,0,0.25)',
        boardBorder: '#2171b5',
        previewColors: ['#dee3e6', '#4e7a9e'],
    },
    forest: {
        id: 'forest',
        name: 'Forest Green',
        lightSquare: '#eeeed2',
        darkSquare: '#769656',
        selectedSquare: '#baca44',
        lastMoveLight: '#f6f669',
        lastMoveDark: '#829769',
        checkHighlight: '#ec4d4d',
        validMoveIndicator: 'rgba(0,0,0,0.2)',
        boardBorder: '#4f5d2f',
        previewColors: ['#eeeed2', '#769656'],
    },
    purple: {
        id: 'purple',
        name: 'Purple Night',
        lightSquare: '#e8d0ff',
        darkSquare: '#7b51a9',
        selectedSquare: '#9b59b6',
        lastMoveLight: '#d4a5ff',
        lastMoveDark: '#6a3d9a',
        checkHighlight: '#ff6b6b',
        validMoveIndicator: 'rgba(255,255,255,0.3)',
        boardBorder: '#4a235a',
        previewColors: ['#e8d0ff', '#7b51a9'],
    },
    wood: {
        id: 'wood',
        name: 'Walnut Wood',
        lightSquare: '#e8d5b6',
        darkSquare: '#a67c52',
        selectedSquare: '#c19a6b',
        lastMoveLight: '#dbc68a',
        lastMoveDark: '#8b6914',
        checkHighlight: '#c0392b',
        validMoveIndicator: 'rgba(0,0,0,0.25)',
        boardBorder: '#5d3a1a',
        previewColors: ['#e8d5b6', '#a67c52'],
    },
    midnight: {
        id: 'midnight',
        name: 'Midnight',
        lightSquare: '#505050',
        darkSquare: '#303030',
        selectedSquare: '#2c7a7b',
        lastMoveLight: '#4a5568',
        lastMoveDark: '#2d3748',
        checkHighlight: '#fc8181',
        validMoveIndicator: 'rgba(255,255,255,0.3)',
        boardBorder: '#1a202c',
        previewColors: ['#505050', '#303030'],
    },
};

// ═══════════════════════════════════════════════════════════════
// THEME CONTEXT
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'chess-theme';

interface ChessThemeContextType {
    theme: ChessTheme;
    themeId: string;
    setTheme: (themeId: string) => void;
    themes: typeof CHESS_THEMES;
}

const ChessThemeContext = createContext<ChessThemeContextType | undefined>(undefined);

export function ChessThemeProvider({ children }: { children: ReactNode }) {
    const [themeId, setThemeId] = useState<string>('classic');

    // Load theme from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && CHESS_THEMES[stored]) {
            setThemeId(stored);
        }
    }, []);

    // Save theme to localStorage when changed
    const setTheme = (newThemeId: string) => {
        if (CHESS_THEMES[newThemeId]) {
            setThemeId(newThemeId);
            localStorage.setItem(STORAGE_KEY, newThemeId);
        }
    };

    const theme = CHESS_THEMES[themeId] || CHESS_THEMES.classic;

    return (
        <ChessThemeContext.Provider value={{ theme, themeId, setTheme, themes: CHESS_THEMES }}>
            {children}
        </ChessThemeContext.Provider>
    );
}

export function useChessTheme() {
    const context = useContext(ChessThemeContext);
    if (!context) {
        throw new Error('useChessTheme must be used within a ChessThemeProvider');
    }
    return context;
}

// Default export for standalone usage without context
export function getTheme(themeId: string = 'classic'): ChessTheme {
    return CHESS_THEMES[themeId] || CHESS_THEMES.classic;
}
