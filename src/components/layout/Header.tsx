'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGuest } from '@/hooks/useGuest';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useEffect, useState } from 'react';

export default function Header() {
    const { guest, logout } = useGuest();
    const pathname = usePathname();
    const isHome = pathname === '/';
    const [scrolled, setScrolled] = useState(false);

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
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        <div className={`h-6 w-px transition-colors duration-300 ${isTransparent ? 'bg-white/20' : 'bg-border'}`} aria-hidden="true" />

                        {guest ? (
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
                                    onClick={logout}
                                    className={`group relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${isTransparent
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
                        ) : (
                            <Link
                                href="/games/ludo"
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                Play Now
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
