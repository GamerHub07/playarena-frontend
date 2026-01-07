import React from 'react';

export const Logo = () => {
    return (
        <div className="flex items-center gap-3 select-none group">
            {/* Logomark */}
            <div className="relative w-10 h-10 flex items-center justify-center">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Main Icon SVG */}
                <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 transform transition-transform duration-500 group-hover:scale-105"
                >
                    <defs>
                        <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="var(--primary)" />
                            <stop offset="100%" stopColor="var(--accent)" />
                        </linearGradient>
                    </defs>

                    {/* Abstract 'V' and 'A' Monogram */}
                    {/* Left Wing / V shape */}
                    <path
                        d="M8 12 L20 34 L32 12"
                        stroke="url(#logo-gradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-100"
                    />

                    {/* Crossbar / A shape - Floating to create negative space */}
                    <path
                        d="M14 23 L26 23"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="text-foreground/90"
                    />

                    {/* Center Diamond / Spark */}
                    <rect
                        x="18"
                        y="8"
                        width="4"
                        height="4"
                        transform="rotate(45 20 10)"
                        fill="var(--secondary)"
                        className="group-hover:animate-pulse"
                    />
                </svg>
            </div>

            {/* Wordmark */}
            <div className="flex flex-col justify-center">
                <div className="grid h-6 items-center overflow-hidden">
                    <span className="col-start-1 row-start-1 text-xl font-bold tracking-tight text-foreground transition-transform duration-300 group-hover:-translate-y-6">
                        Versus
                    </span>
                    <span className="col-start-1 row-start-1 text-xl font-bold tracking-tight text-primary transition-transform duration-300 translate-y-6 group-hover:translate-y-0">
                        Play
                    </span>
                </div>
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    Arena
                </span>
            </div>
        </div>
    );
};
