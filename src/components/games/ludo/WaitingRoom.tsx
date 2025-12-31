'use client';

import { useState } from 'react';
import { Player } from '@/types/game';
import { PLAYER_COLORS } from '@/types/ludo';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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
    const [copied, setCopied] = useState(false);
    const canStart = players.length >= minPlayers;

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-lg mx-auto">
            <Card className="p-8">
                {/* Room Code */}
                <div className="text-center mb-8">
                    <p className="text-sm text-[#888] mb-2">Room Code</p>
                    <button
                        onClick={copyCode}
                        className="group flex items-center justify-center gap-2 mx-auto cursor-pointer"
                    >
                        <span className="text-4xl font-mono font-bold text-white tracking-widest">
                            {roomCode}
                        </span>
                        {copied ? (
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5 text-[#888] group-hover:text-[#3b82f6] transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>
                    <p className={`text-xs mt-2 transition-colors ${copied ? 'text-green-500 font-medium' : 'text-[#555]'}`}>
                        {copied ? 'Copied!' : 'Click to copy'}
                    </p>
                </div>

                {/* Players List */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-[#888]">Players</p>
                        <p className="text-sm text-[#888]">{players.length}/{maxPlayers}</p>
                    </div>

                    <div className="space-y-3">
                        {Array.from({ length: maxPlayers }).map((_, i) => {
                            const player = players[i];
                            const colorInfo = PLAYER_COLORS[i];

                            return (
                                <div
                                    key={i}
                                    className={`
                    flex items-center gap-3 p-4 rounded-lg border
                    ${player
                                            ? 'bg-[#0f0f0f] border-[#2a2a2a]'
                                            : 'bg-[#0f0f0f]/50 border-dashed border-[#2a2a2a]'
                                        }
                  `}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                        style={{ backgroundColor: player ? colorInfo.hex : '#2a2a2a' }}
                                    >
                                        {player ? player.username.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium ${player ? 'text-white' : 'text-[#555]'}`}>
                                            {player ? player.username : 'Waiting...'}
                                        </p>
                                        {player?.isHost && (
                                            <span className="text-xs text-[#3b82f6]">Host</span>
                                        )}
                                    </div>
                                    {player && (
                                        <div className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    {isHost ? (
                        <>
                            <Button
                                onClick={onStart}
                                disabled={!canStart}
                                className="w-full"
                            >
                                {canStart ? 'Start Game' : `Need ${minPlayers - players.length} more player(s)`}
                            </Button>
                            <p className="text-xs text-center text-[#555]">
                                Share the room code with your friends
                            </p>
                        </>
                    ) : (
                        <p className="text-center text-[#888]">
                            Waiting for host to start the game...
                        </p>
                    )}

                    <Button variant="ghost" onClick={onLeave} className="w-full">
                        Leave Room
                    </Button>
                </div>
            </Card>
        </div>
    );
}
