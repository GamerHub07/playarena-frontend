export type ChessColor = "white" | "black";

export type ChessPieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";

export interface ChessPiece {
  type: ChessPieceType;
  color: ChessColor;
}

export type ChessBoard = (ChessPiece | null)[][];

export type ChessGameStatus =
  | "playing"
  | "check"
  | "checkmate"
  | "draw";

export interface ChessMove {
  from: string;
  to: string;
}

export interface ChessGameState {
  board: ChessBoard;
  fen: string;
  turn: ChessColor;
  status: ChessGameStatus;
  winner: ChessColor | null;
  moveHistory: ChessMove[];
  playerColors: Record<string, ChessColor>;

}
