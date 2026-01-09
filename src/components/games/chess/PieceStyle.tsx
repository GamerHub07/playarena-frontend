'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════
// PIECE STYLE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export interface PieceStyle {
    id: string;
    name: string;
    // Piece characters for display
    pieces: {
        white: {
            king: string;
            queen: string;
            rook: string;
            bishop: string;
            knight: string;
            pawn: string;
        };
        black: {
            king: string;
            queen: string;
            rook: string;
            bishop: string;
            knight: string;
            pawn: string;
        };
    };
    // CSS classes for additional styling
    whiteClass: string;
    blackClass: string;
}

export const PIECE_STYLES: Record<string, PieceStyle> = {
    classic: {
        id: 'classic',
        name: 'Classic',
        pieces: {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
        },
        whiteClass: 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]',
        blackClass: 'text-gray-900 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]',
    },
    neo: {
        id: 'neo',
        name: 'Neo',
        pieces: {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
        },
        whiteClass: 'text-amber-100 drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)]',
        blackClass: 'text-slate-800 drop-shadow-[0_2px_2px_rgba(255,255,255,0.2)]',
    },
    staunton: {
        id: 'staunton',
        name: 'Staunton',
        pieces: {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
        },
        whiteClass: 'text-stone-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]',
        blackClass: 'text-stone-900 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]',
    },
    wood: {
        id: 'wood',
        name: 'Wood',
        pieces: {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
        },
        whiteClass: 'text-amber-50 drop-shadow-[0_2px_3px_rgba(101,67,33,0.8)]',
        blackClass: 'text-amber-900 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]',
    },
    glass: {
        id: 'glass',
        name: 'Glass',
        pieces: {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
        },
        whiteClass: 'text-white/90 drop-shadow-[0_2px_4px_rgba(255,255,255,0.5)]',
        blackClass: 'text-black/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]',
    },
    neon: {
        id: 'neon',
        name: 'Neon',
        pieces: {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
        },
        whiteClass: 'text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]',
        blackClass: 'text-fuchsia-500 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]',
    },
};

// ═══════════════════════════════════════════════════════════════
// PIECE STYLE CONTEXT
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'chess-piece-style';

interface PieceStyleContextType {
    style: PieceStyle;
    styleId: string;
    setStyle: (styleId: string) => void;
    styles: typeof PIECE_STYLES;
}

const PieceStyleContext = createContext<PieceStyleContextType | undefined>(undefined);

export function PieceStyleProvider({ children }: { children: ReactNode }) {
    const [styleId, setStyleId] = useState<string>('classic');

    // Load style from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && PIECE_STYLES[stored]) {
            setStyleId(stored);
        }
    }, []);

    // Save style to localStorage when changed
    const setStyle = (newStyleId: string) => {
        if (PIECE_STYLES[newStyleId]) {
            setStyleId(newStyleId);
            localStorage.setItem(STORAGE_KEY, newStyleId);
        }
    };

    const style = PIECE_STYLES[styleId] || PIECE_STYLES.classic;

    return (
        <PieceStyleContext.Provider value={{ style, styleId, setStyle, styles: PIECE_STYLES }}>
            {children}
        </PieceStyleContext.Provider>
    );
}

export function usePieceStyle() {
    const context = useContext(PieceStyleContext);
    if (!context) {
        throw new Error('usePieceStyle must be used within a PieceStyleProvider');
    }
    return context;
}

// Default export for standalone usage
export function getStyle(styleId: string = 'classic'): PieceStyle {
    return PIECE_STYLES[styleId] || PIECE_STYLES.classic;
}
