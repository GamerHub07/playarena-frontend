'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Header from '@/components/layout/Header';
import WaitingRoom from '@/components/games/shared/WaitingRoom';
import Board from '@/components/games/tictactoe/Board';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useGuest } from '@/hooks/useGuest';
import { useSocket } from '@/hooks/useSocket';
import { roomApi } from '@/lib/api';
import { Room, Player } from '@/types/game';
import {
    TicTacToeGameState,
    TicTacToePlayer,
    TicTacToeStartPayload,
    TicTacToeWinnerPayload
} from '@/types/tictactoe';

export default function GameRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomCode = (params.roomId as string).toUpperCase();

    const { guest, loading: guestLoading, login } = useGuest();
    const { isConnected, emit, on } = useSocket();

    const [room, setRoom] = useState<Room | null>(null);
    const [gameState, setGameState] = useState<TicTacToeGameState | null>(null);
    const [gamePlayers, setGamePlayers] = useState<TicTacToePlayer[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [winner, setWinner] = useState<TicTacToeWinnerPayload | null>(null);
    const [opponentLeft, setOpponentLeft] = useState(false);

    // Join modal state
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinUsername, setJoinUsername] = useState('');
    const [joinError, setJoinError] = useState('');
    const [joining, setJoining] = useState(false);

    const currentPlayer = players.find(p => p.sessionId === guest?.sessionId);
    const isHost = currentPlayer?.isHost || false;
    const myPlayerIndex = gamePlayers.findIndex(p => p.sessionId === guest?.sessionId);

    // Fetch room data
    useEffect(() => {
        if (guestLoading) return;

        const fetchRoom = async () => {
            try {
                const res = await roomApi.get(roomCode);
                if (res.success && res.data) {
                    setRoom(res.data);
                    setPlayers(res.data.players);

                    const isParticipant = res.data.players.some(
                        p => p.sessionId === guest?.sessionId
                    );

                    if (guest?.sessionId && !isParticipant) {
                        // Auto-join
                        try {
                            await roomApi.join(roomCode, guest.sessionId);
                        } catch {
                            setShowJoinModal(true);
                        }
                    } else if (!guest) {
                        setShowJoinModal(true);
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
            const { players: updatedPlayers, status } = data as { players: Player[]; status: string };

            // Check if opponent disconnected during game
            // Use status from event data (not stale room state)
            const isGameActive = status === 'playing' || status === 'finished';
            if (isGameActive && guest?.sessionId) {
                // Find opponent (player who is not me)
                const opponent = updatedPlayers.find(p => p.sessionId !== guest.sessionId);
                if (opponent && !opponent.isConnected) {
                    setOpponentLeft(true);
                }
            }

            setPlayers(updatedPlayers);
            setRoom(prev => prev ? { ...prev, status: status as Room['status'] } : null);
        });

        const unsubStart = on('game:start', (data: unknown) => {
            const { state, players: gPlayers } = data as TicTacToeStartPayload;
            setGameState(state);
            setGamePlayers(gPlayers);
            setWinner(null); // Clear winner on restart
            setRoom(prev => prev ? { ...prev, status: 'playing' } : null);
        });

        const unsubState = on('game:state', (data: unknown) => {
            const { state } = data as { state: TicTacToeGameState };
            setGameState(state);
        });

        const unsubWinner = on('game:winner', (data: unknown) => {
            const winnerData = data as TicTacToeWinnerPayload;
            setWinner(winnerData);
            setRoom(prev => prev ? { ...prev, status: 'finished' } : null);

            // Celebration confetti for winner
            if (winnerData.winner && !winnerData.isDraw) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        });

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
    }, [guest, isConnected, on]);

    // Socket join room
    useEffect(() => {
        if (!guest || !isConnected || loading) return;

        emit('room:join', {
            roomCode,
            sessionId: guest.sessionId,
            username: guest.username,
        });

        // Re-fetch room data after joining to ensure we have latest players
        const refreshRoom = async () => {
            try {
                const res = await roomApi.get(roomCode);
                if (res.success && res.data) {
                    setPlayers(res.data.players);
                    setRoom(res.data);
                }
            } catch {
                // Ignore errors, socket update will handle it
            }
        };

        // Small delay to ensure backend has processed the join
        const timeoutId = setTimeout(refreshRoom, 300);

        return () => {
            clearTimeout(timeoutId);
            emit('room:leave', {});
        };
    }, [isConnected, guest, loading, roomCode, emit]);

    const handleStartGame = useCallback(() => {
        emit('game:start', { roomCode });
    }, [emit, roomCode]);

    const handleLeaveRoom = useCallback(() => {
        emit('room:leave', {});
        router.push('/games/tictactoe');
    }, [emit, router]);

    const handleCellClick = useCallback((cellIndex: number) => {
        emit('game:action', {
            roomCode,
            action: 'move',
            data: { cellIndex }
        });
    }, [emit, roomCode]);

    const handlePlayAgain = useCallback(() => {
        emit('game:action', {
            roomCode,
            action: 'restart',
            data: {}
        });
    }, [emit, roomCode]);

    const handleJoinViaLink = async () => {
        if (!joinUsername.trim() || joinUsername.length < 2) {
            setJoinError('Username must be at least 2 characters');
            return;
        }

        setJoining(true);
        setJoinError('');

        try {
            const guestResult = await login(joinUsername.trim());
            if (!guestResult) {
                setJoinError('Failed to create session');
                setJoining(false);
                return;
            }

            const joinRes = await roomApi.join(roomCode, guestResult.sessionId);
            if (joinRes.success && joinRes.data) {
                setRoom(joinRes.data);
                setPlayers(joinRes.data.players);
                setShowJoinModal(false);
            } else {
                setJoinError(joinRes.message || 'Failed to join room');
            }
        } catch {
            setJoinError('Failed to join room');
        }

        setJoining(false);
    };

    if (loading || guestLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error && !room) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <Card className="p-8 text-center bg-slate-800/50 border-slate-700">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/games/tictactoe')}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Back to Tic Tac Toe
                    </button>
                </Card>
            </div>
        );
    }

    const isWaiting = room?.status === 'waiting';
    const isPlaying = room?.status === 'playing';
    const isFinished = room?.status === 'finished';

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                <div className="absolute top-10 left-10 text-9xl font-black text-white -rotate-12 select-none">X</div>
                <div className="absolute top-1/2 left-1/4 text-8xl font-black text-white rotate-12 select-none">O</div>
                <div className="absolute bottom-20 left-20 text-[10rem] font-black text-white -rotate-6 select-none">X</div>
                <div className="absolute top-20 right-20 text-[8rem] font-black text-white rotate-45 select-none">O</div>
                <div className="absolute bottom-1/3 right-10 text-9xl font-black text-white -rotate-12 select-none">X</div>
                <div className="absolute bottom-10 right-1/4 text-[12rem] font-black text-white rotate-12 select-none">O</div>
            </div>

            <Header />

            <main className="pt-24 pb-12 px-4">
                {/* Error Toast */}
                {error && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-red-500/80 text-white">
                        {error}
                    </div>
                )}

                {/* Connection Status */}
                <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-slate-400">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    {isConnected ? 'Connected' : 'Connecting...'}
                </div>

                {/* Waiting Room */}
                {isWaiting && room && (
                    <WaitingRoom
                        roomCode={roomCode}
                        players={players}
                        currentSessionId={guest?.sessionId || ''}
                        isHost={isHost}
                        minPlayers={2}
                        maxPlayers={2}
                        onStart={handleStartGame}
                        onLeave={handleLeaveRoom}
                        gameTitle="Tic Tac Toe"
                        accentColor="#3b82f6"
                        headerContent={<div className="text-6xl mb-2">❌⭕</div>}
                    />
                )}

                {/* Game Board */}
                {isPlaying && gameState && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <Board
                            gameState={gameState}
                            myPlayerIndex={myPlayerIndex}
                            onCellClick={handleCellClick}
                        />
                    </div>
                )}

                {/* Game Over Screen */}
                {isFinished && winner && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <Card className="p-8 text-center bg-slate-800/90 border-slate-700 max-w-sm mx-4">
                            <div className="text-6xl mb-4">
                                {winner.isDraw ? '🤝' : '🏆'}
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {winner.isDraw ? "It's a Draw!" : 'Winner!'}
                            </h2>
                            {winner.winner && (
                                <div className="mb-6">
                                    <p className="text-xl text-slate-300 mb-2">
                                        {winner.winner.username}
                                    </p>
                                    <span className={`text-4xl font-bold ${winner.winner.symbol === 'X' ? 'text-blue-400' : 'text-red-400'
                                        }`}>
                                        {winner.winner.symbol}
                                    </span>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={handleLeaveRoom}
                                    className="flex-1"
                                >
                                    Leave
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handlePlayAgain}
                                    className="flex-1"
                                >
                                    Play Again
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Opponent Left Modal */}
                {opponentLeft && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <Card className="p-8 text-center bg-slate-800/90 border-slate-700 max-w-sm mx-4">
                            <div className="text-6xl mb-4">👋</div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Opponent Left
                            </h2>
                            <p className="text-slate-400 mb-6">
                                Your opponent has left the game.
                            </p>
                            <Button
                                variant="primary"
                                onClick={handleLeaveRoom}
                                className="w-full"
                            >
                                Back to Lobby
                            </Button>
                        </Card>
                    </div>
                )}
            </main>

            {/* Join Modal */}
            <Modal
                isOpen={showJoinModal}
                onClose={() => router.push('/games/tictactoe')}
                title="Join Game"
            >
                <div className="space-y-4">
                    <p className="text-slate-400 text-center">
                        Enter your name to join room <span className="font-mono font-bold text-white">{roomCode}</span>
                    </p>
                    <Input
                        placeholder="Your username"
                        value={joinUsername}
                        onChange={(e) => setJoinUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinViaLink()}
                        maxLength={20}
                    />
                    {joinError && (
                        <p className="text-red-400 text-sm text-center">{joinError}</p>
                    )}
                    <Button
                        variant="primary"
                        onClick={handleJoinViaLink}
                        disabled={joining}
                        className="w-full"
                    >
                        {joining ? 'Joining...' : 'Join Game'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
