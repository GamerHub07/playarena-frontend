'use client';

import Link from 'next/link';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useGuest } from '@/hooks/useGuest';
import { Logo } from '@/components/ui/Logo';

export default function Header() {
    const { guest, logout } = useGuest();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2">
                        <Link href="/" className="transition-opacity hover:opacity-90">
                            <Logo />
                        </Link>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        <div className="h-6 w-px bg-border" aria-hidden="true" />

                        {guest ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-sm font-medium text-foreground">
                                        {guest.username}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                        Guest
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:border-red-900 transition-all"
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
