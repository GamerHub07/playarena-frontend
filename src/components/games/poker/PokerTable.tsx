'use client';

import Card from '@/components/ui/Card';
import { Player } from '@/types/game';
import { PokerGameState } from '@/types/poker';

export type PokerAction = 'check' | 'call' | 'raise' | 'fold';

interface PokerTableProps {
  gameState: PokerGameState;
  players: Player[];
  onAction: (action: PokerAction, amount?: number) => void;
}

export default function PokerTable({
  gameState,
  players,
  onAction,
}: PokerTableProps) {
  return (
    <div className="max-w-6xl mx-auto pt-24 px-4">
      <Card className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Poker Table
        </h2>

        {/* Players */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {players.map((p, i) => (
            <div key={p.sessionId} className="bg-[#1a1a1a] p-3 rounded">
              <p className="text-white font-semibold">{p.username}</p>
              <p className="text-sm text-[#888]">
                Chips: {gameState.players[i]?.chips ?? 0}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onAction('check')}
            className="px-4 py-2 bg-gray-600 rounded"
          >
            Check
          </button>

          <button
            onClick={() => onAction('call')}
            className="px-4 py-2 bg-blue-600 rounded"
          >
            Call
          </button>

          <button
            onClick={() => onAction('raise', 50)}
            className="px-4 py-2 bg-green-600 rounded"
          >
            Raise
          </button>

          <button
            onClick={() => onAction('fold')}
            className="px-4 py-2 bg-red-600 rounded"
          >
            Fold
          </button>
        </div>
      </Card>
    </div>
  );
}
