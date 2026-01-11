'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useRef, useState, useEffect } from 'react';

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
        image: '/games/ludo.png',
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
        image: '/games/business.png',
        href: '/games/monopoly',
        available: true,
        description: 'Build your empire, trade properties, and become the ultimate tycoon.',
    },
    {
        id: 'chess',
        title: 'Chess',
        players: '2 Players',
        image: '/games/chess.png',
        href: '/games/chess',
        available: false,
        description: 'The ultimate game of strategy. Checkmate your opponent in this timeless classic.',
    },
    {
        id: 'poker',
        title: 'Poker',
        players: '2-6 Players',
        image: '/games/poker.png',
        href: '/games/poker',
        available: false,
        description: 'Bluff, bet, and win big in the world\'s most popular card game.',
    }
];

export default function HomePage() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    // Default to unmuted - sound should play immediately
    const [isMuted, setIsMuted] = useState(false);

    const scrollToGames = () => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleSound = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    // Auto-mute when scrolling out of Hero section
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Mute if less than 50% visible (user scrolling away)
                if (entry.intersectionRatio < 0.5 && videoRef.current && !videoRef.current.muted) {
                    videoRef.current.muted = true;
                    setIsMuted(true);
                }
            },
            {
                threshold: [0.5]
            }
        );

        if (heroRef.current) {
            observer.observe(heroRef.current);
        }

        return () => {
            if (heroRef.current) {
                observer.unobserve(heroRef.current);
            }
        };
    }, []);

    // Robust Autoplay Logic: Attempt Unmute -> Fallback to Muted -> Wait for Click
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Function to attempt playing safely
        const attemptPlay = async () => {
            try {
                // Try to play unmuted first
                video.muted = false;
                await video.play();
                setIsMuted(false);
                console.log("Auto-play with sound successful.");
            } catch (err) {
                // If it fails (expected behavior), revert to muted
                console.log("Auto-play with sound prevented. Fallback to muted.");
                video.muted = true;
                setIsMuted(true);
                try {
                    await video.play();
                } catch (e) {
                    console.error("Video playback failed completely", e);
                }
            }
        };

        attemptPlay();

        // Setup interaction listener to unmute if we are currently muted
        const handleInteraction = () => {
            if (video.muted) {
                video.muted = false;
                setIsMuted(false);
                video.play().catch(e => console.log("Interaction play failed", e));
            }
        };

        const events = ['click', 'touchstart', 'keydown'];
        events.forEach(event => window.addEventListener(event, handleInteraction));

        // Note: We don't remove listeners immediately so that if the user pauses/mutes later,
        // we could potentially re-enable? Actually, better to remove them once we succeed?
        // But user might mute manually. 
        // Let's keep it simple: If muted, interaction unmutes.
        // But we should be careful not to override user's manual mute? 
        // Current logic: simple toggle. Interaction always unmutes. 
        // We'll keep listeners for now as per "click to play sound" requirement.

        return () => {
            events.forEach(event => window.removeEventListener(event, handleInteraction));
        };
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            <Header />

            <main>
                {/* Hero Section Container with Video */}
                <section ref={heroRef} className="relative h-[90vh]  flex flex-col items-center justify-center overflow-hidden bg-black">
                    {/* Hero Video Layer */}
                    <div className="absolute inset-0  z-0" suppressHydrationWarning>
                        <video
                            ref={videoRef}
                            autoPlay
                            loop
                            playsInline
                            className="w-full h-full object-cover opacity-60"
                            suppressHydrationWarning
                        >
                            <source src="/loading.mp4" type="video/mp4" />
                        </video>
                        {/* Gradient Overlays for Video */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />
                    </div>

                    {/* Sound Toggle */}
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleSound(); }}
                        className="absolute bottom-8 right-8 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all border border-white/10 group"
                        title={isMuted ? "Unmute Video" : "Mute Video"}
                    >
                        {isMuted ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        ) : (
                            <div className="flex items-center gap-1 h-6">
                                <span className="w-1 h-3 bg-white rounded-full animate-[music_1s_ease-in-out_infinite]" />
                                <span className="w-1 h-5 bg-white rounded-full animate-[music_1.2s_ease-in-out_infinite]" />
                                <span className="w-1 h-2 bg-white rounded-full animate-[music_0.8s_ease-in-out_infinite]" />
                            </div>
                        )}
                    </button>

                    {/* Hero Content */}
                    <div className="relative z-10 px-4 text-center max-w-5xl mx-auto mt-[-4rem]">
                        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-bold text-white shadow-lg cursor-default">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                ONLINE NOW
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 leading-[0.9] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <span className="text-white drop-shadow-lg">
                                NEXT GEN
                            </span>
                            <br />
                            <span className="text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]" style={{
                                textShadow: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
                                WebkitTextStroke: '2px #8B5CF6',
                                color: 'transparent'
                            }}>
                                GAMING
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto font-medium animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            Experience award-winning multiplayer games directly in your browser. No downloads. Just pure fun.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <button
                                onClick={scrollToGames}
                                className="px-10 py-5 bg-white text-black rounded-2xl font-bold text-xl transition-all hover:scale-105 hover:bg-gray-100 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                            >
                                Start Playing
                            </button>

                            <a
                                href="#how-it-works"
                                className="px-10 py-5 rounded-2xl font-bold text-xl text-white border-2 border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all"
                            >
                                How it Works
                            </a>
                        </div>
                    </div>
                </section>

                {/* Games Grid Section */}
                <section id="games" ref={scrollRef} className="py-24 px-4 md:px-6 bg-background">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                            Choose Your Arena
                        </h2>
                        <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
                    </div>

                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {GAMES.map((game) => (
                            <Link
                                key={game.id}
                                href={game.available ? game.href : '#'}
                                className={`
                                    group relative rounded-[2rem] overflow-hidden transition-all duration-300 hover:-translate-y-2
                                    ${!game.available ? 'opacity-80 grayscale-[0.8]' : 'hover:shadow-2xl shadow-card bg-surface'}
                                `}
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <Image
                                        src={game.image}
                                        alt={game.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {!game.available && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="px-4 py-2 bg-black/50 backdrop-blur text-white font-bold rounded-lg border border-white/20">Coming Soon</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{game.title}</h3>
                                        <span className="text-sm font-medium text-text-muted bg-surface-alt px-2 py-1 rounded-md">{game.players}</span>
                                    </div>
                                    <p className="text-text-muted line-clamp-2">{game.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="py-24 bg-surface relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                    <div className="max-w-7xl mx-auto px-4 relative z-10">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-4xl font-bold text-foreground mb-6">Simple as 1-2-3</h2>
                            <p className="text-xl text-text-muted">
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
                                    <div className="bg-background p-8 rounded-3xl border border-border shadow-soft hover:shadow-card transition-all duration-300 h-full relative z-10">
                                        <div className="text-6xl font-black text-surface-alt absolute top-4 right-6 select-none opacity-50 group-hover:opacity-100 transition-opacity">
                                            {item.step}
                                        </div>

                                        <div className="relative z-10 pt-8">
                                            <h3 className="text-2xl font-bold text-foreground mb-4">{item.title}</h3>
                                            <p className="text-text-muted leading-relaxed text-lg">{item.desc}</p>
                                        </div>
                                    </div>
                                    {/* Offset Background Card */}
                                    <div className="absolute inset-0 bg-surface-alt rounded-3xl transform translate-x-2 translate-y-2 -z-0 transition-transform group-hover:translate-x-3 group-hover:translate-y-3" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />

            <style jsx global>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                    opacity: 0;
                }
                @keyframes music {
                    0%, 100% { height: 25%; }
                    50% { height: 100%; }
                }
            `}</style>
        </div>
    );
}
