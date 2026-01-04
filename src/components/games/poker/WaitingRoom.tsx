'use client';

import Card from '@/components/ui/Card';

interface Player {
  sessionId: string;
  username: string;
  isHost?: boolean;
}

interface PokerWaitingRoomProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  minPlayers: number;
  maxPlayers: number;
  onStart: () => void;
  onLeave: () => void;
}

export default function WaitingRoom({
  roomCode,
  players,
  isHost,
  minPlayers,
  maxPlayers,
  onStart,
  onLeave,
}: PokerWaitingRoomProps) {
  return (
    <div className="max-w-xl mx-auto">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Poker Room</h2>

        <p className="text-sm text-[#888] mb-4">
          Room Code: <span className="font-mono text-white">{roomCode}</span>
        </p>

        <div className="mb-4">
          <p className="text-xs text-[#888] mb-2">
            Players ({players.length}/{maxPlayers})
          </p>

          <div className="space-y-2">
            {players.map((p, idx) => (
              <div
                key={p.sessionId}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#111] border border-[#222]"
              >
                <span className="text-white">
                  {p.username}
                  {p.isHost && ' 👑'}
                </span>
                <span className="text-xs text-[#888]">Seat {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {isHost && players.length >= minPlayers && (
            <button
              onClick={onStart}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
            >
              Start Game
            </button>
          )}

          <button
            onClick={onLeave}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
          >
            Leave Room
          </button>
        </div>

        {isHost && players.length < minPlayers && (
          <p className="text-xs text-yellow-400 mt-3 text-center">
            Waiting for more players to join…
          </p>
        )}
      </Card>
    </div>
  );
}