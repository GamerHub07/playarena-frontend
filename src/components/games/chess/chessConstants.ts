/**
 * Chess Game Constants
 * Centralized constants, utilities, and types for the chess game
 */

/* ---------------- TIME CONTROLS ---------------- */
export const TIME_CONTROLS = [
    { minutes: 1, name: "Bullet" },
    { minutes: 3, name: "Blitz" },
    { minutes: 5, name: "Blitz" },
    { minutes: 10, name: "Rapid" },
    { minutes: 30, name: "Classical" },
    { minutes: 60, name: "Classical" },
];

/* ---------------- PIECE VALUES ---------------- */
export const PIECE_VALUES: Record<string, number> = {
    p: 1, n: 3, b: 3, r: 5, q: 9
};

export const PIECE_SYMBOLS: Record<string, string> = {
    P: "♙", N: "♘", B: "♗", R: "♖", Q: "♕",
    p: "♟", n: "♞", b: "♝", r: "♜", q: "♛",
};

/* ---------------- THEME BACKGROUNDS ---------------- */
export const THEME_BACKGROUNDS: Record<string, { bg: string; pattern: string }> = {
    green: {
        bg: "linear-gradient(135deg, #1a1f16 0%, #262b22 50%, #1a1f16 100%)",
        pattern: "radial-gradient(circle at 20% 80%, rgba(119, 149, 86, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(119, 149, 86, 0.08) 0%, transparent 40%)",
    },
    wood: {
        bg: "linear-gradient(135deg, #1f1a14 0%, #2a231b 50%, #1f1a14 100%)",
        pattern: "radial-gradient(circle at 30% 70%, rgba(181, 136, 99, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(181, 136, 99, 0.08) 0%, transparent 40%)",
    },
    blue: {
        bg: "linear-gradient(135deg, #141a1f 0%, #1b232a 50%, #141a1f 100%)",
        pattern: "radial-gradient(circle at 25% 75%, rgba(140, 162, 173, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(140, 162, 173, 0.08) 0%, transparent 40%)",
    },
    purple: {
        bg: "linear-gradient(135deg, #1a141f 0%, #231b2a 50%, #1a141f 100%)",
        pattern: "radial-gradient(circle at 20% 80%, rgba(155, 114, 176, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(155, 114, 176, 0.08) 0%, transparent 40%)",
    },
    coral: {
        bg: "linear-gradient(135deg, #1f1614 0%, #2a1f1b 50%, #1f1614 100%)",
        pattern: "radial-gradient(circle at 25% 75%, rgba(235, 119, 98, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(235, 119, 98, 0.08) 0%, transparent 40%)",
    },
    ice: {
        bg: "linear-gradient(135deg, #141920 0%, #1b2128 50%, #141920 100%)",
        pattern: "radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(173, 216, 230, 0.08) 0%, transparent 40%)",
    },
    neon: {
        bg: "linear-gradient(135deg, #0a0a12 0%, #12121a 50%, #0a0a12 100%)",
        pattern: "radial-gradient(circle at 20% 80%, rgba(0, 255, 136, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.06) 0%, transparent 40%)",
    },
    dark: {
        bg: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%)",
        pattern: "radial-gradient(circle at 25% 75%, rgba(80, 80, 80, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(80, 80, 80, 0.08) 0%, transparent 40%)",
    },
    // New themes
    marble: {
        bg: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)",
        pattern: "radial-gradient(circle at 25% 75%, rgba(200, 200, 200, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(200, 200, 200, 0.08) 0%, transparent 40%)",
    },
    forest: {
        bg: "linear-gradient(135deg, #0d1a0d 0%, #1a2a1a 50%, #0d1a0d 100%)",
        pattern: "radial-gradient(circle at 20% 80%, rgba(61, 90, 61, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(61, 90, 61, 0.08) 0%, transparent 40%)",
    },
    sunset: {
        bg: "linear-gradient(135deg, #1f1410 0%, #2a1f18 50%, #1f1410 100%)",
        pattern: "radial-gradient(circle at 25% 75%, rgba(212, 130, 106, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(212, 130, 106, 0.08) 0%, transparent 40%)",
    },
    ocean: {
        bg: "linear-gradient(135deg, #0a141f 0%, #142028 50%, #0a141f 100%)",
        pattern: "radial-gradient(circle at 30% 70%, rgba(46, 90, 124, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(46, 90, 124, 0.08) 0%, transparent 40%)",
    },
    cherry: {
        bg: "linear-gradient(135deg, #1f1418 0%, #281c20 50%, #1f1418 100%)",
        pattern: "radial-gradient(circle at 20% 80%, rgba(196, 88, 108, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(196, 88, 108, 0.08) 0%, transparent 40%)",
    },
    sand: {
        bg: "linear-gradient(135deg, #1a1814 0%, #24201a 50%, #1a1814 100%)",
        pattern: "radial-gradient(circle at 25% 75%, rgba(196, 168, 130, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(196, 168, 130, 0.08) 0%, transparent 40%)",
    },
    midnight: {
        bg: "linear-gradient(135deg, #0a1018 0%, #141c24 50%, #0a1018 100%)",
        pattern: "radial-gradient(circle at 30% 70%, rgba(44, 62, 80, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(44, 62, 80, 0.1) 0%, transparent 40%)",
    },
    emerald: {
        bg: "linear-gradient(135deg, #0d1a14 0%, #14241c 50%, #0d1a14 100%)",
        pattern: "radial-gradient(circle at 20% 80%, rgba(45, 138, 90, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(45, 138, 90, 0.08) 0%, transparent 40%)",
    },
};

