'use client';

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

export default function TicTacToePage() {
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
            const res = await roomApi.create(sid, 'tictactoe');
            if (res.success && res.data) {
                router.push(`/games/tictactoe/${res.data.code}`);
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
                router.push(`/games/tictactoe/${res.data.code}`);
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
                        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">Tic Tac Toe</h1>
                        <p className="text-[var(--text-muted)] max-w-md mx-auto">
                            The classic game of X and O. Challenge your friends to a quick match and see who has the best strategy!
                        </p>
                    </div>

                    {/* Action Cards */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Card className="p-8 text-center">
                            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">❌</span>
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Create Room</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">Start a new game and invite your friends</p>
                            <Button
                                onClick={() => handleCreateRoom()}
                                loading={isLoading && pendingAction === 'create'}
                                className="w-full"
                            >
                                Create Room
                            </Button>
                        </Card>

                        <Card className="p-8 text-center">
                            <div className="w-16 h-16 bg-[var(--success)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">⭕</span>
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Join Room</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">Enter a room code to join an existing game</p>
                            <Button
                                variant="secondary"
                                onClick={openJoinModal}
                                className="w-full"
                            >
                                Join Room
                            </Button>
                        </Card>
                    </div>

                    {/* Rules */}
                    <div className="mt-16 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold text-[var(--text)] mb-6 text-center">How to Play</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: '❌', text: 'Place X or O on the 3x3 grid' },
                                { icon: '🔄', text: 'Take turns with your opponent' },
                                { icon: '📏', text: 'Get 3 of your marks in a row' },
                                { icon: '🏆', text: 'Win horizontally, vertically, or diagonally' },
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
                            Why Play Tic Tac Toe Online?
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-6 mb-10">
                            {[
                                { icon: '⚡', title: 'Instant Fun', desc: 'Games are quick and exciting, perfect for short breaks.' },
                                { icon: '🧠', title: 'Brain Teaser', desc: 'Simple rules but requires strategy to master.' },
                                { icon: '🆓', title: 'Completely Free', desc: 'Play unlimited matches without any cost.' },
                                { icon: '📱', title: 'Mobile Friendly', desc: 'Play smoothly on any device, anywhere.' },
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
                                        q: 'Is this Tic Tac Toe game free?',
                                        a: 'Yes, playing Tic Tac Toe on VersusArenas is 100% free and requires no downloads.'
                                    },
                                    {
                                        q: 'Can I play with a friend?',
                                        a: 'Yes! Create a room and share the code with your friend to play together online.'
                                    },
                                    {
                                        q: 'Do I need to register?',
                                        a: 'No registration is required. You can play as a guest immediately.'
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
                title="Join Room"
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
                        Join Game
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
