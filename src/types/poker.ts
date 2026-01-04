export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
    suit: Suit;
    rank: Rank;
}

export type GameStatus = 'waiting' | 'dealing' | 'betting' | 'showdown' | 'ended';

export interface Player {
    id: string;
    username: string;
    chips: number;
    bet: number;
    cards: Card[];
    isFolded: boolean;
    isAllIn: boolean;
    isHost: boolean;
    isTurn: boolean;
    position: number;
}

export interface PokerGameState {
    roomCode: string;
    status: GameStatus;
    players: Player[];
    communityCards: Card[];
    pot: number;
    currentBet: number;
    dealerPosition: number;
    activePlayerId: string | null;
    smallBlind: number;
    bigBlind: number;
    winners: string[] | null;
    winningHandDescription?: string;
}