'use client';

import { useEffect, useState } from 'react';
import { PlayerColor } from '@/types/chess';
import { Clock, AlertTriangle } from 'lucide-react';

interface PlayerClockProps {
    timeMs: number;
    isActive: boolean;
    color: PlayerColor;
    playerName: string;
    showWarning?: boolean;
}

function formatTime(ms: number): string {
    if (ms < 0) return '∞'; // Unlimited time

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (totalSeconds < 60) {
        // Show tenths of seconds when under 1 minute
        const tenths = Math.floor((ms % 1000) / 100);
        return `${seconds}.${tenths}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function PlayerClock({
    timeMs,
    isActive,
    color,
    playerName,
    showWarning = true
}: PlayerClockProps) {
    const isLowTime = timeMs >= 0 && timeMs < 30000; // Less than 30 seconds
    const isCritical = timeMs >= 0 && timeMs < 10000; // Less than 10 seconds
    const isUnlimited = timeMs < 0;

    // Animate the clock when active
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (isActive && isCritical) {
            const interval = setInterval(() => {
                setPulse(p => !p);
            }, 500);
            return () => clearInterval(interval);
        }
    }, [isActive, isCritical]);

    return (
        <div
            className={`
                relative rounded-xl px-4 py-3 transition-all duration-300
                ${isActive ? 'ring-2 ring-offset-2 ring-offset-gray-900' : ''}
                ${color === 'white'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }
                ${isActive && color === 'white' ? 'ring-white' : ''}
                ${isActive && color === 'black' ? 'ring-gray-400' : ''}
                ${isCritical && isActive ? 'animate-pulse bg-red-500/20' : ''}
            `}
        >
            {/* Player info */}
            <div className="flex items-center gap-2 mb-1">
                <div
                    className={`w-3 h-3 rounded-full ${color === 'white' ? 'bg-gray-200 border border-gray-400' : 'bg-gray-700'}`}
                />
                <span className={`text-xs font-medium truncate ${color === 'white' ? 'text-gray-600' : 'text-gray-400'}`}>
                    {playerName}
                </span>
                {isActive && (
                    <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-green-500">
                        Playing
                    </span>
                )}
            </div>

            {/* Time display */}
            <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${isActive ? 'animate-spin-slow' : ''} ${isCritical ? 'text-red-500' : ''}`} />
                <span
                    className={`
                        font-mono text-2xl font-bold tracking-tight
                        ${isCritical && pulse ? 'text-red-500' : ''}
                        ${isLowTime && !isCritical ? 'text-yellow-500' : ''}
                    `}
                >
                    {formatTime(timeMs)}
                </span>

                {/* Warning icon for low time */}
                {showWarning && isLowTime && !isUnlimited && (
                    <AlertTriangle
                        className={`w-4 h-4 ${isCritical ? 'text-red-500 animate-bounce' : 'text-yellow-500'}`}
                    />
                )}
            </div>

            {/* Active indicator bar */}
            {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-b-xl" />
            )}
        </div>
    );
}
