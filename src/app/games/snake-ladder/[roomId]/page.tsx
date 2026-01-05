'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Header from '@/components/layout/Header';
import WaitingRoom from '@/components/games/ludo/WaitingRoom';
import { LudoThemeProvider } from '@/contexts/LudoThemeContext';
import SnakeLadderBoard from '@/components/games/snake-ladder/SnakeLadderBoard';
import Dice from '@/components/games/ludo/Dice';
import Card from '@/components/ui/Card';
import { useGuest } from '@/hooks/useGuest';
import { useSocket } from '@/hooks/useSocket';
import { roomApi } from '@/lib/api';
import { Room, Player } from '@/types/game';
import { SnakeLadderGameState, PLAYER_COLORS, SnakeLadderMoveStep } from '@/types/snakeLadder';
import { PlayerColor } from '@/types/ludo';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function SnakeLadderRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomCode = (params.roomId as string).toUpperCase();

    const { guest, loading: guestLoading } = useGuest();
    const { isConnected, emit, on } = useSocket();

    const [room, setRoom] = useState<Room | null>(null);
    const [gameState, setGameState] = useState<SnakeLadderGameState | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rolling, setRolling] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    // Animation state
    const [animatingToken, setAnimatingToken] = useState<{
        playerIndex: number;
        steps: SnakeLadderMoveStep[];
        currentStep: number;
    } | null>(null);
    const [displayedPositions, setDisplayedPositions] = useState<Record<number, number>>({});

    const currentPlayer = players.find(p => p.sessionId === guest?.sessionId);
    const isHost = currentPlayer?.isHost || false;
    const myPlayerIndex = players.findIndex(p => p.sessionId === guest?.sessionId);

    // Fetch room data
    useEffect(() => {
        if (guestLoading) return;

        if (!guest) {
            router.push('/games/snake-ladder');
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
            const { players: updatedPlayers, status } = data as { players: Player[]; status: string };
            setPlayers(updatedPlayers);
            setRoom(prev => prev ? { ...prev, status: status as Room['status'] } : null);
        });

        const unsubStart = on('game:start', (data: unknown) => {
            const { state } = data as { state: SnakeLadderGameState };
            setGameState(state);
            setRoom(prev => prev ? { ...prev, status: 'playing' } : null);
            // Initialize displayed positions
            const positions: Record<number, number> = {};
            Object.entries(state.players).forEach(([idx, pState]) => {
                positions[parseInt(idx)] = pState.position;
            });
            setDisplayedPositions(positions);
        });

        const unsubState = on('game:state', (data: unknown) => {
            const { state } = data as { state: SnakeLadderGameState };
            setGameState(state);
            setRolling(false);

            // Sync displayed positions from game state when no animation is active
            // This ensures tokens appear even if tokenMove event was missed
            setDisplayedPositions(prev => {
                // Only update if we're not in the middle of an animation
                const newPositions: Record<number, number> = {};
                Object.entries(state.players).forEach(([idx, pState]) => {
                    newPositions[parseInt(idx)] = pState.position;
                });
                return newPositions;
            });
        });

        const unsubTokenMove = on('game:tokenMove', (data: unknown) => {
            const { steps, move } = data as { steps: SnakeLadderMoveStep[]; move: { player: number } };
            if (steps && steps.length > 0) {
                setAnimatingToken({
                    playerIndex: move.player,
                    steps,
                    currentStep: 0,
                });
            }
        });

        const unsubWinner = on('game:winner', () => {
            setRoom(prev => prev ? { ...prev, status: 'finished' } : null);
        });

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
    }, [guest, isConnected, on]);

    // Animation loop
    useEffect(() => {
        if (!animatingToken || !gameState) return;

        const { steps, currentStep } = animatingToken;

        // Update displayed position
        if (steps[currentStep]) {
            setDisplayedPositions(prev => ({
                ...prev,
                [animatingToken.playerIndex]: steps[currentStep].position,
            }));
        }

        // Check if animation complete
        if (currentStep >= steps.length - 1) {
            // Sync to final state
            const finalPositions: Record<number, number> = {};
            Object.entries(gameState.players).forEach(([idx, pState]) => {
                finalPositions[parseInt(idx)] = pState.position;
            });
            setDisplayedPositions(finalPositions);
            setAnimatingToken(null);
            return;
        }

        // Schedule next step
        const timer = setTimeout(() => {
            setAnimatingToken(prev => prev ? { ...prev, currentStep: prev.currentStep + 1 } : null);
        }, 200);

        return () => clearTimeout(timer);
    }, [animatingToken, gameState]);

    // Celebration effect
    useEffect(() => {
        if (gameState?.winner !== null && gameState?.winner !== undefined) {
            const duration = 15 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [gameState?.winner]);

    // Socket join room
    useEffect(() => {
        if (!guest || !isConnected || loading) return;

        emit('room:join', {
            roomCode,
            sessionId: guest.sessionId,
            username: guest.username,
        });

        return () => {
            emit('room:leave', {});
        };
    }, [isConnected, guest, loading, roomCode, emit]);

    const handleStartGame = useCallback(() => {
        emit('game:start', { roomCode });
    }, [emit, roomCode]);

    const handleLeaveRoom = useCallback(() => {
        emit('room:leave', {});
        router.push('/games/snake-ladder');
    }, [emit, router]);

    const handleRollDice = useCallback(() => {
        if (!gameState || gameState.turnPhase !== 'roll') return;
        setRolling(true);
        emit('game:action', { roomCode, action: 'roll' });
    }, [emit, roomCode, gameState]);

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
                    <button onClick={() => router.push('/games/snake-ladder')} className="text-[var(--primary)]">
                        Back to Snake & Ladder
                    </button>
                </Card>
            </div>
        );
    }

    const isWaiting = room?.status === 'waiting';
    const isPlaying = room?.status === 'playing';
    const isFinished = room?.status === 'finished';

    return (
        <LudoThemeProvider>
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
                    <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        {isConnected ? 'Connected' : 'Connecting...'}
                    </div>

                    {/* Tutorial Button */}
                    <div className="fixed top-24 right-4 z-40">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowTutorial(true)}
                        >
                            Rules ℹ️
                        </Button>
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
                    {(isPlaying || isFinished) && gameState && guest && (
                        <div className="w-full max-w-5xl mx-auto relative">
                            {/* Game Over Overlay */}
                            {isFinished && gameState.winner !== null && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <div className="max-w-md w-full mx-4 text-center">
                                        <Card className="p-8">
                                            <div className="text-6xl mb-4 animate-bounce">🏆</div>
                                            <h2 className="text-3xl font-bold text-[var(--text)] mb-2">
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
                                            <Button onClick={() => router.push('/games/snake-ladder')}>
                                                Play Again
                                            </Button>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            <div className={`flex flex-col lg:flex-row gap-6 items-start justify-center ${isFinished ? 'brightness-50 pointer-events-none' : ''}`}>
                                {/* Left Panel - Game Info */}
                                <div className="w-full lg:w-64 order-2 lg:order-1 flex-shrink-0">
                                    <Card className="p-4">
                                        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Game Info</h3>

                                        {/* Current Turn */}
                                        <div className="mb-4">
                                            <p className="text-xs text-[var(--text-muted)] mb-2">Current Turn</p>
                                            <div
                                                className="px-3 py-2 rounded-lg text-white font-medium text-center"
                                                style={{ backgroundColor: PLAYER_COLORS[gameState.currentPlayer]?.hex }}
                                            >
                                                {players[gameState.currentPlayer]?.username}
                                                {gameState.currentPlayer === myPlayerIndex && ' (You)'}
                                            </div>
                                        </div>

                                        {/* Dice */}
                                        <div className="mb-4">
                                            <p className="text-xs text-[var(--text-muted)] mb-2">Dice</p>
                                            <div className="flex justify-center">
                                                <Dice
                                                    value={gameState.diceValue || gameState.lastRoll}
                                                    rolling={rolling}
                                                    canRoll={!isFinished && gameState.currentPlayer === myPlayerIndex && gameState.turnPhase === 'roll'}
                                                    onRoll={handleRollDice}
                                                    playerColor={(PLAYER_COLORS[myPlayerIndex]?.name || 'red') as PlayerColor}
                                                />
                                            </div>
                                        </div>

                                        {/* Status Messages */}
                                        {gameState.lastRoll && (
                                            <p className="text-sm text-[var(--text-muted)] text-center mb-2">
                                                Last roll: <span className="font-bold text-[var(--text)]">{gameState.lastRoll}</span>
                                                {gameState.lastRoll === 6 && ' 🎉'}
                                            </p>
                                        )}

                                        {gameState.canRollAgain && gameState.currentPlayer === myPlayerIndex && (
                                            <p className="text-sm text-green-500 text-center">Roll again!</p>
                                        )}

                                        {/* Players */}
                                        <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                            <p className="text-xs text-[var(--text-muted)] mb-3">Players</p>
                                            <div className="space-y-2">
                                                {Object.entries(gameState.players).map(([idx, pState]) => {
                                                    const pIdx = parseInt(idx);
                                                    const player = players[pIdx];
                                                    const displayPos = displayedPositions[pIdx] ?? pState.position;
                                                    const isActive = gameState.currentPlayer === pIdx;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`flex items-center justify-between text-sm p-2 rounded-lg ${isActive ? 'bg-[var(--surface-alt)]' : ''}`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <span
                                                                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                                                    style={{ backgroundColor: PLAYER_COLORS[pIdx]?.hex }}
                                                                />
                                                                <span className="text-[var(--text)]">{player?.username}</span>
                                                            </span>
                                                            <span className="font-mono font-bold text-[var(--text)]">
                                                                {displayPos === 0 ? 'Start' : displayPos}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Center - Board */}
                                <div className="flex-shrink-0 order-1 lg:order-2">
                                    <SnakeLadderBoard
                                        gameState={gameState}
                                        players={players}
                                        displayedPositions={displayedPositions}
                                        currentSessionId={guest.sessionId}
                                        isAnimating={!!animatingToken}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Tutorial Modal */}
                <Modal
                    isOpen={showTutorial}
                    onClose={() => setShowTutorial(false)}
                    title="How to Play"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[var(--surface-alt)] rounded-xl text-center">
                                <span className="text-3xl mb-2 block">🐍</span>
                                <h4 className="font-bold text-[var(--text)] mb-1">Snakes</h4>
                                <p className="text-sm text-[var(--text-muted)]">Slide down when you land on a head.</p>
                            </div>
                            <div className="p-4 bg-[var(--surface-alt)] rounded-xl text-center">
                                <span className="text-3xl mb-2 block">🪜</span>
                                <h4 className="font-bold text-[var(--text)] mb-1">Ladders</h4>
                                <p className="text-sm text-[var(--text-muted)]">Climb up when you land on the bottom.</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-[var(--text-muted)]">
                            <p>🎲 Roll the dice to move forward.</p>
                            <p>🎉 Rolling a <strong>6</strong> gives you an extra turn!</p>
                            <p>⛔ Three <strong>6s</strong> in a row = skip turn.</p>
                            <p>↩️ Must land exactly on <strong>100</strong> to win.</p>
                        </div>

                        <p className="text-xs text-center text-[var(--text-muted)] pt-4 border-t border-[var(--border)]">
                            First player to reach square 100 wins!
                        </p>
                    </div>
                </Modal>
            </div>
        </LudoThemeProvider>
    );
}
