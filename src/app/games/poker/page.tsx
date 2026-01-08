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
        } catch (err) {
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
        } catch (err) {
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
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black">
            <Header />

            <main className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-12">
                        <div className="flex justify-center gap-4 text-6xl mb-4">
                            <span>🃏</span>
                            <span>♠️</span>
                            <span>♥️</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Texas Hold'em Poker</h1>
                        <p className="text-gray-400 max-w-md mx-auto">
                            The ultimate card game of skill and strategy. Bluff, bet, and take the pot!
                        </p>
                    </div>

                    {/* Action Cards */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Card className="p-8 text-center bg-gray-800/50 border-gray-700">
                            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">🎰</span>
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">Create Table</h2>
                            <p className="text-sm text-gray-400 mb-6">Start a new poker table and invite friends</p>
                            <Button
                                onClick={() => handleCreateRoom()}
                                loading={isLoading && pendingAction === 'create'}
                                className="w-full bg-red-600 text-white hover:bg-red-700"
                            >
                                Create Table
                            </Button>
                        </Card>

                        <Card className="p-8 text-center bg-gray-800/50 border-gray-700">
                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">🎴</span>
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">Join Table</h2>
                            <p className="text-sm text-gray-400 mb-6">Enter a room code to join an existing table</p>
                            <Button
                                variant="secondary"
                                onClick={openJoinModal}
                                className="w-full border-gray-600 text-white hover:bg-gray-700"
                            >
                                Join Table
                            </Button>
                        </Card>
                    </div>

                    {/* Rules */}
                    <div className="mt-16 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold text-white mb-6 text-center">How to Play</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: '🃏', text: '2 hole cards are dealt to each player' },
                                { icon: '🎯', text: '5 community cards are shared by all' },
                                { icon: '💰', text: 'Bet, raise, call, check, or fold' },
                                { icon: '🏆', text: 'Best 5-card hand wins the pot' },
                            ].map((rule, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                                    <span className="text-2xl">{rule.icon}</span>
                                    <span className="text-sm text-gray-300">{rule.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features Section */}
                    <section className="mt-20 max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">
                            Why Play Poker at VersusArenas?
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-6 mb-10">
                            {[
                                { icon: '👥', title: 'Up to 8 Players', desc: 'Invite up to 7 friends for a full poker experience.' },
                                { icon: '🆓', title: 'Completely Free', desc: 'No real money. Play with virtual chips for fun!' },
                                { icon: '📱', title: 'Any Device', desc: 'Works on mobile, tablet, and desktop.' },
                                { icon: '⚡', title: 'Real-time Play', desc: 'Instant action synchronization with all players.' },
                                { icon: '🔒', title: 'Private Tables', desc: 'Only friends with the code can join your table.' },
                                { icon: '🎭', title: 'Hidden Cards', desc: 'Your cards are hidden from other players until showdown.' },
                            ].map((feature, i) => (
                                <div key={i} className="p-5 bg-gray-800/50 border border-gray-700 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">{feature.icon}</span>
                                        <h3 className="font-semibold text-white">{feature.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {/* Login Modal */}
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

            {/* Join Modal */}
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
                        placeholder="Enter room code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                        error={error}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono"
                        autoFocus
                    />
                    <Button onClick={handleJoinRoom} loading={isLoading} className="w-full">
                        Join Table
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
