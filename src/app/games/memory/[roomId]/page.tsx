'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGuest } from '@/hooks/useGuest';
import { MemoryState, MemoryCard as MemoryCardType } from '@/types/memory';
import { MemoryBoard } from '@/components/games/memory/MemoryBoard';
import WaitingRoom from '@/components/games/shared/WaitingRoom';
import { roomApi } from '@/lib/api';
import { Loader2, RefreshCw, Trophy } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function MemoryRoom() {
    const { roomId } = useParams();
    const router = useRouter();
    const { socket, isConnected, emit, on } = useSocket();
    const { guest } = useGuest();

    const [gameState, setGameState] = useState<MemoryState | null>(null);
    const [room, setRoom] = useState<any>(null);
    const [players, setPlayers] = useState<any[]>([]);

    // Fetch room data
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

    const handleCardClick = useCallback((card: MemoryCardType) => {
        if (!roomId || card.isFlipped || card.isMatched) return;

        emit('game:action', {
            roomCode: roomId,
            action: 'flip',
            data: { cardId: card.id }
        });
    }, [roomId, emit]);

    const handleRestart = useCallback(() => {
        if (!roomId) return;
        emit('game:action', { roomCode: roomId, action: 'restart' });
    }, [roomId, emit]);

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
                    maxPlayers={2}
                    onStart={handleStartGame}
                    onLeave={handleLeaveRoom}
                    gameTitle="Memory"
                    accentColor="#6366f1"
                    headerContent={<div className="text-6xl mb-2">🧠</div>}
                />
            </div>
        );
    }

    if (!gameState) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-50" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 dark:from-[#0f1020] dark:via-[#151730] dark:to-[#0f1020] relative overflow-hidden py-8 px-4">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5 dark:opacity-10">
                <div className="absolute top-10 left-10 text-9xl font-black text-indigo-500 -rotate-12 select-none">?</div>
                <div className="absolute bottom-20 right-20 text-[10rem] font-black text-indigo-500 rotate-12 select-none">?</div>
                <div className="absolute top-1/3 right-1/4 text-8xl font-black text-indigo-400 rotate-45 select-none">🧠</div>
                <div className="absolute bottom-1/3 left-10 text-9xl font-black text-indigo-600 -rotate-6 select-none">?</div>

                {/* Grid Pattern */}
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(30deg, #6366f1 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.2 }}></div>
            </div>
            <div className="w-full max-w-[500px]">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">Memory</h1>
                        <p className="text-zinc-500 mt-1">Find the matches!</p>
                    </div>

                    <div className="flex gap-2">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded min-w-[80px] text-center border border-indigo-200 dark:border-indigo-800">
                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Moves</div>
                            <div className="text-xl font-bold text-zinc-800 dark:text-white">{gameState.moves}</div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded min-w-[80px] text-center border border-green-200 dark:border-green-800">
                            <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Pairs</div>
                            <div className="text-xl font-bold text-zinc-800 dark:text-white">{gameState.matches}/8</div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex justify-end mb-4">
                    <Button size="sm" variant="outline" onClick={handleRestart}>
                        <RefreshCw className="w-4 h-4 mr-2" /> New Game
                    </Button>
                </div>

                {/* Game Board */}
                <div className="relative">
                    <MemoryBoard
                        cards={gameState.cards}
                        onCardClick={handleCardClick}
                    />

                    {/* Win Overlay */}
                    {gameState.isComplete && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-2xl animate-in fade-in duration-500">
                            <Trophy className="w-20 h-20 text-yellow-500 mb-4 animate-bounce" />
                            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">You Win!</h2>
                            <p className="text-zinc-600 dark:text-zinc-300 mb-6">Completed in {gameState.moves} moves</p>
                            <Button size="lg" onClick={handleRestart}>
                                Play Again
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
