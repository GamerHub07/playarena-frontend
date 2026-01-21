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
        pageBackground: '#0f172a', // Deep slate
        tableBackground: '#1e293b',
        tableFelt: '#14532d', // Matte green felt
        tableBorder: '#334155',
        tableRail: '#1e293b',

        // Card styling
        cardBack: '#1e293b',
        cardBackBorder: '#334155',
        cardFront: '#ffffff',

        playerCard: '#111827', // Dark slate
        playerCardActive: '#14532d',
        playerBorder: '#334155',
        playerActiveBorder: '#22c55e',

        actionBar: '#020617',
        actionBarBorder: '#1e293b',
        infoBar: '#020617',

        accentColor: '#22c55e',
        textPrimary: '#f8fafc',
        textSecondary: '#94a3b8',

        // Outline Button Styles (Border colors)
        btnFold: '#EF4444', // Red-500
        btnCheck: '#94A3B8', // Slate-400
        btnCall: '#10B981', // Emerald-500
        btnRaise: '#10B981', // Emerald-500
        btnAllIn: '#EF4444', // Red-500

        useGradients: false,
        useGlow: false,
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

// Helper to get card image path
function getCardImage(card: CardType): string {
    const suit = card.suit;
    let rank = card.rank;
    // Map single digits to 0-padded (e.g., "2" -> "02")
    if (['2', '3', '4', '5', '6', '7', '8', '9'].includes(rank)) {
        rank = '0' + rank;
    }

    // Construct path: /kenney_playing-cards-pack/PNG/Cards (large)/card_[suit]_[rank].png
    // Note: We use encodeURI to handle spaces and parentheses if needed, but standard browser paths usually handle them or we can escape them.
    // Safe encoded path: Cards%20(large)
    return `/kenney_playing-cards-pack/PNG/Cards%20(large)/card_${suit}_${rank}.png`;
}

