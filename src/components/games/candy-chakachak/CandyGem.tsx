import React from 'react';
import { CandyGem, GemType } from '@/types/candy';

interface CandyGemProps {
    gem: CandyGem;
    isSelected: boolean;
    onClick: () => void;
}

export const CandyGemComponent: React.FC<CandyGemProps> = ({ gem, isSelected, onClick }) => {
    if (!gem.type) return <div className="w-full h-full" />;

    const candies: Record<string, string> = {
        'RED': '🍬',      // Wrapped Candy
        'BLUE': '🧁',     // Cupcake
        'GREEN': '🍏',    // Green Apple (Candy Coated)
        'YELLOW': '🍋',   // Lemon Drop
        'PURPLE': '🍇',   // Grape Soda/Gummy
        'ORANGE': '🍊',   // Orange Slice
    };

    // Background gradients to make the emojis pop
    const backgrounds: Record<string, string> = {
        'RED': 'bg-gradient-to-br from-red-400/20 to-red-600/20 shadow-red-500/30',
        'BLUE': 'bg-gradient-to-br from-blue-400/20 to-blue-600/20 shadow-blue-500/30',
        'GREEN': 'bg-gradient-to-br from-green-400/20 to-green-600/20 shadow-green-500/30',
        'YELLOW': 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 shadow-yellow-500/30',
        'PURPLE': 'bg-gradient-to-br from-purple-400/20 to-purple-600/20 shadow-purple-500/30',
        'ORANGE': 'bg-gradient-to-br from-orange-400/20 to-orange-600/20 shadow-orange-500/30',
    };

    // Special Overlays/Effects
    const specialEffects = {
        'HORIZONTAL': 'after:content-[""] after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-white/50 after:to-transparent after:h-full after:w-full after:animate-pulse',
        'VERTICAL': 'after:content-[""] after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent after:h-full after:w-full after:animate-pulse',
        'BOMB': 'animate-spin-slow ring-4 ring-rainbow', // Rainbow ring or similar
    };

    return (
        <div
            className={`
                relative w-full h-full p-1 cursor-pointer transition-all duration-200
                ${isSelected ? 'scale-110 z-10' : 'hover:scale-105 active:scale-95'}
                ${gem.isNew ? 'animate-in zoom-in slide-in-from-top-4 duration-500' : ''}
                ${gem.isMatched ? 'animate-out zoom-out spin-out shadow-none duration-300' : ''}
                ${gem.special === 'BOMB' ? 'z-20' : ''}
            `}
            onClick={onClick}
        >
            <div className={`
                w-full h-full rounded-2xl 
                ${gem.type ? backgrounds[gem.type] : 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-gradient-x'} 
                ${gem.special && gem.special !== 'BOMB' ? specialEffects[gem.special] : ''}
                shadow-lg backdrop-blur-sm border border-white/10
                flex items-center justify-center select-none overflow-hidden
                ${isSelected ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' : ''}
            `}>
                <span className={`text-3xl sm:text-4xl drop-shadow-md filter transition-transform duration-200 hover:rotate-12 ${gem.special === 'BOMB' ? 'animate-spin' : ''}`}>
                    {gem.type ? candies[gem.type] : '💣'}
                </span>

                {/* Bomb Overlay */}
                {gem.special === 'BOMB' && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl" />
                )}
            </div>
        </div>
    );
};
