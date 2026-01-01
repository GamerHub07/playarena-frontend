'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Header from '@/components/layout/Header';
import WaitingRoom from '@/components/games/ludo/WaitingRoom';
import Board from '@/components/games/ludo/Board';
import Dice from '@/components/games/ludo/Dice';
import Card from '@/components/ui/Card';
import { useGuest } from '@/hooks/useGuest';
import { useSocket } from '@/hooks/useSocket';
import { useTokenAnimation, TokenMoveStep } from '@/hooks/useTokenAnimation';
import { useGameEffects, CaptureEffectOverlay } from '@/hooks/useGameEffects';
import { roomApi } from '@/lib/api';
import { Room, Player } from '@/types/game';
import { LudoGameState, PLAYER_COLORS } from '@/types/ludo';

export default function GameRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomCode = (params.roomId as string).toUpperCase();

    const { guest, loading: guestLoading } = useGuest();
    const { isConnected, emit, on } = useSocket();
    const { animateSteps, isAnimating, getTokenPosition } = useTokenAnimation();
    const { captureEffects, triggerCaptureEffect } = useGameEffects();
    const captureEffectRef = useRef(triggerCaptureEffect);
    captureEffectRef.current = triggerCaptureEffect;

    const [room, setRoom] = useState<Room | null>(null);
    const [gameState, setGameState] = useState<LudoGameState | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rolling, setRolling] = useState(false);
    const [selectableTokens, setSelectableTokens] = useState<number[]>([]);

    // Ref to hold pending state that should be applied after animation
    const pendingStateRef = useRef<LudoGameState | null>(null);

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

    // Keep players ref in sync for socket listeners to avoid dependency loop
    const playersRef = useRef(players);
    useEffect(() => {
        playersRef.current = players;
    }, [players]);

    // Socket listeners
    useEffect(() => {
        if (!guest || !isConnected) return;

        // Listen for room updates
        const unsubRoom = on('room:update', (data: unknown) => {
            const { players: updatedPlayers, status } = data as { players: Player[]; status: string };
            setPlayers(updatedPlayers);
            setRoom(prev => prev ? { ...prev, status: status as Room['status'] } : null);
        });

        // Listen for game start
        const unsubStart = on('game:start', (data: unknown) => {
            const { state } = data as { state: LudoGameState };
            setGameState(state);
            setRoom(prev => prev ? { ...prev, status: 'playing' } : null);
        });

        // Listen for game state updates (dice rolls, moves, turn changes)
        const unsubState = on('game:state', (data: unknown) => {
            const { state } = data as { state: LudoGameState };
            console.log('Game state update:', state.turnPhase, 'currentPlayer:', state.currentPlayer, 'myIndex:', myPlayerIndex);
            console.log('Movable tokens from backend:', state.movableTokens);

            setGameState(state);
            setRolling(false);

            // Calculate my index using ref to avoid dependency loop
            const currentPlayers = playersRef.current;
            const myIdx = currentPlayers.findIndex(p => p.sessionId === guest.sessionId);

            // Check if it's my turn and I need to select a token
            if (state.turnPhase === 'move' && state.currentPlayer === myIdx) {
                // Get movable tokens from state (simplified)
                const playerState = state.players[myIdx];
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

        // Listen for token move animations - animate step by step
        const unsubTokenMove = on('game:tokenMove', (data: unknown) => {
            const { steps, finalState, captured } = data as { steps: TokenMoveStep[]; finalState: LudoGameState; captured?: boolean };
            console.log('Token move animation received:', steps.length, 'steps', captured ? '(CAPTURE!)' : '');

            // Store final state to apply after animation
            pendingStateRef.current = finalState;

            // Animate the steps
            animateSteps(steps, () => {
                // Trigger capture effect if opponent was captured
                if (captured) {
                    captureEffectRef.current();
                }
                // Animation complete - apply final state
                if (pendingStateRef.current) {
                    setGameState(pendingStateRef.current);
                    pendingStateRef.current = null;

                    // Update selectable tokens for next turn
                    const currentPlayers = playersRef.current;
                    const myIdx = currentPlayers.findIndex(p => p.sessionId === guest?.sessionId);
                    if (finalState.turnPhase === 'move' && finalState.currentPlayer === myIdx) {
                        const playerState = finalState.players[myIdx];
                        if (playerState && finalState.diceValue) {
                            const movable: number[] = [];
                            playerState.tokens.forEach((token, idx) => {
                                if (token.zone === 'home' && finalState.diceValue === 6) {
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
                }
            });
        });

        // Listen for winner
        const unsubWinner = on('game:winner', (data: unknown) => {
            const { winner } = data as { winner: { position: number; username: string } };
            // Update room status
            setRoom(prev => prev ? { ...prev, status: 'finished' } : null);
        });

        // Listen for errors
        const unsubError = on('error', (data: unknown) => {
            const { message } = data as { message: string };
            console.error('Socket error:', message);
            setError(message);
            setRolling(false);
            setTimeout(() => setError(''), 3000);
        });

        return () => {
            unsubRoom();
            unsubStart();
            unsubState();
            unsubTokenMove();
            unsubWinner();
            unsubError();
        };
    }, [guest, isConnected, on]); // Removed room/players/myPlayerIndex dependencies

    // Celebration effect
    useEffect(() => {
        // Trigger as soon as we have a winner in the game state
        if (gameState?.winner !== null && gameState?.winner !== undefined) {
            console.log('Triggering celebration effect for winner:', gameState.winner);
            const duration = 15 * 1000;
            const animationEnd = Date.now() + duration;
            // High zIndex to ensure visibility over valid UI elements
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [gameState?.winner]);

    // Socket join room - Separate effect to prevent loops
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
    }, [isConnected, guest, loading, roomCode, emit]); // Depend on stable props/flags only

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
        console.log('tokenIndex', tokenIndex);
        emit('game:action', { roomCode, action: 'move', data: { tokenIndex } });
        setSelectableTokens([]);
    }, [emit, roomCode]);

    if (loading || guestLoading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error && !room) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <Card className="p-8 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button onClick={() => router.push('/games/ludo')} className="text-[var(--primary)]">
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
        <div className="min-h-screen bg-[var(--background)]">
            <Header />

            {/* Capture Effect Overlay */}
            <CaptureEffectOverlay effects={captureEffects} />

            <main className="pt-24 pb-12 px-4">
                {/* Error Toast */}
                {error && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-500/10 border border-red-500 text-red-500 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Connection Status */}
                <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--success)]' : 'bg-red-500'}`} />
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

                {/* Game Board (Visible during play and when finished) */}
                {(isPlaying || isFinished) && gameState && guest && (
                    <div className="w-full max-w-7xl mx-auto relative">
                        {/* Game Over Overlay */}
                        {isFinished && gameState.winner !== null && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                                <div className="max-w-md w-full mx-4 text-center animate-in fade-in zoom-in duration-300">
                                    <Card className="p-8 bg-[var(--surface)] border-2 border-[var(--border)] shadow-2xl">
                                        <div className="text-6xl mb-4 animate-bounce">🏆</div>
                                        <h2 className="text-3xl font-bold text-[var(--dark)] mb-2">
                                            {gameState.winner === myPlayerIndex ? 'You Won! 🎉' : 'Game Over!'}
                                        </h2>
                                        <p className="text-[var(--text-muted)] mb-8 text-lg">
                                            {gameState.winner === myPlayerIndex ? (
                                                <span>Congratulations on your victory!</span>
                                            ) : (
                                                <>
                                                    <span
                                                        className="font-semibold"
                                                        style={{ color: PLAYER_COLORS[gameState.winner]?.hex }}
                                                    >
                                                        {players[gameState.winner]?.username}
                                                    </span> wins!
                                                </>
                                            )}
                                        </p>
                                        <button
                                            onClick={() => router.push('/games/ludo')}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                                        >
                                            Play Again
                                        </button>
                                    </Card>
                                </div>
                            </div>
                        )}

                        <div className={`flex flex-col lg:flex-row gap-6 items-start justify-center transition-all ${isFinished ? 'brightness-50 pointer-events-none' : ''}`}>
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
                                    getAnimatedTokenPosition={getTokenPosition}
                                    isAnimating={isAnimating}
                                />
                            </div>

                            {/* Right Panel - Game Info */}
                            <div className="w-full lg:w-56 order-3">
                                <Card className="p-5">
                                    <h3 className="text-lg font-semibold text-[var(--dark)] mb-4">Game Info</h3>

                                    {/* Current Player */}
                                    <div className="mb-6">
                                        <p className="text-xs text-[var(--text-muted)] mb-2">Current Turn</p>
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
                                        <p className="text-xs text-[var(--text-muted)] mb-2">Dice</p>
                                        <Dice
                                            value={gameState.diceValue || gameState.lastRoll}
                                            rolling={rolling}
                                            canRoll={!isFinished && gameState.currentPlayer === myPlayerIndex && gameState.turnPhase === 'roll'}
                                            onRoll={handleRollDice}
                                            playerColor={PLAYER_COLORS[myPlayerIndex]?.name || 'red'}
                                        />
                                    </div>

                                    {/* Last Roll */}
                                    {gameState.lastRoll && (
                                        <p className="text-sm text-[var(--text-muted)]">
                                            Last roll: <span className="text-[var(--dark)] font-bold">{gameState.lastRoll}</span>
                                            {gameState.lastRoll === 6 && ' 🎉'}
                                        </p>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
