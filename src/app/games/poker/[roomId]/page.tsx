'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Header from '@/components/layout/Header';
import WaitingRoom from '@/components/games/shared/WaitingRoom';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useGuest } from '@/hooks/useGuest';
import { useSocket } from '@/hooks/useSocket';
import { roomApi } from '@/lib/api';
import { Room, Player } from '@/types/game';
import {
    PokerGameState,
    PokerPlayerState,
    Card as CardType,
    PlayerAction,
    WinnerInfo,
    SUIT_SYMBOLS,
    SUIT_COLORS,
    phaseToString,
    actionToString,
    evaluateHand,
    HandEvaluation,
} from '@/types/poker';
import { PokerHandsGuideButton } from '@/components/games/poker/PokerHandsGuide';

// ═══════════════════════════════════════════════════════════════
// PREMIUM STYLING CONSTANTS
// ═══════════════════════════════════════════════════════════════

// Player seat positions around the table (up to 8 players)
const SEAT_POSITIONS = [
    { top: '88%', left: '50%', transform: 'translate(-50%, -50%)' },  // 0: Bottom center (me)
    { top: '75%', left: '8%', transform: 'translate(-50%, -50%)' },   // 1: Bottom left
    { top: '40%', left: '3%', transform: 'translate(-50%, -50%)' },   // 2: Middle left
    { top: '8%', left: '18%', transform: 'translate(-50%, -50%)' },   // 3: Top left
    { top: '8%', left: '50%', transform: 'translate(-50%, -50%)' },   // 4: Top center
    { top: '8%', left: '82%', transform: 'translate(-50%, -50%)' },   // 5: Top right
    { top: '40%', left: '97%', transform: 'translate(-50%, -50%)' },  // 6: Middle right
    { top: '75%', left: '92%', transform: 'translate(-50%, -50%)' },  // 7: Bottom right
];

// Premium poker colors
const POKER_COLORS = [
    { hex: '#dc2626', name: 'Ruby' },
    { hex: '#ea580c', name: 'Ember' },
    { hex: '#16a34a', name: 'Jade' },
    { hex: '#2563eb', name: 'Sapphire' },
    { hex: '#7c3aed', name: 'Amethyst' },
    { hex: '#db2777', name: 'Rose' },
    { hex: '#0891b2', name: 'Cyan' },
    { hex: '#ca8a04', name: 'Gold' },
];

// Player avatars
const PLAYER_AVATARS = ['🎩', '👑', '🎭', '💎', '🌟', '🔥', '⭐', '🃏'];

// ═══════════════════════════════════════════════════════════════
// PREMIUM CARD COMPONENT
// ═══════════════════════════════════════════════════════════════

