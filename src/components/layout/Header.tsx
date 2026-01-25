'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGuest } from '@/hooks/useGuest';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '../auth/LoginModal';
import { motion } from 'framer-motion';
import { Gift, Sparkles, LogIn } from 'lucide-react';

function SurpriseBox() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -2 }}
            className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-2xl bg-surface/30 backdrop-blur-md border border-primary/20 hover:border-primary/40 transition-all cursor-pointer group relative overflow-hidden mr-4"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="flex items-center justify-center w-9 h-9 rounded-xl text-primary group-hover:bg-primary/20 transition-colors">
                <Gift size={24} className="group-hover:rotate-12 transition-transform" />
            </div>

            <div className="flex flex-col pr-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/80 leading-none">Special Offer</span>
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                </div>
                <span className="text-xs font-bold text-foreground leading-none select-none">
                    Claim 50 Welcome Points
                </span>
            </div>

            <Sparkles size={12} className="text-primary/40 absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
}

export default function Header() {
    const { guest, logout: guestLogout } = useGuest();
    const { user, logout: userLogout } = useAuth();
    const pathname = usePathname();
    const isHome = pathname === '/';
    const [scrolled, setScrolled] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Initial check for auth modal triggers
    useEffect(() => {
        // If needed in future
    }, []);

    const logout = () => {
        if (user) userLogout();
        if (guest) guestLogout();
    };

    const setUserLogout = () => {
        // If guest wants to exit guest mode, we just clear guest session
        guestLogout();
    }

    useEffect(() => {
        const handleScroll = () => {
            // Increase threshold to 50 for a more "hero focused" initial state
            setScrolled(window.scrollY > 50);
        };
        // Check on mount (in case user reloads halfway down)
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // "Spawn" effect logic:
    // Initial: Fixed, Transparent, Larger Padding, No Border (Blends with Hero)
    // Scrolled: Fixed, Glassy Background, Smaller Padding, Border (Spawns as a Bar)

    // We only use the transparent blend logic on the Home page.
    const isTransparent = isHome && !scrolled;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isTransparent
                ? 'bg-transparent border-transparent py-6 translate-y-0'
                : 'bg-background/80 backdrop-blur-xl border-b border-border/40 py-3 shadow-md supports-[backdrop-filter]:bg-background/60'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo Section */}
                    <div className={`flex items-center gap-2 transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-foreground'}`}>
                        <Link href="/" className="transition-opacity hover:opacity-90">
                            <Logo />
                        </Link>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle - Only on homepage */}
                        {isHome && <ThemeToggle />}

                        {isHome && <div className={`h-6 w-px transition-colors duration-300 ${isTransparent ? 'bg-white/20' : 'bg-border'}`} aria-hidden="true" />}

                        {/* Auth Section */}
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className={`text-sm font-medium transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-foreground'}`}>
                                        {user.username}
                                    </span>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 flex items-center gap-1 ${isTransparent ? 'text-yellow-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                        <span>🪙</span> {user.points} PTS
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    className={`group relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${isTransparent
                                        ? 'border-white/20 bg-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 text-white'
                                        : 'border-border bg-surface hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:border-red-900 text-foreground'
                                        }`}
                                    title="Logout"
                                >
                                    <svg
                                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        ) : guest ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className={`text-sm font-medium transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-foreground'}`}>
                                        {guest.username}
                                    </span>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 ${isTransparent ? 'text-white/60' : 'text-muted-foreground'}`}>
                                        Guest
                                    </span>
                                </div>
                                <button
                                    onClick={() => setUserLogout()}
                                    className={`group relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${isTransparent
                                        ? 'border-white/20 bg-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 text-white'
                                        : 'border-border bg-surface hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:border-red-900 text-foreground'
                                        }`}
                                    title="Exit Guest Mode"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                </button>
                                <SurpriseBox />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowLoginModal(true)}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow cursor-pointer relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                    <LogIn size={16} />
                                    <span className="relative z-10">Sign In</span>
                                </motion.button>
                            </div>
                        ) : (
                            <>
                                <SurpriseBox />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowLoginModal(true)}
                                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow cursor-pointer relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                    <LogIn size={16} />
                                    <span className="relative z-10">Login / Sign Up</span>
                                </motion.button>
                            </>
                        )}
                        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
                    </div>
                </div>
            </div>
        </header>
    );
}
