'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import { useGuest } from '@/hooks/useGuest';
import { roomApi } from '@/lib/api';

export default function PokerPage() {
    const router = useRouter();
    const { guest, loading, login } = useGuest();

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [username, setUsername] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState<'create' | 'join' | null>(null);

    const handleLogin = async () => {
        if (!username.trim() || username.length < 2) {
            setError('Username must be at least 2 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await login(username.trim());
        setIsLoading(false);

        if (result) {
            setShowLoginModal(false);
            if (pendingAction === 'create') {
                handleCreateRoom(result.sessionId);
            } else if (pendingAction === 'join') {
                setShowJoinModal(true);
            }
            setPendingAction(null);
        } else {
            setError('Failed to create session');
        }
    };

    const handleCreateRoom = async (sessionId?: string) => {
        const sid = sessionId || guest?.sessionId;
        if (!sid) {
            setPendingAction('create');
            setShowLoginModal(true);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await roomApi.create(sid, 'poker');
            if (res.success && res.data) {
                router.push(`/games/poker/${res.data.code}`);
            } else {
                setError(res.message || 'Failed to create room');
            }
        } catch {
            setError('Failed to create room');
        }

        setIsLoading(false);
    };

    const handleJoinRoom = async () => {
        if (!guest) {
            setPendingAction('join');
            setShowLoginModal(true);
            return;
        }

        if (!roomCode.trim() || roomCode.length !== 6) {
            setError('Enter a valid 6-character room code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await roomApi.join(roomCode.toUpperCase(), guest.sessionId);
            if (res.success && res.data) {
                router.push(`/games/poker/${res.data.code}`);
            } else {
                setError(res.message || 'Room not found');
            }
        } catch {
            setError('Failed to join room');
        }

        setIsLoading(false);
    };

    const openJoinModal = () => {
        if (!guest) {
            setPendingAction('join');
            setShowLoginModal(true);
        } else {
            setShowJoinModal(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            <Header />

            <main className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Poker</h1>
                        <p className="text-[#888] max-w-md mx-auto">
                            Classic multiplayer poker. Play smart, bluff better, and win the pot.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Card className="p-8 text-center">
                            <div className="w-16 h-16 bg-[#22c55e]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">🃏</span>
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">Create Table</h2>
                            <p className="text-sm text-[#888] mb-6">Host a private poker table</p>
                            <Button
                                onClick={() => handleCreateRoom()}
                                loading={isLoading && pendingAction === 'create'}
                                className="w-full"
                            >
                                Create Table
                            </Button>
                        </Card>

                        <Card className="p-8 text-center">
                            <div className="w-16 h-16 bg-[#ef4444]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">♠️</span>
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">Join Table</h2>
                            <p className="text-sm text-[#888] mb-6">Enter a code to join a game</p>
                            <Button
                                variant="secondary"
                                onClick={openJoinModal}
                                className="w-full"
                            >
                                Join Table
                            </Button>
                        </Card>
                    </div>

                    <div className="mt-16 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold text-white mb-6 text-center">How to Play</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: '🃏', text: 'Each player is dealt cards' },
                                { icon: '💰', text: 'Bet, call, raise, or fold' },
                                { icon: '🧠', text: 'Use strategy and bluff wisely' },
                                { icon: '🏆', text: 'Best hand wins the pot' },
                            ].map((rule, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                                    <span className="text-2xl">{rule.icon}</span>
                                    <span className="text-sm text-[#888]">{rule.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Modal
                isOpen={showLoginModal}
                onClose={() => {
                    setShowLoginModal(false);
                    setPendingAction(null);
                    setError('');
                }}
                title="Enter Your Name"
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        placeholder="Your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        error={error}
                        autoFocus
                    />
                    <Button onClick={handleLogin} loading={isLoading} className="w-full">
                        Continue
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={showJoinModal}
                onClose={() => {
                    setShowJoinModal(false);
                    setRoomCode('');
                    setError('');
                }}
                title="Join Table"
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        placeholder="Enter table code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                        error={error}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono"
                        autoFocus
                    />
                    <Button onClick={handleJoinRoom} loading={isLoading} className="w-full">
                        Join Game
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
