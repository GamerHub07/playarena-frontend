'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGuest } from '@/hooks/useGuest';
import { Board2048 } from '@/components/games/2048/Board2048';
import { GameOverlay2048 } from '@/components/games/2048/GameOverlay2048';
import WaitingRoom from '@/components/games/shared/WaitingRoom';
import { roomApi } from '@/lib/api';
import { Game2048State, Direction } from '@/types/game2048';
import { calculateNextState } from '@/lib/games/2048/logic';
import { Loader2, RefreshCw, Trophy } from 'lucide-react';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';

export default function Room2048() {
    const { roomId } = useParams();
    const router = useRouter();
    const { socket, isConnected, emit, on } = useSocket();
    const { guest } = useGuest();

    const [gameState, setGameState] = useState<Game2048State | null>(null);
    const [lastActionTime, setLastActionTime] = useState(0);

    const [room, setRoom] = useState<any>(null);
    const [players, setPlayers] = useState<any[]>([]);

    useEffect(() => {
        if (!roomId) return;
        roomApi.get(roomId as string).then(res => {
            if (res.success && res.data) {
                setRoom(res.data);
                setPlayers(res.data.players);
            }
        });
    }, [roomId]);

    // Join Room
    useEffect(() => {
        if (!isConnected || !guest || !roomId) return;

        emit('room:join', {
            roomCode: roomId,
            sessionId: guest.sessionId,
            username: guest.username
        });

        const unsubJoined = on('room:playerJoined', (data: any) => {
            if (data.players) setPlayers(data.players);
        });

        const unsubStart = on('game:start', (data: any) => {
            setGameState(data.state);
            setRoom((prev: any) => prev ? { ...prev, status: 'playing' } : prev);
        });

        const unsubState = on('game:state', (data: any) => {
            setGameState(data.state);
        });

        return () => {
            unsubJoined();
            unsubStart();
            unsubState();
            emit('room:leave', { roomCode: roomId });
        };
    }, [isConnected, guest, roomId, emit, on]);

    const handleStartGame = () => {
        emit('game:start', { roomCode: roomId });
    };

    const handleLeaveRoom = () => {
        router.push('/');
    };

    const handleRestart = useCallback(() => {
        if (!roomId) return;
        emit('game:action', { roomCode: roomId, action: 'restart' });
    }, [roomId, emit]);

    const handleKeepPlaying = useCallback(() => {
        if (!roomId) return;
        emit('game:action', { roomCode: roomId, action: 'keep_playing' });
    }, [roomId, emit]);

    // Keyboard controls
    useEffect(() => {
        if (!gameState || gameState.gameOver || (gameState.won && !gameState.keepPlaying)) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Reduced throttle for better responsiveness
            const now = Date.now();
            if (now - lastActionTime < 50) return;

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

                // Optimistic Update
                const optimisticState = calculateNextState(gameState, direction);

                if (optimisticState) {
                    // Apply local state immediately (slide/merge happens instantly)
                    setGameState(optimisticState);

                    // Send to server to validate and spawn random tile
                    emit('game:action', {
                        roomCode: roomId,
                        action: 'move',
                        data: { direction }
                    });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, roomId, emit, lastActionTime]);

    if (!isConnected) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-50" />
            </div>
        );
    }

    if (room?.status === 'waiting' && guest) {
        return (
            <div className="flex flex-col items-center min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
                <WaitingRoom
                    roomCode={roomId as string}
                    players={players}
                    currentSessionId={guest.sessionId}
                    isHost={players.find(p => p.sessionId === guest.sessionId)?.isHost || false}
                    minPlayers={1}
                    maxPlayers={1}
                    onStart={handleStartGame}
                    onLeave={handleLeaveRoom}
                    gameTitle="2048"
                    accentColor="#eab308"
                    headerContent={<div className="text-6xl mb-2">⬜</div>}
                />
            </div>
        );
    }

    if (!isConnected || !gameState) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-50" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-[#faf8ef] dark:bg-[#1e1e18] relative overflow-hidden pt-24 pb-8 px-4">
            <Header />
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
                <div className="absolute top-20 left-10 text-8xl font-bold text-[#776e65]">2</div>
                <div className="absolute top-40 right-20 text-9xl font-bold text-[#edc22e]">2048</div>
                <div className="absolute bottom-20 left-1/4 text-8xl font-bold text-[#f2b179]">8</div>
                <div className="absolute bottom-40 right-10 text-[10rem] font-bold text-[#f59563]">16</div>
                <div className="absolute top-1/2 left-10 text-8xl font-bold text-[#f67c5f]">32</div>
            </div>
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
