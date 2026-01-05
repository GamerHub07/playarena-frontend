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
            // Note: passing 'poker' as the game type to match your backend GameStore logic
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
                // Ensure the backend validates that this roomCode actually belongs to a poker game
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
        <div className="min-h-screen bg-[var(--background)]">
            <Header />

            <main className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">Texas Hold'em Poker</h1>
                        <p className="text-[var(--text-muted)] max-w-md mx-auto">
                            The ultimate test of strategy and skill. Play against friends, manage your chips, and go all-in!
                        </p>
                    </div>

                    {/* Action Cards */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Card className="p-8 text-center">
                            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Create Table</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">Host a private poker table for your crew</p>
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
                                <svg className="w-8 h-8 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Join Table</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">Join an existing table using a code</p>
                            <Button
                                variant="secondary"
                                onClick={openJoinModal}
                                className="w-full"
                            >
                                Join Table
                            </Button>
                        </Card>
                    </div>

                    {/* Poker Rules/Tips */}
                    <div className="mt-16 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold text-[var(--text)] mb-6 text-center">Quick Guide</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: '🃏', text: 'Get 2 private cards and 5 community cards' },
                                { icon: '💰', text: 'Bet, Check, or Fold during four rounds' },
                                { icon: '📊', text: 'Build the best 5-card hand possible' },
                                { icon: '💎', text: 'Win by having the best hand or bluffing' },
                            ].map((rule, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
                                    <span className="text-2xl">{rule.icon}</span>
                                    <span className="text-sm text-[var(--text-muted)]">{rule.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SEO Content Section */}
                    <section className="mt-20 max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-[var(--text)] mb-6 text-center">
                            Why Play Ludo Online at VersusArenas?
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-6 mb-10">
                            {[
                                { icon: '🆓', title: 'Completely Free', desc: 'No hidden charges, no premium subscriptions. Play unlimited games for free.' },
                                { icon: '📱', title: 'Any Device', desc: 'Works on mobile, tablet, and desktop. No app download required.' },
                                { icon: '👥', title: 'Real-time Multiplayer', desc: 'Play with 2-4 friends in real-time with instant synchronization.' },
                                { icon: '🔒', title: 'Private Rooms', desc: 'Create private rooms with unique codes. Only friends with the code can join.' },
                                { icon: '🎨', title: 'Beautiful Themes', desc: 'Choose from multiple stunning board themes - Vintage, Modern, Ocean & more.' },
                                { icon: '⚡', title: 'No Sign-up', desc: 'Start playing instantly. Just enter a name and create or join a room.' },
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
                        {/* testing */}
                        {/* FAQ Section for SEO */}
                        <div className="mt-12">
                            <h2 className="text-xl font-bold text-[var(--text)] mb-6 text-center">
                                Frequently Asked Questions
                            </h2>
                            <div className="space-y-4">
                                {[
                                    {
                                        q: 'How do I play Ludo online with friends?',
                                        a: 'Simply click "Create Room" to get a unique room code. Share this code with your friends, and they can join by clicking "Join Room" and entering the code. Once everyone\'s in, start the game!'
                                    },
                                    {
                                        q: 'Is this Ludo game free to play?',
                                        a: 'Yes! VersusArenas Ludo is completely free to play. No registration, no downloads, no hidden fees. Just instant multiplayer fun.'
                                    },
                                    {
                                        q: 'Can I play Ludo on my phone?',
                                        a: 'Absolutely! Our Ludo game works on any device with a web browser - smartphones, tablets, laptops, and desktops. No app installation needed.'
                                    },
                                    {
                                        q: 'How many players can play Ludo?',
                                        a: 'You can play Ludo with 2, 3, or 4 players. The classic experience is with 4 players, but 2-player games are just as fun!'
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
                title="Your Poker Nickname"
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        placeholder="e.g., AcePlayer7"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        error={error}
                        autoFocus
                    />
                    <Button onClick={handleLogin} loading={isLoading} className="w-full">
                        Enter Lobby
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
                        placeholder="Table Code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                        error={error}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono"
                        autoFocus
                    />
                    <Button onClick={handleJoinRoom} loading={isLoading} className="w-full">
                        Sit Down
                    </Button>
                </div>
            </Modal>
        </div>
    );
}