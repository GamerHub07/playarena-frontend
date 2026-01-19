/**
 * Sudoku Engine (Client-side)
 * Ported from backend for local single-player games
 */

import { SudokuState, SudokuCell, SudokuDifficulty, SudokuMovePayload } from './types';

export class SudokuEngine {
    private state: SudokuState;

    constructor(initialState?: SudokuState) {
        this.state = initialState || this.generateNewGame('easy', false);
    }

    getState(): SudokuState {
        return this.state;
    }

    handleAction(action: string, payload?: unknown): SudokuState {
        if (this.state.isComplete && action !== 'new_game') {
            return this.state;
        }

        switch (action) {
            case 'move':
                return this.handleMove(payload as SudokuMovePayload);
            case 'new_game':
                const params = payload as { difficulty?: SudokuDifficulty; challengeMode?: boolean };
                return this.generateNewGame(params?.difficulty || 'easy', !!params?.challengeMode);
            default:
                return this.state;
        }
    }

    private handleMove(payload: SudokuMovePayload): SudokuState {
        const { row, col, value } = payload;

        if (row < 0 || row > 8 || col < 0 || col > 8) return this.state;

        // Check timeout
        if (this.state.challengeMode && this.state.timeLimit) {
            const elapsed = (Date.now() - this.state.startTime) / 1000;
            if (elapsed > this.state.timeLimit) {
                this.state.isComplete = true;
                this.state.isWon = false;
                this.state.endTime = Date.now();
                return this.state;
            }
        }

        const cell = this.state.board[row][col];
        if (cell.isFixed) return this.state;

        // Challenge mode: check against solution immediately
        if (this.state.challengeMode && value !== null) {
            const correctValue = this.state.solution[row][col];
            if (value !== correctValue) {
                this.state.mistakes++;
                cell.value = value;
                cell.isError = true;

                if (this.state.mistakes >= 3) {
                    this.state.isComplete = true;
                    this.state.isWon = false;
                    this.state.endTime = Date.now();
                }
                return this.state;
            }
        }

        cell.value = value;
        cell.isError = false;

        if (!this.state.challengeMode) {
            this.validateBoard();
        }

        this.checkCompletion();
        return this.state;
    }

    private validateBoard(): void {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                this.state.board[r][c].isError = false;
            }
        }

        const checkGroup = (cells: SudokuCell[]) => {
            const seen = new Map<number, SudokuCell[]>();
            cells.forEach(cell => {
                if (cell.value !== null) {
                    if (!seen.has(cell.value)) seen.set(cell.value, []);
                    seen.get(cell.value)?.push(cell);
                }
            });
            seen.forEach((duplicates) => {
                if (duplicates.length > 1) {
                    duplicates.forEach(cell => cell.isError = true);
                }
            });
        };

        // Rows
        for (let r = 0; r < 9; r++) checkGroup(this.state.board[r]);
        // Cols
        for (let c = 0; c < 9; c++) checkGroup(this.state.board.map(row => row[c]));
        // Boxes
        for (let br = 0; br < 3; br++) {
            for (let bc = 0; bc < 3; bc++) {
                const boxCells: SudokuCell[] = [];
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        boxCells.push(this.state.board[br * 3 + r][bc * 3 + c]);
                    }
                }
                checkGroup(boxCells);
            }
        }
    }

    private checkCompletion(): void {
        let isFull = true;
        let hasErrors = false;

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = this.state.board[r][c];
                if (cell.value === null) isFull = false;
                if (cell.isError) hasErrors = true;
            }
        }

        if (isFull && !hasErrors) {
            this.state.isComplete = true;
            this.state.isWon = true;
            this.state.endTime = Date.now();
        }
    }

    generateNewGame(difficulty: SudokuDifficulty, challengeMode: boolean): SudokuState {
        const board = this.createEmptyBoard();
        this.fillBoard(board);

        const solution = board.map(row => row.map(cell => cell.value!));
        this.removeNumbers(board, difficulty);

        let timeLimit: number | null = null;
        if (challengeMode) {
            switch (difficulty) {
                case 'easy': timeLimit = 5 * 60; break;
                case 'medium': timeLimit = 10 * 60; break;
                case 'hard': timeLimit = 15 * 60; break;
            }
        }

        this.state = {
            board,
            solution,
            difficulty,
            mistakes: 0,
            isComplete: false,
            isWon: false,
            startTime: Date.now(),
            endTime: null,
            challengeMode,
            timeLimit
        };
        return this.state;
    }

    private createEmptyBoard(): SudokuCell[][] {
        return Array(9).fill(null).map((_, r) =>
            Array(9).fill(null).map((_, c) => ({
                row: r,
                col: c,
                value: null,
                isFixed: false,
                isError: false
            }))
        );
    }

    private fillBoard(board: SudokuCell[][]): boolean {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c].value === null) {
                    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                    for (const num of nums) {
                        if (this.isValidMove(board, r, c, num)) {
                            board[r][c].value = num;
                            if (this.fillBoard(board)) return true;
                            board[r][c].value = null;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    private isValidMove(board: SudokuCell[][], row: number, col: number, num: number): boolean {
        for (let c = 0; c < 9; c++) if (board[row][c].value === num) return false;
        for (let r = 0; r < 9; r++) if (board[r][col].value === num) return false;
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (board[startRow + r][startCol + c].value === num) return false;
            }
        }
        return true;
    }

    private removeNumbers(board: SudokuCell[][], difficulty: SudokuDifficulty): void {
        let attempts = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55;

        while (attempts > 0) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            while (board[row][col].value === null) {
                row = Math.floor(Math.random() * 9);
                col = Math.floor(Math.random() * 9);
            }
            board[row][col].value = null;
            attempts--;
        }

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                board[r][c].isFixed = board[r][c].value !== null;
            }
        }
    }
}
