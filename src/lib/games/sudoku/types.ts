/**
 * Sudoku Types (Client-side)
 */

export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

export interface SudokuCell {
    row: number;
    col: number;
    value: number | null;
    isFixed: boolean;
    isError: boolean;
}

export interface SudokuState {
    board: SudokuCell[][];
    solution: number[][];
    difficulty: SudokuDifficulty;
    mistakes: number;
    isComplete: boolean;
    isWon: boolean;
    startTime: number;
    endTime: number | null;
    challengeMode: boolean;
    timeLimit: number | null;
}

export interface SudokuMovePayload {
    row: number;
    col: number;
    value: number | null;
}
