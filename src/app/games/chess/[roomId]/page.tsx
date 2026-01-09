'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Header from '@/components/layout/Header';
import WaitingRoom from '@/components/games/shared/WaitingRoom';
import Board from '@/components/games/chess/Board';
import GameInfo from '@/components/games/chess/GameInfo';
import PlayerClock from '@/components/games/chess/PlayerClock';
import TimerSelector from '@/components/games/chess/TimerSelector';
import ThemeSelector from '@/components/games/chess/ThemeSelector';
import PieceStyleSelector from '@/components/games/chess/PieceStyleSelector';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useGuest } from '@/hooks/useGuest';
import { useSocket } from '@/hooks/useSocket';
import { roomApi } from '@/lib/api';
import { Room, Player } from '@/types/game';
import {
    ChessGameState,
    Position,
    ValidMoves,
    positionsEqual,
    getResultMessage,
    PieceType,
} from '@/types/chess';

// Chess player colors for waiting room
const CHESS_COLORS = [
    { hex: '#FFFFFF', name: 'White' },
    { hex: '#1a1a1a', name: 'Black' },
];

export default function ChessGameRoom() {
    const params = useParams();
    const router = useRouter();
    const roomCode = (params.roomId as string).toUpperCase();

    const { guest, loading: guestLoading } = useGuest();
    const { isConnected, emit, on } = useSocket();

    const [room, setRoom] = useState<Room | null>(null);
    const [gameState, setGameState] = useState<ChessGameState | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Chess-specific state
    const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
    const [validMoves, setValidMoves] = useState<ValidMoves>({});
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [pendingPromotion, setPendingPromotion] = useState<{
        from: Position;
        to: Position;
    } | null>(null);

    // Timer state
    const [selectedTimeControl, setSelectedTimeControl] = useState('blitz-5-3');
    const [whiteTimeMs, setWhiteTimeMs] = useState(0);
    const [blackTimeMs, setBlackTimeMs] = useState(0);

    // Calculate my player index and color
    const myPlayerIndex = useMemo(() => {
        if (!guest) return null;
        const idx = players.findIndex((p) => p.sessionId === guest.sessionId);
        return idx >= 0 ? idx : null;
    }, [players, guest]);

    const myColor = useMemo(() => {
        if (myPlayerIndex === 0) return 'white';
        if (myPlayerIndex === 1) return 'black';
        return null;
    }, [myPlayerIndex]);

    const isMyTurn = useMemo(() => {
        if (!gameState || myColor === null) return false;
        return gameState.currentPlayer === myColor;
    }, [gameState, myColor]);

    // Get valid moves for selected piece
    const currentValidMoves = useMemo(() => {
        if (!selectedSquare) return [];
        const key = `${selectedSquare.row},${selectedSquare.col}`;
        return validMoves[key] || [];
    }, [selectedSquare, validMoves]);

    // Get last move for highlighting
    const lastMove = useMemo(() => {
        if (!gameState || gameState.moveHistory.length === 0) return null;
        const last = gameState.moveHistory[gameState.moveHistory.length - 1];
        return { from: last.from, to: last.to };
    }, [gameState]);

    // Fetch room data
    useEffect(() => {
        if (guestLoading) return;

        if (!guest) {
            router.push('/games/chess');
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
            const { state, validMoves: moves } = data as {
                state: ChessGameState;
                validMoves: ValidMoves;
            };
            setGameState(state);
            setValidMoves(moves || {});
            setRoom((prev) => (prev ? { ...prev, status: 'playing' } : null));
            // Initialize timer times from state
            if (state.timeControl && state.timeControl.type !== 'unlimited') {
                setWhiteTimeMs(state.whiteTimeRemainingMs);
                setBlackTimeMs(state.blackTimeRemainingMs);
            }
        });

        const unsubState = on('game:state', (data: unknown) => {
            const { state, validMoves: moves } = data as {
                state: ChessGameState;
                validMoves: ValidMoves;
            };
            setGameState(state);
            setValidMoves(moves || {});
            setSelectedSquare(null); // Clear selection after move
        });

        const unsubWinner = on('game:winner', (data: unknown) => {
            const { winner, gameResult, isDraw } = data as {
                winner: { position: number; username: string } | null;
                gameResult: string;
                isDraw: boolean;
            };

            setRoom((prev) => (prev ? { ...prev, status: 'finished' } : null));

            // Celebration if I won
            if (winner && winner.position === myPlayerIndex) {
                const duration = 5 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

                const interval = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();
                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }
                    const particleCount = 50 * (timeLeft / duration);
                    confetti({
                        ...defaults,
                        particleCount,
                        origin: { x: Math.random(), y: Math.random() - 0.2 },
                    });
                }, 250);
            }
        });

        const unsubError = on('error', (data: unknown) => {
            const { message } = data as { message: string };
            console.error('Socket error:', message);
            setError(message);
            setTimeout(() => setError(''), 3000);
        });

        // Timer updates
        const unsubTimer = on('game:timer', (data: unknown) => {
            const { whiteTimeMs: wt, blackTimeMs: bt } = data as {
                whiteTimeMs: number;
                blackTimeMs: number;
            };
            setWhiteTimeMs(wt);
            setBlackTimeMs(bt);
        });

        return () => {
            unsubRoom();
            unsubStart();
            unsubState();
            unsubWinner();
            unsubError();
            unsubTimer();
        };
    }, [guest, isConnected, on, myPlayerIndex]);

    // Track if we've joined the room to prevent duplicate emissions
    const hasJoinedRef = useRef(false);

    // Socket join room
    useEffect(() => {
        if (!guest || !isConnected || loading) return;

        // Only emit room:join once per session
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
            emit('room:leave', {});
        };
    }, [isConnected, guest, loading, roomCode, emit]);

    const handleStartGame = useCallback(() => {
        emit('game:start', { roomCode, timeControlKey: selectedTimeControl });
    }, [emit, roomCode, selectedTimeControl]);

    const handleLeaveRoom = useCallback(() => {
        emit('room:leave', {});
        router.push('/games/chess');
    }, [emit, router]);

    const handleSquareClick = useCallback(
        (pos: Position) => {
            if (!gameState || !isMyTurn || room?.status !== 'playing') return;

            const piece = gameState.board[pos.row][pos.col];

            // If clicking on a valid move target
            if (selectedSquare && currentValidMoves.some((m) => positionsEqual(m, pos))) {
                const movingPiece = gameState.board[selectedSquare.row][selectedSquare.col];

                // Check for pawn promotion
                if (
                    movingPiece?.type === 'pawn' &&
                    ((myColor === 'white' && pos.row === 0) ||
                        (myColor === 'black' && pos.row === 7))
                ) {
                    setPendingPromotion({ from: selectedSquare, to: pos });
                    setShowPromotionModal(true);
                    return;
                }

                // Make move
                emit('game:action', {
                    roomCode,
                    action: 'move',
                    data: { from: selectedSquare, to: pos },
                });
                setSelectedSquare(null);
                return;
            }

            // Select own piece
            if (piece && piece.color === myColor) {
                setSelectedSquare(pos);
            } else {
                setSelectedSquare(null);
            }
        },
        [gameState, isMyTurn, room?.status, selectedSquare, currentValidMoves, myColor, emit, roomCode]
    );

    const handlePromotion = useCallback(
        (pieceType: PieceType) => {
            if (!pendingPromotion) return;

            emit('game:action', {
                roomCode,
                action: 'move',
                data: {
                    from: pendingPromotion.from,
                    to: pendingPromotion.to,
                    promotionPiece: pieceType,
                },
            });

            setShowPromotionModal(false);
            setPendingPromotion(null);
            setSelectedSquare(null);
        },
        [pendingPromotion, emit, roomCode]
    );

    const handleResign = useCallback(() => {
        if (confirm('Are you sure you want to resign?')) {
            emit('game:action', { roomCode, action: 'resign' });
        }
    }, [emit, roomCode]);

    const handleOfferDraw = useCallback(() => {
        emit('game:action', { roomCode, action: 'offer_draw' });
    }, [emit, roomCode]);

    const handleAcceptDraw = useCallback(() => {
        emit('game:action', { roomCode, action: 'accept_draw' });
    }, [emit, roomCode]);

    const handleDeclineDraw = useCallback(() => {
        emit('game:action', { roomCode, action: 'decline_draw' });
    }, [emit, roomCode]);

    // Loading state
    if (loading || guestLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
            </div>
        );
    }

    // Error state
    if (error && !room) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <Card className="p-8 text-center bg-gray-800 border-gray-700">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/games/chess')}
                        className="text-white hover:text-gray-300"
                    >
                        Back to Chess
                    </button>
                </Card>
            </div>
        );
    }

    const isWaiting = room?.status === 'waiting';
    const isPlaying = room?.status === 'playing';
    const isFinished = room?.status === 'finished';
    const currentPlayer = players.find((p) => p.sessionId === guest?.sessionId);
    const isHost = currentPlayer?.isHost || false;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Header />

            <main className="pt-24 pb-12 px-4 relative">
                {/* Error Toast */}
                {error && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg">
                        {error}
                    </div>
                )}

                {/* Connection Status */}
                <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-gray-400">
                    <span
                        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                            }`}
                    />
                    {isConnected ? 'Connected' : 'Connecting...'}
                </div>

                {/* Waiting Room */}
                {isWaiting && room && guest && (
                    <div className="flex flex-col lg:flex-row gap-6 max-w-4xl mx-auto items-start">
                        {/* Main Waiting Room */}
                        <div className="flex-1">
                            <WaitingRoom
                                roomCode={roomCode}
                                players={players}
                                currentSessionId={guest.sessionId}
                                isHost={isHost}
                                minPlayers={room.minPlayers}
                                maxPlayers={room.maxPlayers}
                                onStart={handleStartGame}
                                onLeave={handleLeaveRoom}
                                gameTitle="Chess"
                                accentColor="#ffffff"
                                playerColors={CHESS_COLORS}
                                playerEmojis={['♔', '♚']}
                            />
                        </div>

                        {/* Time Control Selection - Host Only */}
                        {isHost && (
                            <div className="w-full lg:w-80">
                                <TimerSelector
                                    selectedKey={selectedTimeControl}
                                    onSelect={setSelectedTimeControl}
                                    disabled={false}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Game Board */}
                {(isPlaying || isFinished) && gameState && guest && (
                    <div className="max-w-6xl mx-auto">
                        {/* Game Over Overlay */}
                        {isFinished && gameState.gameResult && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                                <Card className="p-8 bg-gray-800 border-gray-700 max-w-md w-full mx-4">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">
                                            {gameState.isDraw ? '🤝' : '👑'}
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            Game Over!
                                        </h2>
                                        <p className="text-gray-300 mb-6">
                                            {getResultMessage(gameState.gameResult)}
                                        </p>
                                        {gameState.winner !== null && (
                                            <p className="text-lg text-white mb-6">
                                                {players[gameState.winner]?.username} wins!
                                                {gameState.winner === myPlayerIndex && ' 🎉'}
                                            </p>
                                        )}
                                        <Button
                                            onClick={() => router.push('/games/chess')}
                                            className="w-full bg-white text-gray-900 hover:bg-gray-200"
                                        >
                                            Back to Lobby
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            {/* Board with Clocks */}
                            <div className="flex-1 order-2 lg:order-1">
                                {/* Opponent's Clock (top) */}
                                {gameState.timeControl && gameState.timeControl.type !== 'unlimited' && (
                                    <div className="mb-3">
                                        <PlayerClock
                                            timeMs={myColor === 'white' ? blackTimeMs : whiteTimeMs}
                                            isActive={gameState.currentPlayer !== myColor}
                                            color={myColor === 'white' ? 'black' : 'white'}
                                            playerName={players[myColor === 'white' ? 1 : 0]?.username || 'Opponent'}
                                        />
                                    </div>
                                )}

                                <div className="mb-3 text-center">
                                    {isMyTurn ? (
                                        <p className="text-green-400 font-semibold">Your turn</p>
                                    ) : (
                                        <p className="text-gray-400">
                                            Waiting for opponent...
                                        </p>
                                    )}
                                </div>
                                <Board
                                    board={gameState.board}
                                    selectedSquare={selectedSquare}
                                    validMoves={currentValidMoves}
                                    lastMove={lastMove}
                                    isCheck={gameState.isCheck}
                                    currentPlayerColor={gameState.currentPlayer}
                                    myColor={myColor}
                                    onSquareClick={handleSquareClick}
                                    isMyTurn={isMyTurn}
                                />

                                {/* My Clock (bottom) */}
                                {gameState.timeControl && gameState.timeControl.type !== 'unlimited' && (
                                    <div className="mt-3">
                                        <PlayerClock
                                            timeMs={myColor === 'white' ? whiteTimeMs : blackTimeMs}
                                            isActive={isMyTurn}
                                            color={myColor || 'white'}
                                            playerName={players[myPlayerIndex ?? 0]?.username || 'You'}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Game Info */}
                            <div className="w-full lg:w-72 order-1 lg:order-2 space-y-4">
                                <GameInfo
                                    gameState={gameState}
                                    players={players}
                                    myPlayerIndex={myPlayerIndex}
                                    isMyTurn={isMyTurn}
                                    onResign={handleResign}
                                    onOfferDraw={handleOfferDraw}
                                    onAcceptDraw={handleAcceptDraw}
                                    onDeclineDraw={handleDeclineDraw}
                                />

                                {/* Theme Selector */}
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Board Theme
                                    </div>
                                    <ThemeSelector compact />
                                </div>

                                {/* Piece Style Selector */}
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Piece Style
                                    </div>
                                    <PieceStyleSelector compact />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Promotion Modal */}
                <Modal
                    isOpen={showPromotionModal}
                    onClose={() => { }}
                    title="Promote Pawn"
                    size="sm"
                >
                    <div className="text-center">
                        <p className="text-gray-400 mb-4">Choose a piece for promotion:</p>
                        <div className="flex justify-center gap-4">
                            {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handlePromotion(type)}
                                    className="w-16 h-16 flex items-center justify-center text-4xl bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                    style={{
                                        color: myColor === 'white' ? '#fff' : '#1a1a1a',
                                        WebkitTextStroke: myColor === 'white' ? '1px #333' : '1px #888',
                                    }}
                                >
                                    {type === 'queen' && '♛'}
                                    {type === 'rook' && '♜'}
                                    {type === 'bishop' && '♝'}
                                    {type === 'knight' && '♞'}
                                </button>
                            ))}
                        </div>
                    </div>
                </Modal>
            </main>
        </div>
    );
}
