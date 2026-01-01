'use client';

import { ColorKey } from '@/lib/ludoBoardLayout';

// Premium 3D token colors with gradients
const TOKEN_COLORS: Record<ColorKey, { primary: string; secondary: string; highlight: string; shadow: string }> = {
    RED: {
        primary: '#E53935',
        secondary: '#B71C1C',
        highlight: '#FF6F61',
        shadow: '#7F0000',
    },
    GREEN: {
        primary: '#43A047',
        secondary: '#1B5E20',
        highlight: '#69F0AE',
        shadow: '#003300',
    },
    YELLOW: {
        primary: '#FDD835',
        secondary: '#F9A825',
        highlight: '#FFFF8D',
        shadow: '#C49000',
    },
    BLUE: {
        primary: '#1E88E5',
        secondary: '#0D47A1',
        highlight: '#64B5F6',
        shadow: '#002171',
    },
};

interface TokenProps {
    color: ColorKey;
    selectable: boolean;
    onClick: () => void;
    small?: boolean;
}

export default function Token({ color, selectable, onClick, small = false }: TokenProps) {
    const colors = TOKEN_COLORS[color];
    const size = small ? 18 : 32;

    return (
        <div
            onClick={() => selectable && onClick()}
            className={`
                relative transition-all duration-200 ease-out
                ${selectable ? 'cursor-pointer hover:scale-110 z-20' : 'cursor-default'}
                ${selectable ? 'animate-pulse' : ''}
            `}
            style={{
                width: size,
                height: size,
                filter: selectable ? `drop-shadow(0 0 8px ${colors.primary})` : 'none',
            }}
        >
            {/* SVG Pawn Token */}
            <svg
                viewBox="0 0 100 100"
                width={size}
                height={size}
                className="block"
            >
                <defs>
                    {/* Body Gradient */}
                    <linearGradient id={`bodyGrad-${color}-${small}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.highlight} />
                        <stop offset="30%" stopColor={colors.primary} />
                        <stop offset="70%" stopColor={colors.primary} />
                        <stop offset="100%" stopColor={colors.secondary} />
                    </linearGradient>

                    {/* Shine Effect */}
                    <linearGradient id={`shine-${color}-${small}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                        <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>

                    {/* Glow Filter */}
                    <filter id={`glow-${color}-${small}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Shadow */}
                <ellipse cx="50" cy="92" rx="28" ry="6" fill="rgba(0,0,0,0.3)" />

                {/* Base Platform */}
                <ellipse cx="50" cy="85" rx="28" ry="10" fill={colors.secondary} stroke={colors.shadow} strokeWidth="1.5" />
                <ellipse cx="50" cy="82" rx="28" ry="10" fill={`url(#bodyGrad-${color}-${small})`} stroke={colors.secondary} strokeWidth="1" />

                {/* Body */}
                <path
                    d="M 28 82 Q 25 55, 38 40 L 42 35 Q 50 30, 58 35 L 62 40 Q 75 55, 72 82 Z"
                    fill={`url(#bodyGrad-${color}-${small})`}
                    stroke={colors.secondary}
                    strokeWidth="1"
                />

                {/* Neck */}
                <ellipse cx="50" cy="33" rx="8" ry="4" fill={colors.primary} />

                {/* Head */}
                <circle
                    cx="50"
                    cy="22"
                    r="14"
                    fill={`url(#bodyGrad-${color}-${small})`}
                    stroke={colors.secondary}
                    strokeWidth="1.5"
                    filter={selectable ? `url(#glow-${color}-${small})` : undefined}
                />

                {/* Head Shine */}
                <ellipse cx="46" cy="18" rx="6" ry="5" fill={`url(#shine-${color}-${small})`} />

                {/* Body Shine */}
                <path d="M 35 75 Q 32 55, 42 42 L 45 42 Q 38 55, 40 75 Z" fill="rgba(255,255,255,0.2)" />

                {/* Selection Ring */}
                {selectable && (
                    <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="#FFD700"
                        strokeWidth="3"
                        strokeDasharray="8 4"
                    />
                )}
            </svg>
        </div>
    );
}
