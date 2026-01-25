import React from 'react';
import { SudokuCell as CellType } from '@/types/sudoku';

interface SudokuCellProps {
    cell: CellType;
    isActive: boolean;
    onClick: () => void;
}

export const SudokuCell = ({ cell, isActive, onClick }: SudokuCellProps) => {
    // Base cell sizing and interaction
    const baseClasses = "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl cursor-pointer transition-all duration-200 select-none";

    // State-based styling
    let colorClasses = "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700/50";

    if (cell.isFixed) {
        colorClasses = "bg-zinc-100 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 font-bold";
    } else if (cell.value) {
        // User filled numbers - amber to distinguish
        colorClasses = "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-600 font-medium";
    }

    if (isActive) {
        colorClasses = "bg-amber-600 text-white dark:bg-amber-600 shadow-inner scale-105 z-10 rounded-sm";
        // Override text color for active state to ensure contrast
        if (cell.isFixed) {
            // Maybe keep fixed cells distinct even when active? Or just uniform?
            // Let's make active always blue background, white text.
        }
    } else if (cell.isError) {
        colorClasses = "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse";
    }

    return (
        <div
            className={`${baseClasses} ${colorClasses}`}
            onClick={onClick}
        >
            {cell.value}
        </div>
    );
};
