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
    gameType: 'ludo' | 'chess' | 'carrom';
    status: 'waiting' | 'playing' | 'finished';
    players: Player[];
    maxPlayers: number;
    minPlayers: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}
