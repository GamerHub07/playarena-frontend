'use client';

import { useMemo } from 'react';
import {
    Board as BoardType,
    ChessPiece,
    Position,
    ValidMoves,
    positionsEqual,
} from '@/types/chess';
import { useChessTheme } from './ChessTheme';
import { usePieceStyle } from './PieceStyle';

interface BoardProps {
    board: BoardType;
    selectedSquare: Position | null;
    validMoves: Position[];
    lastMove: { from: Position; to: Position } | null;
    isCheck: boolean;
    currentPlayerColor: 'white' | 'black';
    myColor: 'white' | 'black' | null;
    onSquareClick: (pos: Position) => void;
    isMyTurn: boolean;
}

export default function Board({
    board,
    selectedSquare,
    validMoves,
    lastMove,
    isCheck,
    currentPlayerColor,
    myColor,
    onSquareClick,
    isMyTurn,
}: BoardProps) {
    // Flip board for black player
    const isFlipped = myColor === 'black';

    // Get theme and piece style
    const { theme } = useChessTheme();
    const { style: pieceStyle } = usePieceStyle();

    // Find king position for check highlight
    const kingPosition = useMemo(() => {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece?.type === 'king' && piece.color === currentPlayerColor) {
                    return { row, col };
                }
            }
        }
        return null;
    }, [board, currentPlayerColor]);

    const renderSquare = (row: number, col: number) => {
        const piece = board[row][col];
        const pos: Position = { row, col };

        // Check if square is light or dark
        const isLightSquare = (row + col) % 2 === 0;

        // Check various states
        const isSelected = selectedSquare && positionsEqual(selectedSquare, pos);
        const isValidMove = validMoves.some((m) => positionsEqual(m, pos));
        const isLastMoveFrom = lastMove && positionsEqual(lastMove.from, pos);
        const isLastMoveTo = lastMove && positionsEqual(lastMove.to, pos);
        const isKingInCheck = isCheck && kingPosition && positionsEqual(kingPosition, pos);

        // Determine if this piece can be selected (my piece and my turn)
        const canSelect = isMyTurn && piece && piece.color === myColor;

        // Base square colors from theme
        let bgColor = isLightSquare ? theme.lightSquare : theme.darkSquare;

        // Highlight states
        if (isSelected) {
            bgColor = theme.selectedSquare;
        } else if (isLastMoveFrom || isLastMoveTo) {
            bgColor = isLightSquare ? theme.lastMoveLight : theme.lastMoveDark;
        }

        // Check highlight
        if (isKingInCheck) {
            bgColor = theme.checkHighlight;
        }

        return (
            <div
                key={`${row}-${col}`}
                onClick={() => onSquareClick(pos)}
                className={`
                    relative aspect-square flex items-center justify-center
                    ${canSelect || isValidMove ? 'cursor-pointer' : ''}
                    transition-colors duration-150
                `}
                style={{ backgroundColor: bgColor }}
            >
                {/* Valid move indicator */}
                {isValidMove && !piece && (
                    <div
                        className="absolute w-1/3 h-1/3 rounded-full"
                        style={{ backgroundColor: theme.validMoveIndicator }}
                    />
                )}

                {/* Valid capture indicator */}
                {isValidMove && piece && (
                    <div className="absolute inset-0 border-4 border-black/30 rounded-full pointer-events-none" />
                )}

                {/* Chess piece */}
                {piece && (
                    <span
                        className={`
                            text-4xl sm:text-5xl md:text-6xl select-none
                            ${piece.color === 'white' ? pieceStyle.whiteClass : pieceStyle.blackClass}
                            ${canSelect ? 'hover:scale-110 transition-transform' : ''}
                        `}
                    >
                        {pieceStyle.pieces[piece.color][piece.type]}
                    </span>
                )}

                {/* Rank labels (1-8) */}
                {col === (isFlipped ? 7 : 0) && (
                    <span className={`absolute top-0.5 left-1 text-xs font-semibold ${isLightSquare ? 'text-[#b58863]' : 'text-[#f0d9b5]'}`}>
                        {isFlipped ? row + 1 : 8 - row}
                    </span>
                )}

                {/* File labels (a-h) */}
                {row === (isFlipped ? 0 : 7) && (
                    <span className={`absolute bottom-0.5 right-1 text-xs font-semibold ${isLightSquare ? 'text-[#b58863]' : 'text-[#f0d9b5]'}`}>
                        {String.fromCharCode(97 + (isFlipped ? 7 - col : col))}
                    </span>
                )}
            </div>
        );
    };

    // Generate rows and columns based on flip state
    const rows = isFlipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 1, 2, 3, 4, 5, 6, 7];
    const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    return (
        <div className="w-full max-w-[500px] mx-auto">
            <div
                className="grid grid-cols-8 rounded-lg overflow-hidden shadow-2xl"
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: `4px solid ${theme.boardBorder}`,
                }}
            >
                {rows.map((row) =>
                    cols.map((col) => renderSquare(row, col))
                )}
            </div>
        </div>
    );
}
