// Snake & Ladder Game Types

export interface SnakeLadderGameState {
    players: Record<number, SnakeLadderPlayerState>;
    currentPlayer: number;
    diceValue: number | null;
    lastRoll: number | null;
    turnPhase: 'roll' | 'wait';
    winner: number | null;
    moveHistory: SnakeLadderMove[];
    canRollAgain: boolean;
    consecutiveSixes: number;
}

export interface SnakeLadderPlayerState {
    position: number;  // 0 = not started, 1-100 = on board
    color: string;
}

export interface SnakeLadderMove {
    player: number;
    from: number;
    to: number;
    diceValue: number;
    usedSnake: boolean;
    snakeEnd?: number;
    usedLadder: boolean;
    ladderEnd?: number;
    timestamp: number;
}

export interface SnakeLadderMoveStep {
    playerIndex: number;
    position: number;
    row: number;
    col: number;
    stepNumber: number;
    totalSteps: number;
    moveType: 'normal' | 'snake' | 'ladder' | 'win' | 'bounce';
}

// Board configuration - snakes (head → tail)
export const SNAKES: Record<number, number> = {
    98: 40, // Super Punishment
    87: 66, // Late annoyance
    84: 58, // Upper setback
    73: 15, // Disaster
    56: 8,  // Early reset
    49: 30, // Minor setback
    33: 6,  // Start setback
    23: 2,  // Very early setback
};

// Ladders (bottom → top)
export const LADDERS: Record<number, number> = {
    4: 25,  // Start boost
    21: 39, // Mid boost
    29: 74, // Huge mid-game boost
    43: 76, // Upper mid boost
    63: 80, // Late game help
    71: 89, // End game boost
};

export const BOARD_SIZE = 100;
export const BOARD_ROWS = 10;
export const BOARD_COLS = 10;

// Player colors
export const PLAYER_COLORS: Record<number, { name: string; hex: string; bg: string }> = {
    0: { name: 'red', hex: '#E53935', bg: '#fef2f2' },
    1: { name: 'green', hex: '#43A047', bg: '#f0fdf4' },
    2: { name: 'yellow', hex: '#FDD835', bg: '#fefce8' },
    3: { name: 'blue', hex: '#1E88E5', bg: '#eff6ff' },
};

/**
 * Convert board position (1-100) to grid coordinates
 * Board is arranged bottom-to-top, alternating left-right (boustrophedon)
 */
export function positionToGrid(position: number): { row: number; col: number } {
    if (position < 1 || position > 100) {
        return { row: 9, col: 0 };
    }

    const row = 9 - Math.floor((position - 1) / 10);
    const posInRow = (position - 1) % 10;
    const isLeftToRight = (9 - row) % 2 === 0;
    const col = isLeftToRight ? posInRow : 9 - posInRow;

    return { row, col };
}

/**
 * Get all cells in the board (1-100) with their grid positions
 */
export function getBoardCells(): { position: number; row: number; col: number }[] {
    const cells: { position: number; row: number; col: number }[] = [];
    for (let pos = 1; pos <= 100; pos++) {
        const grid = positionToGrid(pos);
        cells.push({ position: pos, ...grid });
    }
    return cells;
}
