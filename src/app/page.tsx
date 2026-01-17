'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { HeroBackground } from '@/components/landing/HeroBackground';

interface Game {
    id: string;
    title: string;
    players: string;
    image: string;
    href: string;
    available: boolean;
    description: string;
}

const GAMES: Game[] = [
    {
        id: 'ludo',
        title: 'Ludo',
        players: '2-4 Players',
        image: '/games/ludo3.png',
        href: '/games/ludo',
        available: true,
        description: 'The classic game of strategy and luck. Roll the dice and race your tokens home.',
    },
    {
        id: 'snakes',
        title: 'Snakes & Ladders',
        players: '2-4 Players',
        image: '/games/s&l.png',
        href: '/games/snake-ladder',
        available: true,
        description: 'Climb the ladders and avoid the snakes in this exciting race to the top.',
    },
    {
        id: 'business',
        title: 'Business',
        players: '2-4 Players',
        image: '/games/business2.png',
        href: '/games/monopoly',
        available: true,
        description: 'Build your empire, trade properties, and become the ultimate tycoon.',
    },
    {
        id: 'poker',
        title: 'Poker',
        players: '2-6 Players',
        image: '/games/poker1.png',
        href: '/games/poker',
        available: true,
        description: 'Bluff, bet, and win big in the world\'s most popular card game.',
    },
    {
        id: 'chess',
        title: 'Chess',
        players: '2 Players',
        image: '/games/chess2.png',
        href: '/games/chess',
        available: false,
        description: 'The ultimate game of strategy. Checkmate your opponent in this timeless classic.',
    },

];

