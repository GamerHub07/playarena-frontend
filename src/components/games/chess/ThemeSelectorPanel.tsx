"use client";

import { BoardTheme } from "./chessConstants";
import { ChessPiece } from "./ChessPieces";

interface ThemeSelectorPanelProps {
    currentBoardTheme: BoardTheme;
    currentPieceTheme: BoardTheme;
    onBoardThemeChange: (theme: BoardTheme) => void;
    onPieceThemeChange: (theme: BoardTheme) => void;
}

interface ThemeOption {
    id: BoardTheme;
    name: string;
    lightColor: string;
    darkColor: string;
}

const THEME_OPTIONS: ThemeOption[] = [
    { id: "green", name: "Classic", lightColor: "#ebecd0", darkColor: "#779556" },
    { id: "wood", name: "Wood", lightColor: "#f0d9b5", darkColor: "#b58863" },
    { id: "blue", name: "Blue", lightColor: "#dee3e6", darkColor: "#8ca2ad" },
    { id: "purple", name: "Royal", lightColor: "#f0e6f6", darkColor: "#9b72b0" },
    { id: "coral", name: "Coral", lightColor: "#fce4d8", darkColor: "#eb7762" },
    { id: "ice", name: "Ice", lightColor: "#e8f4f8", darkColor: "#6fa8c0" },
    { id: "neon", name: "Neon", lightColor: "#1a1a2e", darkColor: "#16213e" },
    { id: "dark", name: "Dark", lightColor: "#4a4a4a", darkColor: "#2d2d2d" },
    // New themes
    { id: "marble", name: "Marble", lightColor: "#f5f5f5", darkColor: "#a8a8a8" },
    { id: "forest", name: "Forest", lightColor: "#c8dbb3", darkColor: "#3d5a3d" },
    { id: "sunset", name: "Sunset", lightColor: "#ffe4c9", darkColor: "#d4826a" },
    { id: "ocean", name: "Ocean", lightColor: "#d4e8f2", darkColor: "#2e5a7c" },
    { id: "cherry", name: "Cherry", lightColor: "#fce8ec", darkColor: "#c4586c" },
    { id: "sand", name: "Sand", lightColor: "#f4e8d4", darkColor: "#c4a882" },
    { id: "midnight", name: "Midnight", lightColor: "#2c3e50", darkColor: "#1a252f" },
    { id: "emerald", name: "Emerald", lightColor: "#d4f0e0", darkColor: "#2d8a5a" },
];

export default function ThemeSelectorPanel({
    currentBoardTheme,
    currentPieceTheme,
    onBoardThemeChange,
    onPieceThemeChange,
}: ThemeSelectorPanelProps) {
    return (
        <div className="flex-1 p-4 overflow-y-auto">
            {/* Board Theme Section */}
            <div className="mb-6">
                <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h4v4H7V7zm6 0h4v4h-4V7zm-6 6h4v4H7v-4zm6 0h4v4h-4v-4z" />
                    </svg>
                    Board Theme
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {THEME_OPTIONS.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => onBoardThemeChange(theme.id)}
                            className={`p-1.5 rounded-lg border-2 transition-all ${currentBoardTheme === theme.id
                                ? "border-[#81b64c] bg-[#81b64c]/10"
                                : "border-transparent hover:border-[#3d3935]"
                                }`}
                            title={theme.name}
                        >
                            <div className="aspect-square rounded overflow-hidden grid grid-cols-2">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            backgroundColor: (Math.floor(i / 2) + i) % 2 === 0
                                                ? theme.lightColor
                                                : theme.darkColor
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="text-center text-[10px] text-white mt-1 truncate">{theme.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Piece Theme Section */}
            <div>
                <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 22H5v-2h14v2M17.16 8.26A5 5 0 0 0 12 4a5 5 0 0 0-5.16 4.26L5 18h14l-1.84-9.74z" />
                    </svg>
                    Pieces Theme
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {THEME_OPTIONS.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => onPieceThemeChange(theme.id)}
                            className={`p-1.5 rounded-lg border-2 transition-all ${currentPieceTheme === theme.id
                                ? "border-[#81b64c] bg-[#81b64c]/10"
                                : "border-transparent hover:border-[#3d3935]"
                                }`}
                            title={theme.name}
                        >
                            <div className="flex justify-center items-center py-1 bg-[#262522] rounded">
                                <div className="flex -space-x-1">
                                    <div className="relative z-10">
                                        <ChessPiece piece="K" size={28} theme={theme.id} />
                                    </div>
                                    <div className="relative">
                                        <ChessPiece piece="q" size={28} theme={theme.id} />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center text-[10px] text-white mt-1 truncate">{theme.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Current Selection Info */}
            <div className="mt-6 p-3 bg-[#1a1918] rounded-lg">
                <div className="text-xs text-gray-500 mb-2">Current Selection</div>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded grid grid-cols-2 overflow-hidden">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    style={{
                                        backgroundColor: (Math.floor(i / 2) + i) % 2 === 0
                                            ? THEME_OPTIONS.find(t => t.id === currentBoardTheme)?.lightColor
                                            : THEME_OPTIONS.find(t => t.id === currentBoardTheme)?.darkColor
                                    }}
                                />
                            ))}
                        </div>
                        <span className="text-white">{THEME_OPTIONS.find(t => t.id === currentBoardTheme)?.name}</span>
                    </div>
                    <span className="text-gray-600">+</span>
                    <div className="flex items-center gap-2">
                        <ChessPiece piece="N" size={24} theme={currentPieceTheme} />
                        <span className="text-white">{THEME_OPTIONS.find(t => t.id === currentPieceTheme)?.name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
