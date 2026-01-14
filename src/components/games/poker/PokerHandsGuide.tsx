'use client';

import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
// POKER HANDS DATA - Ranked from highest to lowest
// ═══════════════════════════════════════════════════════════════

interface PokerHand {
    rank: number;
    name: string;
    description: string;
    example: { rank: string; suit: '♠' | '♥' | '♦' | '♣' }[];
    emoji: string;
    color: string;
    rarity: string;
}

const POKER_HANDS: PokerHand[] = [
    {
        rank: 1,
        name: 'Royal Flush',
        description: 'A, K, Q, J, 10 all of the same suit. The ultimate hand!',
        example: [
            { rank: 'A', suit: '♠' },
            { rank: 'K', suit: '♠' },
            { rank: 'Q', suit: '♠' },
            { rank: 'J', suit: '♠' },
            { rank: '10', suit: '♠' },
        ],
        emoji: '👑',
        color: '#fbbf24',
        rarity: 'Legendary',
    },
    {
        rank: 2,
        name: 'Straight Flush',
        description: 'Five consecutive cards of the same suit.',
        example: [
            { rank: '9', suit: '♥' },
            { rank: '8', suit: '♥' },
            { rank: '7', suit: '♥' },
            { rank: '6', suit: '♥' },
            { rank: '5', suit: '♥' },
        ],
        emoji: '🌟',
        color: '#a855f7',
        rarity: 'Epic',
    },
    {
        rank: 3,
        name: 'Four of a Kind',
        description: 'Four cards of the same rank. Also called "Quads".',
        example: [
            { rank: 'K', suit: '♠' },
            { rank: 'K', suit: '♥' },
            { rank: 'K', suit: '♦' },
            { rank: 'K', suit: '♣' },
            { rank: '7', suit: '♠' },
        ],
        emoji: '💎',
        color: '#ec4899',
        rarity: 'Rare',
    },
    {
        rank: 4,
        name: 'Full House',
        description: 'Three of a kind plus a pair. A powerful combination!',
        example: [
            { rank: 'Q', suit: '♣' },
            { rank: 'Q', suit: '♥' },
            { rank: 'Q', suit: '♠' },
            { rank: '9', suit: '♦' },
            { rank: '9', suit: '♣' },
        ],
        emoji: '🏠',
        color: '#f97316',
        rarity: 'Uncommon',
    },
    {
        rank: 5,
        name: 'Flush',
        description: 'Five cards of the same suit, not in sequence.',
        example: [
            { rank: 'A', suit: '♦' },
            { rank: 'J', suit: '♦' },
            { rank: '8', suit: '♦' },
            { rank: '4', suit: '♦' },
            { rank: '2', suit: '♦' },
        ],
        emoji: '🃏',
        color: '#3b82f6',
        rarity: 'Uncommon',
    },
    {
        rank: 6,
        name: 'Straight',
        description: 'Five consecutive cards of different suits.',
        example: [
            { rank: '10', suit: '♠' },
            { rank: '9', suit: '♥' },
            { rank: '8', suit: '♦' },
            { rank: '7', suit: '♣' },
            { rank: '6', suit: '♠' },
        ],
        emoji: '📈',
        color: '#10b981',
        rarity: 'Common',
    },
    {
        rank: 7,
        name: 'Three of a Kind',
        description: 'Three cards of the same rank. Also called "Trips".',
        example: [
            { rank: '8', suit: '♠' },
            { rank: '8', suit: '♥' },
            { rank: '8', suit: '♦' },
            { rank: 'K', suit: '♣' },
            { rank: '4', suit: '♠' },
        ],
        emoji: '🎯',
        color: '#06b6d4',
        rarity: 'Common',
    },
    {
        rank: 8,
        name: 'Two Pair',
        description: 'Two different pairs of cards.',
        example: [
            { rank: 'J', suit: '♠' },
            { rank: 'J', suit: '♥' },
            { rank: '5', suit: '♦' },
            { rank: '5', suit: '♣' },
            { rank: 'A', suit: '♠' },
        ],
        emoji: '✌️',
        color: '#8b5cf6',
        rarity: 'Common',
    },
    {
        rank: 9,
        name: 'One Pair',
        description: 'Two cards of the same rank.',
        example: [
            { rank: 'A', suit: '♠' },
            { rank: 'A', suit: '♥' },
            { rank: 'K', suit: '♦' },
            { rank: '9', suit: '♣' },
            { rank: '4', suit: '♠' },
        ],
        emoji: '👯',
        color: '#64748b',
        rarity: 'Very Common',
    },
    {
        rank: 10,
        name: 'High Card',
        description: 'No matching cards. Highest card determines the winner.',
        example: [
            { rank: 'A', suit: '♠' },
            { rank: 'J', suit: '♥' },
            { rank: '8', suit: '♦' },
            { rank: '5', suit: '♣' },
            { rank: '2', suit: '♠' },
        ],
        emoji: '🎴',
        color: '#475569',
        rarity: 'Most Common',
    },
];