export default function HomePage() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [games, setGames] = useState<Game[]>(GAMES);

    const scrollToGames = () => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setGames((currentGames: Game[]) => {
                // Move first game to the end
                const newGames = [...currentGames];
                const firstGame = newGames.shift();
                if (firstGame) newGames.push(firstGame);
                return newGames;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <section ref={containerRef} className="relative min-h-[95vh] flex items-start pt-32 md:pt-40 pb-32 overflow-hidden bg-background">
                    {/* Animated Gaming Background */}
                    <HeroBackground />

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8  grid lg:grid-cols-2 gap-8 lg:gap-16 items-center h-full relative z-10">

                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-start text-left z-10 lg:pl-35 self-start"
                        >
                            {/* <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-foreground/5 border border-foreground/10 text-sm font-bold tracking-wide uppercase"
                            >
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
                                Online Multiplayer
                            </motion.div> */}

                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-6 text-foreground">
                                <span className="block overflow-hidden">
                                    <motion.span
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                                        className="block"
                                    >
                                        NEXT
                                    </motion.span>
                                </span>
                                <span className="block overflow-hidden text-primary/80">
                                    <motion.span
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                        className="block"
                                    >
                                        LEVEL
                                    </motion.span>
                                </span>
                                <span className="block overflow-hidden">
                                    <motion.span
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                                        className="block"
                                    >
                                        GAMING
                                    </motion.span>
                                </span>
                            </h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-base md:text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed"
                            >
                                Step into the arena. Experience award-winning classic board games reimagined for the modern web. Completely free, no downloads required.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="flex flex-wrap gap-4"
                            >
                                <button
                                    onClick={scrollToGames}
                                    className="px-6 py-3 bg-foreground text-background rounded-xl font-bold text-base transition-transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
                                >
                                    Start Playing
                                </button>
                                <a
                                    href="#how-it-works"
                                    className="px-6 py-3 bg-transparent border-2 border-foreground/10 text-foreground rounded-xl font-bold text-base transition-colors hover:bg-foreground/5 hover:border-foreground/30"
                                >
                                    How it Works
                                </a>
                            </motion.div>
                        </motion.div>

                        {/* Right Visuals - 3D Card Composition */}
                        <div className="relative h-[400px] md:h-[450px] lg:h-[500px] w-full hidden md:flex items-center justify-center perspective-1000">
                            {/* Floating Elements Background */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10"
                            >
                                <div className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-foreground/20 rounded-full border-dashed" />
                                <div className="absolute bottom-1/3 right-1/4 w-48 h-48 border-2 border-primary/20 rounded-full" />
                            </motion.div>

                            {/* Cards Stack */}
                            <div className="relative z-10 w-full max-w-xs md:max-w-sm aspect-[3/4]">
                                {games.map((game, index) => {
                                    // Only show top 3 prominently, others hidden/back
                                    const isVisible = index < 3;
                                    return (
                                        <motion.div
                                            key={game.id}
                                            layoutId={game.id}
                                            animate={{
                                                opacity: isVisible ? 1 : 0,
                                                x: isVisible ? index * 40 - 40 : 0,
                                                y: isVisible ? index * 40 - 40 : 50,
                                                scale: isVisible ? 1 - index * 0.05 : 0.8,
                                                zIndex: 10 - index,
                                                rotateY: isVisible ? -15 + (index * 5) : 0
                                            }}
                                            transition={{
                                                duration: 0.8,
                                                ease: [0.16, 1, 0.3, 1]
                                            }}
                                            className="absolute inset-0 rounded-3xl p-2 bg-surface shadow-2xl border border-border cursor-pointer group"
                                            style={{
                                                transformOrigin: "center center",
                                                display: index > 3 ? 'none' : 'block' // Optimization: completely hide ones far back
                                            }}
                                        >
                                            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-background">
                                                <Link href={game.available ? game.href : '#'} className="block w-full h-full relative" draggable={false}>
                                                    <Image
                                                        src={game.image}
                                                        alt={game.title}
                                                        fill
                                                        className="object-cover"
                                                        draggable={false}
                                                    />
                                                    {/* Minimal Overlay */}
                                                    <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                                        <h3 className="text-white text-2xl font-bold">{game.title}</h3>
                                                        <p className="text-white/80 text-sm mt-1">{game.players}</p>
                                                    </div>
                                                </Link>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2, duration: 1 }}
                        className="absolute bottom-25 left-1/2 -translate-x-1/2 z-20 cursor-pointer hidden md:flex flex-col items-center gap-2 group"
                        onClick={scrollToGames}
                    >
                        <span className="text-xs uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary/80 transition-colors">Scroll to Explore</span>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center p-1 group-hover:border-primary/50 transition-colors"
                        >
                            <motion.div className="w-1 h-2 bg-muted-foreground/50 rounded-full group-hover:bg-primary transition-colors" />
                        </motion.div>
                    </motion.div>
                </section>

                {/* Games Grid Section (Cleaned up) */}
                <section id="games" ref={scrollRef} className="py-16 md:py-24 px-4 bg-surface/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                            <div className="max-w-xl">
                                <h2 className="text-4xl md:text-5xl font-black mb-4 text-foreground tracking-tight">
                                    CHOOSE YOUR <span className="text-primary/80">ARENA</span>
                                </h2>
                                <p className="text-muted-foreground text-lg">
                                    Select a game to start playing instantly with friends.
                                </p>
                            </div>
                            <div className="h-px bg-border flex-grow ml-8 hidden md:block" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {GAMES.map((game, i) => (
                                <Link
                                    key={game.id}
                                    href={game.available ? game.href : '#'}
                                    className="block h-full"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`
                                            group relative rounded-[1.5rem] overflow-hidden 
                                            ${!game.available ? 'opacity-70' : 'hover:shadow-2xl shadow-lg'}
                                            bg-background dark:bg-zinc-900/50
                                            aspect-[9/8] w-full mx-auto
                                            transition-all duration-300
                                        `}
                                    >
                                        <Image
                                            src={game.image}
                                            alt={game.title}
                                            fill
                                            className={`object-cover transition-none ${!game.available ? 'grayscale' : ''}`}
                                        />

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-8">
                                            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <h3 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-md">{game.title}</h3>

                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider">
                                                        {game.players}
                                                    </span>
                                                </div>

                                                <p className="text-white/90 text-sm leading-relaxed line-clamp-3 drop-shadow-sm">
                                                    {game.description}
                                                </p>
                                            </div>
                                        </div>

                                        {!game.available && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] z-20">
                                                <span className="px-5 py-2.5 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 tracking-wider text-sm shadow-xl">COMING SOON</span>
                                            </div>
                                        )}
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section (Simplified) */}
                <section id="how-it-works" className="py-20 md:py-32 bg-background relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center max-w-3xl mx-auto mb-20"
                        >
                            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">SIMPLE AS 1-2-3</h2>
                            <p className="text-xl text-muted-foreground">
                                No registration. No download. Just share a link and play.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: 'Pick a Name', desc: 'Choose any username. No passwords needed.', step: '01' },
                                { title: 'Create Room', desc: 'Get a unique code to share with friends.', step: '02' },
                                { title: 'Start Playing', desc: 'Wait for them to join and let the fun begin!', step: '03' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -10 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2 }}
                                    className="bg-surface p-10 rounded-3xl border border-border relative overflow-hidden group hover:border-primary/30 transition-colors"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-8xl text-foreground select-none group-hover:opacity-20 transition-opacity">
                                        {item.step}
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-4 relative z-10">{item.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed relative z-10">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
