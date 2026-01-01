'use client';

import Link from 'next/link';
import { useGuest } from '@/hooks/useGuest';
import { useTheme } from '@/hooks/useTheme';
import Logo from '@/components/ui/Logo';
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
                <Link href="/" className="flex items-center">
                    <Logo size="md" />
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`
              p-2.5 rounded-xl border transition-colors
              ${scrolled
                                ? 'bg-[var(--surface-alt)] border-[var(--border)] text-[var(--text)]'
                                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--dark)] shadow-sm'
                            }
            `}
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                            </svg>
                        )}
                    </button>

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
                  p-2.5 rounded-xl border hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-colors
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
                            className="px-6 py-2.5 bg-[#FBBF24] text-gray-900 font-bold rounded-xl hover:scale-[1.03] hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98] transition-all duration-200"
                        >
                            Play Now
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}
