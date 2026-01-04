// Ludo-specific Types

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface TokenPosition {
    zone: 'home' | 'path' | 'safe' | 'finish';
    index: number;
}

export interface PlayerState {
    color: PlayerColor;
    tokens: TokenPosition[];
    finishedTokens: number;
}

export interface LudoGameState {
    players: Record<number, PlayerState>;
    currentPlayer: number;
    diceValue: number | null;
    lastRoll: number | null;
    canRollAgain: boolean;
    turnPhase: 'roll' | 'move' | 'wait';
    winner: number | null;
    movableTokens?: number[]; // Tokens that can be moved after rolling
}

// Vintage/Classic color palette for player colors
export const PLAYER_COLORS: Record<number, { name: PlayerColor; hex: string; bg: string }> = {
    0: { name: 'red', hex: '#8B2635', bg: '#D4A5A5' },      // Burgundy red
    1: { name: 'green', hex: '#2D5A3D', bg: '#A8C5B5' },    // Forest green
    2: { name: 'yellow', hex: '#C9A227', bg: '#E8D9A0' },   // Antique gold
    3: { name: 'blue', hex: '#2C4A6E', bg: '#A3B8CC' },     // Navy blue
};
