'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import {
    Mail,
    ArrowRight,
    Globe,
    ShieldCheck,
    Zap,
    Heart,
    Headset
} from 'lucide-react';
import { FaTwitter, FaDiscord, FaGithub } from 'react-icons/fa';

const FOOTER_LINKS = {
    Games: [
        { name: 'Ludo Classic', href: '/games/ludo' },
        { name: 'Snake & Ladder', href: '/games/snake-ladder' },
        { name: 'Tic Tac Toe', href: '/games/tictactoe' },
        { name: 'Monopoly', href: '/games/monopoly' },
        { name: 'Chess Arena', href: '/games/chess' },
    ],
    Platform: [
        { name: 'About Us', href: '/about' },
        { name: 'Features', href: '/#features' },
        { name: 'Leaderboard', href: '#' },
        { name: 'Community', href: '#' },
    ],
    Support: [
        { name: 'Help Center', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Privacy Policy', href: '#' },
        { name: 'Cookie Policy', href: '#' },
    ]
};

const SOCIALS = [
    { icon: FaTwitter, href: '#', label: 'Twitter', color: 'hover:text-[#1DA1F2]' },
    { icon: FaDiscord, href: '#', label: 'Discord', color: 'hover:text-[#5865F2]' },
    { icon: FaGithub, href: '#', label: 'Github', color: 'hover:text-foreground' },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-background border-t border-border/40 pt-24 pb-12 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* CTA / Newsletter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 lg:p-12 rounded-[2.5rem] bg-surface/40 backdrop-blur-xl border border-border/50 shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />

                    <div className="relative">
                        <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                            Ready to dominate the <span className="text-primary tracking-tight">Arena</span>?
                        </h2>
                        <p className="text-text-muted text-lg max-w-md leading-relaxed">
                            Join over 50k+ players worldwide. No downloads, zero lag, just pure competitive fun.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-6 py-4 rounded-2xl bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-foreground placeholder:text-text-muted/50 backdrop-blur-sm"
                            />
                            <button className="px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/25 hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center justify-center gap-3 group/btn">
                                Join Now
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mt-4 ml-2 text-[11px] font-medium text-text-muted/70 uppercase tracking-widest">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Secure & Encrypted Arena Access
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
                    {/* Brand Info */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-4">
                        <Link href="/" className="inline-block mb-8 group">
                            <Logo />
                        </Link>
                        <p className="text-text-muted text-base leading-relaxed mb-10 max-w-sm">
                            The next generation of cross-platform multiplayer gaming. Built for speed, designed for fun, and crafted for the community.
                        </p>
                        <div className="flex gap-4">
                            {SOCIALS.map(({ icon: Icon, href, label, color }) => (
                                <motion.a
                                    key={label}
                                    href={href}
                                    whileHover={{ y: -5, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`w-12 h-12 rounded-2xl bg-surface-alt/40 backdrop-blur-md border border-border/50 flex items-center justify-center text-text-muted transition-all duration-300 shadow-sm ${color}`}
                                >
                                    <span className="sr-only">{label}</span>
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Links Groups */}
                    {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                        <div key={title} className="col-span-1 lg:col-span-2">
                            <h4 className="text-foreground font-black text-xs uppercase tracking-[0.2em] mb-8 opacity-90">{title}</h4>
                            <ul className="space-y-4">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-text-muted hover:text-primary transition-all duration-300 flex items-center group gap-0 hover:gap-3"
                                        >
                                            <span className="h-[2px] w-0 bg-primary rounded-full transition-all duration-300 group-hover:w-4" />
                                            <span className="text-[15px] font-medium tracking-tight">{link.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Quick Contact / Region */}
                    <div className="col-span-2 lg:col-span-2">
                        <h4 className="text-foreground font-black text-xs uppercase tracking-[0.2em] mb-8 opacity-90">Arena Support</h4>
                        <div className="space-y-6">
                            <a href="mailto:support@playarena.com" className="group cursor-pointer block">
                                <div className="flex items-center gap-4 text-text-muted">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors shadow-inner">
                                        <Headset className="w-10 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Inquiries</p>
                                        <p className="text-[14px] font-bold text-foreground/80 group-hover:text-primary transition-colors">support@playarena.com</p>
                                    </div>
                                </div>
                            </a>
                            <div className="flex items-center gap-4 text-text-muted">
                                <div className="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center border border-secondary/10 shadow-inner">
                                    <Globe className="w-5 h-5 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Network</p>
                                    <p className="text-[14px] font-bold text-foreground/80">Global Edge Nodes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-border/30 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10 text-text-muted/60 text-sm font-medium">
                        <p>© {currentYear} PlayArena. All rights reserved.</p>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-alt/30 border border-border/20">
                            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                            <span>Crafted with passion for gamers</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-success/5 border border-success/10 text-success text-[11px] font-black uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-success animate-breathe" />
                            Systems Operational
                        </div>
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-accent/5 border border-accent/10 text-accent text-[11px] font-black uppercase tracking-widest">
                            <Zap className="w-3.5 h-3.5 fill-accent/20" />
                            0.8ms Latency
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </footer>
    );
}

