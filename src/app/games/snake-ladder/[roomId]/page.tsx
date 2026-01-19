'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Header from '@/components/layout/Header';
import WaitingRoom from '@/components/games/shared/WaitingRoom';
import SnakeLadderBoard from '@/components/games/snake-ladder/SnakeLadderBoard';
import Dice from '@/components/games/ludo/Dice';
import Card from '@/components/ui/Card';
import { useGuest } from '@/hooks/useGuest';
import { useAuth } from '@/contexts/AuthContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useSocket } from '@/hooks/useSocket';
import { roomApi } from '@/lib/api';
import { Room, Player } from '@/types/game';
import { SnakeLadderGameState, PLAYER_COLORS, SnakeLadderMoveStep } from '@/types/snakeLadder';
import { PlayerColor } from '@/types/ludo';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SnakeLadderRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomCode = (params.roomId as string).toUpperCase();

    const { guest, loading: guestLoading, login } = useGuest();
    const { user } = useAuth();
    const { isConnected, emit, on } = useSocket();

    const [room, setRoom] = useState<Room | null>(null);
    const [gameState, setGameState] = useState<SnakeLadderGameState | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rolling, setRolling] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    // Join modal state for users joining via link without a session
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinUsername, setJoinUsername] = useState('');
    const [joinError, setJoinError] = useState('');
    const [joining, setJoining] = useState(false);

    // Animation state
    const [animatingToken, setAnimatingToken] = useState<{
        playerIndex: number;
        steps: SnakeLadderMoveStep[];
        currentStep: number;
    } | null>(null);
    const [displayedPositions, setDisplayedPositions] = useState<Record<number, number>>({});

    // Sound effects (must be declared before animation effects that use them)
    const { playDiceRoll, playSnakeBite } = useSoundEffects();

    // Track if we already played the snake sound for current animation
    const snakeSoundPlayedRef = useRef<number | null>(null);

    const currentPlayer = players.find(p => p.sessionId === guest?.sessionId);
    const isHost = currentPlayer?.isHost || false;
    const myPlayerIndex = players.findIndex(p => p.sessionId === guest?.sessionId);

    // Fetch room data and handle join flow
    useEffect(() => {
        if (guestLoading) return;
        // ... (rest of useEffect is fine, just removing the useLudoTheme hook call above)

        const fetchRoom = async () => {
            try {
                const res = await roomApi.get(roomCode);
                if (res.success && res.data) {
                    setRoom(res.data);
                    setPlayers(res.data.players);

                    // If the game is already in progress and has saved state, restore it
                    // The API response may include gameState for reconnection scenarios
                    const roomData = res.data as Room & { gameState?: SnakeLadderGameState };
                    if ((roomData.status === 'playing' || roomData.status === 'finished') && roomData.gameState && roomData.gameState.players) {
                        setGameState(roomData.gameState);
                        // Initialize displayed positions from saved game state
                        const positions: Record<number, number> = {};
                        Object.entries(roomData.gameState.players).forEach(([idx, pState]) => {
                            positions[parseInt(idx)] = pState.position;
                        });
                        setDisplayedPositions(positions);
                    }

                    // Check if current user is already a participant
                    const currentSessionId = guest?.sessionId;
                    const isParticipant = res.data.players.some(p => p.sessionId === currentSessionId);

                    if (currentSessionId && !isParticipant) {
                        const isUsernameInRoom = user && res.data.players.some(p => p.username === user.username);

                        if (!isUsernameInRoom) {
                            // We have a session but are not in the room. Auto-join via API.
                            try {
                                await roomApi.join(roomCode, currentSessionId);
                            } catch (e) {
                                setShowJoinModal(true);
                            }
                        }
                    } else if (!guest && !user) {
                        // If user has no session, show join modal (they came via shared link)
                        setShowJoinModal(true);
                    } else if (user && !guest) {
                        const isUsernameInRoom = res.data.players.some(p => p.username === user.username);
                        if (!isUsernameInRoom) {
                            setShowJoinModal(true);
                        }
                    }
                } else {
                    setError('Room not found');
                }
            } catch {
                setError('Failed to load room');
            }
            setLoading(false);
        };

        fetchRoom();
    }, [roomCode, guest, guestLoading, user]);

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

            // Only sync displayed positions if NO animation is in progress
            // Animation state check is done via the current animatingToken value
            // We use a timeout to defer position sync, allowing tokenMove event to arrive first
            setTimeout(() => {
                setAnimatingToken(currentAnim => {
                    // If there's an animation in progress, don't override positions
                    if (currentAnim) {
                        return currentAnim; // Return unchanged
                    }
                    // No animation - sync positions from state
                    const newPositions: Record<number, number> = {};
                    Object.entries(state.players).forEach(([idx, pState]) => {
                        newPositions[parseInt(idx)] = pState.position;
                    });
                    setDisplayedPositions(newPositions);
                    return null;
                });
            }, 50); // Small delay to let tokenMove event arrive first
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

            // If I am the one animating, tell server I'm done so next turn can start
            if (animatingToken.playerIndex === myPlayerIndex) {
                emit('game:action', { roomCode, action: 'completeTurn' });
            }
            return;
        }

        // Schedule next step - 500ms delay for smooth visible movement
        const timer = setTimeout(() => {
            setAnimatingToken(prev => prev ? { ...prev, currentStep: prev.currentStep + 1 } : null);
        }, 500);

        return () => clearTimeout(timer);
    }, [animatingToken, gameState, myPlayerIndex, roomCode, emit]);

    // Play snake bite sound when landing on a snake
    useEffect(() => {
        if (!animatingToken) {
            // Reset tracking when animation ends
            snakeSoundPlayedRef.current = null;
            return;
        }

        const { steps, currentStep, playerIndex } = animatingToken;
        const currentStepData = steps[currentStep];

        // Check if this step is a snake slide and we haven't played the sound for this animation yet
        if (currentStepData?.moveType === 'snake' && snakeSoundPlayedRef.current !== playerIndex) {
            playSnakeBite();
            snakeSoundPlayedRef.current = playerIndex; // Mark as played for this animation
        }
    }, [animatingToken, playSnakeBite]);

    // Recovery: If we reconnect/load into 'animating' phase but have no local animation running,
    // complete the turn to prevent getting stuck.
    useEffect(() => {
        if (gameState?.turnPhase === 'animating' && gameState.currentPlayer === myPlayerIndex && !animatingToken) {
            console.log('Recovering from interrupted animation...');
            emit('game:action', { roomCode, action: 'completeTurn' });
        }
    }, [gameState?.turnPhase, gameState?.currentPlayer, myPlayerIndex, animatingToken, roomCode, emit]);

    // Celebration effect
    // Celebration effect
    useEffect(() => {
        if (gameState?.winner !== null && gameState?.winner !== undefined) {
            // Wait for visual animation to reach grid 100
            const winnerPos = displayedPositions[gameState.winner];
            if (winnerPos !== 100) return;

            // ... existing confetti code ...
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
    }, [gameState?.winner, displayedPositions]);

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
        playDiceRoll(); // Play dice roll sound
        emit('game:action', { roomCode, action: 'roll' });
    }, [emit, roomCode, gameState, playDiceRoll]);

    // Handle token click - moves the token after dice is rolled
    const handleMoveToken = useCallback(() => {
        if (!gameState || gameState.turnPhase !== 'move') return;
        if (gameState.currentPlayer !== myPlayerIndex) return;
        emit('game:action', { roomCode, action: 'move' });
    }, [emit, roomCode, gameState, myPlayerIndex]);

    // Handle join via shared link (creates session and joins room)
    const handleJoinViaLink = async () => {
        if (!joinUsername.trim() || joinUsername.length < 2) {
            setJoinError('Username must be at least 2 characters');
            return;
        }

        setJoining(true);
        setJoinError('');

        try {
            // Create guest session
            const guestResult = await login(joinUsername.trim());
            if (!guestResult) {
                setJoinError('Failed to create session');
                setJoining(false);
                return;
            }

            // Join the room
            const joinRes = await roomApi.join(roomCode, guestResult.sessionId);
            if (joinRes.success && joinRes.data) {
                setRoom(joinRes.data);
                setPlayers(joinRes.data.players);
                setShowJoinModal(false);
            } else {
                setJoinError(joinRes.message || 'Failed to join room');
            }
        } catch (err) {
            setJoinError('Failed to join room');
        }

        setJoining(false);
    };

    if (loading || guestLoading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #0D2818 0%, #1A3A2A 20%, #0F3320 40%, #16392B 60%, #0B2616 80%, #081C10 100%)',
                }}
            >
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
                {/* Loader */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin shadow-[0_0_20px_rgba(52,211,153,0.3)]" />
                    <span className="text-emerald-300/80 text-sm font-medium tracking-wide">Loading jungle...</span>
                </div>
            </div>
        );
    }

    if (error && !room) {
        return (
            <div
                className="min-h-screen flex items-center justify-center relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #0D2818 0%, #1A3A2A 20%, #0F3320 40%, #16392B 60%, #0B2616 80%, #081C10 100%)',
                }}
            >
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
                {/* Error Card */}
                <div className="relative z-10 p-8 text-center rounded-2xl bg-black/40 backdrop-blur-xl border border-emerald-500/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <div className="text-5xl mb-4 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">🐍</div>
                    <p className="text-red-400 mb-6 font-medium text-lg">{error}</p>
                    <button
                        onClick={() => router.push('/games/snake-ladder')}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all shadow-[0_4px_20px_rgba(52,211,153,0.4)] hover:shadow-[0_4px_30px_rgba(52,211,153,0.6)] transform hover:scale-105"
                    >
                        Back to Snake & Ladder
                    </button>
                </div>
            </div>
        );
    }

    const isWaiting = room?.status === 'waiting';
    const isPlaying = room?.status === 'playing';
    const isFinished = room?.status === 'finished';

    // Only show game over screens when the winner physically reaches the end
    const showGameOver = isFinished && gameState && gameState.winner != null && displayedPositions[gameState.winner] === 100;

    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #0D2818 0%, #1A3A2A 20%, #0F3320 40%, #16392B 60%, #0B2616 80%, #081C10 100%)',
            }}
        >
            {/* === EA SPORTS STYLE JUNGLE BACKGROUND === */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">

                {/* Dark overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

                {/* === TROPICAL PALM LEAVES - TOP LEFT CORNER === */}
                <div className="absolute -top-10 -left-10 w-80 h-80 opacity-30">
                    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                        {/* Palm Frond 1 */}
                        <path d="M20 180 Q60 140 100 100 Q80 80 60 90 Q40 100 20 120 Q10 140 20 180" fill="#1B4D3E" />
                        <path d="M25 175 Q60 140 95 105" stroke="#2D6A4F" strokeWidth="2" fill="none" />
                        {/* Palm Frond 2 */}
                        <path d="M40 190 Q90 130 140 80 Q120 60 95 75 Q70 90 50 120 Q35 150 40 190" fill="#1B4D3E" />
                        <path d="M45 185 Q90 130 135 85" stroke="#2D6A4F" strokeWidth="2" fill="none" />
                        {/* Palm Frond 3 */}
                        <path d="M10 160 Q40 120 70 80 Q55 65 40 75 Q25 90 15 115 Q8 135 10 160" fill="#184E40" />
                    </svg>
                </div>

                {/* === TROPICAL PALM LEAVES - TOP RIGHT CORNER === */}
                <div className="absolute -top-5 -right-16 w-96 h-96 opacity-25 rotate-180">
                    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full transform scale-x-[-1]">
                        <path d="M20 180 Q60 140 100 100 Q80 80 60 90 Q40 100 20 120 Q10 140 20 180" fill="#1B4D3E" />
                        <path d="M40 190 Q90 130 140 80 Q120 60 95 75 Q70 90 50 120 Q35 150 40 190" fill="#1B4D3E" />
                        <path d="M10 160 Q40 120 70 80 Q55 65 40 75 Q25 90 15 115 Q8 135 10 160" fill="#184E40" />
                    </svg>
                </div>

                {/* === MONSTERA LEAF - LEFT SIDE === */}
                <div className="absolute top-1/4 -left-20 w-64 h-64 opacity-20 rotate-12">
                    <svg viewBox="0 0 120 140" fill="none" className="w-full h-full">
                        <path d="M60 130 Q30 110 20 80 Q15 50 40 30 Q55 20 70 30 Q90 50 85 80 Q80 110 60 130" fill="#1B5E20" />
                        {/* Monstera holes */}
                        <ellipse cx="45" cy="60" rx="8" ry="12" fill="#0D2818" />
                        <ellipse cx="65" cy="75" rx="6" ry="10" fill="#0D2818" />
                        <ellipse cx="50" cy="90" rx="5" ry="8" fill="#0D2818" />
                        {/* Leaf veins */}
                        <path d="M60 130 L60 35" stroke="#2D6A4F" strokeWidth="2" />
                        <path d="M60 50 L40 40" stroke="#2D6A4F" strokeWidth="1" />
                        <path d="M60 70 L35 60" stroke="#2D6A4F" strokeWidth="1" />
                        <path d="M60 90 L40 85" stroke="#2D6A4F" strokeWidth="1" />
                    </svg>
                </div>

                {/* === MONSTERA LEAF - RIGHT SIDE === */}
                <div className="absolute top-1/3 -right-10 w-56 h-56 opacity-15 -rotate-20">
                    <svg viewBox="0 0 120 140" fill="none" className="w-full h-full transform scale-x-[-1]">
                        <path d="M60 130 Q30 110 20 80 Q15 50 40 30 Q55 20 70 30 Q90 50 85 80 Q80 110 60 130" fill="#1B5E20" />
                        <ellipse cx="45" cy="60" rx="8" ry="12" fill="#0D2818" />
                        <ellipse cx="65" cy="75" rx="6" ry="10" fill="#0D2818" />
                        <path d="M60 130 L60 35" stroke="#2D6A4F" strokeWidth="2" />
                    </svg>
                </div>

                {/* === FERN PATTERNS - BOTTOM CORNERS === */}
                <div className="absolute -bottom-10 -left-10 w-72 h-72 opacity-25 rotate-45">
                    <svg viewBox="0 0 100 150" fill="none" className="w-full h-full">
                        {/* Fern stem */}
                        <path d="M50 140 Q50 100 50 20" stroke="#2D6A4F" strokeWidth="3" />
                        {/* Fern leaflets */}
                        {[20, 35, 50, 65, 80, 95, 110, 125].map((y, i) => (
                            <g key={i}>
                                <path d={`M50 ${y} Q${30 - i * 2} ${y - 5} ${25 - i * 2} ${y - 10}`} stroke="#1B5E20" strokeWidth="2" fill="none" />
                                <path d={`M50 ${y} Q${70 + i * 2} ${y - 5} ${75 + i * 2} ${y - 10}`} stroke="#1B5E20" strokeWidth="2" fill="none" />
                            </g>
                        ))}
                    </svg>
                </div>

                <div className="absolute -bottom-16 -right-16 w-80 h-80 opacity-20 -rotate-30">
                    <svg viewBox="0 0 100 150" fill="none" className="w-full h-full transform scale-x-[-1]">
                        <path d="M50 140 Q50 100 50 20" stroke="#2D6A4F" strokeWidth="3" />
                        {[20, 35, 50, 65, 80, 95, 110, 125].map((y, i) => (
                            <g key={i}>
                                <path d={`M50 ${y} Q${30 - i * 2} ${y - 5} ${25 - i * 2} ${y - 10}`} stroke="#1B5E20" strokeWidth="2" fill="none" />
                                <path d={`M50 ${y} Q${70 + i * 2} ${y - 5} ${75 + i * 2} ${y - 10}`} stroke="#1B5E20" strokeWidth="2" fill="none" />
                            </g>
                        ))}
                    </svg>
                </div>

                {/* === BAMBOO STALKS - SIDES === */}
                <div className="absolute top-20 left-4 w-6 h-full opacity-15">
                    <svg viewBox="0 0 20 400" fill="none" className="w-full h-full">
                        <rect x="5" y="0" width="10" height="400" fill="#1B4D3E" rx="3" />
                        {[50, 120, 190, 260, 330].map((y, i) => (
                            <rect key={i} x="3" y={y} width="14" height="8" fill="#0D2818" rx="2" />
                        ))}
                    </svg>
                </div>

                <div className="absolute top-32 left-12 w-4 h-full opacity-10">
                    <svg viewBox="0 0 20 400" fill="none" className="w-full h-full">
                        <rect x="5" y="0" width="10" height="400" fill="#1B4D3E" rx="3" />
                        {[70, 140, 210, 280, 350].map((y, i) => (
                            <rect key={i} x="3" y={y} width="14" height="8" fill="#0D2818" rx="2" />
                        ))}
                    </svg>
                </div>

                <div className="absolute top-10 right-6 w-5 h-full opacity-12">
                    <svg viewBox="0 0 20 400" fill="none" className="w-full h-full">
                        <rect x="5" y="0" width="10" height="400" fill="#1B4D3E" rx="3" />
                        {[60, 130, 200, 270, 340].map((y, i) => (
                            <rect key={i} x="3" y={y} width="14" height="8" fill="#0D2818" rx="2" />
                        ))}
                    </svg>
                </div>

                {/* === FLOATING LEAVES - SCATTERED === */}
                <div className="absolute top-[15%] left-[20%] w-12 h-12 opacity-20 rotate-[25deg]">
                    <svg viewBox="0 0 50 50" fill="none">
                        <path d="M25 45 Q10 30 15 15 Q25 5 35 15 Q40 30 25 45" fill="#1B5E20" />
                        <path d="M25 45 L25 12" stroke="#2D6A4F" strokeWidth="1" />
                    </svg>
                </div>

                <div className="absolute top-[60%] left-[15%] w-10 h-10 opacity-15 rotate-[-15deg]">
                    <svg viewBox="0 0 50 50" fill="none">
                        <path d="M25 45 Q10 30 15 15 Q25 5 35 15 Q40 30 25 45" fill="#184E40" />
                    </svg>
                </div>

                <div className="absolute top-[45%] right-[18%] w-14 h-14 opacity-18 rotate-[40deg]">
                    <svg viewBox="0 0 50 50" fill="none">
                        <path d="M25 45 Q10 30 15 15 Q25 5 35 15 Q40 30 25 45" fill="#1B5E20" />
                        <path d="M25 45 L25 12" stroke="#2D6A4F" strokeWidth="1" />
                    </svg>
                </div>

                <div className="absolute top-[75%] right-[25%] w-8 h-8 opacity-12 rotate-[-30deg]">
                    <svg viewBox="0 0 50 50" fill="none">
                        <path d="M25 45 Q10 30 15 15 Q25 5 35 15 Q40 30 25 45" fill="#184E40" />
                    </svg>
                </div>

                {/* === ATMOSPHERIC GLOW EFFECTS === */}
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-900/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-green-900/15 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[150px]" />

                {/* === VIGNETTE EFFECT === */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />

                {/* === TOP/BOTTOM GRADIENT BARS === */}
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/60 to-transparent" />

                {/* === SUBTLE NOISE TEXTURE === */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }} />
            </div>

            <Header />

            <main className="pt-24 pb-12 px-4 relative z-10">
                {/* Error Toast */}
                {error && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-500/10 border border-red-500 text-red-500 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Connection Status */}
                <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-emerald-500/20">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]'}`} />
                    <span className="text-emerald-200/80">{isConnected ? 'Connected' : 'Connecting...'}</span>
                </div>

                {/* Tutorial Button */}
                <div className="fixed top-24 right-4 z-40">
                    <button
                        onClick={() => setShowTutorial(true)}
                        className="px-4 py-2 text-sm font-bold text-emerald-200 bg-black/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all shadow-lg"
                    >
                        Rules 📜
                    </button>
                </div>

                {/* Waiting Room */}
                {isWaiting && room && (
                    <WaitingRoom
                        roomCode={roomCode}
                        players={players}
                        currentSessionId={guest?.sessionId || ''}
                        isHost={isHost}
                        minPlayers={room.minPlayers}
                        maxPlayers={room.maxPlayers}
                        onStart={handleStartGame}
                        onLeave={handleLeaveRoom}
                        gameTitle="Snake & Ladder"
                        accentColor="#10b981"
                        headerContent={<div className="text-6xl mb-2">🐍🪜</div>}
                    />
                )}

                {/* Reconnecting State - shown when game is in progress but state not yet received */}
                {(isPlaying || isFinished) && !gameState && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <Card className="p-8 text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-lg font-semibold text-[var(--text)]">
                                Reconnecting to game...
                            </p>
                            <p className="text-sm mt-2 text-[var(--text-muted)]">
                                Please wait while we restore your game session
                            </p>
                        </Card>
                    </div>
                )}

                {/* Game Board */}
                {(isPlaying || isFinished) && gameState && guest && (
                    <div className="w-full max-w-5xl mx-auto relative">
                        {/* Game Over Overlay */}
                        {showGameOver && (
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
                                                        style={{ color: PLAYER_COLORS[gameState.winner!]?.hex }}
                                                    >
                                                        {players[gameState.winner!]?.username}
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

                        <div className={`flex flex-col lg:flex-row gap-6 items-start justify-center ${showGameOver ? 'brightness-50 pointer-events-none' : ''}`}>
                            {/* Left Panel - Game Info */}
                            <div className="w-full lg:w-72 order-2 lg:order-1 flex-shrink-0">
                                <div
                                    className="p-5 rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                                    style={{
                                        background: 'linear-gradient(145deg, rgba(13,40,24,0.95) 0%, rgba(26,58,42,0.95) 100%)',
                                        backdropFilter: 'blur(20px)',
                                    }}
                                >
                                    <h3 className="text-lg font-bold text-emerald-300 mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                        <span className="text-xl">🎲</span> Game Info
                                    </h3>

                                    {/* Current Turn */}
                                    <div className="mb-4">
                                        <p className="text-xs text-emerald-400/80 font-medium mb-2 uppercase tracking-wider">Current Turn</p>
                                        <div
                                            className="px-4 py-2.5 rounded-xl text-white font-bold text-center shadow-lg"
                                            style={{ backgroundColor: PLAYER_COLORS[gameState.currentPlayer]?.hex }}
                                        >
                                            {players[gameState.currentPlayer]?.username}
                                            {gameState.currentPlayer === myPlayerIndex && ' (You)'}
                                        </div>
                                    </div>

                                    {/* Dice */}
                                    <div className="mb-4">
                                        <p className="text-xs text-emerald-400/80 font-medium mb-2 uppercase tracking-wider">Dice</p>
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
                                        <p className="text-sm text-emerald-300/80 text-center mb-2">
                                            Last roll: <span className="font-bold text-emerald-200">{gameState.lastRoll}</span>
                                            {gameState.lastRoll === 6 && ' 🎉'}
                                        </p>
                                    )}

                                    {gameState.canRollAgain && gameState.currentPlayer === myPlayerIndex && gameState.turnPhase === 'roll' && (
                                        <p className="text-sm text-emerald-300 font-bold text-center animate-pulse drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">🎲 Roll again!</p>
                                    )}

                                    {/* Click token prompt - shows when it's time to move */}
                                    {gameState.turnPhase === 'move' && gameState.currentPlayer === myPlayerIndex && !animatingToken && (
                                        <div className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/50 animate-pulse">
                                            <p className="text-sm text-amber-200 font-bold text-center drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                                                👆 Click your token to move {gameState.diceValue} spaces!
                                            </p>
                                        </div>
                                    )}

                                    {/* Players */}
                                    <div className="mt-4 pt-4 border-t border-emerald-500/20">
                                        <p className="text-xs text-emerald-400/80 font-medium mb-3 uppercase tracking-wider">Players</p>
                                        <div className="space-y-2">
                                            {Object.entries(gameState.players).map(([idx, pState]) => {
                                                const pIdx = parseInt(idx);
                                                const player = players[pIdx];
                                                const displayPos = displayedPositions[pIdx] ?? pState.position;
                                                const isActive = gameState.currentPlayer === pIdx;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`flex items-center justify-between text-sm p-2.5 rounded-xl transition-all ${isActive ? 'bg-emerald-500/20 ring-2 ring-emerald-400/50' : 'hover:bg-emerald-500/10'}`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span
                                                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                                                style={{ backgroundColor: PLAYER_COLORS[pIdx]?.hex }}
                                                            />
                                                            <span className="text-emerald-100 font-medium">{player?.username}</span>
                                                        </span>
                                                        <span className="font-mono font-bold text-emerald-300">
                                                            {displayPos === 0 ? 'Start' : displayPos}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center - Board */}
                            <div className="flex-shrink-0 order-1 lg:order-2">
                                <SnakeLadderBoard
                                    gameState={gameState}
                                    players={players}
                                    displayedPositions={displayedPositions}
                                    currentSessionId={guest.sessionId}
                                    isAnimating={!!animatingToken}
                                    onTokenClick={handleMoveToken}
                                    myPlayerIndex={myPlayerIndex}
                                    canMove={gameState.turnPhase === 'move' && gameState.currentPlayer === myPlayerIndex}
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

            {/* Join Modal - for users accessing via shared link */}
            <Modal
                isOpen={showJoinModal}
                onClose={() => {
                    router.push('/games/snake-ladder');
                }}
                title="Join Game"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-[var(--text-muted)] text-sm">
                        Enter your name to join room <span className="font-mono font-bold text-[var(--primary)]">{roomCode}</span>
                    </p>
                    <Input
                        placeholder="Your username"
                        value={joinUsername}
                        onChange={(e) => setJoinUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinViaLink()}
                        error={joinError}
                        autoFocus
                    />
                    <Button onClick={handleJoinViaLink} loading={joining} className="w-full">
                        Join Game
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
