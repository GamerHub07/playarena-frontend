'use client';

import React from 'react';
import { PLAYER_COLORS } from '@/types/snakeLadder';

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
        ? (stackIndex * 8 - (totalInStack - 1) * 4) // Larger offset for tall tokens
        : 0;

    // Taller aspect ratio for "Tall Pawn"
    // Use scale to adjust size prop to height
    const width = size * 0.7;
    const height = size * 1.4;

    return (
        <div
            className="absolute transition-all duration-300 ease-out hover:z-50 filter drop-shadow-xl"
            style={{
                width: width,
                height: height,
                // Center the bottom of the pawn on the cell center
                left: (size - width) / 2,
                top: (size - height) / 2 - (height * 0.4), // Shift up so base is near cell center
                transform: `translate(${offset}px, ${offset}px)`,
                zIndex: 50 + stackIndex
            }}
        >
            {/* 3D Tall Pawn SVG */}
            <svg viewBox="0 0 60 100" className="w-full h-full overflow-visible">
                <defs>
                    <radialGradient id={`grad-${playerIndex}`} cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor={color} stopOpacity="1" />
                        <stop offset="100%" stopColor={colorObj.bg === '#fef2f2' ? '#991b1b' : '#000'} stopOpacity="0.6" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Shadow Base */}
                <ellipse cx="30" cy="95" rx="20" ry="6" fill="rgba(0,0,0,0.4)" />

                {/* Base Stand */}
                <path
                    d="M 10 90 L 50 90 L 55 95 L 5 95 Z"
                    fill="#444"
                />

                {/* Pawn Body (Tall & Curvy) */}
                <path
                    d="M 30 10
                       C 45 10 50 25 40 35
                       C 35 40 35 50 45 80
                       L 50 90
                       L 10 90
                       L 15 80
                       C 25 50 25 40 20 35
                       C 10 25 15 10 30 10 Z"
                    fill={color}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="2"
                />

                {/* Head Sphere */}
                <circle cx="30" cy="15" r="10" fill={color} stroke="rgba(255,255,255,0.6)" strokeWidth="2" />

                {/* Shine Highlight */}
                <ellipse cx="25" cy="12" rx="3" ry="5" fill="white" opacity="0.5" transform="rotate(-15)" />

                {/* Initial */}
                <text
                    x="30"
                    y="60"
                    fill="white"
                    textAnchor="middle"
                    fontSize="20"
                    fontWeight="900"
                    pointerEvents="none"
                    style={{ textShadow: '0px 2px 2px rgba(0,0,0,0.5)' }}
                >
                    {username.charAt(0).toUpperCase()}
                </text>
            </svg>

            {/* Tooltip */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/90 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm opacity-0 hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity border border-slate-200">
                {username}
            </div>
        </div>
    );
}
