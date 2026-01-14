'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useGuest } from '@/hooks/useGuest';
import { useAuth } from '@/contexts/AuthContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useSocket } from '@/hooks/useSocket';
import { roomApi } from '@/lib/api';
import { Room, Player } from '@/types/game';
import { MonopolyGameState, PLAYER_TOKENS, BoardSquare } from '@/types/monopoly';
import WaitingRoom from '@/components/games/shared/WaitingRoom';
import Board from '@/components/games/monopoly/Board';
import PlayerPanel from '@/components/games/monopoly/PlayerPanel';
import Dice from '@/components/games/monopoly/Dice';
import PropertyCard from '@/components/games/monopoly/PropertyCard';
import GameLogPanel from '@/components/games/monopoly/GameLogPanel';
import SellPropertyModal from '@/components/games/monopoly/SellPropertyModal';
import BuildPanel from '@/components/games/monopoly/BuildPanel';
import LeaderboardScreen from '@/components/games/monopoly/LeaderboardScreen';
import PropertyDetailsModal from '@/components/games/monopoly/PropertyDetailsModal';

export default function MonopolyGameRoom() {
    const params = useParams();
    const router = useRouter();
    const roomCode = (params.roomId as string).toUpperCase();

    const { guest, loading: guestLoading, login } = useGuest();
    const { user } = useAuth();
    const { isConnected, emit, on } = useSocket();

    const [room, setRoom] = useState<Room | null>(null);
    const [gameState, setGameState] = useState<MonopolyGameState | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rolling, setRolling] = useState(false);
    const [showPropertyCard, setShowPropertyCard] = useState(false);
    const [winner, setWinner] = useState<{ username: string } | null>(null);
    const [leaderboard, setLeaderboard] = useState<Array<{ username: string; rank: number }>>([]);
    const [selectedPropertyFromPanel, setSelectedPropertyFromPanel] = useState<BoardSquare | null>(null);

    // Join modal state for users joining via link without a session
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinUsername, setJoinUsername] = useState('');
    const [joinError, setJoinError] = useState('');
    const [joining, setJoining] = useState(false);

    const currentPlayer = players.find(p => p.sessionId === guest?.sessionId);
    const isHost = currentPlayer?.isHost || false;
    const myPlayerIndex = players.findIndex(p => p.sessionId === guest?.sessionId);

    // Fetch room data and handle join flow
    useEffect(() => {
        if (guestLoading) return;

        const fetchRoom = async () => {
            try {
                const res = await roomApi.get(roomCode);
                if (res.success && res.data) {
                    setRoom(res.data);
                    setPlayers(res.data.players);

                    // Check if current user is already a participant
                    const currentSessionId = guest?.sessionId;
                    const isParticipant = res.data.players.some(p => p.sessionId === currentSessionId);

                    if (currentSessionId && !isParticipant) {
                        // We have a session but are not in the room. Auto-join via API.
                        try {
                            await roomApi.join(roomCode, currentSessionId);
                        } catch (e) {
                            setShowJoinModal(true);
                        }
                    } else if (!guest && !user) {
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
            const { state } = data as { state: MonopolyGameState };
            setGameState(state);
            setRoom(prev => prev ? { ...prev, status: 'playing' } : null);
        });

        const unsubState = on('game:state', (data: unknown) => {
            const { state } = data as { state: MonopolyGameState };

            setGameState(state);
            setRolling(false);

            // Show property card if in decision phase and it's my turn
            if (state.phase === 'DECISION' && guest) {
                const orderedPlayers = players.map(p => p.sessionId);
                const currentTurnSessionId = orderedPlayers[state.currentTurnIndex];
                if (currentTurnSessionId === guest.sessionId) {
                    setShowPropertyCard(true);
                }
            } else {
                setShowPropertyCard(false);
            }
        });

        const unsubWinner = on('game:winner', (data: unknown) => {
            const { winner, leaderboard } = data as {
                winner: { username: string } | null,
                leaderboard: Array<{ username: string; rank: number }>
            };
            setWinner(winner);
            setLeaderboard(leaderboard || []);
            setRoom(prev => prev ? { ...prev, status: 'finished' } : null);
        });

        const unsubError = on('error', (data: unknown) => {
            const { message } = data as { message: string };
            setError(message);
            setRolling(false);
            setTimeout(() => setError(''), 3000);
        });

        return () => {
            unsubRoom();
            unsubStart();
            unsubState();
            unsubWinner();
            unsubError();
        };
    }, [guest, isConnected, on, players]);

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
        router.push('/games/monopoly');
    }, [emit, router]);

    // Sound effects
    const { playDiceRoll } = useSoundEffects();

    const handleRollDice = useCallback(() => {
        if (!gameState || (gameState.phase !== 'ROLL' && gameState.phase !== 'JAIL')) return;
        setRolling(true);
        playDiceRoll(); // Play dice roll sound
        emit('game:action', { roomCode, action: 'ROLL_DICE' });
    }, [emit, roomCode, gameState, playDiceRoll]);

    const handleBuyProperty = useCallback(() => {
        emit('game:action', { roomCode, action: 'BUY_PROPERTY' });
        setShowPropertyCard(false);
    }, [emit, roomCode]);

    const handleDeclineProperty = useCallback(() => {
        emit('game:action', { roomCode, action: 'DECLINE_PROPERTY' });
        setShowPropertyCard(false);
    }, [emit, roomCode]);

    const handleEndTurn = useCallback(() => {
        emit('game:action', { roomCode, action: 'END_TURN' });
        setShowPropertyCard(false);
    }, [emit, roomCode]);

    const handleSellProperty = useCallback((propertyId: string) => {
        emit('game:action', { roomCode, action: 'SELL_PROPERTY', data: { propertyId } });
    }, [emit, roomCode]);

    const handleBuildHouse = useCallback((propertyId: string) => {
        emit('game:action', { roomCode, action: 'BUILD_HOUSE', data: { propertyId } });
    }, [emit, roomCode]);

    const handleBuildHotel = useCallback((propertyId: string) => {
        emit('game:action', { roomCode, action: 'BUILD_HOTEL', data: { propertyId } });
    }, [emit, roomCode]);

    const handlePayJailFine = useCallback(() => {
        emit('game:action', { roomCode, action: 'PAY_JAIL_FINE' });
    }, [emit, roomCode]);

    const handleUseJailCard = useCallback(() => {
        emit('game:action', { roomCode, action: 'USE_JAIL_CARD' });
    }, [emit, roomCode]);

    const handleBankrupt = useCallback(() => {
        if (confirm('Are you sure you want to go Bankrupt? This will remove you from the game.')) {
            emit('game:action', { roomCode, action: 'BANKRUPT' });
        }
    }, [emit, roomCode]);

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

            // Join the room via HTTP API
            const joinRes = await roomApi.join(roomCode, guestResult.sessionId);
            if (joinRes.success && joinRes.data) {
                setRoom(joinRes.data);
                setPlayers(joinRes.data.players);
                setShowJoinModal(false);

                // Explicitly emit socket join to ensure real-time connection
                // This is needed because the useEffect may not trigger due to state timing
                if (isConnected) {
                    emit('room:join', {
                        roomCode,
                        sessionId: guestResult.sessionId,
                        username: guestResult.username,
                    });
                }
            } else {
                setJoinError(joinRes.message || 'Failed to join room');
            }
        } catch (err) {
            setJoinError('Failed to join room');
        }

        setJoining(false);
    };

    // Get current turn player
    const getCurrentTurnPlayer = () => {
        if (!gameState) return null;
        const orderedPlayers = players.map(p => p.sessionId);
        const currentTurnSessionId = orderedPlayers[gameState.currentTurnIndex];
        return players.find(p => p.sessionId === currentTurnSessionId);
    };

    const isMyTurn = () => {
        if (!gameState || !guest) return false;
        const orderedPlayers = players.map(p => p.sessionId);
        return orderedPlayers[gameState.currentTurnIndex] === guest.sessionId;
    };

    if (loading || guestLoading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#16a34a] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error && !room) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <Card className="p-8 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button onClick={() => router.push('/games/monopoly')} className="text-[#16a34a]">
                        Back to Monopoly
                    </button>
                </Card>
            </div>
        );
    }

    const isWaiting = room?.status === 'waiting';
    const isPlaying = room?.status === 'playing';
    const isFinished = room?.status === 'finished';

    // Current property for buy decision
    const getCurrentProperty = () => {
        if (!gameState || !guest) return null;
        const myState = gameState.playerState[guest.sessionId];
        if (!myState) return null;
        return gameState.board[myState.position];
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <Header />



            {/* Leaderboard Overlay */}
            {winner && (
                <LeaderboardScreen
                    winner={winner}
                    leaderboard={leaderboard}
                    onHub={handleLeaveRoom}
                />
            )}

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
                {isWaiting && room && guest && (
                    <WaitingRoom
                        roomCode={roomCode}
                        players={players}
                        currentSessionId={guest.sessionId}
                        isHost={isHost}
                        minPlayers={room.minPlayers}
                        maxPlayers={room.maxPlayers}
                        onStart={handleStartGame}
                        onLeave={handleLeaveRoom}
                        gameTitle="Monopoly"
                        accentColor="#16a34a"
                        playerEmojis={Object.values(PLAYER_TOKENS).map(t => t.emoji)}
                    />
                )}

                {/* Reconnecting State - shown when game is in progress but state not yet received */}
                {(isPlaying || isFinished) && !gameState && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <Card className="p-8 text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-[#16a34a] border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-lg font-semibold text-white">
                                Reconnecting to game...
                            </p>
                            <p className="text-sm mt-2 text-[#888]">
                                Please wait while we restore your game session
                            </p>
                        </Card>
                    </div>
                )}

                {/* Game Board */}
                {(isPlaying || isFinished) && gameState && guest && (
                    <div className="max-w-8xl mx-auto">
                        {/* Game Over Overlay */}


                        <div className="grid lg:grid-cols-[250px_1fr_250px] gap-2">
                            {/* Left Panel - Players */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Players</h3>
                                {players.map((player, idx) => (
                                    <PlayerPanel
                                        key={player.sessionId}
                                        player={player}
                                        playerIndex={idx}
                                        playerState={gameState.playerState?.[player.sessionId]}
                                        isCurrentTurn={idx === gameState.currentTurnIndex}
                                        isMe={player.sessionId === guest.sessionId}
                                        board={gameState.board}
                                        onPropertyClick={(prop) => setSelectedPropertyFromPanel(prop)}
                                    />
                                ))}
                            </div>

                            {/* Center - Board */}
                            <div className="flex flex-col items-center">
                                <Board
                                    gameState={gameState}
                                    players={players}
                                    currentSessionId={guest.sessionId}
                                />
                            </div>

                            {/* Right Panel - Actions */}
                            <div className="space-y-4">
                                {/* Property Decision Card - appearing at top of sidebar */}
                                {showPropertyCard && getCurrentProperty() && (
                                    <PropertyCard
                                        property={getCurrentProperty()!}
                                        playerCash={gameState.playerState[guest.sessionId]?.cash || 0}
                                        onBuy={handleBuyProperty}
                                        onDecline={handleDeclineProperty}
                                    />
                                )}
                                <Card className="p-5">
                                    <h3 className="text-lg font-semibold text-white mb-4">Game Info</h3>

                                    {/* Current Turn */}
                                    <div className="mb-6">
                                        <p className="text-xs text-[#888] mb-2">Current Turn</p>
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#16a34a]/20">
                                            <span className="text-xl">
                                                {PLAYER_TOKENS[gameState.currentTurnIndex]?.emoji || '👤'}
                                            </span>
                                            <span className="text-white font-medium">
                                                {getCurrentTurnPlayer()?.username}
                                                {isMyTurn() && ' (You)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Phase */}
                                    <div className="mb-6">
                                        <p className="text-xs text-[#888] mb-2">Phase</p>
                                        <div className="px-3 py-2 rounded-lg bg-[#2a2a2a] text-white">
                                            {gameState.phase === 'ROLL' && '🎲 Roll Dice'}
                                            {gameState.phase === 'RESOLVE' && '⏳ Resolving...'}
                                            {gameState.phase === 'DECISION' && '🤔 Make Decision'}
                                            {gameState.phase === 'END_TURN' && '⏭️ End Turn'}
                                            {gameState.phase === 'DEBT' && '💸 Pay Debt'}
                                            {gameState.phase === 'JAIL' && '🔒 In Jail'}
                                        </div>
                                    </div>

                                    {/* Dice */}
                                    <div className="mb-6">
                                        <Dice
                                            values={gameState.dice}
                                            rolling={rolling}
                                            canRoll={isMyTurn() && (gameState.phase === 'ROLL' || gameState.phase === 'JAIL')}
                                            onRoll={handleRollDice}
                                        />
                                    </div>

                                    {/* Jail Actions */}
                                    {isMyTurn() && gameState.phase === 'JAIL' && (
                                        <div className="mb-6 space-y-2">
                                            <Button
                                                onClick={handlePayJailFine}
                                                className="w-full bg-yellow-600 hover:bg-yellow-700"
                                                disabled={rolling}
                                            >
                                                Pay Bail ($50)
                                            </Button>

                                            {gameState.playerState[guest.sessionId]?.hasGetOutOfJailCard && (
                                                <Button
                                                    onClick={handleUseJailCard}
                                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                                    disabled={rolling}
                                                >
                                                    Use "Get Out of Jail" Card
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* End Turn Button */}
                                    {isMyTurn() && gameState.phase === 'END_TURN' && (
                                        <Button onClick={handleEndTurn} className="w-full">
                                            End Turn
                                        </Button>
                                    )}
                                </Card>

                                {/* Build Panel */}
                                <BuildPanel
                                    gameState={gameState}
                                    mySessionId={guest.sessionId}
                                    isMyTurn={isMyTurn()}
                                    onBuildHouse={handleBuildHouse}
                                    onBuildHotel={handleBuildHotel}
                                />

                                {/* Game Log */}
                                <GameLogPanel logs={gameState.gameLog || []} />

                                {/* Bankrupt Button (Testing) */}
                                <Button
                                    onClick={handleBankrupt}
                                    className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800"
                                >
                                    ☠️ Surrender (Bankrupt)
                                </Button>
                            </div>
                        </div>

                        {/* Property Decision Modal */}


                        {/* Debt Modal - sell properties to pay debt */}
                        {isMyTurn() && gameState.phase === 'DEBT' && (
                            <SellPropertyModal
                                properties={gameState.board.filter(
                                    s => gameState.playerState[guest.sessionId]?.properties.includes(s.id)
                                )}
                                debtAmount={Math.abs(gameState.playerState[guest.sessionId]?.cash || 0)}
                                playerCash={gameState.playerState[guest.sessionId]?.cash || 0}
                                onSell={handleSellProperty}
                            />
                        )}

                        {/* Property Details Modal from Player Panel */}
                        {selectedPropertyFromPanel && (
                            <PropertyDetailsModal
                                property={selectedPropertyFromPanel}
                                owner={selectedPropertyFromPanel.owner ? players.find(p => p.sessionId === selectedPropertyFromPanel.owner) : undefined}
                                ownerIndex={selectedPropertyFromPanel.owner ? players.findIndex(p => p.sessionId === selectedPropertyFromPanel.owner) : undefined}
                                onClose={() => setSelectedPropertyFromPanel(null)}
                            />
                        )}
                    </div>
                )}
            </main>

            {/* Join Modal - for users accessing via shared link */}
            <Modal
                isOpen={showJoinModal}
                onClose={() => {
                    router.push('/games/monopoly');
                }}
                title="Join Game"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-[var(--text-muted)] text-sm">
                        Enter your name to join room <span className="font-mono font-bold text-[#16a34a]">{roomCode}</span>
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
