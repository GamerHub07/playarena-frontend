"use client";

import { useState } from "react";
import { BoardTheme } from "./chessConstants";
import MoveHistoryPanel from "./MoveHistoryPanel";
import ThemeSelectorPanel from "./ThemeSelectorPanel";

interface GameSidePanelProps {
    // Move history props
    moveHistory: Array<{ from: string; to: string }>;
    viewMoveIndex: number | null;
    setViewMoveIndex: (index: number | null) => void;
    isFinished: boolean;
    winner: string | null;
    onOfferDraw: () => void;
    onAbort: () => void;
    onOfferRematch: () => void;
    myUsername: string;
    opponentUsername: string;
    timeControlMinutes: number;

    // Theme props
    currentBoardTheme: BoardTheme;
    currentPieceTheme: BoardTheme;
    onBoardThemeChange: (theme: BoardTheme) => void;
    onPieceThemeChange: (theme: BoardTheme) => void;
}

export default function GameSidePanel({
    moveHistory,
    viewMoveIndex,
    setViewMoveIndex,
    isFinished,
    winner,
    onOfferDraw,
    onAbort,
    onOfferRematch,
    myUsername,
    opponentUsername,
    timeControlMinutes,
    currentBoardTheme,
    currentPieceTheme,
    onBoardThemeChange,
    onPieceThemeChange,
}: GameSidePanelProps) {
    const [activeTab, setActiveTab] = useState<"moves" | "themes">("moves");

    return (
        <div className="flex flex-col bg-[#262522] rounded overflow-hidden" style={{ width: 340, height: 848 }}>
            {/* Tabs */}
            <div className="flex border-b border-[#3d3935]">
                <button
                    onClick={() => setActiveTab("moves")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === "moves"
                            ? "text-white border-b-2 border-[#81b64c]"
                            : "text-gray-500 hover:text-white"
                        }`}
                >
                    Moves
                </button>
                <button
                    onClick={() => setActiveTab("themes")}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === "themes"
                            ? "text-white border-b-2 border-[#81b64c]"
                            : "text-gray-500 hover:text-white"
                        }`}
                >
                    Themes
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "moves" ? (
                <MoveHistoryPanel
                    moveHistory={moveHistory}
                    viewMoveIndex={viewMoveIndex}
                    setViewMoveIndex={setViewMoveIndex}
                    isFinished={isFinished}
                    winner={winner}
                    onOfferDraw={onOfferDraw}
                    onAbort={onAbort}
                    onOfferRematch={onOfferRematch}
                    myUsername={myUsername}
                    opponentUsername={opponentUsername}
                    timeControlMinutes={timeControlMinutes}
                />
            ) : (
                <ThemeSelectorPanel
                    currentBoardTheme={currentBoardTheme}
                    currentPieceTheme={currentPieceTheme}
                    onBoardThemeChange={onBoardThemeChange}
                    onPieceThemeChange={onPieceThemeChange}
                />
            )}
        </div>
    );
}
