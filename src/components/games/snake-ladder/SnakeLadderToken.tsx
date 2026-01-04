'use client';

import React from 'react';
import { PLAYER_COLORS } from '@/types/snakeLadder';
import GamePawn from '@/components/games/shared/GamePawn';

interface SnakeLadderTokenProps {
    playerIndex: number;
    username: string;
    size?: number;
    isMultiple?: boolean;
    stackIndex?: number;
    totalInStack?: number;
}

export default function SnakeLadderToken({
    playerIndex,
    username,
    size = 40,
    isMultiple = false,
    stackIndex = 0,
    totalInStack = 1
}: SnakeLadderTokenProps) {
    // PLAYER_COLORS is object in frontend types
    const colorObj = PLAYER_COLORS[playerIndex] || PLAYER_COLORS[0];
    const color = colorObj.hex;

    // Calculate offset for stacked tokens to ensure visibility
    const offset = isMultiple
        ? (stackIndex * 8 - (totalInStack - 1) * 4)
        : 0;

    // Pawn size - slightly smaller to fit nicely in cells
    const pawnSize = size * 0.85;

    return (
        <div
            className="absolute transition-all duration-300 ease-out hover:z-50"
            style={{
                width: pawnSize,
                height: pawnSize,
                left: (size - pawnSize) / 2,
                top: (size - pawnSize) / 2 - 4, // Slight offset up for better visual
                transform: `translate(${offset}px, ${offset}px)`,
                zIndex: 50 + stackIndex
            }}
        >
            <GamePawn
                color={color}
                size={pawnSize}
                glow={false}
                useGoldAccents={true}
                label={username.charAt(0).toUpperCase()}
            />

            {/* Tooltip */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/90 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm opacity-0 hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity border border-slate-200">
                {username}
            </div>
        </div>
    );
}
