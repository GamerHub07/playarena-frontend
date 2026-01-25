import React from 'react';
import Button from '@/components/ui/Button';

interface SudokuControlsProps {
    onNumberClick: (num: number) => void;
    onClear: () => void;
    onNewGameClick: () => void;
}

export const SudokuControls = ({ onNumberClick, onClear, onNewGameClick }: SudokuControlsProps) => {
    return (
        <div className="flex flex-col gap-4 w-full max-w-[500px] mt-6">
            <div className="grid grid-cols-9 gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => onNumberClick(num)}
                        className="aspect-square flex items-center justify-center text-lg sm:text-xl font-bold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 transition-all active:scale-95"
                    >
                        {num}
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onClear}
                >
                    Clear Cell
                </Button>
                <Button
                    variant="primary"
                    className="flex-1"
                    onClick={onNewGameClick}
                >
                    New Game
                </Button>
            </div>
        </div>
    );
};
