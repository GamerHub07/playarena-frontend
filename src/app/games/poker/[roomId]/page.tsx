'use strict';
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useGuest } from '@/hooks/useGuest';
import { useSocket } from '@/hooks/useSocket';
import { roomApi } from '@/lib/api';
import { Room } from '@/types/game';
import TableView from '@/components/games/poker/TableView';
import { PokerGameState, Player } from '@/types/poker';

export default function PokerRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomCode = (params.roomId as string).toUpperCase();

    const { guest, loading: guestLoading } = useGuest();
    const { isConnected, emit, on } = useSocket();

    const [room, setRoom] = useState<Room | null>(null);
    const [gameState, setGameState] = useState<PokerGameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 1. Initial Room Fetch
    useEffect(() => {
        if (guestLoading) return;
        if (!guest) {
            router.push('/games/poker');
            return;
        }

        const fetchRoom = async () => {
            try {
                // Pass sessionId to allow backend to unmask MY cards while hiding others
                const res = await roomApi.get(`${roomCode}?sessionId=${guest.sessionId}`);
                if (res.success && res.data) {
                    setRoom(res.data);
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

    // 2. State Adapter (Backend -> Frontend)
    const adaptAndSetState = useCallback((backendState: any) => {
        if (!guest) return;

        // Helper: Map Backend Suits (H,D,C,S) -> Frontend (hearts,...)
        const mapCard = (c: any) => c ? { rank: c.rank, suit: ({ H: 'hearts', D: 'diamonds', C: 'clubs', S: 'spades' } as any)[c.suit] || c.suit } : null;

        // Convert Backend Players (Record<index, Player>) to Frontend Array
        const adaptedPlayers: Player[] = Object.values(backendState.players).map((p: any) => ({
            id: p.sessionId,
            username: p.username,
            chips: p.chips,
            bet: p.currentBet, // Mapped from currentBet
            cards: p.hand?.map(mapCard) || [],
            isFolded: p.hasFolded,
            isAllIn: p.isAllIn,
            isHost: false, // Not tracked in game engine yet
            isTurn: Number(backendState.currentPlayer) === p.position,
            position: p.position
        }));

        const statusMap: Record<string, any> = {
            'wait': 'waiting',
            'pre-flop': 'betting',
            'flop': 'betting',
            'turn': 'betting',
            'river': 'betting',
            'showdown': 'showdown'
        };

        const winners = backendState.winner?.map((wIndex: number) => {
            const p = Object.values(backendState.players).find((pl: any) => pl.position === wIndex);
            return (p as any)?.sessionId;
        }) || null;

        const adaptedState: PokerGameState = {
            roomCode: roomCode,
            status: statusMap[backendState.currentPhase] || 'betting',
            players: adaptedPlayers,
            communityCards: backendState.communityCards?.map(mapCard) || [],
            pot: backendState.pot,
            currentBet: backendState.minBet,
            dealerPosition: backendState.dealerIndex,
            activePlayerId: adaptedPlayers.find(p => p.isTurn)?.id || null,
            smallBlind: 10,
            bigBlind: 20,
            winners: winners
        };

        setGameState(adaptedState);
    }, [guest, roomCode]);

    // 3. Socket Connection & Listeners
    useEffect(() => {
        if (!guest || !isConnected) return;

        // Join the room using the generic event
        emit('room:join', {
            roomCode,
            sessionId: guest.sessionId,
            username: guest.username,
        });

        // Listen for internal game state updates
        const unsubState = on('game:state', (data: any) => {
            console.log('📡 Poker state:', data.state);
            adaptAndSetState(data.state);
        });

        const unsubStart = on('game:start', (data: any) => {
            console.log('🚀 Game Started:', data);
            adaptAndSetState(data.state);
        });

        const unsubError = on('error', (data: any) => {
            setError(data.message);
            setTimeout(() => setError(''), 3000);
        });

        return () => {
            unsubState();
            unsubStart();
            unsubError();
            emit('room:leave', {});
        };
    }, [guest, isConnected, on, emit, roomCode, adaptAndSetState]);

    // Action Handlers
    const handleAction = (action: 'fold' | 'call' | 'check' | 'raise' | 'nextRound', amount?: number) => {
        if (action === 'raise' && !amount) return;

        emit('game:action', {
            roomCode,
            action,
            data: action === 'raise' ? { amount } : {}
        });
    };

    const handleStartGame = () => {
        emit('game:start', { roomCode });
    };

    if (loading || guestLoading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
            </div>
        );
    }

    const isHost = room?.players?.[0]?.sessionId === guest?.sessionId;

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Header />

            <main className="relative h-screen overflow-hidden bg-[#0a0f1c]">
                {error && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-full backdrop-blur-sm">
                        {error}
                    </div>
                )}

                {/* Game Area */}
                {gameState ? (
                    <TableView
                        gameState={gameState}
                        currentUserId={guest?.sessionId}
                        onAction={handleAction}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <Card className="p-12 text-center max-w-md w-full">
                            <div className="mb-6 w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto">
                                <span className="text-3xl">♠️</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Waiting for Game</h2>
                            <p className="text-[var(--text-muted)] mb-8">
                                Waiting for the host to start the game.
                            </p>

                            <div
                                className="mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-900/70 transition-colors cursor-pointer group relative"
                                onClick={() => {
                                    navigator.clipboard.writeText(roomCode);
                                    // Visual feedback handled purely via CSS active/focus states or simple alert for now
                                    // Or better: show a temporary "Copied!" text if using state, but let's keep it simple with a title/tooltip
                                    const el = document.getElementById('copy-feedback');
                                    if (el) { el.style.opacity = '1'; setTimeout(() => el.style.opacity = '0', 2000); }
                                }}
                            >
                                <p className="text-slate-400 text-xs font-bold tracking-wider mb-1 flex justify-between items-center">
                                    ROOM CODE
                                    <span className="text-[10px] text-emerald-500 opacity-0 transition-opacity" id="copy-feedback">COPIED!</span>
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-3xl font-mono text-emerald-400 tracking-[0.2em] font-bold">{roomCode}</p>
                                    <span className="text-slate-500 group-hover:text-white transition-colors">
                                        📋
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6 text-left bg-slate-800/50 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Players ({room?.players.length || 0})</h3>
                                <div className="space-y-2">
                                    {room?.players.map((p) => (
                                        <div key={p.sessionId} className="flex items-center gap-3 text-white">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            {p.username}
                                            {p.isHost && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/30">HOST</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {isHost && (
                                <Button onClick={handleStartGame} className="w-full">
                                    Start Game
                                </Button>
                            )}
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}