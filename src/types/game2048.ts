export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Tile {
    id: string;
    val: number;
    row: number;
    col: number;
    mergedFrom?: string[];
    isNew?: boolean;
}

export interface Game2048State {
    grid: (Tile | null)[][];
    score: number;
    bestScore: number;
    gameOver: boolean;
    won: boolean;
    keepPlaying: boolean;
}
