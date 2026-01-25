import React from 'react';
import { MemoryCard as MemoryCardType } from '@/types/memory';

interface MemoryCardProps {
    card: MemoryCardType;
    onClick: (card: MemoryCardType) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ card, onClick }) => {
    return (
        <div
            className="group relative w-20 h-20 sm:w-24 sm:h-24 [perspective:1000px] cursor-pointer"
            onClick={() => !card.isFlipped && !card.isMatched && onClick(card)}
        >
            <div
                className={`w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${(card.isFlipped || card.isMatched) ? "[transform:rotateY(180deg)]" : ""}`}
            >
                {/* Back Face (Pattern) */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center border-2 border-white/20">
                    <span className="text-2xl text-white/50 font-bold">?</span>
                </div>

                {/* Front Face (Content) */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white dark:bg-zinc-800 rounded-xl shadow-lg flex items-center justify-center border-2 border-indigo-400">
                    <span className="text-4xl sm:text-5xl select-none animate-in zoom-in duration-300">
                        {card.content}
                    </span>
                    {card.isMatched && (
                        <div className="absolute inset-0 bg-green-500/20 rounded-xl flex items-center justify-center animate-pulse">
                            <span className="sr-only">Matched</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
