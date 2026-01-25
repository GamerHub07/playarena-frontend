"use client";

import Button from "@/components/ui/Button";
import { ChessColor } from "@/types/chess";

interface GameModalsProps {
    // Abort confirmation
    showAbortConfirm: boolean;
    onCancelAbort: () => void;
    onConfirmAbort: () => void;

    // Draw offer (opponent received)
    drawOffer: { from: string; username: string } | null;
    currentSessionId: string;
    onAcceptDraw: () => void;
    onRejectDraw: () => void;

    // Rematch offer (opponent received)
    rematchOffer: { from: string; username: string } | null;
    onAcceptRematch: () => void;
    onRejectRematch: () => void;

    // Notifications
    drawRejectedNotif: boolean;
    rematchRejectedNotif: boolean;
    abortedBy: string | null;

    // Winner popup
    isGameOver?: boolean;
    winner?: ChessColor | null;
    myColor?: ChessColor;
    winnerUsername?: string | null;
    loserUsername?: string | null;
    myUsername?: string;
    opponentUsername?: string;
    gameEndReason?: "checkmate" | "timeout" | "resign" | "draw" | "stalemate" | "abort" | null;
    onOfferRematch?: () => void;
    onLeaveRoom?: () => void;
    rematchPending?: boolean;

    // Resign confirmation
    showResignConfirm?: boolean;
    onCancelResign?: () => void;
    onConfirmResign?: () => void;
}

