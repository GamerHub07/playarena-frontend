'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { PokerTable } from '@/components/poker/PokerTable';
import { PokerPlayer } from '@/components/poker/PokerPlayer';
import { PokerControls } from '@/components/poker/PokerControls';
import { useGuest } from '@/hooks/useGuest';
import { useSocket } from '@/hooks/useSocket';
import { roomApi } from '@/lib/api';
import { Room, Player } from '@/types/game';
import { PokerState, PokerPlayerState } from '@/types/poker';

const POSITIONS = [
    "absolute bottom-4 left-1/2 -translate-x-1/2",
    "absolute left-4 top-1/2 -translate-y-1/2",
    "absolute top-4 left-1/4 -translate-x-1/2",
    "absolute top-4 right-1/4 translate-x-1/2",
    "absolute right-4 top-1/2 -translate-y-1/2",
    "absolute bottom-4 right-1/4 translate-x-1/2",
];

export default function PokerRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomCode = (params.roomId as string).toUpperCase();

    const { guest, loading: guestLoading } = useGuest();
    const { isConnected, emit, on } = useSocket();

    const [room, setRoom] = useState<Room | null>(null);
    const [gameState, setGameState] = useState<PokerState | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentPlayer = players.find(p => p.sessionId === guest?.sessionId);
    const isHost = currentPlayer?.isHost || false;
    const myPlayerIndex = players.findIndex(p => p.sessionId === guest?.sessionId);

    // Fetch room data
    useEffect(() => {
        if (guestLoading) return;

        if (!guest) {
            router.push('/');
            return;
        }

        const fetchRoom = async () => {
            try {
                const res = await roomApi.get(roomCode);
                if (res.success && res.data) {
                    setRoom(res.data);
                    setPlayers(res.data.players);
                } else {
                    setError('Room not found');
                }
            } catch {
                setError('Failed to load room');
            }
            setLoading(false);
        };

        fetchRoom();
    }, [roomCode, guest, guestLoading, router]);

    // Socket listeners
    useEffect(() => {
        if (!guest || !isConnected) return;

        const unsubRoom = on('room:update', (data: unknown) => {
            const { players: updatedPlayers, status, gameState: gs } = data as { 
                players: Player[]; 
                status: string;
                gameState?: PokerState;
            };
            setPlayers(updatedPlayers);
            setRoom(prev => prev ? { ...prev, status: status as Room['status'] } : null);
            if (gs) {
                setGameState(gs);
            }
        });

        const unsubStart = on('game:start', (data: unknown) => {
            const { state } = data as { state: PokerState };
            setGameState(state);
            setRoom(prev => prev ? { ...prev, status: 'playing' } : null);
        });

        const unsubState = on('game:state', (data: unknown) => {
            const { state } = data as { state: PokerState };
            console.log('Game state update:', state);
            setGameState(state);
        });

        const unsubError = on('error', (data: unknown) => {
            const { message } = data as { message: string };
            console.error('Socket error:', message);
            setError(message);
            setTimeout(() => setError(''), 3000);
        });

        return () => {
            unsubRoom();
            unsubStart();
            unsubState();
            unsubError();
        };
    }, [guest, isConnected, on]);

    // Socket join room
    useEffect(() => {
        if (!guest || !isConnected || loading) return;

        console.log('Joining room:', roomCode);
        emit('room:join', {
            roomCode,
            sessionId: guest.sessionId,
            username: guest.username,
        });

        return () => {
            console.log('Leaving room:', roomCode);
            emit('room:leave', {});
        };
    }, [isConnected, guest, loading, roomCode, emit]);

    const handleStartGame = useCallback(() => {
        emit('game:start', { roomCode });
    }, [emit, roomCode]);

    const handleAction = useCallback((action: string, amount?: number) => {
        emit('game:action', { roomCode, action, data: { amount } });
    }, [emit, roomCode]);

    const handleLeaveRoom = useCallback(() => {
        emit('room:leave', {});
        router.push('/');
    }, [emit, router]);

    if (loading || guestLoading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error && !room) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="text-center text-white">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button onClick={() => router.push('/')} className="text-yellow-500">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const isWaiting = room?.status === 'waiting';
    const isPlaying = room?.status === 'playing';
    const isFinished = room?.status === 'finished';

    // Build poker player state from room players if no game state
    const pokerPlayers: PokerPlayerState[] = gameState?.players && Array.isArray(gameState.players) 
        ? gameState.players 
        : players.map(p => ({
            sessionId: p.sessionId,
            username: p.username,
            chips: 1000,
            bet: 0,
            status: 'ACTIVE' as const,
            totalBetThisRound: 0,
        }));

    // Find my player
    const me = pokerPlayers.find(p => p.sessionId === guest?.sessionId);
    
    // Check if my turn
    const isMyTurn = gameState && 
        gameState.currentTurn !== null && 
        Array.isArray(gameState.players) &&
        gameState.players[gameState.currentTurn]?.sessionId === guest?.sessionId;

    // Rotate players so I'm at bottom
    const getRotatedPlayers = () => {
        const myIdx = pokerPlayers.findIndex(p => p.sessionId === guest?.sessionId);
        if (myIdx === -1) return pokerPlayers;
        return [
            ...pokerPlayers.slice(myIdx),
            ...pokerPlayers.slice(0, myIdx)
        ];
    };

    const rotatedPlayers = getRotatedPlayers();

    return (
        <div className="min-h-screen bg-[#0f172a]">
            <Header />

            <main className="pt-24 pb-12 px-4">
                {/* Error Toast */}
                {error && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-500/10 border border-red-500 text-red-500 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Connection Status */}
                <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-[#888]">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    {isConnected ? 'Connected' : 'Connecting...'}
                </div>

                {/* Waiting Room */}
                {isWaiting && (
                    <div className="max-w-md mx-auto">
                        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-gray-800">
                            <h2 className="text-2xl font-bold text-white mb-2 text-center">Room: {roomCode}</h2>
                            <p className="text-gray-400 text-center mb-6">Waiting for players...</p>
                            
                            <div className="space-y-3 mb-6">
                                {players.map((p, idx) => (
                                    <div key={p.sessionId} className="flex items-center justify-between bg-[#252540] p-3 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">
                                                {p.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="text-white font-medium">{p.username}</span>
                                                {p.isHost && <span className="ml-2 text-xs text-yellow-500">HOST</span>}
                                                {p.sessionId === guest?.sessionId && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                                            </div>
                                        </div>
                                        <span className={`w-2 h-2 rounded-full ${p.isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
                                    </div>
                                ))}
                            </div>

                            <p className="text-gray-500 text-sm text-center mb-4">
                                {players.length} / 6 players • Min 2 to start
                            </p>

                            {isHost && players.length >= 2 && (
                                <button
                                    onClick={handleStartGame}
                                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
                                >
                                    Start Game
                                </button>
                            )}

                            {!isHost && (
                                <p className="text-center text-gray-400 text-sm">
                                    Waiting for host to start...
                                </p>
                            )}

                            <button
                                onClick={handleLeaveRoom}
                                className="w-full mt-4 py-2 border border-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors"
                            >
                                Leave Room
                            </button>
                        </div>
                    </div>
                )}

                {/* Game Board */}
                {(isPlaying || isFinished) && (
                    <div className="max-w-6xl mx-auto">
                        <PokerTable 
                            communityCards={gameState?.communityCards || []} 
                            pot={gameState?.pot || 0}
                        >
                            {rotatedPlayers.map((player, index) => {
                                const originalIndex = pokerPlayers.findIndex(p => p.sessionId === player.sessionId);
                                const isDealer = gameState?.dealerIndex === originalIndex;
                                const isTurn = gameState?.currentTurn === originalIndex;
                                const isWinner = gameState?.winnerIndex === originalIndex;

                                return (
                                    <PokerPlayer
                                        key={player.sessionId}
                                        player={player}
                                        isDealer={isDealer}
                                        isCurrentTurn={isTurn}
                                        isWinner={isWinner}
                                        positionClass={POSITIONS[index] || "hidden"}
                                    />
                                );
                            })}
                        </PokerTable>

                        {/* Controls */}
                        {isMyTurn && gameState?.phase !== 'WAITING' && gameState?.phase !== 'ENDED' && me && (
                            <PokerControls
                                onAction={handleAction}
                                minRaise={gameState?.minRaise || 20}
                                maxChips={me.chips}
                                currentBet={gameState?.currentBet || 0}
                                playerBet={me.totalBetThisRound}
                                canCheck={(gameState?.currentBet || 0) <= me.totalBetThisRound}
                            />
                        )}

                        {/* Winner Overlay */}
                        {gameState?.phase === 'ENDED' && gameState.winnerIndex !== undefined && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                                <div className="bg-[#1a1a2e] p-8 rounded-2xl border-2 border-yellow-500 text-center">
                                    <h2 className="text-4xl font-bold text-yellow-500 mb-2">🏆 WINNER!</h2>
                                    <p className="text-2xl text-white mb-4">
                                        {gameState.players[gameState.winnerIndex]?.username}
                                    </p>
                                    <p className="text-xl text-green-400 mb-6">
                                        {gameState.winnerHand || 'Winner'}
                                    </p>
                                    <button
                                        onClick={handleStartGame}
                                        className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600"
                                    >
                                        Play Again
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
