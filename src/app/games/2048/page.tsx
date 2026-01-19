'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useGuest } from '@/hooks/useGuest';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Loader2 } from 'lucide-react';

export default function Lobby2048() {
    const router = useRouter();
    const { guest, loading, login } = useGuest();
    const [isCreating, setIsCreating] = useState(false);
    const [username, setUsername] = useState('');

    const handleCreateGame = async () => {
        setIsCreating(true);
        // For single-player, navigate directly to the play page
        router.push('/games/2048/play');
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
                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">2048</h1>
                        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                            Join the numbers and get to the 2048 tile! A classic sliding tile puzzle game.
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
                                        guest ? 'Play Now' : 'Start Playing'
                                    )}
                                </Button>

                                <p className="text-xs text-zinc-400">
                                    Reach 2048 to win. Can you go even higher?
                                </p>
                            </div>
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
