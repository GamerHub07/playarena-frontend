'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGuest } from '@/hooks/useGuest';
import { Board2048 } from '@/components/games/2048/Board2048';
import { GameOverlay2048 } from '@/components/games/2048/GameOverlay2048';
import { Game2048State, Direction } from '@/types/game2048';
import { Loader2, RefreshCw, Trophy } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Room2048() {
    const { roomId } = useParams();
    const { socket, isConnected, emit, on } = useSocket();
    const { guest } = useGuest();

    const [gameState, setGameState] = useState<Game2048State | null>(null);
    const [lastActionTime, setLastActionTime] = useState(0);

    // Join Room
    useEffect(() => {
        if (!isConnected || !guest || !roomId) return;

        emit('room:join', {
            roomCode: roomId,
            sessionId: guest.sessionId,
            username: guest.username
        });

        const unsubStart = on('game:start', (data: any) => {
            setGameState(data.state);
        });

        const unsubState = on('game:state', (data: any) => {
            setGameState(data.state);
        });

        return () => {
            unsubStart();
            unsubState();
            emit('room:leave', { roomCode: roomId });
        };
    }, [isConnected, guest, roomId, emit, on]);

    // Keyboard controls
    useEffect(() => {
        if (!gameState || gameState.gameOver || (gameState.won && !gameState.keepPlaying)) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent spamming
            const now = Date.now();
            if (now - lastActionTime < 100) return; // 100ms throttle

            let direction: Direction | null = null;

            switch (e.key) {
                case 'ArrowUp': direction = 'up'; break;
                case 'ArrowDown': direction = 'down'; break;
                case 'ArrowLeft': direction = 'left'; break;
                case 'ArrowRight': direction = 'right'; break;
            }

            if (direction && roomId) {
                e.preventDefault();
                setLastActionTime(now);
                emit('game:action', {
                    roomCode: roomId,
                    action: 'move',
                    data: { direction }
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, roomId, emit, lastActionTime]);

    const handleRestart = useCallback(() => {
        if (!roomId) return;
        emit('game:action', { roomCode: roomId, action: 'restart' });
    }, [roomId, emit]);

    const handleKeepPlaying = useCallback(() => {
        if (!roomId) return;
        emit('game:action', { roomCode: roomId, action: 'keep_playing' });
    }, [roomId, emit]);

    if (!isConnected || !gameState) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-50" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
            <div className="w-full max-w-[500px]">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-5xl font-bold text-zinc-800 dark:text-zinc-100">2048</h1>
                        <p className="text-zinc-500 mt-1">Join the numbers!</p>
                    </div>

                    <div className="flex gap-2">
                        <div className="bg-[#bbada0] p-2 rounded min-w-[80px] text-center">
                            <div className="text-xs font-bold text-[#eee4da] uppercase">Score</div>
                            <div className="text-xl font-bold text-white">{gameState.score}</div>
                        </div>
                        <div className="bg-[#bbada0] p-2 rounded min-w-[80px] text-center">
                            <div className="text-xs font-bold text-[#eee4da] uppercase">Best</div>
                            <div className="text-xl font-bold text-white">{gameState.bestScore}</div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex justify-end mb-4">
                    <Button size="sm" variant="outline" onClick={handleRestart}>
                        <RefreshCw className="w-4 h-4 mr-2" /> New Game
                    </Button>
                </div>

                {/* Game Board Container */}
                <div className="relative">
                    <Board2048 grid={gameState.grid} />

                    <GameOverlay2048
                        won={gameState.won}
                        gameOver={gameState.gameOver}
                        onRestart={handleRestart}
                        onKeepPlaying={handleKeepPlaying}
                    />
                </div>

                <div className="mt-8 text-center text-zinc-500">
                    <p>Use arrow keys to move tiles</p>
                </div>
            </div>
        </div>
    );
}
