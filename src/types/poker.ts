/**
 * Poker Game Types (Frontend)
 * 
 * Type definitions mirroring the backend for type safety.
 */

// ═══════════════════════════════════════════════════════════════
// CARD DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
    suit: Suit;
    rank: Rank;
}

// ═══════════════════════════════════════════════════════════════
// PLAYER STATE
// ═══════════════════════════════════════════════════════════════

export interface PokerPlayerState {
    sessionId: string;
    username: string;
    position: number;
    hand: Card[];
    chips: number;
    currentBet: number;
    totalBetThisHand: number;
    folded: boolean;
    allIn: boolean;
    isDealer: boolean;
    isSmallBlind: boolean;
    isBigBlind: boolean;
    hasActed: boolean;
    isActive: boolean;
    lastAction?: PlayerAction;
}

// ═══════════════════════════════════════════════════════════════
// GAME STATE
// ═══════════════════════════════════════════════════════════════

export type BettingPhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'ended';
export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export interface SidePot {
    amount: number;
    eligiblePlayers: number[];
}

export interface WinnerInfo {
    playerIndex: number;
    amount: number;
    handName: string;
    handCards: Card[];
}

export interface PokerGameState {
    players: Record<number, PokerPlayerState>;
    communityCards: Card[];
    pot: number;
    sidePots: SidePot[];
    currentBet: number;
    minRaise: number;
    smallBlind: number;
    bigBlind: number;
    currentPlayerIndex: number;
    dealerIndex: number;
    phase: BettingPhase;
    handNumber: number;
    winners: WinnerInfo[] | null;
    gameWinner: number | null;
    isGameOver: boolean;
}

// ═══════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════

export const SUIT_SYMBOLS: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
};

export const SUIT_COLORS: Record<Suit, string> = {
    hearts: '#ef4444',
    diamonds: '#ef4444',
    clubs: '#1f2937',
    spades: '#1f2937',
};

/**
 * Get display string for a card
 */
export function cardToString(card: Card): string {
    return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}

/**
 * Get action display name
 */
export function actionToString(action: PlayerAction, amount?: number): string {
    switch (action) {
        case 'fold': return 'Folded';
        case 'check': return 'Checked';
        case 'call': return 'Called';
        case 'raise': return amount ? `Raised $${amount}` : 'Raised';
        case 'all-in': return 'All-In';
        default: return action;
    }
}

/**
 * Get phase display name
 */
