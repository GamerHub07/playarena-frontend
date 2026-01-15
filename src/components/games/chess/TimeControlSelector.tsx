"use client";

import { TIME_CONTROLS } from "./chessConstants";

interface TimeControlSelectorProps {
    selectedTime: number;
    onTimeChange: (minutes: number) => void;
    isHost: boolean;
}

export default function TimeControlSelector({
    selectedTime,
    onTimeChange,
    isHost,
}: TimeControlSelectorProps) {
    if (!isHost) {
        return (
            <div className="max-w-md mx-auto mb-6">
                <div className="bg-[#262522] rounded-lg p-4 text-center">
                    <p className="text-gray-400">Waiting for host to start the game...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mb-6">
            <div className="bg-[#262522] rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 text-center">Time Control</h3>
                <div className="grid grid-cols-3 gap-2">
                    {TIME_CONTROLS.map((tc) => (
                        <button
                            key={tc.minutes}
                            onClick={() => onTimeChange(tc.minutes)}
                            className={`px-4 py-3 rounded-lg font-semibold transition-all ${selectedTime === tc.minutes
                                    ? "bg-[#81b64c] text-white"
                                    : "bg-[#3d3935] text-gray-300 hover:bg-[#4d4945]"
                                }`}
                        >
                            <div className="text-lg">{tc.minutes} min</div>
                            <div className="text-xs opacity-70">{tc.name}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
