import React from 'react';
import { MemoryCard as MemoryCardType } from '@/types/memory';
import { MemoryCard } from './MemoryCard';

interface MemoryBoardProps {
    cards: MemoryCardType[];
    onCardClick: (card: MemoryCardType) => void;
}

export const MemoryBoard: React.FC<MemoryBoardProps> = ({ cards, onCardClick }) => {
    return (
        <div className="grid grid-cols-4 gap-3 sm:gap-4 p-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
            {cards.map((card) => (
                <MemoryCard
                    key={card.id}
                    card={card}
                    onClick={onCardClick}
                />
            ))}
        </div>
    );
};
