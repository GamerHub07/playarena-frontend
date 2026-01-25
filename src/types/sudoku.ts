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
    difficulty: SudokuDifficulty;
    mistakes: number;
    isComplete: boolean;
    startTime: number;
    endTime: number | null;
    challengeMode: boolean;
    timeLimit: number | null;
    isWon: boolean;
}
