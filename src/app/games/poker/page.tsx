'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import { useGuest } from '@/hooks/useGuest';
import { useAuth } from '@/contexts/AuthContext';
import { roomApi } from '@/lib/api';
import { PokerHandsGuideButton } from '@/components/games/poker/PokerHandsGuide';

export default function PokerPage() {
    const router = useRouter();
    const { guest, loading, login } = useGuest();
    const { user } = useAuth();

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

        // If user is logged in but no guest session exists, auto-create one
        if (user && !guest) {
            setIsLoading(true);
            const result = await login(user.username);
            setIsLoading(false);
            if (result) {
                handleCreateRoom(result.sessionId);
            }
            return;
        }

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

    const openJoinModal = async () => {
        if (!guest && !user) {
            setPendingAction('join');
            setShowLoginModal(true);
        } else if (user && !guest) {
            setIsLoading(true);
            const result = await login(user.username);
            setIsLoading(false);
            if (result) {
                setShowJoinModal(true);
            }
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
        <div className="min-h-screen bg-[var(--background)]">
            <Header />

            <main className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
                            Texas Hold'em Poker
                        </h1>
                        <p className="text-[var(--text-muted)] max-w-md mx-auto">
                            The ultimate card game of skill and strategy. Bluff, bet, and take the pot!
                        </p>
                    </div>

                    {/* Action Cards */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Card className="p-8 text-center">
                            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">🎰</span>
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Create Table</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">Start a new poker table and invite friends</p>
                            <Button
                                onClick={() => handleCreateRoom()}
                                loading={isLoading && pendingAction === 'create'}
                                className="w-full"
                            >
                                Create Table
                            </Button>
                        </Card>

                        <Card className="p-8 text-center">
                            <div className="w-16 h-16 bg-[var(--success)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">🎴</span>
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Join Table</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">Enter a room code to join an existing table</p>
                            <Button
                                variant="secondary"
                                onClick={openJoinModal}
                                className="w-full"
                            >
                                Join Table
                            </Button>
                        </Card>
                    </div>

                    {/* Hand Rankings Card */}
                    <div className="mt-8 max-w-2xl mx-auto">
                        <Card className="p-6 text-center bg-[var(--surface-alt)]">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-[var(--primary)]/20 rounded-2xl flex items-center justify-center">
                                        <span className="text-3xl">📖</span>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg font-semibold text-[var(--text)]">New to Poker?</h3>
                                        <p className="text-sm text-[var(--text-muted)]">Learn the hand rankings before you play!</p>
                                    </div>
                                </div>
                                <PokerHandsGuideButton />
                            </div>
                        </Card>
                    </div>

                    {/* Rules */}
                    <div className="mt-12 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold text-[var(--text)] mb-6 text-center">How to Play</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: '🃏', text: '2 hole cards are dealt to each player' },
                                { icon: '🎯', text: '5 community cards are shared by all' },
                                { icon: '💰', text: 'Bet, raise, call, check, or fold' },
                                { icon: '🏆', text: 'Best 5-card hand wins the pot' },
                            ].map((rule, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
                                    <span className="text-2xl">{rule.icon}</span>
                                    <span className="text-sm text-[var(--text-muted)]">{rule.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features Section */}
                    <section className="mt-20 max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-[var(--text)] mb-6 text-center">
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
                                <div key={i} className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-soft">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">{feature.icon}</span>
                                        <h3 className="font-semibold text-[var(--text)]">{feature.title}</h3>
                                    </div>
                                    <p className="text-sm text-[var(--text-muted)]">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* FAQ Section */}
                        <div className="mt-12">
                            <h2 className="text-xl font-bold text-[var(--text)] mb-6 text-center">
                                Frequently Asked Questions
                            </h2>
                            <div className="space-y-4">
                                {[
                                    {
                                        q: 'How do I play Poker online with friends?',
                                        a: 'Click "Create Table" to get a unique room code. Share this code with your friends, and they can join by clicking "Join Table" and entering the code. Once everyone\'s in, start the game!'
                                    },
                                    {
                                        q: 'Is this Poker game free to play?',
                                        a: 'Yes! VersusArenas Poker is completely free to play. No real money is involved - just play with virtual chips for fun.'
                                    },
                                    {
                                        q: 'Can I play Poker on my phone?',
                                        a: 'Absolutely! Our Poker game works on any device with a web browser - smartphones, tablets, laptops, and desktops. No app installation needed.'
                                    },
                                    {
                                        q: 'How many players can play Poker?',
                                        a: 'You can play Texas Hold\'em with 2 to 8 players. The more players, the more exciting the game!'
                                    },
                                    {
                                        q: 'What happens if I disconnect during a game?',
                                        a: 'If you disconnect, you have 15 seconds to reconnect. If you don\'t return in time, your turn will be auto-folded. After 3 missed turns, you\'ll be removed from the game.'
                                    },
                                ].map((faq, i) => (
                                    <details key={i} className="p-4 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg group">
                                        <summary className="font-medium text-[var(--text)] cursor-pointer list-none flex justify-between items-center">
                                            {faq.q}
                                            <span className="text-[var(--text-muted)] group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">{faq.a}</p>
                                    </details>
                                ))}
                            </div>
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
