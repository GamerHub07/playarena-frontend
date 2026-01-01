'use client';

import { PLAYER_COLORS, PlayerColor } from '@/types/ludo';

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
    const colorInfo = PLAYER_COLORS[Object.keys(PLAYER_COLORS).find(
        k => PLAYER_COLORS[parseInt(k)].name === playerColor
    ) as unknown as number] || PLAYER_COLORS[0];

    const displayValue = value || 1;
    const dots = DOT_POSITIONS[displayValue] || [];

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Dice Container */}
            <button
                onClick={onRoll}
                disabled={!canRoll || rolling}
                className={`
                    relative w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-xl
                    transition-all duration-200 transform
                    ${canRoll && !rolling ? 'hover:scale-110 hover:rotate-6 cursor-pointer active:scale-95' : ''}
                    ${!canRoll && !rolling ? 'opacity-60 cursor-not-allowed' : ''}
                `}
                style={{
                    boxShadow: canRoll
                        ? `0 8px 25px ${colorInfo.hex}50, 0 4px 12px rgba(0,0,0,0.15)`
                        : '0 4px 10px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #eeeeee 100%)',
                    animation: rolling ? 'diceShake 0.15s ease-in-out infinite' : 'none',
                }}
            >
                {/* 3D Edge Effect - Top/Left Light */}
                <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                        boxShadow: 'inset 3px 3px 8px rgba(255,255,255,0.9), inset -2px -2px 6px rgba(0,0,0,0.08)',
                    }}
                />

                {/* Border */}
                <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                        border: '2px solid rgba(0,0,0,0.08)',
                    }}
                />

                {/* Dots Grid */}
                <div className="absolute inset-3 md:inset-4 grid grid-cols-3 grid-rows-3 gap-0.5">
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
                                            className="w-3 h-3 md:w-4 md:h-4 rounded-full"
                                            style={{
                                                background: 'radial-gradient(circle at 30% 30%, #444 0%, #1a1a1a 60%, #000 100%)',
                                                boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.15), 0 1px 2px rgba(0,0,0,0.3)',
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Rolling overlay effect */}
                {rolling && (
                    <div className="absolute inset-0 rounded-2xl bg-white/20 pointer-events-none" />
                )}
            </button>

            {/* Roll Prompt */}
            {canRoll && !rolling && (
                <div
                    className="px-4 py-2 rounded-xl"
                    style={{ backgroundColor: colorInfo.hex + '20', border: `1px solid ${colorInfo.hex}40` }}
                >
                    <p className="text-sm font-bold" style={{ color: colorInfo.hex }}>
                        🎲 Tap to Roll!
                    </p>
                </div>
            )}

            {/* Rolling indicator */}
            {rolling && (
                <div className="px-4 py-2 rounded-xl bg-gray-100">
                    <p className="text-sm font-medium text-gray-600 animate-pulse">
                        Rolling...
                    </p>
                </div>
            )}

            {/* Last Roll Display */}
            {value && !canRoll && !rolling && (
                <div className="text-gray-500 text-sm">
                    Rolled: <span className="font-bold text-gray-800 text-lg">{value}</span>
                    {value === 6 && <span className="ml-1">🎉</span>}
                </div>
            )}

            {/* CSS Animation */}
            <style jsx>{`
                @keyframes diceShake {
                    0% { 
                        transform: rotate(0deg) scale(1); 
                    }
                    25% { 
                        transform: rotate(-15deg) scale(1.05) translateX(-2px); 
                    }
                    50% { 
                        transform: rotate(15deg) scale(1.1) translateY(-3px); 
                    }
                    75% { 
                        transform: rotate(-10deg) scale(1.05) translateX(2px); 
                    }
                    100% { 
                        transform: rotate(0deg) scale(1); 
                    }
                }
            `}</style>
        </div>
    );
}
