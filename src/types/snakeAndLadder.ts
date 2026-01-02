export interface SnakeAndLadderState {
  positions: number[]; // index = playerIndex
  currentPlayer: number;
  lastDice: number | null;
  winner: number | null;
}
