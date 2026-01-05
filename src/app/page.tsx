'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';

interface Game {
    id: string;
    title: string;
    players: string;
    image: string;
    href: string;
    available: boolean;
    theme: string;
}

const GAMES: Game[] = [
    {
        id: 'ludo',
        title: 'Ludo',
        players: '2-4 Players',
        image: '/games/ludo.png',
        href: '/games/ludo',
        available: true,
        theme: 'bg-blue-500 text-white',
    },
    {
        id: 'snakes',
        title: 'Snakes & Ladders',
        players: '2-4 Players',
        image: '/games/s&l.png',
        href: '/games/snake-ladder',
        available: true,
        theme: 'bg-green-500 text-white',
    },
    {
        id: 'business',
        title: 'Business',
        players: '2-4 Players',
        image: '/games/business.png',
        href: '/games/monopoly',
        available: true,
        theme: 'bg-amber-500 text-white',
    },
    {
        id: 'chess',
        title: 'Chess',
        players: '2 Players',
        image: '/games/chess.png',
        href: '/games/chess',
        available: false,
        theme: 'bg-gray-800 text-white',
    },
];

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[var(--background)] bg-pattern">
            <Header />

            <main className="pt-24 pb-12 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">

                    {/* Hero Grid Layout */}
                    <div className="grid lg:grid-cols-12 gap-6 mb-20">

                        {/* Main Welcome Block (Left, spans 7 cols) */}
                        <div className="lg:col-span-7 flex flex-col justify-center bg-[var(--surface)] p-8 md:p-12 rounded-[2rem] shadow-card border border-[var(--border)] relative overflow-hidden group">
                            {/* Subtle Texture Background */}
                            <div className="absolute inset-0 texture-dots pointer-events-none" />

                            {/* Floating Decorative Elements (More abundant & punchy) */}
                            {/* Dice - Top Right */}
                            <div className="absolute top-8 right-8 text-indigo-500/20 rotate-12 transition-transform duration-700 group-hover:rotate-45 group-hover:scale-110">
                                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 7h2v2H7V7zm10 10h-2v-2h2v2zm0-4h-2v-2h2v2zm-4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm-4 4H7v-2h2v2zm0-4H7v-2h2v2z" /></svg>
                            </div>

                            {/* Controller - Bottom Left */}
                            <div className="absolute -bottom-6 -left-6 text-pink-500/15 -rotate-12 scale-150 transition-transform duration-700 group-hover:-rotate-6 group-hover:scale-175">
                                <svg width="160" height="160" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>
                            </div>

                            {/* Meeple - Top Center */}
                            <div className="absolute top-12 left-1/2 text-orange-400/20 -translate-x-1/2 -translate-y-1/2 rotate-180">
                                <svg width="90" height="90" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                            </div>

                            {/* Puzzle Piece - Middle Right */}
                            <div className="absolute top-1/2 right-0 text-emerald-400/20 translate-x-1/2 -translate-y-1/2">
                                <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2v2c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V21h4c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z" /></svg>
                            </div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--surface-alt)] rounded-full mb-6 w-fit border border-[var(--border)]">
                                    <span className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse" />
                                    <span className="text-sm font-bold text-[var(--text-muted)] tracking-wide uppercase">Online Now</span>
                                </div>

                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--dark)] mb-6 leading-[0.95] tracking-tight">
                                    Play Games. <br />
                                    <span className="text-[var(--primary)] relative inline-block">
                                        Together.
                                        <svg className="absolute w-full h-3 -bottom-1 left-0 text-[var(--secondary)] opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                        </svg>
                                    </span>
                                </h1>

                                <p className="text-xl text-[var(--text-muted)] mb-8 max-w-lg leading-relaxed font-medium">
                                    Join the arena. No downloads, no signups. Just pure multiplayer fun right in your browser.
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        href="/games/ludo"
                                        className="px-8 py-4  text-white text-lg font-bold rounded-xl bg-[var(--secondary)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 group/btn"
                                    >
                                        Play Ludo
                                        <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                    <a
                                        href="#how-it-works"
                                        className="px-8 py-4 bg-[var(--surface-alt)] text-[var(--text)] text-lg font-bold rounded-xl hover:bg-[var(--border)] transition-colors border border-transparent hover:border-[var(--border)]"
                                    >
                                        How it Works
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Game Tiles (Right, spans 5 cols, Grid) */}
                        <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-full">
                            {GAMES.map((game, i) => (
                                <Link
                                    key={game.id}
                                    href={game.available ? game.href : '#'}
                                    className={`
                    relative group rounded-3xl overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
                    ${i === 0 ? 'col-span-2 row-span-2 aspect-[4/3]' : 'col-span-1 aspect-square'}
                    ${!game.available ? 'opacity-90 grayscale-[0.5] hover:grayscale-0' : ''}
                  `}
                                >
                                    {/* Image Background */}
                                    <div className="absolute inset-0 bg-[var(--surface-alt)]">
                                        <Image
                                            src={game.image}
                                            alt={game.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <h3 className="text-white text-xl font-bold drop-shadow-md">{game.title}</h3>
                                                <p className="text-white/90 text-sm font-medium">{game.players}</p>
                                            </div>
                                            {game.available ? (
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 shadow-lg">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <span className="px-2 py-1 bg-black/50 rounded-lg text-white/90 text-xs font-bold backdrop-blur-sm border border-white/20">
                                                    Soon
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* "More" Tile */}
                            <div className="col-span-1 aspect-square rounded-3xl bg-[var(--surface)] border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all cursor-pointer group hover:bg-[var(--surface-alt)]">
                                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform duration-300">+</span>
                                <span className="font-bold text-sm">More Games</span>
                            </div>
                        </div>
                    </div>


                    {/* How It Works Section */}
                    <section id="how-it-works" className="py-12">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-4xl font-bold text-[var(--dark)] mb-4">Simple as 1-2-3</h2>
                            <p className="text-lg text-[var(--text-muted)]">
                                We removed all the friction. You are just seconds away from playing with your friends.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: 'Pick a Name',
                                    desc: 'Choose any username you like. No passwords to remember.',
                                    step: '01'
                                },
                                {
                                    title: 'Create Room',
                                    desc: 'Get a unique room code to share with your friends.',
                                    step: '02'
                                },
                                {
                                    title: 'Start Playing',
                                    desc: 'Wait for them to join and let the games begin!',
                                    step: '03'
                                },
                            ].map((item, i) => (
                                <div key={i} className="relative group">
                                    <div className="bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-soft hover:shadow-card transition-all duration-300 relative z-10 h-full overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--surface-alt)] rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                                        <div className="text-4xl font-bold text-[var(--text-muted)]/20 absolute top-4 right-4 z-0">
                                            {item.step}
                                        </div>

                                        <div className="relative z-10 pt-4">
                                            <h3 className="text-2xl font-bold text-[var(--dark)] mb-3">{item.title}</h3>
                                            <p className="text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>


                </div>
            </main>

            {/* Simple Footer */}
            <footer className="py-12 text-center text-[var(--text-muted)] border-t border-[var(--border)] mt-12 bg-[var(--surface)]">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                </div>
                <p className="mb-2 font-medium">© {new Date().getFullYear()} VersusArenas</p>
                <p className="text-sm">Made for gamers, by gamers.</p>
            </footer>
        </div>
    );
}