// Chess piece SVG icons
const KingIcon = ({ color }: { color: "white" | "black" }) => (
    <svg viewBox="0 0 45 45" className="w-16 h-16">
        <g fill={color === "white" ? "#fff" : "#1a1a1a"} stroke={color === "white" ? "#1a1a1a" : "#fff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
            <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={color === "white" ? "#fff" : "#1a1a1a"} strokeLinecap="butt" strokeLinejoin="miter" />
            <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill={color === "white" ? "#fff" : "#1a1a1a"} />
            <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
        </g>
    </svg>
);

const TrophyIcon = () => (
    <svg viewBox="0 0 24 24" className="w-8 h-8 text-yellow-400" fill="currentColor">
        <path d="M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2M12 4L20 12L12 20L4 12L12 4M12 7C10.34 7 9 8.34 9 10C9 11.31 9.84 12.41 11 12.83V15H10V17H14V15H13V12.83C14.16 12.41 15 11.31 15 10C15 8.34 13.66 7 12 7M12 9C12.55 9 13 9.45 13 10S12.55 11 12 11 11 10.55 11 10 11.45 9 12 9Z" />
    </svg>
);

const HandshakeIcon = () => (
    <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-400" fill="currentColor">
        <path d="M21.71 8.71C22.96 7.46 22.39 6 21.71 5.29L18.71 2.29C17.45 1.04 16 1.61 15.29 2.29L13.59 4H11C9.1 4 8 5 7.44 6.15L3 10.59V14.59L2.29 15.29C1.04 16.55 1.61 18 2.29 18.71L5.29 21.71C5.83 22.25 6.41 22.45 6.96 22.45C7.67 22.45 8.32 22.1 8.71 21.71L11.41 19H15C16.7 19 17.56 17.94 17.87 16.9C19 16.6 19.62 15.74 19.87 14.9C21.42 14.5 22 13.03 22 12V9H21.41L21.71 8.71M20 12C20 12.45 19.81 13 19 13L18 13L18 14C18 14.45 17.81 15 17 15L16 15L16 16C16 16.45 15.81 17 15 17H10.59L7.31 20.28C7 20.57 6.82 20.4 6.71 20.29L3.72 17.31C3.43 17 3.6 16.82 3.71 16.71L5 15.41V11.41L7 9.41V11C7 12.21 7.8 14 10 14S13 12.21 13 11H20V12M20.29 7.29L18.59 9H11V11C11 11.45 10.81 12 10 12S9 11.45 9 11V8C9 7.54 9.17 6 11 6H14.41L16.69 3.72C17 3.43 17.18 3.6 17.29 3.71L20.28 6.69C20.57 7 20.4 7.18 20.29 7.29Z" />
    </svg>
);

export default function GameModals({
    showAbortConfirm,
    onCancelAbort,
    onConfirmAbort,
    drawOffer,
    currentSessionId,
    onAcceptDraw,
    onRejectDraw,
    rematchOffer,
    onAcceptRematch,
    onRejectRematch,
    drawRejectedNotif,
    rematchRejectedNotif,
    abortedBy,
    isGameOver = false,
    winner,
    myColor,
    winnerUsername,
    loserUsername,
    myUsername,
    opponentUsername,
    gameEndReason,
    onOfferRematch,
    onLeaveRoom,
    rematchPending = false,
    showResignConfirm = false,
    onCancelResign,
    onConfirmResign,
}: GameModalsProps) {
    // Determine if this is a draw (no winner) - timeout and resign are NOT draws
    const isDraw = gameEndReason === "draw" || gameEndReason === "stalemate" ||
        (isGameOver && !winner && gameEndReason !== "abort" && gameEndReason !== "timeout" && gameEndReason !== "resign");
    const isAborted = gameEndReason === "abort";
    // Only determine winner/loser if it's not a draw
    // For timeout/resign, check if current player is the winner by comparing usernames
    const isWinner = !isDraw && (winner === myColor || ((gameEndReason === "timeout" || gameEndReason === "resign") && winnerUsername === myUsername));

    // Get the end reason text
    const getEndReasonText = () => {
        switch (gameEndReason) {
            case "checkmate":
                return "by checkmate";
            case "timeout":
                return "on time";
            case "resign":
                return "by resignation";
            case "stalemate":
                return "Stalemate - Draw!";
            case "draw":
                return "Game drawn by agreement";
            case "abort":
                return "Game was aborted";
            default:
                return "";
        }
    };

    // Get the defeat method text for the loser label
    const getDefeatMethodText = () => {
        switch (gameEndReason) {
            case "checkmate":
                return "Checkmate";
            case "timeout":
                return "On Time";
            case "resign":
                return "Resigned";
            default:
                return "Defeated";
        }
    };

    return (
        <>
            {/* Winner/Game Over Popup */}
            {isGameOver && !isAborted && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-300">
                    <div className="bg-gradient-to-b from-[#312e2b] to-[#262522] rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Header with result */}
                        <div className={`p-6 text-center relative overflow-hidden ${isDraw
                            ? "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700"
                            : isWinner
                                ? "bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700"
                                : "bg-gradient-to-r from-red-800 via-red-700 to-red-800"
                            }`}>
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer-gold" />

                            {/* Trophy/Result icon */}
                            <div className="flex justify-center mb-3">
                                {isDraw ? (
                                    <HandshakeIcon />
                                ) : isWinner ? (
                                    <div className="relative">
                                        <TrophyIcon />
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                                    </div>
                                ) : (
                                    <div className="opacity-75">
                                        <KingIcon color={myColor || "white"} />
                                    </div>
                                )}
                            </div>

                            {/* Result text */}
                            <h2 className="text-3xl font-bold text-white mb-1 tracking-wide">
                                {isDraw ? "Draw!" : isWinner ? "Victory!" : "Defeat"}
                            </h2>
                            <p className="text-white/80 text-sm font-medium">
                                {getEndReasonText()}
                            </p>
                        </div>

                        {/* Players result */}
                        <div className="p-6">
                            {/* Draw display - show both players equally */}
                            {isDraw && (
                                <div className="flex items-center justify-center gap-6 mb-6">
                                    {/* Current player (white piece if playing white) */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 bg-gray-600/30 ring-2 ring-gray-500">
                                            <KingIcon color={myColor || "white"} />
                                        </div>
                                        <span className="font-semibold text-gray-300 text-sm">
                                            {myUsername || "You"}
                                        </span>
                                    </div>

                                    {/* Draw indicator */}
                                    <div className="flex flex-col items-center">
                                        <div className="text-3xl font-bold text-gray-400">½ - ½</div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Draw</span>
                                    </div>

                                    {/* Opponent */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 bg-gray-600/30 ring-2 ring-gray-500">
                                            <KingIcon color={myColor === "white" ? "black" : "white"} />
                                        </div>
                                        <span className="font-semibold text-gray-300 text-sm">
                                            {opponentUsername || "Opponent"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Winner/Loser display - only show when not a draw */}
                            {!isDraw && winner && (
                                <div className="flex items-center justify-between mb-6 px-4">
                                    {/* Winner side */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isWinner ? "bg-emerald-500/20 ring-2 ring-emerald-500" : "bg-gray-700/50"
                                            }`}>
                                            <KingIcon color={winner || "white"} />
                                        </div>
                                        <span className={`font-semibold ${isWinner ? "text-emerald-400" : "text-gray-400"}`}>
                                            {winnerUsername || "Winner"}
                                        </span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Winner</span>
                                    </div>

                                    {/* VS */}
                                    <div className="text-2xl font-bold text-gray-600">VS</div>

                                    {/* Loser side */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${!isWinner ? "bg-red-500/20 ring-2 ring-red-500" : "bg-gray-700/50"
                                            }`}>
                                            <div className="fallen-king">
                                                <KingIcon color={winner === "white" ? "black" : "white"} />
                                            </div>
                                        </div>
                                        <span className={`font-semibold ${!isWinner ? "text-red-400" : "text-gray-400"}`}>
                                            {loserUsername || "Loser"}
                                        </span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">{getDefeatMethodText()}</span>
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                {onOfferRematch && (
                                    <Button
                                        onClick={onOfferRematch}
                                        disabled={rematchPending}
                                        className={`flex-1 py-3 rounded-lg font-semibold transition-all ${rematchPending
                                            ? "bg-gray-600 cursor-not-allowed"
                                            : "bg-[#81b64c] hover:bg-[#95c95e]"
                                            }`}
                                    >
                                        {rematchPending ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Waiting...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 4v6h6M23 20v-6h-6" />
                                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                                                </svg>
                                                Rematch
                                            </span>
                                        )}
                                    </Button>
                                )}

                                {onLeaveRoom && (
                                    <Button
                                        onClick={onLeaveRoom}
                                        className="flex-1 py-3 rounded-lg font-semibold bg-[#3d3935] hover:bg-[#4d4945] transition-all"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <polyline points="16,17 21,12 16,7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                            Leave
                                        </span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Abort Result Popup - Dedicated layout for aborted games */}
            {isGameOver && isAborted && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-300">
                    <div className="bg-gradient-to-b from-[#312e2b] to-[#262522] rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Header - Orange/Amber for abort */}
                        <div className="p-6 text-center relative overflow-hidden bg-gradient-to-r from-orange-800 via-amber-700 to-orange-800">
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer-gold" />

                            {/* X icon for abort */}
                            <div className="flex justify-center mb-3">
                                <div className="w-16 h-16 rounded-full bg-orange-900/50 flex items-center justify-center ring-2 ring-orange-400">
                                    <svg className="w-10 h-10 text-orange-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </div>
                            </div>

                            {/* Result text */}
                            <h2 className="text-3xl font-bold text-white mb-1 tracking-wide">
                                Game Aborted
                            </h2>
                            <p className="text-white/80 text-sm font-medium">
                                {abortedBy ? `Aborted by ${abortedBy}` : "This game was cancelled"}
                            </p>
                        </div>

                        {/* Body - no winner/loser to show */}
                        <div className="p-6">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                {/* Both players shown neutrally */}
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gray-700/50 ring-1 ring-gray-600">
                                        <KingIcon color={myColor || "white"} />
                                    </div>
                                    <span className="font-medium text-gray-400 text-sm">
                                        {myUsername || "You"}
                                    </span>
                                </div>

                                {/* Abort indicator */}
                                <div className="text-orange-400 font-bold text-xl">—</div>

                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gray-700/50 ring-1 ring-gray-600">
                                        <KingIcon color={myColor === "white" ? "black" : "white"} />
                                    </div>
                                    <span className="font-medium text-gray-400 text-sm">
                                        {opponentUsername || "Opponent"}
                                    </span>
                                </div>
                            </div>

                            <p className="text-center text-gray-500 text-sm mb-4">
                                No result recorded
                            </p>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                {onOfferRematch && (
                                    <Button
                                        onClick={onOfferRematch}
                                        disabled={rematchPending}
                                        className={`flex-1 py-3 rounded-lg font-semibold transition-all ${rematchPending
                                            ? "bg-gray-600 cursor-not-allowed"
                                            : "bg-[#81b64c] hover:bg-[#95c95e]"
                                            }`}
                                    >
                                        {rematchPending ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Waiting...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 4v6h6M23 20v-6h-6" />
                                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                                                </svg>
                                                New Game
                                            </span>
                                        )}
                                    </Button>
                                )}

                                {onLeaveRoom && (
                                    <Button
                                        onClick={onLeaveRoom}
                                        className="flex-1 py-3 rounded-lg font-semibold bg-[#3d3935] hover:bg-[#4d4945] transition-all"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <polyline points="16,17 21,12 16,7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                            Leave
                                        </span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Abort Confirmation Modal */}
            {showAbortConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#262522] p-6 rounded-lg max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Abort Game?</h3>
                        <p className="text-gray-400 mb-4">Are you sure you want to abort this game?</p>
                        <div className="flex gap-3">
                            <Button onClick={onCancelAbort} className="flex-1 bg-[#3d3935] rounded">Cancel</Button>
                            <Button onClick={onConfirmAbort} className="flex-1 bg-red-600 rounded">Abort</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resign Confirmation Modal */}
            {showResignConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#262522] p-6 rounded-lg max-w-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
                            </svg>
                            Resign Game?
                        </h3>
                        <p className="text-gray-400 mb-4">Are you sure you want to resign? You will lose this game.</p>
                        <div className="flex gap-3">
                            <Button onClick={onCancelResign} className="flex-1 bg-[#3d3935] rounded">Cancel</Button>
                            <Button onClick={onConfirmResign} className="flex-1 bg-red-600 rounded">Resign</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Draw Offer Modal - Only show to opponent */}
            {drawOffer && drawOffer.from !== currentSessionId && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#262522] p-6 rounded-lg max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Draw Offer</h3>
                        <p className="text-gray-400 mb-4">{drawOffer.username} offers a draw</p>
                        <div className="flex gap-3">
                            <Button onClick={onRejectDraw} className="flex-1 bg-[#3d3935] rounded">Decline</Button>
                            <Button onClick={onAcceptDraw} className="flex-1 bg-[#81b64c] rounded">Accept</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Draw Rejected Notification */}
            {drawRejectedNotif && (
                <div className="fixed top-4 right-4 bg-[#3d3935] text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                    Draw offer was declined
                </div>
            )}

            {/* Aborted Notification */}
            {abortedBy && (
                <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50">
                    Game aborted by {abortedBy}
                </div>
            )}

            {/* Rematch Offer Modal - Only show to opponent */}
            {rematchOffer && rematchOffer.from !== currentSessionId && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#262522] p-6 rounded-lg max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Rematch Offer</h3>
                        <p className="text-gray-400 mb-4">{rematchOffer.username} wants a rematch!</p>
                        <div className="flex gap-3">
                            <Button onClick={onRejectRematch} className="flex-1 bg-[#3d3935] rounded">Decline</Button>
                            <Button onClick={onAcceptRematch} className="flex-1 bg-[#81b64c] rounded">Accept</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rematch Rejected Notification */}
            {rematchRejectedNotif && (
                <div className="fixed top-4 right-4 bg-[#3d3935] text-white px-4 py-3 rounded-lg shadow-lg z-50">
                    Rematch offer was declined
                </div>
            )}
        </>
    );
}
