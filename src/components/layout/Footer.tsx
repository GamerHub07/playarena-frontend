'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function Footer() {
    return (
        <footer className="bg-surface border-t border-border pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="inline-block mb-6">
                            <Logo />
                        </Link>
                        <p className="text-text-muted text-lg max-w-sm mb-6">
                            The next generation of browser-based multiplayer gaming. Zero friction, maximum fun.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons Placeholder */}
                            {['twitter', 'discord', 'github'].map((social) => (
                                <a key={social} href="#" className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all">
                                    <span className="sr-only">{social}</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Column */}
                    <div>
                        <h4 className="font-bold text-foreground mb-6">Platform</h4>
                        <ul className="space-y-4">
                            <li><Link href="/games/ludo" className="text-text-muted hover:text-primary transition-colors">Play Ludo</Link></li>
                            <li><Link href="/games/snake-ladder" className="text-text-muted hover:text-primary transition-colors">Snakes & Ladders</Link></li>
                            <li><Link href="/about" className="text-text-muted hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/blog" className="text-text-muted hover:text-primary transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h4 className="font-bold text-foreground mb-6">Legal</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-text-muted hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-text-muted hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-text-muted hover:text-primary transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-text-muted text-sm">
                        © {new Date().getFullYear()} PlayArena. All rights reserved.
                    </p>
                    <div className="flex bg-surface-alt rounded-full p-1 border border-border">
                        <div className="px-3 py-1 bg-success rounded-full w-2 h-2 mx-2 self-center animate-pulse"></div>
                        <span className="text-xs font-medium text-text-muted pr-3">All Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
