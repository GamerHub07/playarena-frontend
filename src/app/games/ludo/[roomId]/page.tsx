'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import WaitingRoom from '@/components/games/ludo/WaitingRoom';
import Board from '@/components/games/ludo/Board';
import Dice from '@/components/games/ludo/Dice';
import Card from '@/components/ui/Card';
import { useGuest } from '@/hooks/useGuest';
import { useSocket } from '@/hooks/useSocket';
import { roomApi } from '@/lib/api';
import { Room, Player } from '@/types/game';
import { LudoGameState, PLAYER_COLORS } from '@/types/ludo';

export default function GameRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomCode = (params.roomId as string).toUpperCase();

    const { guest, loading: guestLoading } = useGuest();
    const { isConnected, emit, on } = useSocket();

    const [room, setRoom] = useState<Room | null>(null);
    const [gameState, setGameState] = useState<LudoGameState | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rolling, setRolling] = useState(false);
    const [selectableTokens, setSelectableTokens] = useState<number[]>([]);

    const currentPlayer = players.find(p => p.sessionId === guest?.sessionId);
    const isHost = currentPlayer?.isHost || false;
    const myPlayerIndex = players.findIndex(p => p.sessionId === guest?.sessionId);

    // Fetch room data
    useEffect(() => {
        if (guestLoading) return;

        if (!guest) {
            router.push('/games/ludo');
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

    // Socket connection
    useEffect(() => {
        if (!guest || !isConnected || !room) return;

        // Join socket room
        emit('room:join', {
            roomCode,
            sessionId: guest.sessionId,
            username: guest.username,
        });

        // Listen for room updates
        const unsubRoom = on('room:update', (data: unknown) => {
            const { players: updatedPlayers, status } = data as { players: Player[]; status: string };
            setPlayers(updatedPlayers);
            if (room) {
                setRoom({ ...room, status: status as Room['status'] });
            }
        });

        // Listen for game start
        const unsubStart = on('game:start', (data: unknown) => {
            const { state } = data as { state: LudoGameState };
            setGameState(state);
            if (room) {
                setRoom({ ...room, status: 'playing' });
            }
        });

        // Listen for game state updates
        const unsubState = on('game:state', (data: unknown) => {
            const { state } = data as { state: LudoGameState };
            setGameState(state);
            setRolling(false);

            // Check if it's my turn and I need to select a token
            if (state.turnPhase === 'move' && state.currentPlayer === myPlayerIndex) {
                // Get movable tokens from state (simplified)
                const playerState = state.players[myPlayerIndex];
                if (playerState && state.diceValue) {
                    const movable: number[] = [];
                    playerState.tokens.forEach((token, idx) => {
                        if (token.zone === 'home' && state.diceValue === 6) {
                            movable.push(idx);
                        } else if (token.zone === 'path' || token.zone === 'safe') {
                            movable.push(idx);
                        }
                    });
                    setSelectableTokens(movable);
                }
            } else {
                setSelectableTokens([]);
            }
        });

        // Listen for winner
        const unsubWinner = on('game:winner', () => {
            // Game over handled in gameState
        });

        // Listen for errors
        const unsubError = on('error', (data: unknown) => {
            const { message } = data as { message: string };
            setError(message);
            setTimeout(() => setError(''), 3000);
        });

        return () => {
            unsubRoom();
            unsubStart();
            unsubState();
            unsubWinner();
            unsubError();
        };
    }, [guest, isConnected, room, emit, on, roomCode, myPlayerIndex]);

    const handleStartGame = useCallback(() => {
        emit('game:start', { roomCode });
    }, [emit, roomCode]);

    const handleLeaveRoom = useCallback(() => {
        emit('room:leave', {});
        router.push('/games/ludo');
    }, [emit, router]);

    const handleRollDice = useCallback(() => {
        if (!gameState || gameState.turnPhase !== 'roll') return;
        setRolling(true);
        emit('game:action', { roomCode, action: 'roll' });
    }, [emit, roomCode, gameState]);

    const handleTokenClick = useCallback((tokenIndex: number) => {
        if (!gameState || gameState.turnPhase !== 'move') return;
        emit('game:action', { roomCode, action: 'move', data: { tokenIndex } });
        setSelectableTokens([]);
    }, [emit, roomCode, gameState]);

    if (loading || guestLoading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error && !room) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <Card className="p-8 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button onClick={() => router.push('/games/ludo')} className="text-[#3b82f6]">
                        Back to Ludo
                    </button>
                </Card>
            </div>
        );
    }

    const isWaiting = room?.status === 'waiting';
    const isPlaying = room?.status === 'playing';
    const isFinished = room?.status === 'finished';

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
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
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
                    {isConnected ? 'Connected' : 'Connecting...'}
                </div>

                {/* Waiting Room */}
                {isWaiting && room && (
                    <WaitingRoom
                        roomCode={roomCode}
                        players={players}
                        isHost={isHost}
                        minPlayers={room.minPlayers}
                        maxPlayers={room.maxPlayers}
                        onStart={handleStartGame}
                        onLeave={handleLeaveRoom}
                    />
                )}

                {/* Game Board */}
                {isPlaying && gameState && guest && (
                    <div className="w-full max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                            {/* Left Panel - Controls */}
                            <div className="w-full lg:w-48 flex flex-col gap-4 order-2 lg:order-1">
                                {/* This is handled inside Board now */}
                            </div>

                            {/* Center - Board */}
                            <div className="order-1 lg:order-2 flex-shrink-0">
                                <Board
                                    gameState={gameState}
                                    players={players}
                                    currentSessionId={guest.sessionId}
                                    onTokenClick={handleTokenClick}
                                    selectableTokens={selectableTokens}
                                />
                            </div>

                            {/* Right Panel - Game Info */}
                            <div className="w-full lg:w-56 order-3">
                                <Card className="p-5">
                                    <h3 className="text-lg font-semibold text-white mb-4">Game Info</h3>

                                    {/* Current Player */}
                                    <div className="mb-6">
                                        <p className="text-xs text-[#888] mb-2">Current Turn</p>
                                        <div
                                            className="px-3 py-2 rounded-lg text-white font-medium"
                                            style={{ backgroundColor: PLAYER_COLORS[gameState.currentPlayer]?.hex }}
                                        >
                                            {players[gameState.currentPlayer]?.username}
                                            {gameState.currentPlayer === myPlayerIndex && ' (You)'}
                                        </div>
                                    </div>

                                    {/* Dice */}
                                    <div className="mb-6">
                                        <p className="text-xs text-[#888] mb-2">Dice</p>
                                        <Dice
                                            value={gameState.diceValue || gameState.lastRoll}
                                            rolling={rolling}
                                            canRoll={gameState.currentPlayer === myPlayerIndex && gameState.turnPhase === 'roll'}
                                            onRoll={handleRollDice}
                                            playerColor={PLAYER_COLORS[myPlayerIndex]?.name || 'red'}
                                        />
                                    </div>

                                    {/* Last Roll */}
                                    {gameState.lastRoll && (
                                        <p className="text-sm text-[#888]">
                                            Last roll: <span className="text-white font-bold">{gameState.lastRoll}</span>
                                            {gameState.lastRoll === 6 && ' 🎉'}
                                        </p>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {/* Game Over */}
                {isFinished && gameState && gameState.winner !== null && (
                    <div className="max-w-md mx-auto text-center">
                        <Card className="p-8">
                            <div className="text-6xl mb-4">🏆</div>
                            <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
                            <p className="text-[#888] mb-6">
                                <span
                                    className="font-semibold"
                                    style={{ color: PLAYER_COLORS[gameState.winner]?.hex }}
                                >
                                    {players[gameState.winner]?.username}
                                </span> wins!
                            </p>
                            <button
                                onClick={() => router.push('/games/ludo')}
                                className="text-[#3b82f6] hover:underline"
                            >
                                Play Again
                            </button>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}
