"use client";

import { getCapturedPieces, formatTime } from "./chessConstants";

interface PlayerBarProps {
    username: string;
    color: "white" | "black";
    time: number;
    isCurrentTurn: boolean;
    isFinished: boolean;
    isWinner: boolean | null;
    fen: string;
    isCurrentPlayer?: boolean;
}

export default function PlayerBar({
    username,
    color,
    time,
    isCurrentTurn,
    isFinished,
    isWinner,
    fen,
    isCurrentPlayer = false,
}: PlayerBarProps) {
    const captured = getCapturedPieces(fen, color);
    const isLowTime = time <= 30 && isCurrentTurn;

    return (
        <div
            className={`flex items-center justify-between h-10 sm:h-12 px-2 rounded relative transition-all w-full ${isFinished && isWinner === true ? "winner-square" :
                isFinished && isWinner === false ? "loser-square" : ""
                }`}
        >
            {/* Win/Lose Flag */}
            {isFinished && isWinner !== null && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs ${isWinner ? "bg-green-500 text-white" : "bg-red-500"
                    }`}>
                    {isWinner ? "🏆" : "🏳"}
                </div>
            )}

            {/* Player Info */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex-shrink-0 flex items-center justify-center text-xs sm:text-sm font-bold text-white ${isCurrentPlayer ? "bg-[#81b64c]" : "bg-[#454341]"
                    } ${isFinished && isWinner === false ? "fallen-king" : ""}`}>
                    {username?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-white text-xs sm:text-sm leading-tight truncate">
                        {username || "Waiting..."}
                    </span>
                    <div className="flex items-center gap-0.5 text-[10px] sm:text-xs text-gray-400 leading-tight">
                        {captured.pieces.length > 0 && (
                            <>
                                <span className="flex">
                                    {captured.pieces.slice(0, 6).map((p, i) => (
                                        <span key={i} className="text-[10px] sm:text-xs">{p}</span>
                                    ))}
                                    {captured.pieces.length > 6 && <span className="text-[10px]">...</span>}
                                </span>
                                <span className="text-[#81b64c] font-semibold text-[10px] sm:text-xs ml-0.5">
                                    +{captured.points}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Clock */}
            <div
                className={`flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-4 py-1 rounded-lg text-lg sm:text-2xl font-bold tracking-wide transition-all duration-200 flex-shrink-0 ${isCurrentTurn
                    ? "bg-white text-[#1a1918] shadow-lg"
                    : "bg-[#262522] text-[#888]"
                    } ${isLowTime ? "!bg-red-600 !text-white !shadow-red-500/30" : ""}`}
                style={{
                    fontFamily: "var(--font-roboto-mono), 'Roboto Mono', 'SF Mono', 'Fira Code', monospace",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "0.05em",
                    minWidth: "80px",
                    justifyContent: "center",
                    ...(isLowTime ? { animation: "pulse-bg 1s ease-in-out infinite" } : {})
                }}
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                </svg>
                <span>{formatTime(time)}</span>
            </div>
        </div>
    );
}
