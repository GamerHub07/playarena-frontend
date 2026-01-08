// Chess Game Types (Frontend)
// Matches backend ChessTypes.ts

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PlayerColor = 'white' | 'black';

export interface ChessPiece {
    type: PieceType;
    color: PlayerColor;
    hasMoved: boolean;
}

export interface Position {
    row: number; // 0-7 (0 = rank 8, 7 = rank 1)
    col: number; // 0-7 (0 = file a, 7 = file h)
}

// Board is 8x8, null means empty square
export type Board = (ChessPiece | null)[][];

export type SpecialMoveType =
    | 'castling-kingside'
    | 'castling-queenside'
    | 'en-passant'
    | 'promotion';

export interface ChessMove {
    from: Position;
    to: Position;
    piece: ChessPiece;
    capturedPiece?: ChessPiece;
    specialMove?: SpecialMoveType;
    promotionPiece?: PieceType;
    timestamp: number;
}

export type GameResult =
    | 'white-wins-checkmate'
    | 'black-wins-checkmate'
    | 'white-wins-resignation'
    | 'black-wins-resignation'
    | 'draw-stalemate'
    | 'draw-agreement'
    | 'draw-insufficient-material'
    | 'draw-fifty-moves'
    | 'draw-threefold-repetition';

export interface ChessGameState {
    board: Board;
    currentPlayer: PlayerColor;
    moveHistory: ChessMove[];
    isCheck: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    isDraw: boolean;
    gameResult: GameResult | null;
    winner: number | null; // 0 = white (first player), 1 = black (second player)

    // For special move tracking
    enPassantTarget: Position | null;
    halfMoveClock: number;
    fullMoveNumber: number;

    // Draw offers
    drawOfferedBy: PlayerColor | null;

    // Captured pieces for display
    capturedByWhite: ChessPiece[];
    capturedByBlack: ChessPiece[];
}

// Valid moves map: key is "row,col", value is array of valid target positions
export type ValidMoves = Record<string, Position[]>;

// ═══════════════════════════════════════════════════════════════
// PIECE UNICODE SYMBOLS
// ═══════════════════════════════════════════════════════════════

export const PIECE_SYMBOLS: Record<PlayerColor, Record<PieceType, string>> = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙',
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟',
    },
};

// Alternative: Use filled symbols for both
export const PIECE_FILLED: Record<PieceType, string> = {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟',
};

// ═══════════════════════════════════════════════════════════════
// PLAYER COLORS FOR UI
// ═══════════════════════════════════════════════════════════════

export const CHESS_PLAYER_COLORS = {
    0: { name: 'white' as PlayerColor, hex: '#F5F5F5', bg: '#FFFFFF', text: '#000000' },
    1: { name: 'black' as PlayerColor, hex: '#2D2D2D', bg: '#1a1a1a', text: '#FFFFFF' },
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Convert position to algebraic notation (e.g., {row: 6, col: 4} -> "e2")
 */
export function positionToAlgebraic(pos: Position): string {
    const file = String.fromCharCode(97 + pos.col); // a-h
    const rank = (8 - pos.row).toString(); // 1-8
    return file + rank;
}

/**
 * Check if two positions are equal
 */
export function positionsEqual(a: Position, b: Position): boolean {
    return a.row === b.row && a.col === b.col;
}

/**
 * Get the result message for display
 */
export function getResultMessage(result: GameResult): string {
    switch (result) {
        case 'white-wins-checkmate':
            return 'White wins by checkmate!';
        case 'black-wins-checkmate':
            return 'Black wins by checkmate!';
        case 'white-wins-resignation':
            return 'White wins - Black resigned';
        case 'black-wins-resignation':
            return 'Black wins - White resigned';
        case 'draw-stalemate':
            return 'Draw by stalemate';
        case 'draw-agreement':
            return 'Draw by mutual agreement';
        case 'draw-insufficient-material':
            return 'Draw - insufficient material';
        case 'draw-fifty-moves':
            return 'Draw - 50 move rule';
        case 'draw-threefold-repetition':
            return 'Draw - threefold repetition';
        default:
            return 'Game Over';
    }
}
