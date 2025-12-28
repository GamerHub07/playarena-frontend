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
          relative w-24 h-24 bg-white rounded-2xl shadow-xl
          transition-all duration-300 transform
          ${rolling ? 'animate-spin' : ''}
          ${canRoll && !rolling ? 'hover:scale-110 hover:rotate-12 cursor-pointer' : 'opacity-60 cursor-not-allowed'}
        `}
                style={{
                    boxShadow: canRoll
                        ? `0 8px 30px ${colorInfo.hex}60, 0 4px 10px rgba(0,0,0,0.2)`
                        : '0 4px 10px rgba(0,0,0,0.2)',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
                }}
            >
                {/* 3D Edge Effect */}
                <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                        boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.8), inset -2px -2px 6px rgba(0,0,0,0.1)',
                    }}
                />

                {/* Dots Grid */}
                <div className="absolute inset-4 grid grid-cols-3 grid-rows-3 gap-1">
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
                                            className="w-4 h-4 rounded-full bg-[#1a1a1a] shadow-inner"
                                            style={{
                                                boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.3)',
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </button>

            {/* Roll Prompt */}
            {canRoll && !rolling && (
                <div
                    className="px-4 py-2 rounded-lg animate-pulse"
                    style={{ backgroundColor: colorInfo.hex + '30' }}
                >
                    <p className="text-sm font-medium" style={{ color: colorInfo.hex }}>
                        🎲 Click to Roll!
                    </p>
                </div>
            )}

            {/* Last Roll Display */}
            {value && !canRoll && (
                <div className="text-white/60 text-sm">
                    Rolled: <span className="font-bold text-white">{value}</span>
                </div>
            )}
        </div>
    );
}
