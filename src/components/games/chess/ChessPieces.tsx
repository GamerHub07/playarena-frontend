"use client";

import React from "react";

export type BoardTheme = "green" | "wood" | "blue" | "purple" | "coral" | "ice" | "neon" | "dark" | "marble" | "forest" | "sunset" | "ocean" | "cherry" | "sand" | "midnight" | "emerald";

interface ChessPieceProps {
    piece: string;
    size?: number;
    theme?: BoardTheme;
}

// Theme-based piece colors
const PIECE_THEMES: Record<BoardTheme, {
    white: { fill: string; stroke: string; gradient?: string; shadow: string };
    black: { fill: string; stroke: string; gradient?: string; shadow: string };
}> = {
    green: {
        white: { fill: "#ffffff", stroke: "#1a1a1a", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" },
        black: { fill: "#312e2b", stroke: "#000000", shadow: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))" },
    },
    wood: {
        white: { fill: "#f5f0e6", stroke: "#8b7355", gradient: "url(#woodWhiteGrad)", shadow: "drop-shadow(0 2px 4px rgba(139,115,85,0.5))" },
        black: { fill: "#5c4033", stroke: "#2c1810", gradient: "url(#woodBlackGrad)", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" },
    },
    blue: {
        white: { fill: "#f0f8ff", stroke: "#4682b4", shadow: "drop-shadow(0 2px 4px rgba(70,130,180,0.4))" },
        black: { fill: "#1e3a5f", stroke: "#0a1929", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" },
    },
    purple: {
        white: { fill: "#f8f0ff", stroke: "#8b5cf6", shadow: "drop-shadow(0 2px 4px rgba(139,92,246,0.4))" },
        black: { fill: "#4c1d95", stroke: "#1e1b4b", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" },
    },
    coral: {
        white: { fill: "#fff5f2", stroke: "#cd5c5c", shadow: "drop-shadow(0 2px 4px rgba(205,92,92,0.4))" },
        black: { fill: "#8b3a3a", stroke: "#4a1c1c", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" },
    },
    ice: {
        white: { fill: "#ffffff", stroke: "#87ceeb", gradient: "url(#iceWhiteGrad)", shadow: "drop-shadow(0 0 8px rgba(135,206,235,0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))" },
        black: { fill: "#4a6fa5", stroke: "#2c3e50", shadow: "drop-shadow(0 0 6px rgba(74,111,165,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))" },
    },
    neon: {
        white: { fill: "#0a0a0a", stroke: "#00ff88", gradient: "url(#neonGreenGrad)", shadow: "drop-shadow(0 0 10px rgba(0,255,136,0.8)) drop-shadow(0 0 20px rgba(0,255,136,0.4))" },
        black: { fill: "#0a0a0a", stroke: "#ff00ff", gradient: "url(#neonPinkGrad)", shadow: "drop-shadow(0 0 10px rgba(255,0,255,0.8)) drop-shadow(0 0 20px rgba(255,0,255,0.4))" },
    },
    dark: {
        white: { fill: "#c0c0c0", stroke: "#505050", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" },
        black: { fill: "#1a1a1a", stroke: "#000000", shadow: "drop-shadow(0 2px 3px rgba(0,0,0,0.6))" },
    },
    // New themes
    marble: {
        white: { fill: "#f8f8f8", stroke: "#888888", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" },
        black: { fill: "#4a4a4a", stroke: "#1a1a1a", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" },
    },
    forest: {
        white: { fill: "#e8f5e0", stroke: "#2d5a2d", shadow: "drop-shadow(0 2px 4px rgba(45,90,45,0.4))" },
        black: { fill: "#2d4a2d", stroke: "#1a2a1a", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" },
    },
    sunset: {
        white: { fill: "#fff8f0", stroke: "#d4826a", shadow: "drop-shadow(0 2px 4px rgba(212,130,106,0.4))" },
        black: { fill: "#8b4a3a", stroke: "#4a2a1a", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" },
    },
    ocean: {
        white: { fill: "#f0f8ff", stroke: "#2e5a7c", shadow: "drop-shadow(0 2px 4px rgba(46,90,124,0.4))" },
        black: { fill: "#1e3a5c", stroke: "#0a1a2c", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" },
    },
    cherry: {
        white: { fill: "#fff8fa", stroke: "#c4586c", shadow: "drop-shadow(0 2px 4px rgba(196,88,108,0.4))" },
        black: { fill: "#8b3a4a", stroke: "#4a1a2a", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" },
    },
    sand: {
        white: { fill: "#faf8f0", stroke: "#a8956a", shadow: "drop-shadow(0 2px 4px rgba(168,149,106,0.4))" },
        black: { fill: "#6a5a3a", stroke: "#3a2a1a", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" },
    },
    midnight: {
        white: { fill: "#8a9aaa", stroke: "#3a4a5a", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" },
        black: { fill: "#1a2a3a", stroke: "#0a1a2a", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" },
    },
    emerald: {
        white: { fill: "#f0fff8", stroke: "#2d8a5a", shadow: "drop-shadow(0 2px 4px rgba(45,138,90,0.4))" },
        black: { fill: "#1a5a3a", stroke: "#0a2a1a", shadow: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" },
    },
};

// SVG gradient definitions for special themes
const GradientDefs = () => (
    <defs>
        {/* Wood theme gradients */}
        <linearGradient id="woodWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff8f0" />
            <stop offset="50%" stopColor="#f5ebe0" />
            <stop offset="100%" stopColor="#e8dcc8" />
        </linearGradient>
        <linearGradient id="woodBlackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b4423" />
            <stop offset="50%" stopColor="#5c4033" />
            <stop offset="100%" stopColor="#4a3429" />
        </linearGradient>

        {/* Ice theme gradients */}
        <linearGradient id="iceWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e6f7ff" />
            <stop offset="100%" stopColor="#cceeff" />
        </linearGradient>

        {/* Neon theme gradients */}
        <linearGradient id="neonGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="100%" stopColor="#00cc6a" />
        </linearGradient>
        <linearGradient id="neonPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff00ff" />
            <stop offset="100%" stopColor="#cc00cc" />
        </linearGradient>
    </defs>
);

// SVG Chess Pieces with theme support
export function ChessPiece({ piece, size = 80, theme = "green" }: ChessPieceProps) {
    const isWhite = piece === piece.toUpperCase();
    const pieceType = piece.toLowerCase();

    const colors = PIECE_THEMES[theme]?.[isWhite ? "white" : "black"] || PIECE_THEMES.green[isWhite ? "white" : "black"];
    const fillColor = colors.gradient || colors.fill;
    const strokeColor = colors.stroke;
    const strokeWidth = isWhite ? "1.5" : "1";

    const commonProps = {
        width: size,
        height: size,
        viewBox: "0 0 45 45",
        style: {
            filter: colors.shadow,
            transition: "filter 0.3s ease",
        }
    };

    const needsGradients = theme === "wood" || theme === "ice" || theme === "neon";

    switch (pieceType) {
        case "k": // King
            return (
                <svg {...commonProps}>
                    {needsGradients && <GradientDefs />}
                    <g fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22.5 11.63V6M20 8h5" strokeWidth="1.5" />
                        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={fillColor} strokeLinecap="butt" />
                        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill={fillColor} />
                        <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" />
                    </g>
                </svg>
            );

        case "q": // Queen
            return (
                <svg {...commonProps}>
                    {needsGradients && <GradientDefs />}
                    <g fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="6" cy="12" r="2.75" />
                        <circle cx="14" cy="9" r="2.75" />
                        <circle cx="22.5" cy="8" r="2.75" />
                        <circle cx="31" cy="9" r="2.75" />
                        <circle cx="39" cy="12" r="2.75" />
                        <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" strokeLinecap="butt" />
                        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="butt" />
                        <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" />
                    </g>
                </svg>
            );

        case "r": // Rook
            return (
                <svg {...commonProps}>
                    {needsGradients && <GradientDefs />}
                    <g fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" strokeLinecap="butt" />
                        <path d="M14 29.5v-13h17v13H14z" strokeLinecap="butt" strokeLinejoin="miter" />
                        <path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" strokeLinecap="butt" />
                        <path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17" fill="none" strokeWidth="1" strokeLinejoin="miter" />
                    </g>
                </svg>
            );

        case "b": // Bishop
            return (
                <svg {...commonProps}>
                    {needsGradients && <GradientDefs />}
                    <g fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                        <g strokeLinecap="butt">
                            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
                            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
                            <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
                        </g>
                        <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" fill="none" strokeLinejoin="miter" />
                    </g>
                </svg>
            );

        case "n": // Knight
            return (
                <svg {...commonProps}>
                    {needsGradients && <GradientDefs />}
                    <g fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
                        <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" />
                        <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill={strokeColor} />
                        <path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill={strokeColor} strokeWidth="1.49997" />
                    </g>
                </svg>
            );

        case "p": // Pawn
            return (
                <svg {...commonProps}>
                    {needsGradients && <GradientDefs />}
                    <g fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round">
                        <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
                    </g>
                </svg>
            );

        default:
            return null;
    }
}

export default ChessPiece;
