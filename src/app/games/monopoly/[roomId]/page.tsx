'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useGuest } from '@/hooks/useGuest';
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

    const { guest, loading: guestLoading } = useGuest();
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

    const currentPlayer = players.find(p => p.sessionId === guest?.sessionId);
    const isHost = currentPlayer?.isHost || false;
    const myPlayerIndex = players.findIndex(p => p.sessionId === guest?.sessionId);

    // Fetch room data
    useEffect(() => {
        if (guestLoading) return;

        if (!guest) {
            router.push('/games/monopoly');
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

    const handleRollDice = useCallback(() => {
        if (!gameState || (gameState.phase !== 'ROLL' && gameState.phase !== 'JAIL')) return;
        setRolling(true);
        emit('game:action', { roomCode, action: 'ROLL_DICE' });
    }, [emit, roomCode, gameState]);

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
                        {showPropertyCard && getCurrentProperty() && (
                            <PropertyCard
                                property={getCurrentProperty()!}
                                playerCash={gameState.playerState[guest.sessionId]?.cash || 0}
                                onBuy={handleBuyProperty}
                                onDecline={handleDeclineProperty}
                            />
                        )}

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
        </div>
    );
}
