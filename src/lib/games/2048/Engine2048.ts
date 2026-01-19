/**
 * 2048 Engine (Client-side)
 * Ported from backend for local single-player games
 */

import { Game2048State, Tile, Direction } from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export class Engine2048 {
    private state: Game2048State;

    constructor(initialState?: Game2048State) {
        this.state = initialState || this.startNewGame();
    }

    getState(): Game2048State {
        return this.state;
    }

    handleAction(action: string, payload?: unknown): Game2048State {
        if (this.state.gameOver && action !== 'restart') return this.state;

        switch (action) {
            case 'move':
                return this.move((payload as { direction: Direction }).direction);
            case 'restart':
                return this.startNewGame();
            case 'keep_playing':
                this.state.keepPlaying = true;
                this.state.won = false;
                return this.state;
            default:
                return this.state;
        }
    }

    startNewGame(): Game2048State {
        const emptyGrid: (Tile | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
        this.addRandomTile(emptyGrid);
        this.addRandomTile(emptyGrid);

        this.state = {
            grid: emptyGrid,
            score: 0,
            bestScore: this.state?.bestScore || 0,
            gameOver: false,
            won: false,
            keepPlaying: false
        };
        return this.state;
    }

    private addRandomTile(grid: (Tile | null)[][]) {
        const emptyCells: { r: number, c: number }[] = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (!grid[r][c]) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length === 0) return;

        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[r][c] = {
            id: generateId(),
            row: r,
            col: c,
            val: Math.random() < 0.9 ? 2 : 4,
            isNew: true
        };
    }

    private move(direction: Direction): Game2048State {
        let grid = this.state.grid.map(row => row.map(tile => tile ? { ...tile } : null));
        let score = this.state.score;
        let moved = false;

        // Reset merger/new flags
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c]) {
                    grid[r][c]!.mergedFrom = undefined;
                    grid[r][c]!.isNew = false;
                }
            }
        }

        const vector = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        }[direction];

        const traverse = (callback: (r: number, c: number) => void) => {
            const range = [0, 1, 2, 3];
            const rows = direction === 'down' ? [...range].reverse() : range;
            const cols = direction === 'right' ? [...range].reverse() : range;

            rows.forEach(r => {
                cols.forEach(c => {
                    callback(r, c);
                });
            });
        };

        const inBounds = (r: number, c: number) => r >= 0 && r < 4 && c >= 0 && c < 4;

        traverse((r, c) => {
            const tile = grid[r][c];
            if (!tile) return;

            let nextR = r + vector.y;
            let nextC = c + vector.x;
            let destR = r;
            let destC = c;

            while (inBounds(nextR, nextC) && !grid[nextR][nextC]) {
                destR = nextR;
                destC = nextC;
                nextR += vector.y;
                nextC += vector.x;
            }

            if (inBounds(nextR, nextC) && grid[nextR][nextC]!.val === tile.val && !grid[nextR][nextC]!.mergedFrom) {
                const target = grid[nextR][nextC]!;
                const newVal = tile.val * 2;

                grid[nextR][nextC] = {
                    id: generateId(),
                    val: newVal,
                    row: nextR,
                    col: nextC,
                    mergedFrom: [target.id, tile.id]
                };
                grid[r][c] = null;
                score += newVal;
                moved = true;

                if (newVal === 2048 && !this.state.won && !this.state.keepPlaying) {
                    this.state.won = true;
                }
            } else if (destR !== r || destC !== c) {
                grid[destR][destC] = {
                    ...tile,
                    row: destR,
                    col: destC
                };
                grid[r][c] = null;
                moved = true;
            }
        });

        if (moved) {
            this.addRandomTile(grid);

            if (!this.movesAvailable(grid)) {
                this.state.gameOver = true;
            }

            this.state.bestScore = Math.max(score, this.state.bestScore);
        }

        this.state.grid = grid;
        this.state.score = score;

        return this.state;
    }

    private movesAvailable(grid: (Tile | null)[][]): boolean {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (!grid[r][c]) return true;
                if (c < 3 && grid[r][c]!.val === grid[r][c + 1]?.val) return true;
                if (r < 3 && grid[r][c]!.val === grid[r + 1][c]?.val) return true;
            }
        }
        return false;
    }
}
