'use client';

import Link from 'next/link';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useGuest } from '@/hooks/useGuest';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect } from 'react';

export default function Header() {
    const { guest, logout } = useGuest();
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`
        fixed top-0 left-0 right-0 z-50 px-4 py-3 transition-all duration-300
        ${scrolled ? 'pt-2' : 'pt-4'}
      `}
        >
            <nav
                className={`
          max-w-7xl mx-auto rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-300
          ${scrolled
                        ? 'bg-[var(--surface)] shadow-md border border-[var(--border)]'
                        : 'bg-transparent'
                    }
        `}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-[var(--dark)] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-xl">P</span>
                    </div>
                    <span className={`text-xl font-bold transition-colors ${scrolled ? 'text-[var(--dark)]' : 'text-[var(--dark)]'}`}>
                        PlayArena
                    </span>
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* User Section */}
                    {guest ? (
                        <div className="flex items-center gap-2">
                            <div className={`
                px-4 py-2 rounded-xl font-medium border
                ${scrolled
                                    ? 'bg-[var(--surface-alt)] border-[var(--border)] text-[var(--text)]'
                                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--dark)] shadow-sm'
                                }
              `}>
                                {guest.username}
                            </div>
                            <button
                                onClick={logout}
                                className={`
                  p-2.5 rounded-xl border hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-colors
                  ${scrolled
                                        ? 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]'
                                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] shadow-sm'
                                    }
                `}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/games/ludo"
                            className="px-6 py-2.5 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            Play Now
                        </Link>
                    )}
                </div>
            </nav>
        </header >
    );
}
