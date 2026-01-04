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
import { roomApi } from '@/lib/api';
import { Room, Player } from '@/types/game';
import { LudoGameState, PLAYER_COLORS, TokenPosition, PlayerState } from '@/types/ludo';
import {
    getTokenGridPosition,
    START_POSITIONS,
    PLAYER_COLOR_MAP
} from '@/lib/ludoBoardLayout';

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

    // Animation state
    const [displayedPlayers, setDisplayedPlayers] = useState<Record<number, PlayerState> | null>(null);
    const [animatingToken, setAnimatingToken] = useState<{
        playerIndex: number;
        tokenIndex: number;
        path: { row: number; col: number }[];
        currentStep: number;
    } | null>(null);
    // Refs for socket listeners to access latest state without re-binding
    const displayedPlayersRef = useRef(displayedPlayers);
    const animatingTokenRef = useRef(animatingToken);

    useEffect(() => {
        displayedPlayersRef.current = displayedPlayers;
        animatingTokenRef.current = animatingToken;
    }, [displayedPlayers, animatingToken]);

    const animationRef = useRef<NodeJS.Timeout | null>(null);

    // Helper to calculate path between two positions
    const computePath = (playerIndex: number, start: TokenPosition, end: TokenPosition): { row: number; col: number }[] => {
        const path: { row: number; col: number }[] = [];
        const color = PLAYER_COLOR_MAP[playerIndex];
        if (!color) return [];

        // 1. Home -> Path
        if (start.zone === 'home' && (end.zone === 'path' || end.zone === 'safe')) {
            // Skip adding the home start position to avoid delay
            // The token will appear directly at the spawn point

            // Initial spawn point
            const trackIdx = START_POSITIONS[color];
            const trackPos = getTokenGridPosition(playerIndex, 'path', trackIdx, 0);
            if (trackPos) path.push(trackPos);

            // If we are already at destination (just spawning), we are done with the "spawn" part
            // But we might need to move further if the logic allows recursive moves (unlikely for spawn)
            // Usually spawn puts you at START_POSITIONS.
            if (end.zone === 'path' && end.index === trackIdx) return path;

            // Continue from track start
            start = { zone: 'path', index: trackIdx };
        }

        // 2. Path/Safe movement
        // We simulate step by step
        let currentZone = start.zone;
        let currentIndex = start.index;

        // Safety break
        let steps = 0;
        const maxSteps = 60;

        // If we just spawned, we are already at path/START_POSITIONS.
        // But we added that to path. 
        // We shouldn't duplicate if the loop adds it again?
        // Let's rely on the loop to add subsequent steps.

        while (steps < maxSteps) {
            if (currentZone === end.zone && currentIndex === end.index) break;

            steps++;

            // Logic to determine NEXT step
            if (currentZone === 'path') {
                // Check if we should enter safe zone
                // Exit indices: Red 50->Safe, Green 11->Safe, Yellow 24->Safe, Blue 37->Safe
                const exitIdx = (START_POSITIONS[color] - 2 + 52) % 52;

                if (currentIndex === exitIdx && (end.zone === 'safe' || end.zone === 'finish')) {
                    // Enter safe zone
                    currentZone = 'safe';
                    currentIndex = 0;
                } else {
                    // Move along path
                    currentIndex = (currentIndex + 1) % 52;
                }
            } else if (currentZone === 'safe') {
                if (currentIndex < 5) {
                    currentIndex++;
                }
                if (currentIndex === 5) { // Reached end of safe
                    if (end.zone === 'finish') {
                        currentZone = 'finish';
                        currentIndex = 0; // arbitrary
                    }
                }
            } else if (currentZone === 'home') {
                // Should have been handled above
                break;
            }

            // Get grid pos for this new step
            const pos = getTokenGridPosition(playerIndex, currentZone as any, currentIndex, 0);
            if (pos) path.push(pos);
        }

        return path;
    };

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
        // hel
        //hbhjb
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

            // Handle Animation Trigger
            const currentDisplayed = displayedPlayersRef.current;

            if (currentDisplayed) {
                // Check if any token moved
                let moveFound = false;
                Object.entries(state.players).forEach(([pIdxStr, pState]) => {
                    const pIdx = parseInt(pIdxStr);
                    const oldPState = currentDisplayed[pIdx];
                    if (!oldPState) return;

                    pState.tokens.forEach((token, tIdx) => {
                        const oldToken = oldPState.tokens[tIdx];

                        const isCapture = (oldToken.zone !== 'home' && token.zone === 'home');
                        const isMove = !isCapture && (oldToken.zone !== token.zone || oldToken.index !== token.index);

                        if (isMove && !moveFound) {
                            // Check if this token is already animating
                            const currentAnim = animatingTokenRef.current;
                            if (currentAnim && currentAnim.playerIndex === pIdx && currentAnim.tokenIndex === tIdx) {
                                moveFound = true; // Already animating this, don't start another
                                return;
                            }

                            moveFound = true;
                            // Calculate path
                            const path = computePath(pIdx, oldToken, token);
                            if (path.length > 0) {
                                console.log('Starting animation for', pIdx, tIdx, 'Path len:', path.length);
                                setAnimatingToken({
                                    playerIndex: pIdx,
                                    tokenIndex: tIdx,
                                    path,
                                    currentStep: 0
                                });
                            }
                        }
                    });
                });

                if (!moveFound) {
                    // No moves (or just continued animation), update immediately only if NOT animating?
                    // If we are animating, we don't want to update displayedPlayers yet.
                    if (!animatingTokenRef.current) {
                        setDisplayedPlayers(state.players);
                    }
                }
            } else {
                // Initial load
                setDisplayedPlayers(state.players);
            }

            // Calculate my index using ref to avoid dependency loop
            const currentPlayers = playersRef.current;
            const myIdx = currentPlayers.findIndex(p => p.sessionId === guest.sessionId);

            // Check if it's my turn and I need to select a token
            if (state.turnPhase === 'move' && state.currentPlayer === myIdx) {
                // Get movable tokens from state using backend logic if available
                if (state.movableTokens && state.movableTokens.length > 0) {
                    setSelectableTokens(state.movableTokens);
                } else {
                    // Fallback to local calculation (mostly for initial state or robustness)
                    // But now valid: Check if move is possible
                    const playerState = state.players[myIdx];
                    if (playerState && state.diceValue) {
                        const movable: number[] = [];
                        playerState.tokens.forEach((token, idx) => {
                            // Basic fallback logic:
                            if (token.zone === 'home' && state.diceValue === 6) {
                                movable.push(idx);
                            } else if (token.zone === 'path' || token.zone === 'safe') {
                                // Improved check: if in safe zone, can we move?
                                if (token.zone === 'safe') {
                                    const remainingSteps = 5 - token.index;
                                    if (state.diceValue! <= remainingSteps) {
                                        movable.push(idx);
                                    }
                                } else {
                                    movable.push(idx);
                                }
                            }
                        });
                        setSelectableTokens(movable);
                    }
                }
            } else {
                setSelectableTokens([]);
            }
        });

        // Listen for token move animations (optional - just log for now)
        const unsubTokenMove = on('game:tokenMove', (data: unknown) => {
            console.log('Token move animation data received:', data);
            // Animation can be added later - state is already updated via game:state
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

    // Animation Loop
    useEffect(() => {
        if (!animatingToken || !gameState) return;

        // Note: The render-phase derived state (effectivePlayers) handles the instantaneous visual sync
        // at the last step. We still sync the actual state here when animation completes to be safe.
        if (animatingToken.currentStep >= animatingToken.path.length - 1) {
            setDisplayedPlayers(gameState.players);
        }

        const speedMs = 200; // Time per step

        const timer = setInterval(() => {
            setAnimatingToken(prev => {
                if (!prev) return null;
                const nextStep = prev.currentStep + 1;

                if (nextStep >= prev.path.length) {
                    // Animation complete
                    clearInterval(timer);
                    setDisplayedPlayers(gameState.players); // Sync visuals to real state
                    return null;
                }

                return { ...prev, currentStep: nextStep };
            });
        }, speedMs);

        return () => clearInterval(timer);
    }, [animatingToken, gameState]);

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
                <div className="animate-spin w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error && !room) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
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

    // Derived state: Use final game state immediately when animation reaches the last step
    // This prevents a 1-frame overlap where both tokens are at the same cell
    const effectivePlayers = (animatingToken && animatingToken.currentStep >= animatingToken.path.length - 1 && gameState)
        ? gameState.players
        : displayedPlayers;

    const boardGameState = effectivePlayers && gameState ? { ...gameState, players: effectivePlayers } : gameState;

    return (
        <div className="min-h-screen bg-[var(--background)]">
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

                {/* Game Board (Visible during play and when finished) */}
                {(isPlaying || isFinished) && gameState && guest && (
                    <div className="w-full max-w-7xl mx-auto relative">
                        {/* Game Over Overlay */}
                        {isFinished && gameState.winner !== null && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                                <div className="max-w-md w-full mx-4 text-center animate-in fade-in zoom-in duration-300">
                                    <Card className="p-8 bg-[#1a1a1a] border-2 border-[#333] shadow-2xl">
                                        <div className="text-6xl mb-4 animate-bounce">🏆</div>
                                        <h2 className="text-3xl font-bold text-white mb-2">
                                            {gameState.winner === myPlayerIndex ? 'You Won! 🎉' : 'Game Over!'}
                                        </h2>
                                        <p className="text-[#bbb] mb-8 text-lg">
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
                                    gameState={boardGameState!}
                                    players={players}
                                    currentSessionId={guest.sessionId}
                                    onTokenClick={handleTokenClick}
                                    selectableTokens={selectableTokens}
                                    isAnimating={!!animatingToken}
                                    getAnimatedTokenPosition={(pIdx, tIdx) => {
                                        if (animatingToken && animatingToken.playerIndex === pIdx && animatingToken.tokenIndex === tIdx) {
                                            return animatingToken.path[animatingToken.currentStep] || null;
                                        }
                                        return null;
                                    }}
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
                                            canRoll={!isFinished && gameState.currentPlayer === myPlayerIndex && gameState.turnPhase === 'roll'}
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
            </main>
        </div>
    );
}
