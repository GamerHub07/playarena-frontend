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

export const PLAYER_COLORS: Record<number, { name: PlayerColor; hex: string; bg: string }> = {
    0: { name: 'red', hex: '#dc2626', bg: '#fef2f2' },
    1: { name: 'green', hex: '#16a34a', bg: '#f0fdf4' },
    2: { name: 'yellow', hex: '#ca8a04', bg: '#fefce8' },
    3: { name: 'blue', hex: '#2563eb', bg: '#eff6ff' },
};
