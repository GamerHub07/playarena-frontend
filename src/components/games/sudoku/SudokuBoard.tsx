import React, { useState } from 'react';
import { SudokuCell } from './SudokuCell';
import { SudokuCell as CellType } from '@/types/sudoku';

interface SudokuBoardProps {
    board: CellType[][];
    onCellClick: (row: number, col: number) => void;
    activeCell: { row: number, col: number } | null;
}

export const SudokuBoard = ({ board, onCellClick, activeCell }: SudokuBoardProps) => {
    // Helper to extract 3x3 subgrids
    const getSubGrid = (boxIndex: number) => {
        const startRow = Math.floor(boxIndex / 3) * 3;
        const startCol = (boxIndex % 3) * 3;
        const cells = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                cells.push(board[startRow + r][startCol + c]);
            }
        }
        return cells;
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            {/* Main Board Container - The gap-2 creates the thick "major" grid lines */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-zinc-800 dark:bg-zinc-900 rounded-xl shadow-2xl ring-4 ring-zinc-200 dark:ring-zinc-800">
                {[...Array(9)].map((_, boxIndex) => (
                    // Subgrid Container - The gap-[1px] creates the thin "minor" grid lines
                    <div key={boxIndex} className="grid grid-cols-3 gap-[1px] bg-zinc-300 dark:bg-zinc-700 overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
                        {getSubGrid(boxIndex).map((cell) => (
                            <SudokuCell
                                key={`${cell.row}-${cell.col}`}
                                cell={cell}
                                isActive={activeCell?.row === cell.row && activeCell?.col === cell.col}
                                onClick={() => onCellClick(cell.row, cell.col)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
