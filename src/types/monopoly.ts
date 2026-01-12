// Monopoly-specific Types

export type TurnPhase = 'ROLL' | 'RESOLVE' | 'DECISION' | 'END_TURN' | 'DEBT' | 'JAIL';

export interface MonopolyPlayerState {
    sessionId: string;
    username: string;
    position: number;
    cash: number;
    properties: string[];
    inJail: boolean;
    jailTurns: number;
    bankrupt: boolean;
    hasGetOutOfJailCard?: boolean;
}

export interface BoardSquare {
    id: string;
    type: 'GO' | 'PROPERTY' | 'TAX' | 'JAIL' | 'GO_TO_JAIL' | 'FREE_PARKING' | 'CHANCE' | 'COMMUNITY_CHEST' | 'RAILROAD' | 'UTILITY';
    name?: string;
    price?: number;
    rent?: number;
    owner?: string | null;
    amount?: number;
    color?: string;
    // House/Hotel support
    houses?: number; // 0-4 houses, 5 = hotel
    houseCost?: number; // Cost to build one house
    rentTiers?: number[]; // [base, 1house, 2house, 3house, 4house, hotel]
}

export interface DrawnCard {
    id: string;
    text: string;
}

export type GameLogType =
    | 'PASS_GO'
    | 'RENT_PAID'
    | 'RENT_RECEIVED'
    | 'TAX_PAID'
    | 'PROPERTY_BOUGHT'
    | 'PROPERTY_SOLD'
    | 'JAIL_FINE'
    | 'CARD_COLLECT'
    | 'CARD_PAY'
    | 'CARD_TRANSFER'
    | 'HOUSE_BUILT'
    | 'HOTEL_BUILT';

export interface GameLogEntry {
    id: string;
    type: GameLogType;
    playerId: string;
    playerName: string;
    amount: number;
    description: string;
    timestamp: number;
    relatedPlayerId?: string;
    relatedPlayerName?: string;
    propertyName?: string;
}

export interface MonopolyGameState {
    currentTurnIndex: number;
    phase: TurnPhase;
    dice: [number, number] | null;
    diceSeed?: number;
    board: BoardSquare[];
    playerState: Record<string, MonopolyPlayerState>;
    lastCard?: DrawnCard | null;
    doublesCount?: number;
    gameLog: GameLogEntry[];
}

// Player token colors
export const PLAYER_TOKENS: Record<number, { name: string; color: string; emoji: string }> = {
    0: { name: 'Car', color: '#dc2626', emoji: '🚗' },
    1: { name: 'Ship', color: '#16a34a', emoji: '🚢' },
    2: { name: 'Hat', color: '#2563eb', emoji: '🎩' },
    3: { name: 'Dog', color: '#ca8a04', emoji: '🐕' },
    4: { name: 'Boot', color: '#9333ea', emoji: '👢' },
    5: { name: 'Iron', color: '#0891b2', emoji: '🔧' },
};

// Property color groups
export const PROPERTY_COLORS: Record<string, string> = {
    brown: '#8B4513',
    lightBlue: '#87CEEB',
    pink: '#FF69B4',
    orange: '#FFA500',
    red: '#ff6868ff',
    yellow: '#f3ff9aff',
    green: '#47c447ff',
    blue: '#4f4fc8ff',
};
