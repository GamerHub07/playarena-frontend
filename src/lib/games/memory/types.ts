/**
 * Memory Game Types (Client-side)
 */

export interface MemoryCard {
    id: string;
    content: string;
    isFlipped: boolean;
    isMatched: boolean;
}

export interface MemoryState {
    cards: MemoryCard[];
    moves: number;
    matches: number;
    isComplete: boolean;
    bestScore: number;
}
