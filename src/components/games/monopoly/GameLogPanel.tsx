'use client';

interface GameLog {
  id: number;
  message: string;
  timestamp: number;
  type: 'roll' | 'buy' | 'rent' | 'card' | 'jail' | 'move' | 'system';
}

interface GameLogPanelProps {
  logs: GameLog[];
}

const LOG_ICONS: Record<GameLog['type'], string> = {
  roll: '🎲',
  buy: '🏠',
  rent: '💰',
  card: '🃏',
  jail: '🔒',
  move: '👣',
  system: '📢',
};

export default function GameLogPanel({ logs }: GameLogPanelProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 max-h-[300px] overflow-y-auto">
      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <span>📜</span> Game Log
      </h4>
      
      {logs.length === 0 ? (
        <p className="text-xs text-[#666] text-center py-4">No events yet...</p>
      ) : (
        <div className="space-y-2">
          {logs.slice().reverse().map((log) => (
            <div
              key={log.id}
              className="text-xs text-[#aaa] flex gap-2 items-start py-1 border-b border-[#2a2a2a] last:border-b-0"
            >
              <span className="flex-shrink-0">{LOG_ICONS[log.type]}</span>
              <span className="flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { GameLog };
