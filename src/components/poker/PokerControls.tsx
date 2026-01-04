import React, { useState, useEffect } from 'react';

interface PokerControlsProps {
  onAction: (action: string, amount?: number) => void;
  minRaise: number;
  maxChips: number;
  currentBet: number;
  playerBet: number;
  canCheck: boolean;
}

export const PokerControls: React.FC<PokerControlsProps> = ({
  onAction,
  minRaise,
  maxChips,
  currentBet,
  playerBet,
  canCheck
}) => {
  const [raiseAmount, setRaiseAmount] = useState(minRaise);

  // Sync state if props change (e.g. minRaise goes up)
  useEffect(() => {
    if (raiseAmount < minRaise) setRaiseAmount(minRaise);
  }, [minRaise]);

  const callAmount = currentBet - playerBet;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md border-t border-gray-700 p-4 flex flex-col items-center gap-4 z-50">
      
      {/* Raise Slider */}
      <div className="w-full max-w-md flex items-center gap-4">
        <span className="text-white font-mono text-sm">Raise: ${raiseAmount}</span>
        <input 
          type="range" 
          min={minRaise} 
          max={maxChips} 
          step={10} // Step 10 chips
          value={raiseAmount} 
          onChange={(e) => setRaiseAmount(Number(e.target.value))}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-400"
        />
        <button 
           onClick={() => setRaiseAmount(maxChips)}
           className="text-xs bg-red-600 px-2 py-1 rounded text-white"
        >
          MAX
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => onAction("fold")}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
        >
          FOLD
        </button>

        {canCheck ? (
          <button
            onClick={() => onAction("check")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg transition-colors border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
          >
            CHECK
          </button>
        ) : (
          <button
            onClick={() => onAction("call")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg transition-colors border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
          >
            CALL ${callAmount}
          </button>
        )}

        <button
          onClick={() => onAction("raise", raiseAmount)}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-bold shadow-lg transition-colors border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1"
        >
          RAISE TO ${currentBet + raiseAmount}
        </button>
      </div>
    </div>
  );
};
