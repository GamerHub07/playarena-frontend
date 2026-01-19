
import { Game2048State, Direction, Tile } from '@/types/game2048';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function calculateNextState(currentState: Game2048State, direction: Direction): Game2048State | null {
  // Deep clone grid
  let grid = currentState.grid.map(row => row.map(tile => tile ? { ...tile } : null));
  let score = currentState.score;
  let moved = false;
  let won = currentState.won;

  // Reset mergedFrom/isNew flags on clone
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c]) {
        grid[r][c]!.mergedFrom = undefined;
        grid[r][c]!.isNew = false;
      }
    }
  }

  const vector = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  }[direction];

  const inBounds = (r: number, c: number) => r >= 0 && r < 4 && c >= 0 && c < 4;

  // Traverse logic (from Engine2048.ts)
  const traverse = (callback: (r: number, c: number) => void) => {
    const range = [0, 1, 2, 3];
    const rows = direction === 'down' ? [...range].reverse() : range;
    const cols = direction === 'right' ? [...range].reverse() : range;

    rows.forEach(r => {
      cols.forEach(c => {
        callback(r, c);
      });
    });
  };

  traverse((r, c) => {
    const tile = grid[r][c];
    if (!tile) return;

    let nextR = r + vector.y;
    let nextC = c + vector.x;
    let destR = r;
    let destC = c;

    // Find farthest position
    while (inBounds(nextR, nextC) && !grid[nextR][nextC]) {
      destR = nextR;
      destC = nextC;
      nextR += vector.y;
      nextC += vector.x;
    }

    // Check merge
    if (inBounds(nextR, nextC) && grid[nextR][nextC]!.val === tile.val && !grid[nextR][nextC]!.mergedFrom) {
      // Merge!
      const target = grid[nextR][nextC]!;
      const newVal = tile.val * 2;

      grid[nextR][nextC] = {
        id: generateId(),
        val: newVal,
        row: nextR,
        col: nextC,
        mergedFrom: [target.id, tile.id]
      };
      grid[r][c] = null;
      score += newVal;
      moved = true;

      if (newVal === 2048 && !currentState.keepPlaying && !currentState.won) {
        won = true;
      }
    } else if (destR !== r || destC !== c) {
      // Just move
      grid[destR][destC] = {
        ...tile,
        row: destR,
        col: destC
      };
      grid[r][c] = null;
      moved = true;
    }
  });

  if (!moved) return null;

  // NOTE: We do NOT add a random tile here. 
  // We want the UI to show the slide/merge instantly, 
  // and wait for the server to spawn the new tile.

  return {
    ...currentState,
    grid,
    score,
    bestScore: Math.max(score, currentState.bestScore),
    won
  };
}
