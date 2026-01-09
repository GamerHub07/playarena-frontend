'use client';

import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';

interface MoveNavigatorProps {
    currentMoveIndex: number | null; // null = viewing current position
    totalMoves: number;
    onGoToMove: (index: number | null) => void;
}

export default function MoveNavigator({
    currentMoveIndex,
    totalMoves,
    onGoToMove,
}: MoveNavigatorProps) {
    // If null, we're viewing the current (latest) position
    const viewingIndex = currentMoveIndex ?? totalMoves;
    const isAtStart = viewingIndex === 0;
    const isAtEnd = viewingIndex === totalMoves;
    const isReviewMode = currentMoveIndex !== null && currentMoveIndex < totalMoves;

    const goToFirst = () => onGoToMove(0);
    const goToPrev = () => onGoToMove(Math.max(0, viewingIndex - 1));
    const goToNext = () => {
        const next = viewingIndex + 1;
        onGoToMove(next >= totalMoves ? null : next);
    };
    const goToCurrent = () => onGoToMove(null);

    if (totalMoves === 0) {
        return null; // Don't show navigator if no moves yet
    }

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3">
            {/* Review mode banner */}
            {isReviewMode && (
                <div className="mb-3 px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-yellow-400 text-xs font-medium">
                            📋 Reviewing move {viewingIndex + 1} of {totalMoves}
                        </span>
                        <button
                            onClick={goToCurrent}
                            className="text-xs text-yellow-400 hover:text-yellow-300 underline"
                        >
                            Return to game
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation controls */}
            <div className="flex items-center justify-center gap-2">
                <button
                    onClick={goToFirst}
                    disabled={isAtStart}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="First move"
                >
                    <ChevronFirst className="w-5 h-5 text-white" />
                </button>

                <button
                    onClick={goToPrev}
                    disabled={isAtStart}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Previous move"
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                {/* Move indicator */}
                <div className="px-4 py-1 bg-white/5 rounded-lg min-w-[80px] text-center">
                    <span className="text-sm text-gray-300 font-mono">
                        {viewingIndex} / {totalMoves}
                    </span>
                </div>

                <button
                    onClick={goToNext}
                    disabled={isAtEnd}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Next move"
                >
                    <ChevronRight className="w-5 h-5 text-white" />
                </button>

                <button
                    onClick={goToCurrent}
                    disabled={isAtEnd}
                    className={`p-2 rounded-lg transition-all ${isAtEnd
                            ? 'bg-white/10 opacity-30 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-500'
                        }`}
                    title="Current position"
                >
                    <ChevronLast className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Keyboard hints */}
            <div className="mt-2 text-center">
                <span className="text-[10px] text-gray-500">
                    Use ← → arrow keys to navigate
                </span>
            </div>
        </div>
    );
}
