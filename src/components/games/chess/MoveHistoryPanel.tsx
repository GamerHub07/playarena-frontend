"use client";

import { pairMoves } from "./chessConstants";

interface MoveHistoryPanelProps {
    moveHistory: Array<{ from: string; to: string }>;
    viewMoveIndex: number | null; // null = live, -1 = starting position, 0+ = after move N
    setViewMoveIndex: (index: number | null) => void;
    isFinished: boolean;
    winner: string | null;
    onOfferDraw: () => void;
    onResign: () => void;
    onOfferRematch: () => void;
    myUsername: string;
    opponentUsername: string;
    timeControlMinutes: number;
}

export default function MoveHistoryPanel({
    moveHistory,
    viewMoveIndex,
    setViewMoveIndex,
    isFinished,
    winner,
    onOfferDraw,
    onResign,
    onOfferRematch,
    myUsername,
    opponentUsername,
    timeControlMinutes,
}: MoveHistoryPanelProps) {
    const pairedMoves = pairMoves(moveHistory);
    const totalMoves = moveHistory?.length ?? 0;

    // Helper to determine if we're viewing live
    const isLive = viewMoveIndex === null;

    // Current position being viewed
    const currentPosition = isLive ? totalMoves - 1 : viewMoveIndex;

    // Navigation handlers
    const handleFirst = () => setViewMoveIndex(-1); // Starting position
    const handlePrev = () => {
        if (isLive) {
            setViewMoveIndex(totalMoves - 2);
        } else if (viewMoveIndex !== null && viewMoveIndex > -1) {
            setViewMoveIndex(viewMoveIndex - 1);
        }
    };
    const handleNext = () => {
        if (viewMoveIndex !== null && viewMoveIndex < totalMoves - 1) {
            setViewMoveIndex(viewMoveIndex + 1);
        } else if (viewMoveIndex === totalMoves - 1) {
            setViewMoveIndex(null); // Go live
        }
    };
    const handleLast = () => setViewMoveIndex(null); // Live position

    // Button states
    const canGoPrev = totalMoves > 0 && (isLive || (viewMoveIndex !== null && viewMoveIndex > -1));
    const canGoNext = !isLive && viewMoveIndex !== null && viewMoveIndex < totalMoves - 1;
    const canGoFirst = totalMoves > 0 && (isLive || (viewMoveIndex !== null && viewMoveIndex > -1));
    const canGoLast = !isLive;

    return (
        <>
            {/* Starting Position Label */}
            <div
                className={`px-4 py-2.5 border-b border-[#3d3935] text-sm cursor-pointer transition-colors ${viewMoveIndex === -1 ? "bg-[#81b64c]/20 text-[#81b64c]" : "text-gray-400 hover:bg-[#3d3935]/30"
                    }`}
                onClick={() => setViewMoveIndex(-1)}
            >
                Starting Position
            </div>

            {/* Moves Table */}
            <div className="flex-1 overflow-y-auto">
                {pairedMoves.length === 0 ? (
                    <div className="p-4 text-gray-500 text-sm">No moves yet</div>
                ) : (
                    <div className="divide-y divide-[#3d3935]/50">
                        {pairedMoves.map((move, pairIdx) => {
                            const whiteIdx = pairIdx * 2;
                            const blackIdx = pairIdx * 2 + 1;

                            return (
                                <div key={move.num} className="flex text-sm">
                                    <span className="w-10 px-2 py-1.5 text-gray-500 bg-[#1a1918]/50 text-center">
                                        {move.num}.
                                    </span>
                                    <span
                                        className={`flex-1 px-3 py-1.5 cursor-pointer transition-colors ${viewMoveIndex === whiteIdx
                                            ? "bg-[#81b64c]/30 text-[#81b64c]"
                                            : "hover:bg-[#454341]/50"
                                            }`}
                                        onClick={() => setViewMoveIndex(whiteIdx)}
                                    >
                                        {move.white}
                                    </span>
                                    <span
                                        className={`flex-1 px-3 py-1.5 cursor-pointer text-gray-400 transition-colors ${viewMoveIndex === blackIdx
                                            ? "bg-[#81b64c]/30 text-[#81b64c]"
                                            : move.black ? "hover:bg-[#454341]/50" : ""
                                            }`}
                                        onClick={() => move.black && setViewMoveIndex(blackIdx)}
                                    >
                                        {move.black || ""}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Playback Controls - Improved UI */}
            <div className="flex justify-center items-center gap-2 py-3 px-4 border-t border-[#3d3935] bg-[#1f1d1b]">
                {/* First Move */}
                <button
                    onClick={handleFirst}
                    disabled={!canGoFirst}
                    className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${canGoFirst
                        ? "bg-[#3d3935] hover:bg-[#4d4945] active:scale-95 text-white"
                        : "bg-[#2a2826] text-gray-600 cursor-not-allowed"
                        }`}
                    title="Starting position"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                </button>

                {/* Previous Move */}
                <button
                    onClick={handlePrev}
                    disabled={!canGoPrev}
                    className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${canGoPrev
                        ? "bg-[#3d3935] hover:bg-[#4d4945] active:scale-95 text-white"
                        : "bg-[#2a2826] text-gray-600 cursor-not-allowed"
                        }`}
                    title="Previous move"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>

                {/* Live Button */}
                <button
                    onClick={handleLast}
                    className={`px-4 h-11 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all ${isLive
                        ? "bg-[#81b64c] text-white shadow-lg shadow-[#81b64c]/20"
                        : "bg-[#3d3935] hover:bg-[#4d4945] text-gray-300"
                        }`}
                    title="Live position"
                >
                    <span className={`w-2 h-2 rounded-full ${isLive ? "bg-white animate-pulse" : "bg-gray-500"}`} />
                    <span className="text-sm">LIVE</span>
                </button>

                {/* Next Move */}
                <button
                    onClick={handleNext}
                    disabled={!canGoNext}
                    className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${canGoNext
                        ? "bg-[#3d3935] hover:bg-[#4d4945] active:scale-95 text-white"
                        : "bg-[#2a2826] text-gray-600 cursor-not-allowed"
                        }`}
                    title="Next move"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                </button>

                {/* Last Move */}
                <button
                    onClick={handleLast}
                    disabled={!canGoLast}
                    className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${canGoLast
                        ? "bg-[#3d3935] hover:bg-[#4d4945] active:scale-95 text-white"
                        : "bg-[#2a2826] text-gray-600 cursor-not-allowed"
                        }`}
                    title="Latest move (live)"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
                    </svg>
                </button>
            </div>

            {/* Move Counter */}
            {totalMoves > 0 && !isLive && (
                <div className="text-center py-1.5 text-xs text-gray-500 bg-[#1a1918] border-t border-[#3d3935]">
                    {viewMoveIndex === -1 ? "Starting position" : `Move ${(viewMoveIndex ?? 0) + 1} of ${totalMoves}`}
                </div>
            )}

            {/* Game Controls */}
            <div className="flex gap-6 px-4 py-3 border-t border-[#3d3935] text-sm justify-center">
                {!isFinished ? (
                    <>
                        <button
                            onClick={onOfferDraw}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                        >
                            <span className="text-lg">½</span> Draw
                        </button>
                        <button
                            onClick={onResign}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                            </svg>
                            Resign
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <span className="text-[#81b64c] font-semibold">Game Over</span>
                        {winner && <span className="text-white">- {winner} wins!</span>}
                        <button
                            onClick={onOfferRematch}
                            className="ml-4 px-4 py-1.5 bg-[#81b64c] hover:bg-[#6fa53b] rounded text-white font-semibold transition-colors"
                        >
                            Rematch
                        </button>
                    </div>
                )}
            </div>

            {/* Game Info */}
            <div className="px-4 py-3 bg-[#1a1918] text-xs border-t border-[#3d3935]">
                <div className="font-semibold text-gray-500 mb-1 uppercase tracking-wide">Game Info</div>
                <div className="text-gray-300">
                    {myUsername} vs. {opponentUsername || "..."} • {timeControlMinutes} min
                </div>
            </div>
        </>
    );
}
