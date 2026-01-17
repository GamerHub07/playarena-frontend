'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Header from '@/components/layout/Header';
import WaitingRoom from '@/components/games/shared/WaitingRoom';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
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
import PokerThemeSelector, { PokerTheme } from '@/components/games/poker/PokerThemeSelector';

// ═══════════════════════════════════════════════════════════════
// THEME DEFINITIONS
// ═══════════════════════════════════════════════════════════════


interface ThemeConfig {
    // Background
    pageBackground: string;
    // Table styling
    tableBackground: string;
    tableFelt: string;
    tableBorder: string;
    tableRail: string;
    // Card styling
    cardBack: string;
    cardBackBorder: string;
    cardFront: string;
    // Player styling
    playerCard: string;
    playerCardActive: string;
    playerBorder: string;
    playerActiveBorder: string;
    // UI styling
    actionBar: string;
    actionBarBorder: string;
    infoBar: string;
    accentColor: string;
    textPrimary: string;
    textSecondary: string;
    // Button colors
    btnFold: string;
    btnCheck: string;
    btnCall: string;
    btnRaise: string;
    btnAllIn: string;
    // Effects
    useGradients: boolean;
    useGlow: boolean;
    useAnimations: boolean;
}

const THEME_CONFIGS: Record<PokerTheme, ThemeConfig> = {
    classic: {
        // Solid dark background like PokerNow
        pageBackground: '#1f1f1f',
        // Classic green felt poker table
        tableBackground: '#2d2d2d', // Dark rail
        tableFelt: '#35654d', // PokerNow style green felt
        tableBorder: '#404040', // Subtle border
        tableRail: '#333333', // Dark rail
        // Classic red card backs
        cardBack: '#2e7d32', // Green card backs
        cardBackBorder: '#1b5e20',
        cardFront: '#ffffff',
        // Simple dark player cards
        playerCard: '#2a2a2a',
        playerCardActive: '#385f38', // Subtle green tint when active
        playerBorder: '#404040',
        playerActiveBorder: '#4caf50',
        // Clean dark UI
        actionBar: '#242424',
        actionBarBorder: '#404040',
        infoBar: '#2a2a2a',
        accentColor: '#4caf50',
        textPrimary: '#ffffff',
        textSecondary: '#9e9e9e',
        // UNIFORM button colors - all same green like PokerNow
        btnFold: '#4caf50', // Same green for all
        btnCheck: '#4caf50', // Same green for all
        btnCall: '#4caf50', // Same green for all
        btnRaise: '#4caf50', // Same green for all
        btnAllIn: '#4caf50', // Same green for all
        // No effects
        useGradients: false,
        useGlow: false,
        useAnimations: false,
    },
    premium: {
        // Gradient background
        pageBackground: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)',
        // Rich emerald table with gradients
        tableBackground: 'linear-gradient(180deg, #5c3d2e 0%, #3d2517 50%, #2d1810 100%)',
        tableFelt: 'radial-gradient(ellipse at center, #1a6b4a 0%, #0f4a33 40%, #0a3322 80%, #061f15 100%)',
        tableBorder: 'rgba(255,255,255,0.1)',
        tableRail: 'linear-gradient(180deg, #5c3d2e 0%, #3d2517 50%, #2d1810 100%)',
        // Premium card styling with gradients
        cardBack: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 50%, #1e3a5f 100%)',
        cardBackBorder: '#3b82f6',
        cardFront: 'linear-gradient(145deg, #ffffff 0%, #f3f4f6 50%, #e5e7eb 100%)',
        // Premium player styling
        playerCard: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
        playerCardActive: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        playerBorder: 'rgba(255, 255, 255, 0.1)',
        playerActiveBorder: '#10b981',
        // Premium UI styling
        actionBar: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
        actionBarBorder: 'rgba(16, 185, 129, 0.3)',
        infoBar: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
        accentColor: '#10b981',
        textPrimary: '#ffffff',
        textSecondary: '#94a3b8',
        // Gradient buttons
        btnFold: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        btnCheck: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        btnCall: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        btnRaise: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)',
        btnAllIn: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
        // Full effects
        useGradients: true,
        useGlow: true,
        useAnimations: true,
    }
};

