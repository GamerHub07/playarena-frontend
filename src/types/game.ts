// Game Types

export interface Guest {
    sessionId: string;
    username: string;
}

export interface Player {
    odId: string;
    sessionId: string;
    username: string;
    position: number;
    isHost: boolean;
    isConnected: boolean;
}

export interface Room {
    code: string;
    // 1. Added 'poker' to the gameType union
    gameType: 'ludo' | 'chess' | 'carrom' | 'snake-ladder' | 'poker'; 
    status: 'waiting' | 'playing' | 'finished';
    players: Player[];
    maxPlayers: number;
    minPlayers: number;
    // 2. Add gameState here so you can access poker data globally
    gameState?: any; 
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}