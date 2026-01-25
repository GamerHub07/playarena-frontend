// Tic Tac Toe Game Types

// Cell value: null (empty), 'X', or 'O'
export type CellValue = null | 'X' | 'O';

// Player symbols
export const PLAYER_SYMBOLS: ['X', 'O'] = ['X', 'O'];

// Board size
export const BOARD_SIZE = 9;
export const GRID_SIZE = 3;

/**
 * Individual player state
 */
export interface TicTacToePlayerState {
    symbol: 'X' | 'O';
    moves: number;
}

/**
 * Game state for Tic Tac Toe
 */
export interface TicTacToeGameState {
    board: CellValue[];           // 9 cells (3x3 grid, flattened)
    currentPlayer: number;        // 0 or 1 (index into players array)
    players: Record<number, TicTacToePlayerState>;
    winner: number | null;        // Player index of winner, or null
    isDraw: boolean;              // True if game ended in draw
    gameStarted: boolean;         // True once game has started
    winningLine: number[] | null; // Indices of winning cells for highlighting
    lastMove: number | null;      // Index of last move for animation
}

/**
 * Player info with symbol assignment
 */
export interface TicTacToePlayer {
    username: string;
    sessionId: string;
    symbol: 'X' | 'O';
}

/**
 * Game start event payload
 */
export interface TicTacToeStartPayload {
    state: TicTacToeGameState;
    players: TicTacToePlayer[];
}

/**
 * Game winner event payload
 */
export interface TicTacToeWinnerPayload {
    winner: {
        position: number;
        username: string;
        symbol: 'X' | 'O';
    } | null;
    isDraw: boolean;
}