// ═══════════════════════════════════════════════════════════════
// STYLING CONSTANTS
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
// CARD COMPONENT
// ═══════════════════════════════════════════════════════════════

function PokerCard({ card, hidden = false, small = false, glow = false, theme = 'premium' }: {
    card?: CardType;
    hidden?: boolean;
    small?: boolean;
    glow?: boolean;
    theme?: PokerTheme;
}) {
    const themeConfig = THEME_CONFIGS[theme];
    const sizeClasses = small
        ? 'w-10 h-14 rounded-lg text-sm'
        : 'w-16 h-22 rounded-xl text-base';

    if (hidden || !card) {
        // Card back
        const isClassic = theme === 'classic';
        return (
            <div
                className={`${sizeClasses} relative overflow-hidden`}
                style={{
                    background: themeConfig.cardBack,
                    border: `2px solid ${themeConfig.cardBackBorder}`,
                    boxShadow: isClassic ? '0 2px 8px rgba(0,0,0,0.4)' : '0 4px 20px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1)',
                }}
            >
                {/* Card back pattern */}
                {isClassic ? (
                    // Classic diamond pattern
                    <div className="absolute inset-1 border border-white/20 rounded">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white/60 text-lg font-bold">♦</span>
                        </div>
                    </div>
                ) : (
                    // Premium pattern
                    <>
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
                    </>
                )}
            </div>
        );
    }

    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const color = isRed ? '#dc2626' : '#1f2937';
    const symbol = SUIT_SYMBOLS[card.suit];
    const isClassic = theme === 'classic';

    return (
        <div
            className={`${sizeClasses} relative overflow-hidden transition-all ${themeConfig.useAnimations ? 'duration-300 hover:scale-110 hover:-translate-y-1' : ''}`}
            style={{
                background: isClassic ? '#ffffff' : 'linear-gradient(145deg, #ffffff 0%, #f3f4f6 50%, #e5e7eb 100%)',
                borderRadius: small ? '8px' : '12px',
                border: '1px solid rgba(0,0,0,0.2)',
                boxShadow: isClassic
                    ? '0 2px 6px rgba(0,0,0,0.2)'
                    : glow
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
            {/* Shine effect - only for premium */}
            {!isClassic && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// PLAYER SEAT COMPONENT
// ═══════════════════════════════════════════════════════════════

function PlayerSeat({
    player,
    isCurrentTurn,
    isMe,
    position,
    communityCards,
    playerIndex,
    theme = 'premium',
}: {
    player: PokerPlayerState;
    isCurrentTurn: boolean;
    isMe: boolean;
    position: { top: string; left: string; transform: string };
    communityCards: CardType[];
    playerIndex: number;
    theme?: PokerTheme;
}) {
    const themeConfig = THEME_CONFIGS[theme];
    const isClassic = theme === 'classic';
    const handEval = (isMe && player.hand && player.hand.length > 0 && !player.folded)
        ? evaluateHand(player.hand, communityCards)
        : null;

    const avatar = PLAYER_AVATARS[playerIndex % PLAYER_AVATARS.length];
    const playerColor = POKER_COLORS[playerIndex % POKER_COLORS.length];

    return (
        <div
            className={`absolute flex flex-col items-center gap-1.5 transition-all ${themeConfig.useAnimations ? 'duration-500' : ''} ${isCurrentTurn && !isClassic ? 'scale-110 z-20' : 'z-10'}`}
            style={position}
        >
            {/* Turn indicator ring - premium only */}
            {isCurrentTurn && !isClassic && (
                <div
                    className="absolute -inset-4 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: playerColor.hex }}
                />
            )}

            {/* Hand Hint - show for premium only */}
            {handEval && !isClassic && (
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
                            <PokerCard card={card} small glow={!!(isMe && handEval && handEval.strength >= 4 && !isClassic)} theme={theme} />
                        </div>
                    ))
                ) : (
                    <>
                        <div style={{ transform: 'rotate(-8deg)' }}>
                            <PokerCard hidden small theme={theme} />
                        </div>
                        <div style={{ transform: 'rotate(8deg)' }}>
                            <PokerCard hidden small theme={theme} />
                        </div>
                    </>
                )}
            </div>

            {/* Player info card */}
            <div
                className={`relative px-4 py-2 ${isClassic ? 'rounded' : 'rounded-2xl'} flex items-center gap-2 ${player.folded ? 'opacity-40' : ''}`}
                style={{
                    background: isClassic
                        ? (isCurrentTurn ? themeConfig.playerCardActive : themeConfig.playerCard)
                        : isCurrentTurn
                            ? `linear-gradient(135deg, ${playerColor.hex} 0%, ${playerColor.hex}cc 100%)`
                            : themeConfig.playerCard,
                    border: isMe
                        ? `2px solid ${themeConfig.playerActiveBorder}`
                        : isCurrentTurn
                            ? `2px solid ${isClassic ? themeConfig.accentColor : playerColor.hex}`
                            : `1px solid ${themeConfig.playerBorder}`,
                    boxShadow: isClassic
                        ? '0 2px 8px rgba(0,0,0,0.4)'
                        : isCurrentTurn
                            ? `0 8px 32px ${playerColor.hex}50, 0 4px 12px rgba(0,0,0,0.5)`
                            : '0 4px 12px rgba(0,0,0,0.4)',
                }}
            >
                {/* Avatar - premium only */}
                {!isClassic && <span className="text-xl">{avatar}</span>}

                {/* Name & Chips */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        {player.isDealer && <span className={`text-xs ${isClassic ? 'bg-yellow-600' : 'bg-yellow-500/80'} px-1.5 py-0.5 rounded text-black font-bold`}>D</span>}
                        {player.isSmallBlind && <span className={`text-xs ${isClassic ? 'bg-blue-600' : 'bg-blue-500/80'} px-1 py-0.5 rounded text-white`}>SB</span>}
                        {player.isBigBlind && <span className={`text-xs ${isClassic ? 'bg-purple-600' : 'bg-purple-500/80'} px-1 py-0.5 rounded text-white`}>BB</span>}
                        <span className={`font-semibold truncate max-w-[70px] ${isCurrentTurn ? 'text-white' : 'text-gray-200'}`}>
                            {player.username}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-400 font-bold text-sm">{isClassic ? '$' : '💰 $'}{player.chips.toLocaleString()}</span>
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
                        background: isClassic ? '#2e7d32' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        boxShadow: isClassic ? 'none' : '0 4px 12px rgba(22, 163, 74, 0.4)',
                    }}
                >
                    {!isClassic && <span className="text-sm">🪙</span>}
                    <span className="text-white">${player.currentBet}</span>
                </div>
            )}

            {/* Status badges */}
            <div className="flex gap-1">
                {player.folded && (
                    <div className={`${isClassic ? 'bg-gray-600' : 'bg-gray-700/90'} text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium`}>
                        {isClassic ? 'Folded' : '❌ Folded'}
                    </div>
                )}
                {player.allIn && (
                    <div
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{
                            background: isClassic ? '#c62828' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            animation: !isClassic ? 'pulse 1s infinite' : 'none',
                            boxShadow: isClassic ? 'none' : '0 0 20px rgba(220, 38, 38, 0.6)',
                        }}
                    >
                        {isClassic ? 'ALL-IN' : '🔥 ALL-IN'}
                    </div>
                )}
                {/* Removed lastAction popup per user request */}
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

    const { guest, loading: guestLoading, login } = useGuest();
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

    // Join modal state for users joining via link without a session
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinUsername, setJoinUsername] = useState('');
    const [joinError, setJoinError] = useState('');
    const [joining, setJoining] = useState(false);

    // Theme state with localStorage persistence
    const [theme, setTheme] = useState<PokerTheme>('premium');
    const themeConfig = THEME_CONFIGS[theme];

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('poker-theme') as PokerTheme | null;
        if (savedTheme && (savedTheme === 'classic' || savedTheme === 'premium')) {
            setTheme(savedTheme);
        }
    }, []);

    // Save theme to localStorage when changed
    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'premium' ? 'classic' : 'premium';
        setTheme(newTheme);
        localStorage.setItem('poker-theme', newTheme);
    }, [theme]);

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

    // Fetch room data and handle join flow
    useEffect(() => {
        if (guestLoading) return;

        const fetchRoom = async () => {
            try {
                const res = await roomApi.get(roomCode);
                if (res.success && res.data) {
                    setRoom(res.data);
                    setPlayers(res.data.players);

                    // If user has no session, show join modal (they came via shared link)
                    if (!guest) {
                        setShowJoinModal(true);
                    } else {
                        // Check if user is already in the room's player list
                        const isAlreadyInRoom = res.data.players.some(
                            (p: { sessionId: string }) => p.sessionId === guest.sessionId
                        );
                        // If user has session but isn't in room, show join modal to confirm joining
                        if (!isAlreadyInRoom && res.data.status === 'waiting') {
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
    }, [roomCode, guest, guestLoading]);

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

    // Join room on connect - ONLY FOR PLAYERS ALREADY IN ROOM (reconnecting)
    // New players must go through the join modal first
    useEffect(() => {
        if (!guest || !isConnected || !room) return;

        // Check if user is already in the room's player list
        const isAlreadyInRoom = players.some(p => p.sessionId === guest.sessionId);

        // Only auto-join via socket if already in room (reconnecting)
        if (isAlreadyInRoom && !hasJoinedRef.current) {
            hasJoinedRef.current = true;
            emit('room:join', {
                roomCode,
                sessionId: guest.sessionId,
                username: guest.username,
            });
        }


    }, [guest, isConnected, room, roomCode, emit, players]);

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

    // Handle join via shared link (creates session if needed and joins room)
    const handleJoinViaLink = async () => {
        setJoining(true);
        setJoinError('');

        try {
            let sessionId = guest?.sessionId;

            // If no session exists, we need a username to create one
            if (!sessionId) {
                if (!joinUsername.trim() || joinUsername.length < 2) {
                    setJoinError('Username must be at least 2 characters');
                    setJoining(false);
                    return;
                }

                // Create guest session
                const guestResult = await login(joinUsername.trim());
                if (!guestResult) {
                    setJoinError('Failed to create session');
                    setJoining(false);
                    return;
                }
                sessionId = guestResult.sessionId;
            }

            // Join the room with the session
            const joinRes = await roomApi.join(roomCode, sessionId);
            if (joinRes.success && joinRes.data) {
                setRoom(joinRes.data);
                setPlayers(joinRes.data.players);
                setShowJoinModal(false);

                // Also emit socket join so we're connected to the room
                hasJoinedRef.current = true;
                emit('room:join', {
                    roomCode,
                    sessionId,
                    username: guest?.username || joinUsername.trim(),
                });
            } else {
                setJoinError(joinRes.message || 'Failed to join room');
            }
        } catch (err) {
            setJoinError('Failed to join room');
        }

        setJoining(false);
    };

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

    // Join modal - for users accessing via shared link (must come before waiting room check)
    if (showJoinModal && room) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
                <Header />
                {/* Connection Status */}
                <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-gray-400">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isConnected ? '#22c55e' : '#ef4444' }}
                    />
                    {isConnected ? 'Connected' : 'Connecting...'}
                </div>

                <div className="bg-slate-800/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-700 max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="text-4xl mb-3">🃏</div>
                        <h2 className="text-2xl font-bold text-white mb-1">Join Game</h2>
                        <p className="text-gray-400 text-sm">
                            Room <span className="font-mono font-bold text-emerald-400">{roomCode}</span>
                        </p>
                    </div>

                    <div className="space-y-4">
                        {guest ? (
                            // User has existing session - just confirm joining
                            <>
                                <p className="text-gray-400 text-sm text-center">
                                    Join as <span className="font-bold text-white">{guest.username}</span>?
                                </p>
                                {joinError && <p className="text-red-400 text-sm text-center">{joinError}</p>}
                                <Button onClick={handleJoinViaLink} loading={joining} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                    Join Game
                                </Button>
                            </>
                        ) : (
                            // New user - need username
                            <>
                                <Input
                                    placeholder="Enter your name"
                                    value={joinUsername}
                                    onChange={(e) => setJoinUsername(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleJoinViaLink()}
                                    error={joinError}
                                    autoFocus
                                />
                                <Button onClick={handleJoinViaLink} loading={joining} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                    Join Game
                                </Button>
                            </>
                        )}

                        <button
                            onClick={() => router.push('/games/poker')}
                            className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Waiting room
    if (room?.status === 'waiting') {
        return (
            <div className="min-h-screen" style={{ background: themeConfig.pageBackground }}>
                <Header />

                {/* Theme Selector - Fixed position (visible to all, editable by host) */}
                {isHost && (
                    <div className="fixed top-20 right-4 z-40">
                        <PokerThemeSelector
                            currentTheme={theme}
                            onThemeChange={(newTheme) => {
                                setTheme(newTheme);
                                localStorage.setItem('poker-theme', newTheme);
                            }}
                            compact
                        />
                    </div>
                )}

                {/* Connection Status */}
                <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-gray-400">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isConnected ? '#22c55e' : '#ef4444' }}
                    />
                    {isConnected ? 'Connected' : 'Connecting...'}
                </div>

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
            </div>
        );
    }

    // Reconnecting state - game is playing but we haven't received state yet
    if ((room?.status === 'playing' || room?.status === 'finished') && !gameState) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center">
                <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-700 text-center max-w-md">
                    <div className="relative mb-4">
                        <div className="w-16 h-16 border-4 border-emerald-500/30 rounded-full mx-auto" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Reconnecting to game...</h2>
                    <p className="text-gray-400">Please wait while we restore your session</p>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // MAIN GAME VIEW
    // ═══════════════════════════════════════════════════════════════

    const isClassic = theme === 'classic';

    return (
        <div
            className="min-h-screen overflow-hidden"
            style={{ background: themeConfig.pageBackground }}
        >
            {/* Ambient background effects - premium only */}
            {!isClassic && (
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                </div>
            )}

            <Header />

            <main className="pt-20 pb-4 px-4 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Game Info Bar */}
                    <div className="flex justify-between items-center mb-4 px-4">
                        <div className="flex items-center gap-4">
                            <div
                                className={`flex items-center gap-2 px-4 py-2 ${isClassic ? 'rounded-lg' : 'rounded-xl'}`}
                                style={{
                                    background: themeConfig.infoBar,
                                    border: `1px solid ${themeConfig.playerBorder}`,
                                    boxShadow: isClassic ? 'none' : '0 4px 12px rgba(0,0,0,0.3)',
                                }}
                            >
                                {!isClassic && <span className="text-emerald-400">🎰</span>}
                                <span className="text-gray-400 text-sm">Room:</span>
                                <span className="font-mono font-bold text-white tracking-wider">{roomCode}</span>
                            </div>
                            <div className="text-gray-400 text-sm">
                                Hand <span className="text-white font-bold">#{gameState?.handNumber}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Theme Selector - Dropdown */}
                            <PokerThemeSelector
                                currentTheme={theme}
                                onThemeChange={(newTheme) => {
                                    setTheme(newTheme);
                                    localStorage.setItem('poker-theme', newTheme);
                                }}
                                compact
                            />
                            <PokerHandsGuideButton />
                            <div
                                className={`px-4 py-2 ${isClassic ? 'rounded-lg' : 'rounded-xl'} text-sm`}
                                style={{
                                    background: themeConfig.infoBar,
                                    border: `1px solid ${themeConfig.playerBorder}`,
                                }}
                            >
                                <span className="text-gray-400">Phase:</span>
                                <span className={`ml-2 font-semibold ${isClassic ? 'text-green-400' : 'text-emerald-400'}`}>{phaseToString(gameState?.phase || 'waiting')}</span>
                            </div>
                            <div
                                className={`px-5 py-2 ${isClassic ? 'rounded-lg' : 'rounded-xl'} font-bold text-lg flex items-center gap-2`}
                                style={{
                                    background: isClassic ? '#b8860b' : 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)',
                                    boxShadow: isClassic ? 'none' : '0 4px 20px rgba(202, 138, 4, 0.4)',
                                }}
                            >
                                {!isClassic && <span>💰</span>}
                                <span className="text-white">${gameState?.pot || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* POKER TABLE */}
                    <div className="relative w-full aspect-[16/9] max-h-[65vh]">
                        {/* Outer table rim */}
                        <div
                            className="absolute inset-[5%] rounded-[50%]"
                            style={{
                                background: isClassic ? themeConfig.tableRail : 'linear-gradient(180deg, #5c3d2e 0%, #3d2517 50%, #2d1810 100%)',
                                boxShadow: isClassic ? '0 10px 30px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.1)',
                            }}
                        />

                        {/* Table felt */}
                        <div
                            className="absolute inset-[7%] rounded-[50%] overflow-hidden"
                            style={{
                                background: isClassic ? themeConfig.tableFelt : 'radial-gradient(ellipse at center, #1a6b4a 0%, #0f4a33 40%, #0a3322 80%, #061f15 100%)',
                                boxShadow: isClassic ? 'inset 0 0 30px rgba(0,0,0,0.3)' : 'inset 0 0 100px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)',
                            }}
                        >
                            {/* Felt texture overlay - premium only */}
                            {!isClassic && (
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                                    }}
                                />
                            )}

                            {/* Inner decorative ring - premium only */}
                            {!isClassic && (
                                <>
                                    <div className="absolute inset-6 border border-emerald-400/20 rounded-[50%]" />
                                    <div className="absolute inset-12 border border-emerald-400/10 rounded-[50%]" />
                                </>
                            )}
                        </div>

                        {/* Community cards */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3">
                            {gameState?.communityCards.map((card, i) => (
                                <div key={i} className={`transform ${!isClassic ? 'hover:scale-110' : ''} transition-transform`}>
                                    <PokerCard card={card} theme={theme} />
                                </div>
                            ))}
                            {/* Empty slots */}
                            {Array.from({ length: 5 - (gameState?.communityCards.length || 0) }).map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    className={`w-16 h-22 ${isClassic ? 'rounded-lg border border-dashed border-gray-500/40 bg-gray-500/10' : 'rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5'}`}
                                />
                            ))}
                        </div>

                        {/* Pot display */}
                        {gameState && gameState.pot > 0 && (
                            <div
                                className={`absolute top-[28%] left-1/2 -translate-x-1/2 px-6 py-2 ${isClassic ? 'rounded-lg' : 'rounded-full'} flex items-center gap-2`}
                                style={{
                                    background: isClassic ? 'rgba(0,0,0,0.6)' : 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
                                    border: isClassic ? '1px solid #b8860b' : '1px solid rgba(202, 138, 4, 0.5)',
                                    boxShadow: isClassic ? 'none' : '0 4px 20px rgba(0,0,0,0.5), 0 0 30px rgba(202, 138, 4, 0.2)',
                                }}
                            >
                                {!isClassic && <span className="text-2xl">💰</span>}
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
                                theme={theme}
                            />
                        ))}
                    </div>

                    {/* ACTION BAR - only show if there are actions to take */}
                    {isMyTurn && gameState?.phase !== 'showdown' && availableActions.length > 0 && (
                        <div
                            className="fixed z-50"
                            style={{
                                left: `calc(50% + ${actionBarPos.x}px)`,
                                top: `calc(85% + ${actionBarPos.y}px)`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <div
                                className={`p-5 ${isClassic ? 'rounded-lg' : 'rounded-2xl'} cursor-grab active:cursor-grabbing`}
                                style={{
                                    background: themeConfig.actionBar,
                                    backdropFilter: isClassic ? 'none' : 'blur(20px)',
                                    border: `1px solid ${themeConfig.actionBarBorder}`,
                                    boxShadow: isClassic ? '0 4px 15px rgba(0,0,0,0.3)' : '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(16, 185, 129, 0.1)',
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
                                {/* Header - premium only */}
                                {!isClassic && (
                                    <div className="flex justify-center mb-3">
                                        <div className="w-12 h-1 bg-emerald-500/50 rounded-full" />
                                    </div>
                                )}
                                <div className={`text-center ${isClassic ? 'text-green-400' : 'text-emerald-400'} mb-4 font-bold text-lg flex items-center justify-center gap-2`}>
                                    {!isClassic && <span className="animate-pulse">🎯</span>} Your Turn
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
                                            className={`px-5 py-2.5 ${isClassic ? 'rounded' : 'rounded-xl'} font-bold text-white`}
                                            style={{ background: themeConfig.btnFold }}
                                        >
                                            {isClassic ? 'Fold' : '❌ Fold'}
                                        </button>
                                    )}
                                    {availableActions.includes('check') && (
                                        <button
                                            onClick={() => handleAction('check')}
                                            className={`px-5 py-2.5 ${isClassic ? 'rounded' : 'rounded-xl'} font-bold text-white`}
                                            style={{ background: themeConfig.btnCheck }}
                                        >
                                            {isClassic ? 'Check' : '✓ Check'}
                                        </button>
                                    )}
                                    {availableActions.includes('call') && (() => {
                                        // Calculate actual callable amount (may be less than toCall if short-stacked)
                                        const actualCallAmount = myPlayer ? Math.min(toCall, myPlayer.chips) : toCall;
                                        const isAllInCall = myPlayer && myPlayer.chips <= toCall;

                                        return (
                                            <button
                                                onClick={() => handleAction('call')}
                                                className={`px-5 py-2.5 ${isClassic ? 'rounded' : 'rounded-xl'} font-bold text-white`}
                                                style={{ background: themeConfig.btnCall }}
                                            >
                                                {isClassic
                                                    ? (isAllInCall ? `Call $${actualCallAmount} (All-in)` : `Call $${toCall}`)
                                                    : (isAllInCall ? `📞 Call $${actualCallAmount} (All-in)` : `📞 Call $${toCall}`)
                                                }
                                            </button>
                                        );
                                    })()}
                                    {availableActions.includes('raise') && (
                                        !showRaiseSlider ? (
                                            <button
                                                onClick={() => {
                                                    setRaiseAmount(minRaise);
                                                    setShowRaiseSlider(true);
                                                }}
                                                className={`px-5 py-2.5 ${isClassic ? 'rounded' : 'rounded-xl'} font-bold text-white`}
                                                style={{ background: themeConfig.btnRaise }}
                                            >
                                                {isClassic ? 'Raise' : '📈 Raise'}
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setShowRaiseSlider(false)}
                                                    className={`px-4 py-2.5 ${isClassic ? 'rounded' : 'rounded-xl'} font-bold text-white`}
                                                    style={{
                                                        background: isClassic ? '#444' : 'rgba(255, 255, 255, 0.1)',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    }}
                                                >
                                                    ←
                                                </button>
                                                <button
                                                    onClick={() => handleAction('raise', raiseAmount)}
                                                    className={`px-5 py-2.5 ${isClassic ? 'rounded' : 'rounded-xl'} font-bold text-white`}
                                                    style={{ background: themeConfig.btnRaise }}
                                                >
                                                    ${raiseAmount}
                                                </button>
                                            </>
                                        )
                                    )}
                                    {availableActions.includes('all-in') && (
                                        <button
                                            onClick={() => handleAction('all-in')}
                                            className={`px-5 py-2.5 ${isClassic ? 'rounded' : 'rounded-xl'} font-bold text-white ${!isClassic ? 'animate-pulse' : ''}`}
                                            style={{ background: themeConfig.btnAllIn }}
                                        >
                                            {isClassic ? 'ALL-IN' : '🔥 ALL-IN!'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error display */}
                    {error && (
                        <div
                            className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl font-medium text-white"
                            style={{
                                background: isClassic ? '#b71c1c' : 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%)',
                            }}
                        >
                            {error}
                        </div>
                    )}
                </div>
            </main>

            {/* Winner modal */}
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

            {/* Join Modal - for users accessing via shared link */}
            <Modal
                isOpen={showJoinModal}
                onClose={() => {
                    // If they close without joining, redirect to poker page
                    router.push('/games/poker');
                }}
                title="Join Game"
                size="sm"
            >
                <div className="space-y-4">
                    {guest ? (
                        // User has existing session - just confirm joining
                        <>
                            <p className="text-gray-400 text-sm">
                                Join room <span className="font-mono font-bold text-emerald-400">{roomCode}</span> as <span className="font-bold text-white">{guest.username}</span>?
                            </p>
                            {joinError && <p className="text-red-400 text-sm">{joinError}</p>}
                            <Button onClick={handleJoinViaLink} loading={joining} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                Join Game
                            </Button>
                        </>
                    ) : (
                        // New user - need username
                        <>
                            <p className="text-gray-400 text-sm">
                                Enter your name to join room <span className="font-mono font-bold text-emerald-400">{roomCode}</span>
                            </p>
                            <Input
                                placeholder="Your username"
                                value={joinUsername}
                                onChange={(e) => setJoinUsername(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoinViaLink()}
                                error={joinError}
                                autoFocus
                            />
                            <Button onClick={handleJoinViaLink} loading={joining} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                Join Game
                            </Button>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
}
