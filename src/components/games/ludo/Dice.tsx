'use client';

import { PLAYER_COLORS, PlayerColor } from '@/types/ludo';
import { useLudoTheme } from '@/contexts/LudoThemeContext';

interface DiceProps {
    value: number | null;
    rolling: boolean;
    canRoll: boolean;
    onRoll: () => void;
    playerColor: PlayerColor;
}

// Dot positions for each dice value (3x3 grid, 0-indexed)
const DOT_POSITIONS: Record<number, [number, number][]> = {
    1: [[1, 1]],
    2: [[0, 2], [2, 0]],
    3: [[0, 2], [1, 1], [2, 0]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

export default function Dice({ value, rolling, canRoll, onRoll, playerColor }: DiceProps) {
    const { theme } = useLudoTheme();

    const colorInfo = PLAYER_COLORS[Object.keys(PLAYER_COLORS).find(
        k => PLAYER_COLORS[parseInt(k)].name === playerColor
    ) as unknown as number] || PLAYER_COLORS[0];

    const displayValue = value || 1;
    const dots = DOT_POSITIONS[displayValue] || [];

    return (
        <div className="flex flex-col items-center gap-1.5 sm:gap-4">
            {/* Custom slow spin animation */}
            <style jsx>{`
                @keyframes slowClockwiseSpin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                .dice-slow-spin {
                    animation: slowClockwiseSpin 3.5s linear infinite;
                }
            `}</style>

            {/* Dice Container */}
            <button
                onClick={onRoll}
                disabled={!canRoll || rolling}
                className={`
          relative w-12 h-12 sm:w-20 md:w-24 sm:h-20 md:h-24 rounded-lg sm:rounded-xl
          transition-all duration-300 transform
          ${rolling ? 'dice-slow-spin' : ''}
          ${canRoll && !rolling ? 'hover:scale-110 hover:rotate-12 cursor-pointer' : 'opacity-70 cursor-not-allowed'}
        `}
                style={{
                    background: theme.dice.background,
                    boxShadow: canRoll
                        ? `0 8px 20px ${theme.dice.shadowColor}, 
                           0 4px 8px rgba(0,0,0,0.3),
                           inset 0 2px 4px rgba(255,255,255,0.5),
                           inset 0 -2px 4px rgba(0,0,0,0.2),
                           0 0 20px ${colorInfo.hex}40`
                        : `0 4px 8px rgba(0,0,0,0.2),
                           inset 0 2px 4px rgba(255,255,255,0.3)`,
                    border: `2px solid ${theme.dice.borderColor}`,
                    borderRadius: 'clamp(8px, 2vw, 12px)',
                }}
            >
                {/* Texture overlay for themed dice */}
                {theme.effects.useWoodTexture && (
                    <div
                        className="absolute inset-0 rounded-lg sm:rounded-xl opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30c20-5 30 5 60-5' stroke='%23000' stroke-opacity='0.2' fill='none'/%3E%3Cpath d='M0 15c15-3 30 6 60 0' stroke='%23000' stroke-opacity='0.15' fill='none'/%3E%3Cpath d='M0 45c25 5 35-8 60 3' stroke='%23000' stroke-opacity='0.18' fill='none'/%3E%3C/svg%3E")`,
                            backgroundSize: '60px 60px',
                        }}
                    />
                )}

                {/* Edge bevel effect */}
                <div
                    className="absolute inset-0 rounded-lg sm:rounded-xl"
                    style={{
                        boxShadow: 'inset 3px 3px 6px rgba(255,255,255,0.4), inset -3px -3px 6px rgba(0, 0, 0, 0.2)',
                    }}
                />

                {/* Decorative corner dots for vintage themes */}
                {theme.effects.useGoldAccents && (
                    <>
                        <div
                            className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full opacity-30"
                            style={{ backgroundColor: theme.ui.accentColor }}
                        />
                        <div
                            className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full opacity-30"
                            style={{ backgroundColor: theme.ui.accentColor }}
                        />
                        <div
                            className="absolute bottom-1 left-1 sm:bottom-1.5 sm:left-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full opacity-30"
                            style={{ backgroundColor: theme.ui.accentColor }}
                        />
                        <div
                            className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full opacity-30"
                            style={{ backgroundColor: theme.ui.accentColor }}
                        />
                    </>
                )}

                {/* Dots Grid */}
                <div className="absolute inset-1.5 sm:inset-3 md:inset-4 grid grid-cols-3 grid-rows-3 gap-0.5 sm:gap-1">
                    {[0, 1, 2].map(row =>
                        [0, 1, 2].map(col => {
                            const hasDot = dots.some(([r, c]) => r === row && c === col);
                            return (
                                <div
                                    key={`${row}-${col}`}
                                    className="flex items-center justify-center"
                                >
                                    {hasDot && (
                                        <div
                                            className="w-2 h-2 sm:w-3 md:w-4 sm:h-3 md:h-4 rounded-full"
                                            style={{
                                                background: `radial-gradient(circle at 30% 30%, ${theme.dice.dotColor} 0%, ${theme.dice.dotColor} 100%)`,
                                                boxShadow: `
                                                    inset 1px 1px 2px rgba(255,255,255,0.2),
                                                    inset -1px -1px 2px rgba(0,0,0,0.3),
                                                    0 1px 2px rgba(255,255,255,0.2)
                                                `,
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </button>

            {/* Roll Prompt - hidden on mobile for compactness */}
            {canRoll && !rolling && (
                <div
                    className="hidden sm:block px-2 sm:px-4 py-1 sm:py-2 rounded-lg animate-pulse"
                    style={{
                        backgroundColor: theme.ui.cardBackground,
                        border: `1px solid ${theme.ui.accentColor}40`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                >
                    <p
                        className="text-xs sm:text-sm font-medium"
                        style={{
                            color: theme.ui.textPrimary,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                            fontFamily: theme.effects.fontFamily,
                        }}
                    >
                        🎲 Click to Roll!
                    </p>
                </div>
            )}

            {/* Last Roll Display */}
            {value && !canRoll && (
                <div
                    className="text-sm"
                    style={{
                        color: theme.ui.textSecondary,
                        fontFamily: theme.effects.fontFamily,
                    }}
                >
                    Rolled: <span
                        className="font-bold"
                        style={{
                            color: theme.ui.accentColor,
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        }}
                    >
                        {value}
                    </span>
                </div>
            )}
        </div>
    );
}