function PokerCard({ card, hidden = false, small = false, glow = false, theme = 'premium' }: {
    card?: CardType;
    hidden?: boolean;
    small?: boolean;
    glow?: boolean;
    theme?: PokerTheme;
}) {
    const themeConfig = THEME_CONFIGS[theme];
    const sizeClasses = small
        ? 'w-16 h-24 md:w-40 md:h-60' // Player cards: VERY BIG as requested
        : 'w-24 h-36 md:w-32 md:h-48'; // Community cards: kept compact (perfect as per user)

    // Base styles for the container
    const containerClasses = `${sizeClasses} relative rounded-lg transition-transform hover:z-10 ${themeConfig.useAnimations && !hidden ? 'duration-300' : ''
        }`;

    // Shadow styles - Removed as per request to remove "glossy border" styling
    // Kept minimal shadow for depth if needed, but removing the "glossy" heavy shadow/border look.
    const shadowStyle = {
        // Simple subtle shadow, flat look
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
    };

    if (hidden || !card) {
        return (
            <div className={containerClasses} style={shadowStyle}>
                <img
                    src="/kenney_playing-cards-pack/PNG/Cards%20(large)/card_back.png"
                    alt="Card Back"
                    className="w-full h-full object-contain"
                    draggable={false}
                />
            </div>
        );
    }

    return (
        <div className={containerClasses} style={shadowStyle}>
            <img
                src={getCardImage(card)}
                alt={`${card.rank} of ${card.suit}`}
                className="w-full h-full object-contain"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
                draggable={false}
            />
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


            {/* Hand Hint - show for premium only */}
            {handEval && !isClassic && (
                <div
                    className="px-3 py-1 rounded-full text-xs font-bold shadow-md"
                    style={{
                        background: handEval.color,
                        color: 'white',
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
                className={`relative px-3 py-2 rounded-lg flex items-center gap-3 backdrop-blur-sm transition-colors duration-200 ${player.folded ? 'opacity-40 grayscale' : ''}`}
                style={{
                    background: 'rgba(15, 23, 42, 0.9)', // Slate-900, highly opaque
                    border: isMe
                        ? '2px solid #10B981' // Emerald-500
                        : isCurrentTurn
                            ? '2px solid #F59E0B' // Amber-500
                            : '1px solid rgba(148, 163, 184, 0.2)', // Slate-400, low opacity
                    boxShadow: isCurrentTurn ? '0 0 15px rgba(251, 191, 36, 0.1)' : 'none',
                    minWidth: '140px',
                }}
            >
                {/* Avatar - premium only */}
                {!isClassic && <span className="text-xl">{avatar}</span>}

                {/* Name & Chips */}
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        {isCurrentTurn && <span className="px-1.5 py-0.5 rounded bg-yellow-400 text-black text-[10px] font-bold animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]">TURN</span>}
                        {isMe && <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-bold">YOU</span>}
                        {player.isDealer && <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center" title="Dealer">D</span>}
                        {player.isSmallBlind && <span className="w-4 h-4 rounded-full bg-slate-600 text-white text-[10px] font-bold flex items-center justify-center" title="Small Blind">S</span>}
                        {player.isBigBlind && <span className="w-4 h-4 rounded-full bg-slate-600 text-white text-[10px] font-bold flex items-center justify-center" title="Big Blind">B</span>}
                        <span className={`text-sm font-bold truncate ${isCurrentTurn ? 'text-white' : 'text-slate-200'}`}>
                            {player.username}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 pl-0.5">
                        <span className="text-emerald-400 font-bold text-xs font-mono tracking-wide">${player.chips.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Current bet chip */}
            {player.currentBet > 0 && (
                <div className="px-3 py-1 bg-slate-900/90 rounded-full border border-slate-700 flex items-center gap-1 shadow-sm">
                    <span className="text-white text-xs font-bold font-mono">${player.currentBet}</span>
                </div>
            )}

            {/* Status badges */}
            <div className="flex gap-1">
                {player.folded && (
                    <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400">
                        FOLD
                    </div>
                )}
                {player.allIn && (
                    <div className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500 text-[10px] font-bold text-red-500">
                        ALL-IN
                    </div>
                )}
                {/* Removed lastAction popup per user request */}
            </div>
        </div >
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
                        headerContent={<div className="text-6xl mb-2">🃏</div>}
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

            <Header />

            <main className="pt-20 pb-4 px-4 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Game Info Bar */}
                    <div className="flex justify-between items-center mb-4 px-4 h-12">
                        {/* Left Side: Room & Hand */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
                                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Room</span>
                                <span className="font-mono font-bold text-white text-sm">{roomCode}</span>
                            </div>
                            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                                Hand <span className="text-white font-bold ml-1">#{gameState?.handNumber}</span>
                            </div>
                        </div>

                        {/* Right Side: Controls & Game Stats */}
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

                            <div className="h-4 w-px bg-slate-700 mx-1" /> {/* Separator */}

                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
                                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Phase</span>
                                <span className="font-semibold text-emerald-400 text-sm capitalize">{phaseToString(gameState?.phase || 'waiting')}</span>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm min-w-[80px] justify-center">
                                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Pot</span>
                                <span className="text-yellow-400 font-bold text-sm font-mono">${gameState?.pot || 0}</span>
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
                                background: themeConfig.tableFelt,
                                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)',
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

                            <div
                                className="absolute inset-0 opacity-[0.08]"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                                }}
                            />

                        </div>

                        {/* Community cards */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 items-center">
                            {gameState?.communityCards.map((card, i) => (
                                <div key={i} className={`transform ${!isClassic ? 'hover:scale-110' : ''} transition-transform`}>
                                    <PokerCard card={card} theme={theme} />
                                </div>
                            ))}
                            {/* Empty slots */}
                            {Array.from({ length: 5 - (gameState?.communityCards.length || 0) }).map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    className={`w-16 h-24 md:w-24 md:h-36 ${isClassic ? 'rounded-lg border border-dashed border-gray-500/40 bg-gray-500/10' : 'rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/5'}`}
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
                                bottom: '40px',
                                right: '40px',
                                transform: `translate(${actionBarPos.x}px, ${actionBarPos.y}px)`,
                            }}
                        >
                            <div
                                className={`
                                    relative flex flex-col items-center
                                    ${isClassic ? 'rounded-xl' : 'rounded-3xl'}
                                    cursor-grab active:cursor-grabbing
                                    transition-all duration-200
                                `}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(51, 65, 85, 0.5)',
                                    backdropFilter: 'blur(8px)',
                                    minWidth: 'auto',
                                    padding: '1.5rem',
                                    borderRadius: '1rem',
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
                                {/* Drag Handle */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/10 rounded-full" />

                                {/* "Your Turn" Indicator */}
                                <div className="mb-6 flex items-center justify-center gap-2">
                                    {/* SIMPLIFIED "Your Turn" Indicator */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                                        <span className="text-yellow-400 font-bold tracking-wider text-sm">YOUR TURN</span>
                                    </div>
                                    {!isClassic && (gameState?.minRaise ?? 0) > 0 && (
                                        <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-gray-400 border border-white/5">
                                            Min Raise: ${gameState?.minRaise}
                                        </div>
                                    )}
                                </div>

                                {/* Raise slider */}
                                {availableActions.includes('raise') && showRaiseSlider && (
                                    <div className="w-full mb-6 px-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
                                        <div className="flex justify-between items-end mb-3">
                                            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Raise Amount</span>
                                            <span className="text-2xl font-bold text-white font-mono">${raiseAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="relative h-6 flex items-center">
                                            <input
                                                type="range"
                                                min={minRaise}
                                                max={maxRaise}
                                                value={raiseAmount}
                                                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                                                className="w-full h-2 rounded-lg appearance-none cursor-pointer absolute z-20 opacity-0"
                                            />
                                            {/* Custom Track */}
                                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden relative z-10 pointer-events-none">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-75 ease-out"
                                                    style={{ width: `${((raiseAmount - minRaise) / (maxRaise - minRaise)) * 100}%` }}
                                                />
                                            </div>
                                            {/* Custom Thumb (Visual only) */}
                                            <div
                                                className="absolute w-6 h-6 bg-white rounded-full shadow-lg border-2 border-emerald-500 z-10 pointer-events-none transition-all duration-75 ease-out"
                                                style={{ left: `calc(${((raiseAmount - minRaise) / (maxRaise - minRaise)) * 100}% - 12px)` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <button
                                                onClick={() => setRaiseAmount(minRaise)}
                                                className="text-xs text-gray-500 hover:text-white transition-colors"
                                            >
                                                Min ${minRaise}
                                            </button>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setRaiseAmount(Math.min(maxRaise, raiseAmount + (minRaise)))}
                                                    className="px-2 py-1 rounded bg-slate-700 text-xs text-white hover:bg-slate-600"
                                                >
                                                    +BB
                                                </button>
                                                <button
                                                    onClick={() => setRaiseAmount(Math.floor((gameState?.pot || 0) / 2))}
                                                    className="px-2 py-1 rounded bg-slate-700 text-xs text-white hover:bg-slate-600"
                                                >
                                                    1/2 Pot
                                                </button>
                                                <button
                                                    onClick={() => setRaiseAmount(gameState?.pot || 0)}
                                                    className="px-2 py-1 rounded bg-slate-700 text-xs text-white hover:bg-slate-600"
                                                >
                                                    Pot
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setRaiseAmount(maxRaise)}
                                                className="text-xs text-gray-500 hover:text-white transition-colors"
                                            >
                                                Max ${maxRaise}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-4 items-end">
                                    {/* FOLD */}
                                    {availableActions.includes('fold') && (
                                        <button
                                            onClick={() => handleAction('fold')}
                                            className="w-24 h-16 rounded-md border-2 font-bold text-lg transition-all hover:bg-red-500/10 active:scale-95 flex flex-col items-center justify-center relative group"
                                            style={{ borderColor: isClassic ? '#b71c1c' : themeConfig.btnFold, color: isClassic ? '#effddb' : themeConfig.btnFold }}
                                        >
                                            <span className="absolute -top-3 right-0 text-[10px] text-gray-500 bg-slate-900 px-1">F</span>
                                            FOLD
                                        </button>
                                    )}

                                    {/* CHECK */}
                                    {availableActions.includes('check') && (
                                        <button
                                            onClick={() => handleAction('check')}
                                            className="w-24 h-16 rounded-md border-2 font-bold text-lg transition-all hover:bg-slate-500/10 active:scale-95 flex flex-col items-center justify-center relative"
                                            style={{ borderColor: isClassic ? '#757575' : themeConfig.btnCheck, color: isClassic ? '#e0e0e0' : themeConfig.btnCheck }}
                                        >
                                            <span className="absolute -top-3 right-0 text-[10px] text-gray-500 bg-slate-900 px-1">K</span>
                                            CHECK
                                        </button>
                                    )}

                                    {/* CALL */}
                                    {availableActions.includes('call') && (() => {
                                        const actualCallAmount = myPlayer ? Math.min(toCall, myPlayer.chips) : toCall;
                                        return (
                                            <button
                                                onClick={() => handleAction('call')}
                                                className="w-28 h-16 rounded-md border-2 font-bold transition-all hover:bg-emerald-500/10 active:scale-95 flex flex-col items-center justify-center relative"
                                                style={{ borderColor: isClassic ? '#2e7d32' : themeConfig.btnCall, color: isClassic ? '#a5d6a7' : themeConfig.btnCall }}
                                            >
                                                <span className="absolute -top-3 right-0 text-[10px] text-gray-500 bg-slate-900 px-1">C</span>
                                                <span className="text-sm">CALL</span>
                                                <span className="text-lg">${actualCallAmount}</span>
                                            </button>
                                        );
                                    })()}

                                    {/* RAISE */}
                                    {availableActions.includes('raise') && (
                                        !showRaiseSlider ? (
                                            <button
                                                onClick={() => {
                                                    setRaiseAmount(minRaise);
                                                    setShowRaiseSlider(true);
                                                }}
                                                className="w-28 h-16 rounded-md border-2 font-bold transition-all hover:bg-emerald-500/10 active:scale-95 flex flex-col items-center justify-center relative"
                                                style={{ borderColor: isClassic ? '#f9a825' : themeConfig.btnRaise, color: isClassic ? '#fff59d' : themeConfig.btnRaise }}
                                            >
                                                <span className="absolute -top-3 right-0 text-[10px] text-gray-500 bg-slate-900 px-1">R</span>
                                                RAISE
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setShowRaiseSlider(false)}
                                                    className="w-12 h-16 rounded-md border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 flex items-center justify-center"
                                                >
                                                    ✕
                                                </button>
                                                <button
                                                    onClick={() => handleAction('raise', raiseAmount)}
                                                    className="w-28 h-16 rounded-md border-2 font-bold transition-all hover:bg-emerald-500/10 active:scale-95 flex flex-col items-center justify-center"
                                                    style={{ borderColor: themeConfig.btnRaise, color: themeConfig.btnRaise }}
                                                >
                                                    <span className="text-xs">CONFIRM</span>
                                                    <span className="text-lg">${raiseAmount}</span>
                                                </button>
                                            </div>
                                        )
                                    )}

                                    {/* ALL IN */}
                                    {availableActions.includes('all-in') && (
                                        <button
                                            onClick={() => handleAction('all-in')}
                                            className="w-24 h-16 rounded-md border-2 font-bold text-lg transition-all hover:bg-red-500/10 active:scale-95 flex flex-col items-center justify-center"
                                            style={{ borderColor: themeConfig.btnAllIn, color: themeConfig.btnAllIn }}
                                        >
                                            ALL IN
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