export function phaseToString(phase: BettingPhase): string {
    switch (phase) {
        case 'waiting': return 'Waiting';
        case 'preflop': return 'Pre-Flop';
        case 'flop': return 'Flop';
        case 'turn': return 'Turn';
        case 'river': return 'River';
        case 'showdown': return 'Showdown';
        case 'ended': return 'Game Over';
        default: return phase;
    }
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;
export const STARTING_CHIPS = 1000;

// ═══════════════════════════════════════════════════════════════
// HAND EVALUATION HELPERS
// ═══════════════════════════════════════════════════════════════

export type HandRank =
    | 'High Card'
    | 'Pair'
    | 'Two Pair'
    | 'Three of a Kind'
    | 'Straight'
    | 'Flush'
    | 'Full House'
    | 'Four of a Kind'
    | 'Straight Flush'
    | 'Royal Flush';

export interface HandEvaluation {
    rank: HandRank;
    description: string;
    strength: number; // 1-10 for sorting/styling
    color: string;    // For UI styling
    emoji: string;    // Fun indicator
}

const RANK_VALUES: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

/**
 * Count occurrences of each rank in a set of cards
 */
function getRankCounts(cards: Card[]): Map<Rank, number> {
    const counts = new Map<Rank, number>();
    cards.forEach(card => {
        counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
    });
    return counts;
}

/**
 * Count occurrences of each suit in a set of cards
 */
function getSuitCounts(cards: Card[]): Map<Suit, number> {
    const counts = new Map<Suit, number>();
    cards.forEach(card => {
        counts.set(card.suit, (counts.get(card.suit) || 0) + 1);
    });
    return counts;
}

/**
 * Check if cards contain a flush (5+ of same suit)
 */
function hasFlush(cards: Card[]): Suit | null {
    const suitCounts = getSuitCounts(cards);
    for (const [suit, count] of suitCounts) {
        if (count >= 5) return suit;
    }
    return null;
}

/**
 * Check if cards contain a straight (5 consecutive ranks)
 */
function hasStraight(cards: Card[]): boolean {
    const values = [...new Set(cards.map(c => RANK_VALUES[c.rank]))].sort((a, b) => a - b);

    // Check for Ace-low straight (A-2-3-4-5)
    if (values.includes(14)) {
        values.unshift(1); // Add Ace as low
    }

    let consecutive = 1;
    for (let i = 1; i < values.length; i++) {
        if (values[i] === values[i - 1] + 1) {
            consecutive++;
            if (consecutive >= 5) return true;
        } else if (values[i] !== values[i - 1]) {
            consecutive = 1;
        }
    }
    return false;
}

/**
 * Check for straight flush
 */
function hasStraightFlush(cards: Card[]): boolean {
    const flushSuit = hasFlush(cards);
    if (!flushSuit) return false;

    const flushCards = cards.filter(c => c.suit === flushSuit);
    return hasStraight(flushCards);
}

/**
 * Check for royal flush (10-J-Q-K-A of same suit)
 */
function hasRoyalFlush(cards: Card[]): boolean {
    const flushSuit = hasFlush(cards);
    if (!flushSuit) return false;

    const flushCards = cards.filter(c => c.suit === flushSuit);
    const royalRanks: Rank[] = ['10', 'J', 'Q', 'K', 'A'];
    return royalRanks.every(rank => flushCards.some(c => c.rank === rank));
}

/**
 * Evaluate the best poker hand from hole cards + community cards
 */
export function evaluateHand(holeCards: Card[], communityCards: Card[]): HandEvaluation {
    const allCards = [...holeCards, ...communityCards];

    // Need at least 2 cards to evaluate
    if (allCards.length < 2) {
        return {
            rank: 'High Card',
            description: 'Waiting for cards...',
            strength: 0,
            color: '#6b7280',
            emoji: '🃏'
        };
    }

    const rankCounts = getRankCounts(allCards);
    const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);

    // Check for hands from highest to lowest
    if (hasRoyalFlush(allCards)) {
        return {
            rank: 'Royal Flush',
            description: 'Royal Flush! 👑',
            strength: 10,
            color: '#fbbf24',
            emoji: '👑'
        };
    }

    if (hasStraightFlush(allCards)) {
        return {
            rank: 'Straight Flush',
            description: 'Straight Flush!',
            strength: 9,
            color: '#f59e0b',
            emoji: '🌟'
        };
    }

    if (counts[0] >= 4) {
        const quadRank = Array.from(rankCounts.entries()).find(([_, c]) => c >= 4)?.[0];
        return {
            rank: 'Four of a Kind',
            description: `Four ${quadRank}s!`,
            strength: 8,
            color: '#ef4444',
            emoji: '🔥'
        };
    }

    if (counts[0] >= 3 && counts[1] >= 2) {
        return {
            rank: 'Full House',
            description: 'Full House!',
            strength: 7,
            color: '#ec4899',
            emoji: '🏠'
        };
    }

    if (hasFlush(allCards)) {
        const flushSuit = hasFlush(allCards)!;
        return {
            rank: 'Flush',
            description: `Flush (${flushSuit})`,
            strength: 6,
            color: '#8b5cf6',
            emoji: '💜'
        };
    }

    if (hasStraight(allCards)) {
        return {
            rank: 'Straight',
            description: 'Straight!',
            strength: 5,
            color: '#06b6d4',
            emoji: '📈'
        };
    }

    if (counts[0] >= 3) {
        const tripRank = Array.from(rankCounts.entries()).find(([_, c]) => c >= 3)?.[0];
        return {
            rank: 'Three of a Kind',
            description: `Three ${tripRank}s`,
            strength: 4,
            color: '#10b981',
            emoji: '🎯'
        };
    }

    if (counts[0] >= 2 && counts[1] >= 2) {
        return {
            rank: 'Two Pair',
            description: 'Two Pair',
            strength: 3,
            color: '#D97706',
            emoji: '✌️'
        };
    }

    if (counts[0] >= 2) {
        const pairRank = Array.from(rankCounts.entries()).find(([_, c]) => c >= 2)?.[0];
        return {
            rank: 'Pair',
            description: `Pair of ${pairRank}s`,
            strength: 2,
            color: '#6366f1',
            emoji: '👯'
        };
    }

    // High card
    const highCard = allCards.reduce((a, b) =>
        RANK_VALUES[a.rank] > RANK_VALUES[b.rank] ? a : b
    );
    return {
        rank: 'High Card',
        description: `High Card: ${highCard.rank}`,
        strength: 1,
        color: '#6b7280',
        emoji: '🃏'
    };
}
