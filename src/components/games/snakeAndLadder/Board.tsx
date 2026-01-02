import Cell from "./Cell";
import Token from "./Token";
import SnakeLadderOverlay from "./SnakeLadderOverlay";
import { BOARD_SIZE, getCellPosition } from "./boardConfig";
import { Player } from "@/types/game";

interface BoardProps {
  positions: number[];
  players: Player[];
}

export default function Board({ positions, players }: BoardProps) {
  return (
    <div className="relative w-full max-w-[90vw] sm:max-w-md mx-auto aspect-square">
      {/* Grid */}
      <div
        className="grid w-full h-full"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
      >
        {Array.from({ length: 100 }, (_, i) => (
          <Cell key={i} value={100 - i} />
        ))}
      </div>

      {/* Snakes & Ladders */}
      <SnakeLadderOverlay />

      {/* Tokens */}
      {positions?.map((cell, index) => {
        if (cell === 0) return null;
        const { row, col } = getCellPosition(cell);

        return (
          <div
            key={players[index]?.sessionId}
            className="absolute transition-all duration-300"
            style={{
              top: `${row * 10}%`,
              left: `${col * 10}%`,
            }}
          >
            <Token color="#2563EB" />
          </div>
        );
      })}
    </div>
  );
}
