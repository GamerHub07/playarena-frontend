import React from 'react';

interface CardProps {
  card: string; // e.g. "AH", "Td", "2s"
  className?: string;
  hidden?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, className = "", hidden = false }) => {
  if (hidden || !card) {
    return (
      <div className={`w-12 h-16 bg-blue-800 rounded border-2 border-white shadow-md flex items-center justify-center ${className}`}>
        <div className="w-8 h-12 border border-blue-600 rounded-sm bg-blue-700 repeating-linear-gradient-pattern" />
      </div>
    );
  }

  const rank = card.slice(0, -1);
  const suit = card.slice(-1); // H, D, C, S

  const isRed = suit === 'H' || suit === 'D';
  
  const getSuitIcon = (s: string) => {
    switch (s) {
      case 'H': return '♥';
      case 'D': return '♦';
      case 'C': return '♣';
      case 'S': return '♠';
      default: return '?';
    }
  };

  return (
    <div className={`
      w-12 h-16 bg-white rounded border border-gray-300 shadow-md 
      flex flex-col items-center justify-between p-1 select-none 
      ${isRed ? 'text-red-600' : 'text-black'} 
      ${className}
    `}>
      <div className="text-xs font-bold leading-none self-start">{rank}</div>
      <div className="text-xl leading-none">{getSuitIcon(suit)}</div>
      <div className="text-xs font-bold leading-none self-end transform rotate-180">{rank}</div>
    </div>
  );
};
