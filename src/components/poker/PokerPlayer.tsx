import React from 'react';
import { PokerPlayerState } from '@/types/poker';
import { Card } from './Card';

interface PokerPlayerProps {
  player: PokerPlayerState;
  isDealer?: boolean;
  isCurrentTurn?: boolean;
  isWinner?: boolean;
  positionClass?: string;
}

export const PokerPlayer: React.FC<PokerPlayerProps> = ({ 
  player, 
  isDealer, 
  isCurrentTurn, 
  isWinner,
  positionClass = ""
}) => {
  return (
    <div className={`flex flex-col items-center gap-2 ${positionClass}`}>
      {/* Cards */}
      <div className="flex -space-x-4 mb-2 h-16 justify-center">
        {player.hand ? (
          player.hand.map((c, i) => (
            <Card key={i} card={c} className="transform hover:-translate-y-2 transition-transform" />
          ))
        ) : (
          player.status === "ACTIVE" || player.status === "ALL_IN" ? (
             <>
               <Card card="" hidden className="transform -rotate-6" />
               <Card card="" hidden className="transform rotate-6" />
             </>
          ) : null
        )}
      </div>

      {/* Avatar / Info Bubble */}
      <div className={`
        relative w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center
        bg-gray-900 text-white shadow-lg transition-all duration-300
        ${isCurrentTurn ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] scale-110' : 'border-gray-700'}
        ${player.status === "FOLDED" ? 'opacity-50 grayscale' : ''}
        ${isWinner ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)]' : ''}
      `}>
        <div className="font-bold truncate w-20 text-center text-sm">{player.username}</div>
        <div className="text-yellow-400 text-xs font-mono">
            ${player.chips}
        </div>
        
        {/* Status Badge */}
        {player.status !== "ACTIVE" && (
            <div className="absolute -bottom-2 bg-gray-800 text-xs px-2 py-0.5 rounded-full border border-gray-600">
                {player.status}
            </div>
        )}
        
        {/* Dealer Button */}
        {isDealer && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center font-bold text-xs border-2 border-gray-400 shadow-sm">
                D
            </div>
        )}

        {/* Action Indicator (Bet) */}
        {player.totalBetThisRound > 0 && (
             <div className="absolute -top-8 bg-black/60 text-white px-2 py-1 rounded text-xs animate-fade-in">
                 Bet: ${player.totalBetThisRound}
             </div>
        )}
      </div>
    </div>
  );
};
