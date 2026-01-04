'use client';

import { useState } from 'react';
import { Player } from '@/types/game';
import Card from '@/components/ui/Card';
import { useLudoTheme } from '@/contexts/LudoThemeContext';

interface WaitingRoomProps {
    roomCode: string;
    players: Player[];
    isHost: boolean;
    minPlayers: number;
    maxPlayers: number;
    onStart: () => void;
    onLeave: () => void;
}

export default function WaitingRoom({
    roomCode,
    players,
    isHost,
    minPlayers,
    maxPlayers,
    onStart,
    onLeave,
}: WaitingRoomProps) {
    const { theme } = useLudoTheme();
    const [copied, setCopied] = useState(false);
    const canStart = players.length >= minPlayers;

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Get player colors from theme
    const getPlayerColor = (index: number) => {
        const colorMap: (keyof typeof theme.playerColors)[] = ['red', 'green', 'yellow', 'blue'];
        return theme.playerColors[colorMap[index] || 'red'];
    };

    return (
        <div className="max-w-lg mx-auto">
            <Card
                className="p-8"
                style={{
                    backgroundColor: theme.ui.cardBackground,
                    border: `4px solid ${theme.ui.cardBorder}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
                }}
            >
                {/* Decorative Header */}
                {theme.effects.useGoldAccents && (
                    <div className="text-center mb-2">
                        <span className="text-2xl" style={{ color: theme.ui.accentColor }}>❧ ✦ ❧</span>
                    </div>
                )}

                {/* Room Code */}
                <div className="text-center mb-8">
                    <p
                        className="text-sm mb-2"
                        style={{ color: theme.ui.textSecondary, fontFamily: theme.effects.fontFamily }}
                    >
                        Room Code
                    </p>
                    <button
                        onClick={copyCode}
                        className="group flex items-center justify-center gap-2 mx-auto cursor-pointer transition-transform hover:scale-105"
                    >
                        <span
                            className="text-4xl font-bold tracking-widest"
                            style={{
                                color: theme.ui.textPrimary,
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                fontFamily: theme.effects.fontFamily,
                            }}
                        >
                            {roomCode}
                        </span>
                        {
                            copied ? (
                                <svg className="w-5 h-5" style={{ color: theme.playerColors.green.bg }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5 transition-colors"
                                    style={{ color: theme.ui.textSecondary }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                    </button>
                    <p
                        className="text-xs mt-2 transition-colors"
                        style={{
                            color: copied ? theme.playerColors.green.bg : theme.ui.textMuted,
                            fontFamily: theme.effects.fontFamily,
                        }}
                    >
                        {copied ? '✓ Copied!' : 'Click to copy'}
                    </p>
                </div>

                {/* Players List */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm" style={{ color: theme.ui.textSecondary, fontFamily: theme.effects.fontFamily }}>Players</p>
                        <p className="text-sm" style={{ color: theme.ui.textSecondary, fontFamily: theme.effects.fontFamily }}>{players.length}/{maxPlayers}</p>
                    </div >

                    <div className="space-y-3">
                        {Array.from({ length: maxPlayers }).map((_, i) => {
                            const player = players[i];
                            const playerColor = getPlayerColor(i);

                            return (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-4 rounded-lg"
                                    style={{
                                        backgroundColor: player ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)',
                                        border: player
                                            ? `2px solid ${playerColor.bg}50`
                                            : `2px dashed ${theme.ui.cardBorder}50`,
                                        boxShadow: player ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'none',
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                                        style={{
                                            backgroundColor: player ? playerColor.bg : theme.ui.cardBackground,
                                            color: theme.ui.textPrimary,
                                            border: `2px solid ${theme.ui.accentColor}60`,
                                            boxShadow: player ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                            fontFamily: theme.effects.fontFamily,
                                        }}
                                    >
                                        {player ? player.username.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className="flex-1">
                                        <p
                                            className="font-medium"
                                            style={{
                                                color: player ? theme.ui.textPrimary : theme.ui.textMuted,
                                                fontFamily: theme.effects.fontFamily,
                                            }}
                                        >
                                            {player ? player.username : 'Waiting...'}
                                        </p>
                                        {
                                            player?.isHost && (
                                                <span
                                                    className="text-xs"
                                                    style={{ color: theme.ui.accentColor, fontFamily: theme.effects.fontFamily }}
                                                >
                                                    {theme.effects.useGoldAccents ? '★ Host' : '● Host'}
                                                </span>
                                            )
                                        }
                                    </div >
                                    {player && (
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: player.isConnected ? theme.playerColors.green.bg : theme.playerColors.red.bg }}
                                        />
                                    )
                                    }
                                </div >
                            );
                        })}
                    </div >
                </div >

                {/* Actions */}
                < div className="space-y-3" >
                    {
                        isHost ? (
                            <>
                                <button
                                    onClick={onStart}
                                    disabled={!canStart}
                                    className="w-full px-6 py-3 rounded-lg font-semibold transition-all"
                                    style={{
                                        background: canStart
                                            ? `linear-gradient(145deg, ${theme.ui.buttonGradientStart} 0%, ${theme.ui.buttonGradientEnd} 100%)`
                                            : `linear-gradient(145deg, ${theme.ui.cardBackground} 0%, ${theme.ui.cardBackground} 100%)`,
                                        color: canStart ? theme.ui.textPrimary : theme.ui.textMuted,
                                        border: canStart ? `2px solid ${theme.ui.buttonBorder}` : `2px solid ${theme.ui.cardBorder}50`,
                                        boxShadow: canStart ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                                        textShadow: canStart ? '1px 1px 2px rgba(0,0,0,0.4)' : 'none',
                                        cursor: canStart ? 'pointer' : 'not-allowed',
                                        opacity: canStart ? 1 : 0.7,
                                        fontFamily: theme.effects.fontFamily,
                                    }}
                                >
                                    {canStart
                                        ? (theme.effects.useGoldAccents ? '✦ Start Game ✦' : '● Start Game ●')
                                        : `Need ${minPlayers - players.length} more player(s)`}
                                </button>
                                <p
                                    className="text-xs text-center"
                                    style={{ color: theme.ui.textMuted, fontFamily: theme.effects.fontFamily }}
                                >
                                    Share the room code with your friends
                                </p >
                            </>
                        ) : (
                            <p
                                className="text-center"
                                style={{ color: theme.ui.textSecondary, fontFamily: theme.effects.fontFamily }}
                            >

                                Waiting for host to start the game...
                            </p>
                        )}

                    <button
                        onClick={onLeave}
                        className="w-full px-4 py-2 rounded-lg transition-colors"
                        style={{
                            backgroundColor: 'transparent',
                            color: theme.playerColors.red.light,
                            border: `2px solid ${theme.playerColors.red.bg}60`,
                            fontFamily: theme.effects.fontFamily,
                        }}
                    >
                        Leave Room
                    </button>
                </div >

                {/* Decorative Footer */}
                {
                    theme.effects.useGoldAccents && (
                        <div className="text-center mt-4">
                            <span className="text-2xl" style={{ color: theme.ui.accentColor }}>❧ ✦ ❧</span>
                        </div>
                    )
                }
            </Card >
        </div >
    );
}
