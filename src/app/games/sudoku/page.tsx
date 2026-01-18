'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useGuest } from '@/hooks/useGuest';
import { roomApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Loader2 } from 'lucide-react';

export default function SudokuLobby() {
    const router = useRouter();
    const { guest, loading, login } = useGuest();
    const [isCreating, setIsCreating] = useState(false);
    const [username, setUsername] = useState('');

    const handleCreateGame = async () => {
        setIsCreating(true);

        let currentGuest = guest;

        // If no guest session, create one
        if (!currentGuest) {
            if (!username.trim()) {
                setIsCreating(false);
                return;
            }
            currentGuest = await login(username);
            if (!currentGuest) {
                console.error('Failed to create guest session');
                setIsCreating(false);
                return;
            }
        }

        try {
            // Create a room specifically for sudoku
            const response = await roomApi.create(currentGuest.sessionId, 'sudoku');
            if (response.success && response.data) {
                router.push(`/games/sudoku/${response.data.code}`);
            } else {
                console.error('Failed to create game:', response.message);
                setIsCreating(false);
            }
        } catch (error) {
            console.error('Failed to create game:', error);
            setIsCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Header />

            <main className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Sudoku</h1>
                        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                            Classic board game. Fill the grid with numbers so each row, column, and box contains all digits.
                        </p>
                    </div>

                    {/* Action Card */}
                    <div className="max-w-md mx-auto mb-20">
                        <Card className="p-8 text-center space-y-6">
                            <div className="space-y-4">
                                {!guest && (
                                    <div className="text-left">
                                        <Input
                                            placeholder="Enter your name"
                                            value={username}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                            className="mb-2"
                                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && username.trim() && handleCreateGame()}
                                        />
                                    </div>
                                )}

                                <Button
                                    size="lg"
                                    className="w-full text-lg h-14"
                                    onClick={handleCreateGame}
                                    disabled={isCreating || (!guest && !username.trim())}
                                >
                                    {isCreating ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {guest ? 'Creating...' : 'Joining...'}</>
                                    ) : (
                                        guest ? 'Start New Game' : 'Start Playing'
                                    )}
                                </Button>

                                <p className="text-xs text-zinc-400">
                                    Single Player & Challenge Modes available
                                </p>
                            </div>
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
