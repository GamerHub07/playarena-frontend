'use client';

import { useState } from 'react';
import { Player } from '@/types/game';
import { TicTacToePlayer } from '@/types/tictactoe';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface WaitingRoomProps {
    roomCode: string;
    players: Player[];
    isHost: boolean;
    onStart: () => void;
    onLeave: () => void;
}

export default function WaitingRoom({
    roomCode,
    players,
    isHost,
    onStart,
    onLeave,
}: WaitingRoomProps) {
    const canStart = players.length >= 2;
    const [codeCopied, setCodeCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const roomLink = typeof window !== 'undefined' 
        ? `${window.location.origin}/games/tictactoe/${roomCode}` 
        : '';

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const copyRoomLink = () => {
        navigator.clipboard.writeText(roomLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <Card className="w-full max-w-md p-8 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Waiting Room</h2>
                    <p className="text-slate-400">Share the room code or link with a friend</p>
                </div>

                {/* Room Code Display */}
                <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-sm text-slate-400">Room Code</span>
                    </div>
                    <button
                        onClick={copyRoomCode}
                        className="w-full py-4 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-600 hover:border-blue-500 transition-colors group"
                    >
                        <span className="text-3xl font-mono font-bold tracking-widest text-white group-hover:text-blue-400 transition-colors">
                            {roomCode}
                        </span>
                        <p className={`text-xs mt-2 transition-colors ${codeCopied ? 'text-green-400' : 'text-slate-500'}`}>
                            {codeCopied ? '✓ Copied!' : 'Click to copy code'}
                        </p>
                    </button>
                </div>

                {/* Room Link Display */}
                <div className="mb-8">
                    <button
                        onClick={copyRoomLink}
                        className="w-full py-3 px-4 bg-slate-800/30 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors group text-left"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400 truncate flex-1 mr-2">
                                {roomLink}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${linkCopied ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400 group-hover:text-blue-400'}`}>
                                {linkCopied ? '✓ Copied!' : 'Copy Link'}
                            </span>
                        </div>
                    </button>
                </div>

                {/* Players List */}
                <div className="mb-8">
                    <h3 className="text-sm text-slate-400 mb-3">Players ({players.length}/2)</h3>
                    <div className="space-y-2">
                        {players.map((player, index) => (
                            <div
                                key={player.sessionId}
                                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold ${
                                    index === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                    {index === 0 ? 'X' : 'O'}
                                </div>
                                <span className="text-white font-medium flex-grow">
                                    {player.username}
                                </span>
                                {player.isHost && (
                                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                                        Host
                                    </span>
                                )}
                                <span className={`w-2 h-2 rounded-full ${
                                    player.isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                            </div>
                        ))}
                        
                        {/* Empty slot */}
                        {players.length < 2 && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border-2 border-dashed border-slate-700">
                                <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                                    <span className="text-slate-500">?</span>
                                </div>
                                <span className="text-slate-500">Waiting for player...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={onLeave}
                        className="flex-1"
                    >
                        Leave
                    </Button>
                    {isHost && (
                        <Button
                            variant="primary"
                            onClick={onStart}
                            disabled={!canStart}
                            className="flex-1"
                        >
                            {canStart ? 'Start Game' : 'Need 2 Players'}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