// ═══════════════════════════════════════════════════════════════
// MINI CARD COMPONENT FOR EXAMPLES
// ═══════════════════════════════════════════════════════════════

function MiniCard({ rank, suit }: { rank: string; suit: '♠' | '♥' | '♦' | '♣' }) {
    const isRed = suit === '♥' || suit === '♦';

    return (
        <div
            className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg flex flex-col items-center justify-center font-bold shadow-lg transition-transform hover:scale-110"
            style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
                border: '2px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            }}
        >
            <span className={`text-sm sm:text-base ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
                {rank}
            </span>
            <span className={`text-lg sm:text-xl ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
                {suit}
            </span>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// POKER HANDS GUIDE MODAL
// ═══════════════════════════════════════════════════════════════

interface PokerHandsGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PokerHandsGuide({ isOpen, onClose }: PokerHandsGuideProps) {
    const [selectedHand, setSelectedHand] = useState<PokerHand | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.7), 0 0 60px rgba(16, 185, 129, 0.15)',
                }}
            >
                {/* Header */}
                <div
                    className="sticky top-0 z-10 px-6 py-5 border-b border-emerald-500/20"
                    style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 95, 70, 0.15) 100%)',
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">🃏</span>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Poker Hand Rankings</h2>
                                <p className="text-emerald-400 text-sm">Learn the winning combinations</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                    <div className="grid gap-4">
                        {POKER_HANDS.map((hand, index) => (
                            <div
                                key={hand.name}
                                className="relative group rounded-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                                style={{
                                    background: selectedHand?.name === hand.name
                                        ? `linear-gradient(135deg, ${hand.color}20 0%, ${hand.color}10 100%)`
                                        : 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
                                    border: selectedHand?.name === hand.name
                                        ? `2px solid ${hand.color}80`
                                        : '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: selectedHand?.name === hand.name
                                        ? `0 8px 30px ${hand.color}30`
                                        : '0 4px 12px rgba(0, 0, 0, 0.2)',
                                }}
                                onClick={() => setSelectedHand(selectedHand?.name === hand.name ? null : hand)}
                            >
                                {/* Rank Badge */}
                                <div
                                    className="absolute -left-2 -top-2 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${hand.color} 0%, ${hand.color}dd 100%)`,
                                        boxShadow: `0 4px 15px ${hand.color}50`,
                                    }}
                                >
                                    #{hand.rank}
                                </div>

                                <div className="p-5 pl-12">
                                    {/* Hand Info Row */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{hand.emoji}</span>
                                            <div>
                                                <h3
                                                    className="text-xl font-bold"
                                                    style={{ color: hand.color }}
                                                >
                                                    {hand.name}
                                                </h3>
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{
                                                        background: `${hand.color}20`,
                                                        color: hand.color,
                                                    }}
                                                >
                                                    {hand.rarity}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Example Cards */}
                                        <div className="flex gap-1 sm:gap-2">
                                            {hand.example.map((card, i) => (
                                                <MiniCard key={i} rank={card.rank} suit={card.suit} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description (expanded) */}
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${selectedHand?.name === hand.name ? 'max-h-24 mt-4' : 'max-h-0'
                                            }`}
                                    >
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {hand.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Hover hint */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    {selectedHand?.name === hand.name ? 'Click to collapse' : 'Click for details'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer tip */}
                    <div
                        className="mt-6 p-4 rounded-xl text-center"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 95, 70, 0.1) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                        }}
                    >
                        <p className="text-emerald-400 text-sm">
                            💡 <strong>Pro Tip:</strong> In Texas Hold&apos;em, you make the best 5-card hand from your 2 hole cards and 5 community cards!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// POKER HANDS GUIDE BUTTON
// ═══════════════════════════════════════════════════════════════

export function PokerHandsGuideButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)',
                    color: '#a78bfa',
                }}
            >
                <span className="text-lg">📖</span>
                <span className="hidden sm:inline">Hand Rankings</span>
            </button>
            <PokerHandsGuide isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
