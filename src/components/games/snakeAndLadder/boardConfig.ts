export const BOARD_SIZE = 10;
export const CELL_COUNT = 100;

// Snakes & ladders (same as backend)
export const SNAKES: Record<number, number> = {
  99: 54,
  70: 55,
  52: 42,
  25: 2,
};

export const LADDERS: Record<number, number> = {
  6: 25,
  11: 40,
  46: 90,
  60: 85,
};

// Convert cell number (1–100) → grid row/col
export function getCellPosition(cell: number) {
  const index = cell - 1;
  const rowFromBottom = Math.floor(index / 10);
  const colInRow = index % 10;

  const isEvenRow = rowFromBottom % 2 === 0;
  const col = isEvenRow ? colInRow : 9 - colInRow;

  return {
    row: 9 - rowFromBottom,
    col,
  };
}
