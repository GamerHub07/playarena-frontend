'use client';

import Card from '@/components/ui/Card';
import { Player } from '@/types/game';

interface WaitingRoomProps {
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
}: WaitingRoomProps) {
  return (
    <div className="pt-24 max-w-md mx-auto">
      <Card className="p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Room Code: {roomCode}
        </h2>

        <p className="text-[#888] mb-4">
          Players ({players.length}/{maxPlayers})
        </p>

        <ul className="mb-6">
          {players.map(p => (
            <li key={p.sessionId} className="text-white">
              {p.username}
            </li>
          ))}
        </ul>

        {isHost && players.length >= minPlayers && (
          <button
            onClick={onStart}
            className="w-full mb-3 bg-blue-600 py-2 rounded"
          >
            Start Game
          </button>
        )}

        <button
          onClick={onLeave}
          className="w-full bg-gray-700 py-2 rounded"
        >
          Leave Room
        </button>
      </Card>
    </div>
  );
}
