'use client';

import { useChessTheme, CHESS_THEMES, ChessTheme } from './ChessTheme';
import { Palette, Check } from 'lucide-react';

interface ThemeSelectorProps {
    compact?: boolean;
}

export default function ThemeSelector({ compact = false }: ThemeSelectorProps) {
    const { themeId, setTheme, themes } = useChessTheme();

    const themeList = Object.values(themes);

    // Render a mini 2x2 board preview
    const renderPreview = (theme: ChessTheme) => (
        <div
            className="w-8 h-8 grid grid-cols-2 rounded overflow-hidden shadow-sm"
            style={{ border: `2px solid ${theme.boardBorder}` }}
        >
            <div style={{ backgroundColor: theme.lightSquare }} />
            <div style={{ backgroundColor: theme.darkSquare }} />
            <div style={{ backgroundColor: theme.darkSquare }} />
            <div style={{ backgroundColor: theme.lightSquare }} />
        </div>
    );

    if (compact) {
        return (
            <div className="flex gap-2 flex-wrap">
                {themeList.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={`
                            relative p-1 rounded-lg transition-all
                            ${themeId === theme.id
                                ? 'ring-2 ring-white/50 scale-110'
                                : 'hover:scale-105 opacity-70 hover:opacity-100'
                            }
                        `}
                        title={theme.name}
                    >
                        {renderPreview(theme)}
                        {themeId === theme.id && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-wider">
                <Palette className="w-4 h-4" />
                Board Theme
            </div>

            <div className="grid grid-cols-3 gap-3">
                {themeList.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={`
                            flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                            ${themeId === theme.id
                                ? 'bg-white/20 ring-2 ring-white/50'
                                : 'bg-white/5 hover:bg-white/10'
                            }
                        `}
                    >
                        {/* Large preview */}
                        <div
                            className="w-12 h-12 grid grid-cols-2 rounded-lg overflow-hidden shadow-md"
                            style={{ border: `3px solid ${theme.boardBorder}` }}
                        >
                            <div style={{ backgroundColor: theme.lightSquare }} />
                            <div style={{ backgroundColor: theme.darkSquare }} />
                            <div style={{ backgroundColor: theme.darkSquare }} />
                            <div style={{ backgroundColor: theme.lightSquare }} />
                        </div>

                        <span className={`text-xs font-medium ${themeId === theme.id ? 'text-white' : 'text-gray-400'}`}>
                            {theme.name}
                        </span>

                        {themeId === theme.id && (
                            <Check className="w-4 h-4 text-green-400" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
