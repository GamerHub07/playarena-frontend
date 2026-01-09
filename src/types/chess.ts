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
    | 'draw-threefold-repetition'
    | 'white-wins-timeout'
    | 'black-wins-timeout';

// Timer System
export interface TimeControl {
    type: 'bullet' | 'blitz' | 'rapid' | 'classical' | 'unlimited' | 'armageddon';
    initialTimeMs: number;
    incrementMs: number;
    name: string;
}

export const TIME_CONTROL_PRESETS: Record<string, TimeControl> = {
    'bullet-1': { type: 'bullet', initialTimeMs: 60000, incrementMs: 0, name: '1 min' },
    'bullet-1-1': { type: 'bullet', initialTimeMs: 60000, incrementMs: 1000, name: '1+1' },
    'bullet-2-1': { type: 'bullet', initialTimeMs: 120000, incrementMs: 1000, name: '2+1' },
    'blitz-3': { type: 'blitz', initialTimeMs: 180000, incrementMs: 0, name: '3 min' },
    'blitz-3-2': { type: 'blitz', initialTimeMs: 180000, incrementMs: 2000, name: '3+2' },
    'blitz-5': { type: 'blitz', initialTimeMs: 300000, incrementMs: 0, name: '5 min' },
    'blitz-5-3': { type: 'blitz', initialTimeMs: 300000, incrementMs: 3000, name: '5+3' },
    'rapid-10': { type: 'rapid', initialTimeMs: 600000, incrementMs: 0, name: '10 min' },
    'rapid-10-5': { type: 'rapid', initialTimeMs: 600000, incrementMs: 5000, name: '10+5' },
    'rapid-15-10': { type: 'rapid', initialTimeMs: 900000, incrementMs: 10000, name: '15+10' },
    'classical-30': { type: 'classical', initialTimeMs: 1800000, incrementMs: 0, name: '30 min' },
    'classical-60': { type: 'classical', initialTimeMs: 3600000, incrementMs: 0, name: '60 min' },
    'classical-90': { type: 'classical', initialTimeMs: 5400000, incrementMs: 30000, name: '90+30' },
    'unlimited': { type: 'unlimited', initialTimeMs: 0, incrementMs: 0, name: 'Unlimited' },
    'armageddon': { type: 'armageddon', initialTimeMs: 300000, incrementMs: 0, name: 'Armageddon' },
};

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

    // Timer system
    timeControl: TimeControl | null;
    whiteTimeRemainingMs: number;
    blackTimeRemainingMs: number;
    lastMoveTimestamp: number | null;
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
        case 'white-wins-timeout':
            return 'White wins - Black ran out of time';
        case 'black-wins-timeout':
            return 'Black wins - White ran out of time';
        default:
            return 'Game Over';
    }
}
