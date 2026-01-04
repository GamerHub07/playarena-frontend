'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import WaitingRoom from '@/components/games/poker/WaitingRoom';
import PokerTable from '@/components/games/poker/PokerTable';
import PokerControls from '@/components/games/poker/PokerControls';
import { useGuest } from '@/hooks/useGuest';
import { useSocket } from '@/hooks/useSocket';
import { roomApi } from '@/lib/api';
import { Room, Player } from '@/types/game';
import { PokerGameState } from '@/types/poker';

export default function PokerRoomPage() {
    const { roomId } = useParams();
    const router = useRouter();
    const roomCode = (roomId as string).toUpperCase();

    const { guest, loading: guestLoading } = useGuest();
    const { isConnected, emit, on } = useSocket();

    const [room, setRoom] = useState<Room | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [gameState, setGameState] = useState<PokerGameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentPlayerIndex = players.findIndex(
        p => p.sessionId === guest?.sessionId
    );

    const isHost = players[currentPlayerIndex]?.isHost;

    // Fetch room
    useEffect(() => {
        if (!guest || guestLoading) return;

        roomApi.get(roomCode).then(res => {
            if (res.success && res.data) {
                setRoom(res.data);
                setPlayers(res.data.players);
            } else {
                setError('Room not found');
            }
            setLoading(false);
        });
    }, [roomCode, guest, guestLoading]);

    // Join socket room
    useEffect(() => {
        if (!guest || !isConnected || loading) return;

        emit('room:join', {
            roomCode,
            sessionId: guest.sessionId,
            username: guest.username
        });

        return () => emit('room:leave', {});
    }, [guest, isConnected, loading, roomCode]);

    // Socket listeners
    useEffect(() => {
        if (!guest || !isConnected) return;

        const unsubRoom = on('room:update', ({ players, status }) => {
            setPlayers(players);
            setRoom(r => r ? { ...r, status } : null);
        });

        const unsubStart = on('game:start', ({ state }) => {
            setGameState(state);
            setRoom(r => r ? { ...r, status: 'playing' } : null);
        });

        const unsubState = on('game:state', ({ state }) => {
            setGameState(state);
        });

        const unsubWinner = on('game:winner', ({ winner }) => {
            setGameState(s => s ? { ...s, winner } : null);
            setRoom(r => r ? { ...r, status: 'finished' } : null);
        });

        const unsubError = on('error', ({ message }) => {
            setError(message);
        });

        return () => {
            unsubRoom();
            unsubStart();
            unsubState();
            unsubWinner();
            unsubError();
        };
    }, [guest, isConnected]);

    const startGame = useCallback(() => {
        emit('game:start', { roomCode });
    }, [emit, roomCode]);

    const sendAction = useCallback((action: string, amount?: number) => {
        emit('game:action', { roomCode, action, amount });
    }, [emit, roomCode]);

    if (loading || guestLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error && !room) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Card className="p-6 text-red-500">{error}</Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="pt-24 px-4">
                {room?.status === 'waiting' && (
                    <WaitingRoom
                        roomCode={roomCode}
                        players={players}
                        isHost={isHost}
                        onStart={startGame}
                        onLeave={() => router.push('/games/poker')}
                    />
                )}

                {room?.status !== 'waiting' && gameState && (
                    <div className="max-w-6xl mx-auto grid gap-6">
                        <PokerTable
                            gameState={gameState}
                            players={players}
                            myIndex={currentPlayerIndex}
                        />

                        <PokerControls
                            disabled={gameState.currentTurn !== currentPlayerIndex}
                            onAction={sendAction}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
