import { Card as CardType } from '@/types/poker';

interface Props {
    card?: CardType;
    hidden?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
};

const suitColors = {
    hearts: 'text-red-500',
    diamonds: 'text-red-500',
    clubs: 'text-slate-900',
    spades: 'text-slate-900',
};

const sizeClasses = {
    sm: "w-8 h-12 text-sm",
    md: "w-12 h-16 md:w-16 md:h-24 text-xl",
    lg: "w-16 h-22 md:w-24 md:h-36 text-3xl",
};

export default function PokerCard({ card, hidden, className = "", size = "md" }: Props) {
    const sizeClass = sizeClasses[size];
    const baseStyle = `${sizeClass} rounded-lg flex items-center justify-center font-bold border-2 shadow-sm bg-white transition-all`;

    if (hidden || !card) {
        return (
            <div className={`${baseStyle} bg-emerald-800 border-emerald-400 border-4 ${className}`}>
                <div className="w-full h-full opacity-20 bg-[radial-gradient(circle,_#fff_1px,_transparent_1px)] bg-[size:10px_10px]" />
            </div>
        );
    }

    return (
        <div className={`${baseStyle} ${suitColors[card.suit]} border-slate-200 flex-col ${className}`}>
            <span className="text-[0.6em] self-start ml-1 leading-none">{card.rank}</span>
            <span className="leading-none">{suitSymbols[card.suit]}</span>
            <span className="text-[0.6em] self-end mr-1 leading-none rotate-180">{card.rank}</span>
        </div>
    );
}