/**
 * Memory Engine (Client-side)
 * Ported from backend for local single-player games
 */

import { MemoryState, MemoryCard } from './types';

const EMOJIS = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍓', '🍑', '🍍'];

export class MemoryEngine {
    private state: MemoryState;

    constructor(initialState?: MemoryState) {
        this.state = initialState || this.startNewGame();
    }

    getState(): MemoryState {
        return this.state;
    }

    handleAction(action: string, payload?: unknown): MemoryState {
        switch (action) {
            case 'flip':
                return this.flipCard((payload as { cardId: string }).cardId);
            case 'restart':
                return this.startNewGame();
            default:
                return this.state;
        }
    }

    startNewGame(): MemoryState {
        const cards: MemoryCard[] = [];
        const items = [...EMOJIS, ...EMOJIS];

        // Fisher-Yates Shuffle
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }

        items.forEach((item, index) => {
            cards.push({
                id: `card-${index}`,
                content: item,
                isFlipped: false,
                isMatched: false
            });
        });

        this.state = {
            cards,
            moves: 0,
            matches: 0,
            isComplete: false,
            bestScore: this.state?.bestScore || 0
        };

        return this.state;
    }

    private flipCard(cardId: string): MemoryState {
        const cardIndex = this.state.cards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return this.state;

        const card = this.state.cards[cardIndex];

        if (card.isMatched || card.isFlipped) return this.state;

        const flipped = this.state.cards.filter(c => c.isFlipped && !c.isMatched);

        if (flipped.length === 2) {
            // Third click: Reset the previous two mismatches
            flipped.forEach(c => c.isFlipped = false);
            this.state.cards[cardIndex].isFlipped = true;
        } else if (flipped.length === 1) {
            // Second click: Flip and check match
            this.state.cards[cardIndex].isFlipped = true;
            this.state.moves++;

            const otherCard = flipped[0];
            if (otherCard.content === card.content) {
                // Match!
                otherCard.isMatched = true;
                this.state.cards[cardIndex].isMatched = true;
                this.state.matches++;

                // Check Win
                if (this.state.matches === EMOJIS.length) {
                    this.state.isComplete = true;
                    if (this.state.bestScore === 0 || this.state.moves < this.state.bestScore) {
                        this.state.bestScore = this.state.moves;
                    }
                }
            }
        } else {
            // First click
            this.state.cards[cardIndex].isFlipped = true;
        }

        return this.state;
    }
}