function PremiumCard({ card, hidden = false, small = false, glow = false }: {
    card?: CardType;
    hidden?: boolean;
    small?: boolean;
    glow?: boolean;
}) {
    const sizeClasses = small
        ? 'w-10 h-14 rounded-lg text-sm'
        : 'w-16 h-22 rounded-xl text-base';

    if (hidden || !card) {
        return (
            <div
                className={`${sizeClasses} relative overflow-hidden shadow-xl transition-transform hover:scale-105`}
                style={{
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 50%, #1e3a5f 100%)',
                    border: '2px solid #3b82f6',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1)',
                }}
            >
                {/* Card back pattern */}
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 5px,
                        rgba(59, 130, 246, 0.3) 5px,
                        rgba(59, 130, 246, 0.3) 10px
                    )`
                }} />
                <div className="absolute inset-2 border border-blue-400/30 rounded-md" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-blue-400 text-2xl">♠</span>
                </div>
            </div>
        );
    }

    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const color = isRed ? '#ef4444' : '#1f2937';
    const symbol = SUIT_SYMBOLS[card.suit];

    return (
        <div
            className={`${sizeClasses} relative overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-1`}
            style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f3f4f6 50%, #e5e7eb 100%)',
                borderRadius: small ? '8px' : '12px',
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: glow
                    ? `0 8px 32px rgba(234, 179, 8, 0.5), 0 4px 16px rgba(0,0,0,0.3)`
                    : '0 4px 16px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.1)',
            }}
        >
            {/* Card content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-1" style={{ color }}>
                <span className={`font-black ${small ? 'text-lg' : 'text-2xl'} leading-none`}>
                    {card.rank}
                </span>
                <span className={`${small ? 'text-lg' : 'text-3xl'} leading-none mt-0.5`}>
                    {symbol}
                </span>
            </div>
            {/* Top-left corner */}
            <div className="absolute top-1 left-1.5 flex flex-col items-center text-xs leading-none" style={{ color }}>
                <span className="font-bold">{card.rank}</span>
                <span className="text-sm">{symbol}</span>
            </div>
            {/* Bottom-right corner (rotated) */}
            <div className="absolute bottom-1 right-1.5 flex flex-col items-center text-xs leading-none rotate-180" style={{ color }}>
                <span className="font-bold">{card.rank}</span>
                <span className="text-sm">{symbol}</span>
            </div>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// PREMIUM PLAYER SEAT COMPONENT
// ═══════════════════════════════════════════════════════════════

function PlayerSeat({
    player,
    isCurrentTurn,
    isMe,
    position,
    communityCards,
    playerIndex,
}: {
    player: PokerPlayerState;
    isCurrentTurn: boolean;
    isMe: boolean;
    position: { top: string; left: string; transform: string };
    communityCards: CardType[];
    playerIndex: number;
}) {
    const handEval = (isMe && player.hand && player.hand.length > 0 && !player.folded)
        ? evaluateHand(player.hand, communityCards)
        : null;

    const avatar = PLAYER_AVATARS[playerIndex % PLAYER_AVATARS.length];
    const playerColor = POKER_COLORS[playerIndex % POKER_COLORS.length];

    return (
        <div
            className={`absolute flex flex-col items-center gap-1.5 transition-all duration-500 ${isCurrentTurn ? 'scale-110 z-20' : 'z-10'}`}
            style={position}
        >
            {/* Turn indicator ring */}
            {isCurrentTurn && (
                <div
                    className="absolute -inset-4 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: playerColor.hex }}
                />
            )}

            {/* Hand Hint */}
            {handEval && (
                <div
                    className="px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, ${handEval.color} 0%, ${handEval.color}dd 100%)`,
                        color: 'white',
                        boxShadow: `0 4px 15px ${handEval.color}60`,
                        animation: 'pulse 2s infinite',
                    }}
                >
                    {handEval.emoji} {handEval.description}
                </div>
            )}

            {/* Cards */}
            <div className="flex gap-1 -space-x-2">
                {player.hand && player.hand.length > 0 ? (
                    player.hand.map((card, i) => (
                        <div key={i} style={{ transform: `rotate(${i === 0 ? -8 : 8}deg)` }}>
                            <PremiumCard card={card} small glow={!!(isMe && handEval && handEval.strength >= 4)} />
                        </div>
                    ))
                ) : (
                    <>
                        <div style={{ transform: 'rotate(-8deg)' }}>
                            <PremiumCard hidden small />
                        </div>
                        <div style={{ transform: 'rotate(8deg)' }}>
                            <PremiumCard hidden small />
                        </div>
                    </>
                )}
            </div>

            {/* Player info card */}
            <div
                className={`relative px-4 py-2 rounded-2xl flex items-center gap-2 transition-all duration-300
                    ${player.folded ? 'opacity-40 grayscale' : ''}
                `}
                style={{
                    background: isCurrentTurn
                        ? `linear-gradient(135deg, ${playerColor.hex} 0%, ${playerColor.hex}cc 100%)`
                        : 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    border: isMe
                        ? '2px solid #22c55e'
                        : isCurrentTurn
                            ? `2px solid ${playerColor.hex}`
                            : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isCurrentTurn
                        ? `0 8px 32px ${playerColor.hex}50, 0 4px 12px rgba(0,0,0,0.5)`
                        : '0 4px 12px rgba(0,0,0,0.4)',
                }}
            >
                {/* Avatar */}
                <span className="text-xl">{avatar}</span>

                {/* Name & Chips */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        {player.isDealer && <span className="text-xs bg-yellow-500/80 px-1.5 py-0.5 rounded text-black font-bold">D</span>}
                        {player.isSmallBlind && <span className="text-xs bg-blue-500/80 px-1 py-0.5 rounded">SB</span>}
                        {player.isBigBlind && <span className="text-xs bg-purple-500/80 px-1 py-0.5 rounded">BB</span>}
                        <span className={`font-semibold truncate max-w-[70px] ${isCurrentTurn ? 'text-white' : 'text-gray-200'}`}>
                            {player.username}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-400 font-bold text-sm">💰 ${player.chips.toLocaleString()}</span>
                    </div>
                </div>

                {/* Me indicator */}
                {isMe && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-500 rounded-full text-[10px] font-bold text-white">
                        YOU
                    </div>
                )}
            </div>

            {/* Current bet chip */}
            {player.currentBet > 0 && (
                <div
                    className="flex items-center gap-1 px-3 py-1 rounded-full font-bold text-sm"
                    style={{
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)',
                    }}
                >
                    <span className="text-sm">🪙</span>
                    <span className="text-white">${player.currentBet}</span>
                </div>
            )}

            {/* Status badges */}
            <div className="flex gap-1">
                {player.folded && (
                    <div className="bg-gray-700/90 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">
                        ❌ Folded
                    </div>
                )}
                {player.allIn && (
                    <div
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{
                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            animation: 'pulse 1s infinite',
                            boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)',
                        }}
                    >
                        🔥 ALL-IN
                    </div>
                )}
                {player.lastAction && !player.folded && !player.allIn && (
                    <div className="bg-blue-600/90 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                        {actionToString(player.lastAction)}
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function PokerGameRoom() {
    const params = useParams();
    const router = useRouter();
    const roomCode = (params.roomId as string).toUpperCase();

    const { guest, loading: guestLoading } = useGuest();
    const { isConnected, emit, on } = useSocket();

    const [room, setRoom] = useState<Room | null>(null);
    const [gameState, setGameState] = useState<PokerGameState | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [availableActions, setAvailableActions] = useState<PlayerAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // UI state
    const [raiseAmount, setRaiseAmount] = useState(0);
    const [showRaiseSlider, setShowRaiseSlider] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [winners, setWinners] = useState<WinnerInfo[] | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [nextHandCountdown, setNextHandCountdown] = useState<number | null>(null);

    // Draggable action bar state
    const [actionBarPos, setActionBarPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

    // Track if we've joined the room to prevent duplicate emissions
    const hasJoinedRef = useRef(false);

    // Calculate my position
    const myPlayerIndex = useMemo(() => {
        if (!guest || !gameState) return null;
        const player = Object.values(gameState.players).find(p => p.sessionId === guest.sessionId);
        return player?.position ?? null;
    }, [gameState, guest]);

    const isMyTurn = useMemo(() => {
        return gameState && myPlayerIndex !== null && gameState.currentPlayerIndex === myPlayerIndex;
    }, [gameState, myPlayerIndex]);

    const myPlayer = useMemo(() => {
        if (myPlayerIndex === null || !gameState) return null;
        return gameState.players[myPlayerIndex];
    }, [gameState, myPlayerIndex]);

    // Fetch room data
    useEffect(() => {
        if (guestLoading) return;

        if (!guest) {
            router.push('/games/poker');
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
            const { players: updatedPlayers, status } = data as {
                players: Player[];
                status: string;
            };
            setPlayers(updatedPlayers);
            setRoom((prev) => (prev ? { ...prev, status: status as Room['status'] } : null));
        });

        const unsubStart = on('game:start', (data: unknown) => {
            const { state, availableActions: actions } = data as {
                state: PokerGameState;
                availableActions: PlayerAction[];
            };
            setGameState(state);
            setAvailableActions(actions || []);
            setRoom((prev) => (prev ? { ...prev, status: 'playing' } : null));
        });

        const unsubState = on('game:state', (data: unknown) => {
            const { state, availableActions: actions } = data as {
                state: PokerGameState;
                availableActions: PlayerAction[];
            };
            setGameState(state);
            setAvailableActions(actions || []);
        });

        const unsubWinner = on('game:winner', (data: unknown) => {
            const { handWinners, isGameOver: gameOver, winner } = data as {
                handWinners: WinnerInfo[] | null;
                isGameOver: boolean;
                winner?: { position: number; username: string };
            };
            setWinners(handWinners);
            setIsGameOver(gameOver);
            setShowWinnerModal(true);

            // Start countdown for next hand if game is not over
            if (!gameOver) {
                setNextHandCountdown(3);
            }

            if (gameOver) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                });
            }
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
            unsubWinner();
            unsubError();
        };
    }, [guest, isConnected, on]);

    // Join room on connect
    useEffect(() => {
        if (!guest || !isConnected || !room) return;

        if (!hasJoinedRef.current) {
            hasJoinedRef.current = true;
            emit('room:join', {
                roomCode,
                sessionId: guest.sessionId,
                username: guest.username,
            });
        }

        return () => {
            hasJoinedRef.current = false;
        };
    }, [guest, isConnected, room, roomCode, emit]);

    // Reset slider when turn ends
    useEffect(() => {
        if (!isMyTurn) setShowRaiseSlider(false);
    }, [isMyTurn]);

    // Handle actions
    const handleAction = useCallback((action: PlayerAction, amount?: number) => {
        emit('game:action', {
            roomCode,
            action: 'poker_action',
            data: { action, amount },
        });
    }, [emit, roomCode]);

    const handleStartGame = useCallback(() => {
        emit('game:start', { roomCode });
    }, [emit, roomCode]);

    const handleNextHand = useCallback(() => {
        setShowWinnerModal(false);
        setNextHandCountdown(null);
        emit('game:action', {
            roomCode,
            action: 'poker_action',
            data: { action: 'start_hand' },
        });
    }, [emit, roomCode]);

    // Auto-start next hand countdown
    useEffect(() => {
        if (nextHandCountdown === null || isGameOver) return;

        if (nextHandCountdown <= 0) {
            handleNextHand();
            return;
        }

        const timer = setTimeout(() => {
            setNextHandCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearTimeout(timer);
    }, [nextHandCountdown, isGameOver, handleNextHand]);

    // Calculate raise bounds
    const minRaise = gameState?.minRaise || 0;
    const maxRaise = myPlayer ? myPlayer.chips - (gameState?.currentBet || 0 - (myPlayer?.currentBet || 0)) : 0;
    const toCall = gameState && myPlayer ? gameState.currentBet - myPlayer.currentBet : 0;

    // Check if user is host
    const isHost = players.find(p => p.sessionId === guest?.sessionId)?.isHost || false;

    // ═══════════════════════════════════════════════════════════════
    // RENDER STATES
    // ═══════════════════════════════════════════════════════════════

    if (loading || guestLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-500/30 rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                    <span className="text-emerald-400 font-medium">Loading table...</span>
                </div>
            </div>
        );
    }

    if (error && !room) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center">
                <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-700 text-center max-w-md">
                    <div className="text-5xl mb-4">😞</div>
                    <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Button onClick={() => router.push('/games/poker')} className="bg-emerald-600 hover:bg-emerald-700">
                        Back to Lobby
                    </Button>
                </div>
            </div>
        );
    }

    // Waiting room
    if (room?.status === 'waiting') {
        return (
            <>
                <Header />
                <main className="pt-24 pb-12 px-4">
                    <WaitingRoom
                        roomCode={roomCode}
                        players={players}
                        currentSessionId={guest?.sessionId || ''}
                        maxPlayers={room?.maxPlayers || 8}
                        minPlayers={room?.minPlayers || 2}
                        playerColors={POKER_COLORS}
                        isHost={isHost}
                        onStart={handleStartGame}
                        onLeave={() => router.push('/games/poker')}
                        gameTitle="Texas Hold'em Poker"
                        accentColor="#10b981"
                    />
                </main>
            </>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // MAIN GAME VIEW
    // ═══════════════════════════════════════════════════════════════

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 overflow-hidden">
            {/* Ambient background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
            </div>

            <Header />

            <main className="pt-20 pb-4 px-4 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Premium Game Info Bar */}
                    <div className="flex justify-between items-center mb-4 px-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                }}
                            >
                                <span className="text-emerald-400">🎰</span>
                                <span className="text-gray-400 text-sm">Room:</span>
                                <span className="font-mono font-bold text-white tracking-wider">{roomCode}</span>
                            </div>
                            <div className="text-gray-400 text-sm">
                                Hand <span className="text-white font-bold">#{gameState?.handNumber}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <PokerHandsGuideButton />
                            <div
                                className="px-4 py-2 rounded-xl text-sm"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                <span className="text-gray-400">Phase:</span>
                                <span className="text-emerald-400 ml-2 font-semibold">{phaseToString(gameState?.phase || 'waiting')}</span>
                            </div>
                            <div
                                className="px-5 py-2 rounded-xl font-bold text-lg flex items-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)',
                                    boxShadow: '0 4px 20px rgba(202, 138, 4, 0.4)',
                                }}
                            >
                                <span>💰</span>
                                <span className="text-white">${gameState?.pot || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* PREMIUM POKER TABLE */}
                    <div className="relative w-full aspect-[16/9] max-h-[65vh]">
                        {/* Outer table rim */}
                        <div
                            className="absolute inset-[5%] rounded-[50%]"
                            style={{
                                background: 'linear-gradient(180deg, #5c3d2e 0%, #3d2517 50%, #2d1810 100%)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1)',
                            }}
                        />

                        {/* Table felt */}
                        <div
                            className="absolute inset-[7%] rounded-[50%] overflow-hidden"
                            style={{
                                background: 'radial-gradient(ellipse at center, #1a6b4a 0%, #0f4a33 40%, #0a3322 80%, #061f15 100%)',
                                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)',
                            }}
                        >
                            {/* Felt texture overlay */}
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                                }}
                            />

                            {/* Inner decorative ring */}
                            <div className="absolute inset-6 border border-emerald-400/20 rounded-[50%]" />
                            <div className="absolute inset-12 border border-emerald-400/10 rounded-[50%]" />
                        </div>

                        {/* Community cards */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3">
                            {gameState?.communityCards.map((card, i) => (
                                <div key={i} className="transform hover:scale-110 transition-transform">
                                    <PremiumCard card={card} />
                                </div>
                            ))}
                            {/* Empty slots */}
                            {Array.from({ length: 5 - (gameState?.communityCards.length || 0) }).map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    className="w-16 h-22 rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5"
                                />
                            ))}
                        </div>

                        {/* Pot display */}
                        {gameState && gameState.pot > 0 && (
                            <div
                                className="absolute top-[28%] left-1/2 -translate-x-1/2 px-6 py-2 rounded-full flex items-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
                                    border: '1px solid rgba(202, 138, 4, 0.5)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 30px rgba(202, 138, 4, 0.2)',
                                }}
                            >
                                <span className="text-2xl">💰</span>
                                <span className="text-yellow-400 font-bold text-xl">${gameState.pot.toLocaleString()}</span>
                            </div>
                        )}

                        {/* Player seats */}
                        {gameState && Object.values(gameState.players).map((player, idx) => (
                            <PlayerSeat
                                key={player.position}
                                player={player}
                                isCurrentTurn={player.position === gameState.currentPlayerIndex}
                                isMe={player.position === myPlayerIndex}
                                position={SEAT_POSITIONS[idx % SEAT_POSITIONS.length]}
                                communityCards={gameState.communityCards}
                                playerIndex={idx}
                            />
                        ))}
                    </div>

                    {/* PREMIUM ACTION BAR */}
                    {isMyTurn && gameState?.phase !== 'showdown' && (
                        <div
                            className="fixed z-50"
                            style={{
                                left: `calc(50% + ${actionBarPos.x}px)`,
                                top: `calc(85% + ${actionBarPos.y}px)`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <div
                                className="p-5 rounded-2xl cursor-grab active:cursor-grabbing"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(16, 185, 129, 0.1)',
                                    minWidth: '380px',
                                }}
                                onMouseDown={(e) => {
                                    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') return;
                                    setIsDragging(true);
                                    dragStartRef.current = { x: e.clientX, y: e.clientY, posX: actionBarPos.x, posY: actionBarPos.y };
                                }}
                                onMouseMove={(e) => {
                                    if (!isDragging) return;
                                    setActionBarPos({
                                        x: dragStartRef.current.posX + (e.clientX - dragStartRef.current.x),
                                        y: dragStartRef.current.posY + (e.clientY - dragStartRef.current.y)
                                    });
                                }}
                                onMouseUp={() => setIsDragging(false)}
                                onMouseLeave={() => setIsDragging(false)}
                            >
                                {/* Header */}
                                <div className="flex justify-center mb-3">
                                    <div className="w-12 h-1 bg-emerald-500/50 rounded-full" />
                                </div>
                                <div className="text-center text-emerald-400 mb-4 font-bold text-lg flex items-center justify-center gap-2">
                                    <span className="animate-pulse">🎯</span> Your Turn
                                </div>

                                {/* Raise slider */}
                                {availableActions.includes('raise') && showRaiseSlider && (
                                    <div className="mb-5 px-2">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-emerald-400 font-medium">Raise: ${raiseAmount}</span>
                                            <span className="text-gray-500">Max: ${maxRaise}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={minRaise}
                                            max={maxRaise}
                                            value={raiseAmount}
                                            onChange={(e) => setRaiseAmount(Number(e.target.value))}
                                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                            style={{
                                                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((raiseAmount - minRaise) / (maxRaise - minRaise)) * 100}%, #374151 ${((raiseAmount - minRaise) / (maxRaise - minRaise)) * 100}%, #374151 100%)`,
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-2 justify-center flex-wrap">
                                    {availableActions.includes('fold') && (
                                        <button
                                            onClick={() => handleAction('fold')}
                                            className="px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                                            style={{
                                                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
                                            }}
                                        >
                                            ❌ Fold
                                        </button>
                                    )}
                                    {availableActions.includes('check') && (
                                        <button
                                            onClick={() => handleAction('check')}
                                            className="px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                                            style={{
                                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                                            }}
                                        >
                                            ✓ Check
                                        </button>
                                    )}
                                    {availableActions.includes('call') && (
                                        <button
                                            onClick={() => handleAction('call')}
                                            className="px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                                            style={{
                                                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                                boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)',
                                            }}
                                        >
                                            📞 Call ${toCall}
                                        </button>
                                    )}
                                    {availableActions.includes('raise') && (
                                        !showRaiseSlider ? (
                                            <button
                                                onClick={() => {
                                                    setRaiseAmount(minRaise);
                                                    setShowRaiseSlider(true);
                                                }}
                                                className="px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                                                style={{
                                                    background: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)',
                                                    boxShadow: '0 4px 15px rgba(202, 138, 4, 0.4)',
                                                }}
                                            >
                                                📈 Raise
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setShowRaiseSlider(false)}
                                                    className="px-4 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 text-white"
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    }}
                                                >
                                                    🔙
                                                </button>
                                                <button
                                                    onClick={() => handleAction('raise', raiseAmount)}
                                                    className="px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)',
                                                        boxShadow: '0 4px 15px rgba(202, 138, 4, 0.4)',
                                                    }}
                                                >
                                                    ✅ ${raiseAmount}
                                                </button>
                                            </>
                                        )
                                    )}
                                    {availableActions.includes('all-in') && (
                                        <button
                                            onClick={() => handleAction('all-in')}
                                            className="px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 animate-pulse"
                                            style={{
                                                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.5)',
                                            }}
                                        >
                                            🔥 ALL-IN!
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error display */}
                    {error && (
                        <div
                            className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl font-medium"
                            style={{
                                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%)',
                                boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
                            }}
                        >
                            {error}
                        </div>
                    )}
                </div>
            </main>

            {/* Premium Winner modal */}
            <Modal
                isOpen={showWinnerModal}
                onClose={() => setShowWinnerModal(false)}
                title={isGameOver ? '🏆 Champion Crowned!' : '🎉 Hand Complete!'}
                size="md"
            >
                <div className="text-center py-4">
                    {winners && winners.map((winner, i) => (
                        <div key={i} className="mb-6">
                            <div className="text-4xl mb-3">🏆</div>
                            <div className="text-2xl font-bold text-white mb-2">
                                {gameState?.players[winner.playerIndex]?.username}
                            </div>
                            <div
                                className="text-3xl font-bold mb-2"
                                style={{ color: '#fbbf24' }}
                            >
                                Won ${winner.amount.toLocaleString()}
                            </div>
                            <div
                                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                                    border: '1px solid rgba(16, 185, 129, 0.5)',
                                    color: '#10b981',
                                }}
                            >
                                {winner.handName}
                            </div>
                        </div>
                    ))}

                    <div className="mt-6 flex flex-col items-center gap-3">
                        {!isGameOver && nextHandCountdown !== null && (
                            <div className="flex flex-col items-center gap-3">
                                {/* Countdown circle */}
                                <div
                                    className="relative w-16 h-16 flex items-center justify-center"
                                >
                                    <svg className="w-16 h-16 transform -rotate-90">
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            fill="none"
                                            stroke="rgba(16, 185, 129, 0.2)"
                                            strokeWidth="4"
                                        />
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeDasharray={176}
                                            strokeDashoffset={176 - (176 * (3 - nextHandCountdown) / 3)}
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <span className="absolute text-2xl font-bold text-emerald-400">
                                        {nextHandCountdown}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">Next hand starting...</p>
                                <button
                                    onClick={handleNextHand}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                    style={{
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                    }}
                                >
                                    ⏭️ Skip
                                </button>
                            </div>
                        )}

                        {isGameOver && (
                            <button
                                onClick={() => router.push('/games/poker')}
                                className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                                }}
                            >
                                🏠 Back to Lobby
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
