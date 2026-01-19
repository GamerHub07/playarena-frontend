'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useGuest } from '@/hooks/useGuest';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Loader2 } from 'lucide-react';

export default function MemoryLobby() {
    const router = useRouter();
    const { guest, loading, login } = useGuest();
    const [isCreating, setIsCreating] = useState(false);
    const [username, setUsername] = useState('');

    const handleCreateGame = async () => {
        setIsCreating(true);
        // For single-player, navigate directly to the play page
        router.push('/games/memory/play');
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
                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Memory Flip</h1>
                        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                            Test your memory! Flip cards to find matching pairs and clear the board.
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
                                    Train your brain and beat your best score!
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Rules */}
                    <div className="mt-16 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6 text-center">How to Play</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: '🃏', text: 'Tap a card to flip it over' },
                                { icon: '👀', text: 'Find the matching card to clear the pair' },
                                { icon: '🧠', text: 'Remember positions of cards you see' },
                                { icon: '🏆', text: 'Clear the board in fewest moves possible' },
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
                            Why Play Memory Flip Online?
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-6 mb-10">
                            {[
                                { icon: '🆓', title: 'Completely Free', desc: 'No hidden charges. Play unlimited games for free.' },
                                { icon: '📱', title: 'Any Device', desc: 'Smooth 3D animations on mobile, tablet, and desktop.' },
                                { icon: '🧠', title: 'Brain Training', desc: 'Improve your concentration and visual memory skills.' },
                                { icon: '⚡', title: 'Instant Play', desc: 'No loading screens, no forced ads, just pure gameplay.' },
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
                                        q: 'How do I play Memory Flip?',
                                        a: 'Tap any card to reveal it. Then tap another card. If they match, they stay face up. If not, they flip back over. Repeat until all pairs are found!'
                                    },
                                    {
                                        q: 'Is this game free?',
                                        a: 'Yes, Memory Flip is 100% free to play.'
                                    },
                                    {
                                        q: 'Does it save my score?',
                                        a: 'Currently, the game tracks your moves for the current session.'
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
