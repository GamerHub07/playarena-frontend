/**
 * Candy Engine (Client-side)
 * Ported from backend for local single-player games
 */

import { CandyState, CandyGem, GemType } from './types';

const ROWS = 8;
const COLS = 8;
const GEM_TYPES: GemType[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];

const generateId = () => Math.random().toString(36).substr(2, 9);

export class CandyEngine {
    private state: CandyState;

    constructor(initialState?: CandyState) {
        this.state = initialState || this.startNewGame();
    }

    getState(): CandyState {
        return this.state;
    }

    handleAction(action: string, payload?: unknown): CandyState {
        if (this.state.isComplete && action !== 'restart') return this.state;

        switch (action) {
            case 'swap':
                const move = payload as { row1: number; col1: number; row2: number; col2: number };
                return this.handleSwap(move.row1, move.col1, move.row2, move.col2);
            case 'restart':
                return this.startNewGame();
            default:
                return this.state;
        }
    }

    startNewGame(): CandyState {
        this.state = {
            grid: this.createInitialGrid(),
            score: 0,
            movesLeft: 20,
            targetScore: 2000,
            isComplete: false,
            comboMultiplier: 1
        };
        return this.state;
    }

    private createInitialGrid(): CandyGem[][] {
        let grid: CandyGem[][] = [];
        do {
            grid = [];
            for (let r = 0; r < ROWS; r++) {
                const row: CandyGem[] = [];
                for (let c = 0; c < COLS; c++) {
                    row.push({
                        id: generateId(),
                        type: this.getRandomGem(),
                        row: r,
                        col: c
                    });
                }
                grid.push(row);
            }
        } while (this.hasMatches(grid));

        return grid;
    }

    private getRandomGem(): GemType {
        return GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
    }

    private hasMatches(grid: CandyGem[][]): boolean {
        // Horizontal
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS - 2; c++) {
                const type = grid[r][c].type;
                if (type && type === grid[r][c + 1].type && type === grid[r][c + 2].type) return true;
            }
        }
        // Vertical
        for (let r = 0; r < ROWS - 2; r++) {
            for (let c = 0; c < COLS; c++) {
                const type = grid[r][c].type;
                if (type && type === grid[r + 1][c].type && type === grid[r + 2][c].type) return true;
            }
        }
        return false;
    }

    private handleSwap(r1: number, c1: number, r2: number, c2: number): CandyState {
        if (this.state.movesLeft <= 0) return this.state;
        if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return this.state;

        const grid = this.state.grid;

        // Perform Swap
        const temp = grid[r1][c1];
        grid[r1][c1] = grid[r2][c2];
        grid[r2][c2] = temp;

        grid[r1][c1].row = r1;
        grid[r1][c1].col = c1;
        grid[r2][c2].row = r2;
        grid[r2][c2].col = c2;

        if (this.hasMatches(grid)) {
            this.state.movesLeft--;
            this.state.comboMultiplier = 1;
            this.resolveMatches(grid);
        } else {
            // Revert swap
            const tempRevert = grid[r1][c1];
            grid[r1][c1] = grid[r2][c2];
            grid[r2][c2] = tempRevert;

            grid[r1][c1].row = r1;
            grid[r1][c1].col = c1;
            grid[r2][c2].row = r2;
            grid[r2][c2].col = c2;
        }

        if (this.state.movesLeft === 0 || this.state.score >= this.state.targetScore) {
            this.state.isComplete = true;
        }

        return this.state;
    }

    private resolveMatches(grid: CandyGem[][]) {
        let loop = 0;
        while (this.hasMatches(grid) && loop < 10) {
            loop++;
            const matches = new Set<string>();

            // Find Horizontal Matches
            for (let r = 0; r < ROWS; r++) {
                let matchLen = 1;
                for (let c = 0; c < COLS; c++) {
                    const current = grid[r][c];
                    const next = c < COLS - 1 ? grid[r][c + 1] : null;

                    if (next && current.type && current.type === next.type) {
                        matchLen++;
                    } else {
                        if (matchLen >= 3) {
                            for (let k = 0; k < matchLen; k++) {
                                matches.add(grid[r][c - k].id);
                            }
                        }
                        matchLen = 1;
                    }
                }
            }

            // Find Vertical Matches
            for (let c = 0; c < COLS; c++) {
                let matchLen = 1;
                for (let r = 0; r < ROWS; r++) {
                    const current = grid[r][c];
                    const next = r < ROWS - 1 ? grid[r + 1][c] : null;

                    if (next && current.type && current.type === next.type) {
                        matchLen++;
                    } else {
                        if (matchLen >= 3) {
                            for (let k = 0; k < matchLen; k++) {
                                matches.add(grid[r - k][c].id);
                            }
                        }
                        matchLen = 1;
                    }
                }
            }

            // Score
            this.state.score += matches.size * 10 * this.state.comboMultiplier;
            this.state.comboMultiplier++;

            // Remove & Shift
            for (let c = 0; c < COLS; c++) {
                let shift = 0;
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (matches.has(grid[r][c].id)) {
                        shift++;
                    } else if (shift > 0) {
                        grid[r + shift][c] = grid[r][c];
                        grid[r + shift][c].row = r + shift;
                    }
                }

                for (let r = 0; r < shift; r++) {
                    grid[r][c] = {
                        id: generateId(),
                        type: this.getRandomGem(),
                        row: r,
                        col: c,
                        isNew: true
                    };
                }
            }
        }
    }
}
