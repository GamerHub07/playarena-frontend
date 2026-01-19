/**
 * Local Game Store Utility
 * Saves and loads game state to/from localStorage for single-player games
 */

const STORAGE_PREFIX = 'playarena_';

export type GameType = 'sudoku' | '2048' | 'memory' | 'candy';

export function saveGame<T>(gameType: GameType, state: T): void {
    try {
        localStorage.setItem(`${STORAGE_PREFIX}${gameType}`, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save game state:', e);
    }
}

export function loadGame<T>(gameType: GameType): T | null {
    try {
        const data = localStorage.getItem(`${STORAGE_PREFIX}${gameType}`);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.warn('Failed to load game state:', e);
        return null;
    }
}

export function clearGame(gameType: GameType): void {
    try {
        localStorage.removeItem(`${STORAGE_PREFIX}${gameType}`);
    } catch (e) {
        console.warn('Failed to clear game state:', e);
    }
}

export function savePlayerName(name: string): void {
    try {
        localStorage.setItem(`${STORAGE_PREFIX}player_name`, name);
    } catch (e) {
        console.warn('Failed to save player name:', e);
    }
}

export function getPlayerName(): string | null {
    try {
        return localStorage.getItem(`${STORAGE_PREFIX}player_name`);
    } catch (e) {
        return null;
    }
}
