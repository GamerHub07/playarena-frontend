'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Header from '@/components/layout/Header';
import WaitingRoom from '@/components/games/ludo/WaitingRoom';
import Board from '@/components/games/ludo/Board';
import Dice from '@/components/games/ludo/Dice';
import ThemeSelector from '@/components/games/ludo/ThemeSelector';
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
import { LudoThemeProvider, useLudoTheme } from '@/contexts/LudoThemeContext';

// Wrapper component that provides the theme context
export default function GameRoomPage() {
    return (
        <LudoThemeProvider>
            <GameRoomContent />
        </LudoThemeProvider>
    );
}

// Main game room content that uses the theme
function GameRoomContent() {
    const { theme, setThemeId } = useLudoTheme();
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
    const [leaderboard, setLeaderboard] = useState<Array<{ position: number; username: string; rank: number }>>([]);

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
            // Initial spawn point
            const trackIdx = START_POSITIONS[color];
            const trackPos = getTokenGridPosition(playerIndex, 'path', trackIdx, 0);
            if (trackPos) path.push(trackPos);

            if (end.zone === 'path' && end.index === trackIdx) return path;
            start = { zone: 'path', index: trackIdx };
        }

        // 2. Path/Safe movement
        let currentZone = start.zone;
        let currentIndex = start.index;
        let steps = 0;
        const maxSteps = 60;

        while (steps < maxSteps) {
            if (currentZone === end.zone && currentIndex === end.index) break;
            steps++;

            if (currentZone === 'path') {
                const exitIdx = (START_POSITIONS[color] - 2 + 52) % 52;
                if (currentIndex === exitIdx && (end.zone === 'safe' || end.zone === 'finish')) {
                    currentZone = 'safe';
                    currentIndex = 0;
                } else {
                    currentIndex = (currentIndex + 1) % 52;
                }
            } else if (currentZone === 'safe') {
                if (currentIndex < 5) {
                    currentIndex++;
                }
                if (currentIndex === 5) {
                    if (end.zone === 'finish') {
                        currentZone = 'finish';
                        currentIndex = 0;
                    }
                }
            } else if (currentZone === 'home') {
                break;
            }

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

    // Keep players ref in sync
    const playersRef = useRef(players);
    useEffect(() => {
        playersRef.current = players;
    }, [players]);

    // Socket listeners
    useEffect(() => {
        if (!guest || !isConnected) return;

        const unsubRoom = on('room:update', (data: unknown) => {
            const { players: updatedPlayers, status } = data as { players: Player[]; status: string };
            setPlayers(updatedPlayers);
            setRoom(prev => prev ? { ...prev, status: status as Room['status'] } : null);
        });

        const unsubStart = on('game:start', (data: unknown) => {
            const { state } = data as { state: LudoGameState };
            setGameState(state);
            setRoom(prev => prev ? { ...prev, status: 'playing' } : null);
        });

        const unsubState = on('game:state', (data: unknown) => {
            const { state } = data as { state: LudoGameState };
            setGameState(state);
            setRolling(false);

            const currentDisplayed = displayedPlayersRef.current;

            if (currentDisplayed) {
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
                            const currentAnim = animatingTokenRef.current;
                            if (currentAnim && currentAnim.playerIndex === pIdx && currentAnim.tokenIndex === tIdx) {
                                moveFound = true;
                                return;
                            }

                            moveFound = true;
                            const path = computePath(pIdx, oldToken, token);
                            if (path.length > 0) {
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
                    if (!animatingTokenRef.current) {
                        setDisplayedPlayers(state.players);
                    }
                }
            } else {
                setDisplayedPlayers(state.players);
            }

            const currentPlayers = playersRef.current;
            const myIdx = currentPlayers.findIndex(p => p.sessionId === guest.sessionId);

            if (state.turnPhase === 'move' && state.currentPlayer === myIdx) {
                let tokensToSelect: number[] = [];
                if (state.movableTokens && state.movableTokens.length > 0) {
                    tokensToSelect = state.movableTokens;
                } else {
                    const playerState = state.players[myIdx];
                    if (playerState && state.diceValue) {
                        playerState.tokens.forEach((token, idx) => {
                            if (token.zone === 'home' && state.diceValue === 6) {
                                tokensToSelect.push(idx);
                            } else if (token.zone === 'path' || token.zone === 'safe') {
                                if (token.zone === 'safe') {
                                    const remainingSteps = 5 - token.index;
                                    if (state.diceValue! <= remainingSteps) {
                                        tokensToSelect.push(idx);
                                    }
                                } else {
                                    tokensToSelect.push(idx);
                                }
                            }
                        });
                    }
                }

                setSelectableTokens(tokensToSelect);

                if (tokensToSelect.length === 1) {
                    const tokenIndex = tokensToSelect[0];
                    setTimeout(() => {
                        if (state.turnPhase === 'move' && state.currentPlayer === myIdx) {
                            emit('game:action', { roomCode, action: 'move', data: { tokenIndex } });
                            setSelectableTokens([]);
                        }
                    }, 500);
                }
            } else {
                setSelectableTokens([]);
            }
        });

        const unsubTokenMove = on('game:tokenMove', (data: unknown) => {
            console.log('Token move animation data received:', data);
        });

        const unsubWinner = on('game:winner', (data: unknown) => {
            const { winner, leaderboard: lb } = data as {
                winner: { position: number; username: string },
                leaderboard?: Array<{ position: number; username: string; rank: number }>
            };

            if (lb) {
                setLeaderboard(lb);
            } else if (winner) {
                setLeaderboard([{ ...winner, rank: 1 }]);
            }

            setRoom(prev => prev ? { ...prev, status: 'finished' } : null);
        });

        const unsubError = on('error', (data: unknown) => {
            const { message } = data as { message: string };
            console.error('Socket error:', message);
            setError(message);
            setRolling(false);
            setTimeout(() => setError(''), 3000);
        });

        // Listen for theme changes from host
        const unsubTheme = on('room:theme', (data: unknown) => {
            const { themeId } = data as { themeId: string };
            console.log('Theme changed to:', themeId);
            setThemeId(themeId);
        });

        return () => {
            unsubRoom();
            unsubStart();
            unsubState();
            unsubTokenMove();
            unsubWinner();
            unsubError();
            unsubTheme();
        };
    }, [guest, isConnected, on, setThemeId]);

    // Animation Loop
    useEffect(() => {
        if (!animatingToken || !gameState) return;

        if (animatingToken.currentStep >= animatingToken.path.length - 1) {
            setDisplayedPlayers(gameState.players);
        }

        const speedMs = 200;

        const timer = setInterval(() => {
            setAnimatingToken(prev => {
                if (!prev) return null;
                const nextStep = prev.currentStep + 1;

                if (nextStep >= prev.path.length) {
                    clearInterval(timer);
                    setDisplayedPlayers(gameState.players);
                    return null;
                }

                return { ...prev, currentStep: nextStep };
            });
        }, speedMs);

        return () => clearInterval(timer);
    }, [animatingToken, gameState]);

    // Celebration effect
    useEffect(() => {
        if (gameState?.winner !== null && gameState?.winner !== undefined) {
            const duration = 5 * 1000; // Reduced from 15s for better performance
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }
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
        router.push('/games/ludo');
    }, [emit, router]);

    const handleRollDice = useCallback(() => {
        if (!gameState || gameState.turnPhase !== 'roll') return;
        setRolling(true);
        emit('game:action', { roomCode, action: 'roll' });
    }, [emit, roomCode, gameState]);

    const handleTokenClick = useCallback((tokenIndex: number) => {
        emit('game:action', { roomCode, action: 'move', data: { tokenIndex } });
        setSelectableTokens([]);
    }, [emit, roomCode]);

    // Handle theme change (host only) - emits to all players via socket
    const handleThemeChange = useCallback((themeId: string) => {
        emit('room:theme', { themeId });
    }, [emit]);

    // Get theme colors
    const getPlayerColor = (playerIndex: number) => {
        const colorMap: Record<number, keyof typeof theme.playerColors> = {
            0: 'red',
            1: 'green',
            2: 'yellow',
            3: 'blue',
        };
        return theme.playerColors[colorMap[playerIndex]];
    };

    if (loading || guestLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: theme.board.background }}>
                <div
                    className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
                    style={{ borderColor: theme.ui.accentColor, borderTopColor: 'transparent' }}
                />
            </div>
        );
    }

    if (error && !room) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: theme.board.background }}>
                <Card
                    className="p-8 text-center"
                    style={{ backgroundColor: theme.ui.cardBackground, border: `2px solid ${theme.ui.cardBorder}` }}
                >
                    <p className="mb-4" style={{ color: theme.playerColors.red.bg, fontFamily: theme.effects.fontFamily }}>{error}</p>
                    <button
                        onClick={() => router.push('/games/ludo')}
                        className="transition-colors"
                        style={{ color: theme.ui.accentColor, fontFamily: theme.effects.fontFamily }}
                    >
                        Back to Ludo
                    </button>
                </Card>
            </div>
        );
    }

    const isWaiting = room?.status === 'waiting';
    const isPlaying = room?.status === 'playing';
    const isFinished = room?.status === 'finished';

    const effectivePlayers = (animatingToken && animatingToken.currentStep >= animatingToken.path.length - 1 && gameState)
        ? gameState.players
        : displayedPlayers;

    const boardGameState = effectivePlayers && gameState ? { ...gameState, players: effectivePlayers } : gameState;

    return (
        <div className="min-h-screen relative" style={{ background: theme.board.background }}>
            {/* Theme texture overlay */}
            {theme.effects.useWoodTexture && (
                <div
                    className="fixed inset-0 opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                    }}
                />
            )}

            {/* Full-screen ambient decorations from theme */}
            {theme.decorations.ambientElements?.map((element, i) => (
                element.positions.map((pos, j) => (
                    <div
                        key={`ambient-${i}-${j}`}
                        className="fixed text-4xl md:text-5xl lg:text-6xl pointer-events-none select-none z-10"
                        style={{
                            top: pos.top,
                            left: pos.left,
                            opacity: pos.opacity ?? 0.4,
                            transform: `translate(-50%, -50%) ${pos.rotation ? `rotate(${pos.rotation}deg)` : ''}`,
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                            animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                            animationDelay: `${j * 0.5}s`,
                        }}
                    >
                        {element.symbol}
                    </div>
                ))
            ))}

            {theme.decorations.sceneElements?.map((el, i) => (
                <div
                    key={`scene-${i}`}
                    className="fixed pointer-events-none select-none z-10"
                    style={{
                        ...el.position,
                        fontSize: el.size ?? '5rem',
                        opacity: el.opacity ?? 0.5,
                        transform: `rotate(${el.rotation ?? 0}deg)`,
                        filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))',
                        animation: el.float ? 'float 4s ease-in-out infinite' : undefined
                    }}
                >
                    {el.symbol}
                </div>
            ))}


            {theme.decorations.foregroundElements?.map((el, i) => (
                <div
                    key={`fg-${i}`}
                    className="fixed pointer-events-none z-20"
                    style={{
                        bottom: el.position.bottom,
                        left: el.position.left,
                        right: el.position.right,
                        opacity: el.opacity ?? 0.4,
                        fontSize: '48px',
                        width: '100%',
                        textAlign: 'center',
                    }}
                >
                    {el.symbol}
                </div>
            ))}



            {/* Corner decorations - larger and fixed to screen corners */}
            {theme.decorations.cornerSymbols && (
                <>
                    <div className="fixed top-24 left-4 text-3xl md:text-4xl pointer-events-none select-none z-10" style={{ color: theme.ui.accentColor, opacity: 0.6, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{theme.decorations.cornerSymbols[0]}</div>
                    <div className="fixed top-24 right-4 text-3xl md:text-4xl pointer-events-none select-none z-10" style={{ color: theme.ui.accentColor, opacity: 0.6, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{theme.decorations.cornerSymbols[1]}</div>
                    <div className="fixed bottom-4 left-4 text-3xl md:text-4xl pointer-events-none select-none z-10" style={{ color: theme.ui.accentColor, opacity: 0.6, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{theme.decorations.cornerSymbols[2]}</div>
                    <div className="fixed bottom-4 right-4 text-3xl md:text-4xl pointer-events-none select-none z-10" style={{ color: theme.ui.accentColor, opacity: 0.6, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{theme.decorations.cornerSymbols[3]}</div>
                </>
            )}

            <Header />

            <main className="pt-24 pb-12 px-4 relative z-10">
                {/* Error Toast */}
                {error && (
                    <div
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg"
                        style={{
                            backgroundColor: `${theme.playerColors.red.bg}E6`,
                            border: `2px solid ${theme.playerColors.red.bg}`,
                            color: theme.ui.textPrimary,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                            fontFamily: theme.effects.fontFamily,
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Connection Status */}
                <div
                    className="fixed bottom-4 right-4 flex items-center gap-2 text-xs"
                    style={{ color: theme.ui.textSecondary, fontFamily: theme.effects.fontFamily }}
                >
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isConnected ? theme.playerColors.green.bg : theme.playerColors.red.bg }}
                    />
                    {isConnected ? 'Connected' : 'Connecting...'}
                </div>

                {/* Theme Selector - Fixed position (Host only) */}
                <div className="fixed top-20 right-4 z-40">
                    <ThemeSelector
                        compact
                        isHost={isHost}
                        onThemeChange={handleThemeChange}
                    />
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
                    <div className="w-full max-w-7xl mx-auto relative">
                        {/* Game Over Overlay */}
                        {isFinished && leaderboard.length > 0 && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                                <div className="max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
                                    <Card
                                        className="p-8 shadow-2xl"
                                        style={{
                                            backgroundColor: theme.ui.cardBackground,
                                            border: `4px solid ${theme.ui.cardBorder}`,
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        <div className="text-center mb-6">
                                            <div className="text-6xl mb-4 animate-bounce" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>🏆</div>
                                            <h2
                                                className="text-3xl font-bold mb-2"
                                                style={{ color: theme.ui.textPrimary, textShadow: '2px 2px 4px rgba(0,0,0,0.5)', fontFamily: theme.effects.fontFamily }}
                                            >
                                                Game Over!
                                            </h2>
                                            <p style={{ color: theme.ui.textSecondary, fontFamily: theme.effects.fontFamily }}>Here are the final standings:</p>
                                        </div>

                                        <div className="space-y-3 mb-8">
                                            {leaderboard.map((p) => {
                                                const isMe = players[p.position]?.sessionId === guest.sessionId;
                                                const playerColor = getPlayerColor(p.position);

                                                return (
                                                    <div
                                                        key={p.position}
                                                        className="flex items-center justify-between p-4 rounded-lg"
                                                        style={{
                                                            backgroundColor: isMe ? `${theme.ui.accentColor}30` : 'rgba(0,0,0,0.2)',
                                                            border: isMe ? `2px solid ${theme.ui.accentColor}` : `2px solid ${theme.ui.cardBorder}50`,
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                                                                style={{
                                                                    backgroundColor: playerColor.bg,
                                                                    color: theme.ui.textPrimary,
                                                                    border: `2px solid ${theme.ui.accentColor}80`,
                                                                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                                                    fontFamily: theme.effects.fontFamily,
                                                                }}
                                                            >
                                                                {p.rank}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span
                                                                    className="font-semibold text-lg"
                                                                    style={{ color: isMe ? theme.ui.textPrimary : theme.ui.textSecondary, fontFamily: theme.effects.fontFamily }}
                                                                >
                                                                    {p.username}
                                                                </span>
                                                                {isMe && <span className="text-xs" style={{ color: theme.ui.accentColor }}>You</span>}
                                                            </div>
                                                        </div>

                                                        {p.rank === 1 && <span className="text-2xl">🥇</span>}
                                                        {p.rank === 2 && <span className="text-2xl">🥈</span>}
                                                        {p.rank === 3 && <span className="text-2xl">🥉</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="text-center">
                                            <button
                                                onClick={() => router.push('/games/ludo')}
                                                className="w-full px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                                                style={{
                                                    background: `linear-gradient(145deg, ${theme.ui.buttonGradientStart} 0%, ${theme.ui.buttonGradientEnd} 100%)`,
                                                    color: theme.ui.textPrimary,
                                                    border: `2px solid ${theme.ui.buttonBorder}`,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                                    textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                                                    fontFamily: theme.effects.fontFamily,
                                                }}
                                            >
                                                Back to Lobby
                                            </button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        <div className={`flex flex-col lg:flex-row gap-6 items-start justify-center transition-all ${isFinished ? 'brightness-50 pointer-events-none' : ''}`}>
                            {/* Left Panel - Controls */}
                            <div className="w-full lg:w-48 flex flex-col gap-4 order-2 lg:order-1">
                                {/* Placeholder for future controls */}
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
                                <Card
                                    className="p-5"
                                    style={{
                                        backgroundColor: theme.ui.cardBackground,
                                        border: `3px solid ${theme.ui.cardBorder}`,
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <h3
                                        className="text-lg font-semibold mb-4"
                                        style={{
                                            color: theme.ui.textPrimary,
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                            fontFamily: theme.effects.fontFamily,
                                        }}
                                    >
                                        {theme.effects.useGoldAccents ? '✦ Game Info ✦' : '● Game Info ●'}
                                    </h3>

                                    {/* Current Player */}
                                    <div className="mb-6">
                                        <p
                                            className="text-xs mb-2"
                                            style={{ color: theme.ui.textSecondary, fontFamily: theme.effects.fontFamily }}
                                        >
                                            Current Turn
                                        </p>
                                        <div
                                            className="px-3 py-2 rounded-lg font-medium"
                                            style={{
                                                backgroundColor: getPlayerColor(gameState.currentPlayer).bg,
                                                color: theme.ui.textPrimary,
                                                border: `2px solid ${theme.ui.accentColor}60`,
                                                textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                                                fontFamily: theme.effects.fontFamily,
                                            }}
                                        >
                                            {players[gameState.currentPlayer]?.username}
                                            {gameState.currentPlayer === myPlayerIndex && ' (You)'}
                                        </div>
                                    </div>

                                    {/* Dice */}
                                    <div className="mb-6">
                                        <p
                                            className="text-xs mb-2"
                                            style={{ color: theme.ui.textSecondary, fontFamily: theme.effects.fontFamily }}
                                        >
                                            Dice
                                        </p>
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
                                        <p
                                            className="text-sm"
                                            style={{ color: theme.ui.textSecondary, fontFamily: theme.effects.fontFamily }}
                                        >
                                            Last roll: <span className="font-bold" style={{ color: theme.ui.accentColor }}>{gameState.lastRoll}</span>
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
