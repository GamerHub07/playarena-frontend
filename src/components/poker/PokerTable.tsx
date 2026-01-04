import React from 'react';
import { Card } from './Card';

interface PokerTableProps {
  children?: React.ReactNode;
  communityCards: string[];
  pot: number;
}

export const PokerTable: React.FC<PokerTableProps> = ({ children, communityCards, pot }) => {
  return (
    <div className="relative w-full max-w-5xl aspect-[2/1] mx-auto my-10 bg-[#1A472A] rounded-[200px] border-[16px] border-[#2C1810] shadow-[inset_0_0_100px_rgba(0,0,0,0.6)] flex items-center justify-center">
      
      {/* Table Felt Pattern/Texture */}
      <div className="absolute inset-0 rounded-[180px] bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-30 pointer-events-none" />
      
      {/* Center Logo/Decor */}
      <div className="absolute opacity-10 text-white font-serif text-6xl tracking-widest select-none pointer-events-none">
        POKER
      </div>
      
      {/* Community Cards Area */}
      <div className="z-10 flex gap-3 p-4 bg-black/20 rounded-xl backdrop-blur-sm border border-white/10">
        {(communityCards || []).map((card, idx) => (
           <Card key={idx} card={card} />
        ))}
        {Array.from({ length: 5 - (communityCards || []).length }).map((_, i) => (
           <div key={`empty-${i}`} className="w-12 h-16 border-2 border-dashed border-white/20 rounded-md" />
        ))}
      </div>
      
      {/* Pot Display */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 px-4 py-1 rounded-full text-yellow-400 font-mono font-bold border border-yellow-500/30">
        POT: ${pot}
      </div>

      {/* Players Positioned Around Table */} 
      {/* Note: Children (Players) are absolutely positioned by the parent Page logic usually, or passed here with position classes */}
      {children}
    </div>
  );
};
