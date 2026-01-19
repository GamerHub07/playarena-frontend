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

export default function Game2048Page() {
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
            const res = await roomApi.create(sid, '2048');
            if (res.success && res.data) {
                router.push(`/games/2048/${res.data.code}`);
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
                router.push(`/games/2048/${res.data.code}`);
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
                            2048
                        </h1>
                        <p className="text-[var(--text-muted)] max-w-md mx-auto">
                            Join the numbers and reach the 2048 tile! A classic sliding tile puzzle game.
                        </p>
                    </div>

                    {/* Action Cards */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Card className="p-8 text-center">
                            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">🧩</span>
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">New Game</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">Start a fresh 2048 puzzle match</p>
                            <Button
                                onClick={() => handleCreateRoom()}
                                loading={isLoading && pendingAction === 'create'}
                                className="w-full"
                            >
                                Start Game
                            </Button>
                        </Card>

                        <Card className="p-8 text-center">
                            <div className="w-16 h-16 bg-[var(--success)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">⚔️</span>
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Join Battle</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">Enter code to join a 2048 battle</p>
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
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6 text-center">How to Play</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: '↔️', text: 'Use arrow keys or swipe to move tiles' },
                                { icon: '➕', text: 'Tiles with the same number merge into one' },
                                { icon: '🎯', text: 'Reach the 2048 tile to win the game' },
                                { icon: '🧱', text: 'Keep grid from filling up to survive' },
                            ].map((rule, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
                                    <span className="text-2xl">{rule.icon}</span>
                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{rule.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SEO Content Section */}
                    <section className="mt-20 max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 text-center">
                            Why Play 2048 Online at VersusArenas?
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-6 mb-10">
                            {[
                                { icon: '🆓', title: 'Completely Free', desc: 'No hidden charges. Play unlimited games for free.' },
                                { icon: '📱', title: 'Any Device', desc: 'Works on mobile, tablet, and desktop with smooth animations.' },
                                { icon: '💾', title: 'Auto-Save', desc: 'Your game progress is saved automatically if you close the tab.' },
                                { icon: '🌙', title: 'Dark Mode', desc: 'Easy on the eyes with full Dark Mode support.' },
                                { icon: '⚡', title: 'Instant Play', desc: 'No loading screens, no forced ads, just pure gameplay.' },
                                { icon: '🚀', title: 'No Sign-up', desc: 'Start playing instantly without creating an account.' },
                            ].map((feature, i) => (
                                <div key={i} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">{feature.icon}</span>
                                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{feature.title}</h3>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* FAQ Section */}
                        <div className="mt-12">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 text-center">
                                Frequently Asked Questions
                            </h2>
                            <div className="space-y-4">
                                {[
                                    {
                                        q: 'How do I play 2048?',
                                        a: 'Swipe (Up, Down, Left, Right) to move all tiles. When two tiles with the same number touch, they merge into one! Join the numbers and get to the 2048 tile.'
                                    },
                                    {
                                        q: 'Is this game free?',
                                        a: 'Yes, VersusArenas 2048 is 100% free to play.'
                                    },
                                    {
                                        q: 'What happens after 2048?',
                                        a: 'You can keep playing to reach 4096, 8192, and beyond to achieve a high score!'
                                    },
                                    {
                                        q: 'Can I undo a move?',
                                        a: 'Currently, we follow the classic strict rules where moves cannot be undone. Think carefully!'
                                    },
                                ].map((faq, i) => (
                                    <details key={i} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg group">
                                        <summary className="font-medium text-zinc-900 dark:text-zinc-50 cursor-pointer list-none flex justify-between items-center">
                                            {faq.q}
                                            <span className="text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