export type BoardTheme = "green" | "wood" | "blue" | "purple" | "coral" | "ice" | "neon" | "dark" | "marble" | "forest" | "sunset" | "ocean" | "cherry" | "sand" | "midnight" | "emerald";

/* ---------------- UTILITY FUNCTIONS ---------------- */

/**
 * Calculate captured pieces from FEN notation
 */
export function getCapturedPieces(fen: string, forColor: "white" | "black"): { pieces: string[]; points: number } {
    const startingPieces = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const boardPart = fen.split(" ")[0];

    const whitePieces = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    const blackPieces = { p: 0, n: 0, b: 0, r: 0, q: 0 };

    for (const char of boardPart) {
        if (char === "P") whitePieces.p++;
        else if (char === "N") whitePieces.n++;
        else if (char === "B") whitePieces.b++;
        else if (char === "R") whitePieces.r++;
        else if (char === "Q") whitePieces.q++;
        else if (char === "p") blackPieces.p++;
        else if (char === "n") blackPieces.n++;
        else if (char === "b") blackPieces.b++;
        else if (char === "r") blackPieces.r++;
        else if (char === "q") blackPieces.q++;
    }

    const captured: string[] = [];
    let points = 0;
    const opponentPieces = forColor === "white" ? blackPieces : whitePieces;
    const opponentSymbols = forColor === "white" ? "pnbrq" : "PNBRQ";

    for (const [piece, starting] of Object.entries(startingPieces)) {
        const lost = starting - opponentPieces[piece as keyof typeof opponentPieces];
        for (let i = 0; i < lost; i++) {
            const symbol = opponentSymbols[["p", "n", "b", "r", "q"].indexOf(piece)];
            captured.push(PIECE_SYMBOLS[symbol] || "");
            points += PIECE_VALUES[piece];
        }
    }

    return { pieces: captured, points };
}

/**
 * Format seconds to MM:SS
 */
export function formatTime(seconds: number): string {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}

/**
 * Pair moves for display (white + black per row)
 */
export interface PairedMove {
    num: number;
    white: string;
    black?: string;
}

export function pairMoves(moveHistory: Array<{ from: string; to: string; san?: string }>): PairedMove[] {
    const pairedMoves: PairedMove[] = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
        pairedMoves.push({
            num: Math.floor(i / 2) + 1,
            // Use SAN if available, otherwise fallback to from+to
            white: moveHistory[i].san || `${moveHistory[i].from}${moveHistory[i].to}`,
            black: moveHistory[i + 1]
                ? moveHistory[i + 1].san || `${moveHistory[i + 1].from}${moveHistory[i + 1].to}`
                : undefined,
        });
    }
    return pairedMoves;
}
