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

export default function SudokuPage() {
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
            const res = await roomApi.create(sid, 'sudoku');
            if (res.success && res.data) {
                router.push(`/games/sudoku/${res.data.code}`);
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
                router.push(`/games/sudoku/${res.data.code}`);
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
                            Sudoku
                        </h1>
                        <p className="text-[var(--text-muted)] max-w-md mx-auto">
                            The classic logic-based number placement puzzle. Challenge yourself or race against friends!
                        </p>
                    </div>

                    {/* Action Cards */}
                    <div className="flex justify-center max-w-2xl mx-auto">
                        <Card className="p-8 text-center w-full max-w-md">
                            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">🔢</span>
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">New Game</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">Start a fresh Sudoku puzzle</p>
                            <Button
                                onClick={() => handleCreateRoom()}
                                loading={isLoading && pendingAction === 'create'}
                                className="w-full"
                            >
                                Start Game
                            </Button>
                        </Card>
                    </div>

                    {/* Rules */}
                    <div className="mt-16 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6 text-center">How to Play</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: '🔢', text: 'Fill grid with numbers 1-9' },
                                { icon: '🚫', text: 'No duplicates in any row, column, or box' },
                                { icon: '🧠', text: 'Use logic to deduce missing numbers' },
                                { icon: '⚡', text: 'Challenge yourself with time limits!' },
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
                            Why Play Sudoku Online at VersusArenas?
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-6 mb-10">
                            {[
                                { icon: '🆓', title: 'Completely Free', desc: 'No hidden charges, no premium subscriptions. Play unlimited puzzles for free.' },
                                { icon: '📱', title: 'Any Device', desc: 'Works on mobile, tablet, and desktop. No app download required.' },
                                { icon: '⚡', title: 'Challenge Mode', desc: 'Test your skills with our timer-based Challenge Mode and strict mistake limits.' },
                                { icon: '🔒', title: 'Progress Saving', desc: 'Your current game state is saved automatically if you disconnect.' },
                                { icon: '🎨', title: 'Clean Design', desc: 'Distraction-free interface with Dark Mode support for late-night solving.' },
                                { icon: '🚀', title: 'No Sign-up', desc: 'Start playing instantly. Just enter a name and go.' },
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
                                        q: 'How do I play Sudoku?',
                                        a: 'Fill the 9x9 grid with digits so that each column, each row, and each of the nine 3x3 sub-grids that compose the grid contain all of the digits from 1 to 9.'
                                    },
                                    {
                                        q: 'Is this Sudoku game free?',
                                        a: 'Yes! VersusArenas Sudoku is completely free to play with no ads interrupting your gameplay.'
                                    },
                                    {
                                        q: 'What is Challenge Mode?',
                                        a: 'Challenge Mode adds a timer and a strict 3-mistake limit to the game, adding extra pressure for experienced players.'
                                    },
                                    {
                                        q: 'Can I play on mobile?',
                                        a: 'Absolutely! Our Sudoku is optimized for mobile play with touch-friendly controls.'
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
