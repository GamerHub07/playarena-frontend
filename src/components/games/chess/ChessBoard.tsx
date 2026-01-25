"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ChessPiece } from "./ChessPieces";

export type BoardTheme = "green" | "wood" | "blue" | "purple" | "coral" | "ice" | "neon" | "dark" | "marble" | "forest" | "sunset" | "ocean" | "cherry" | "sand" | "midnight" | "emerald";

interface ChessBoardProps {
  fen: string;
  onMove: (from: string, to: string, promotion?: string) => void;
  orientation: "white" | "black";
  canMove: boolean;
  theme?: BoardTheme;
  pieceTheme?: BoardTheme;
  /** @deprecated Use className for responsive sizing instead */
  size?: number;
  winner?: "white" | "black" | null;
  /** Optional className for responsive container sizing */
  className?: string;
  isInCheck?: boolean; // Whether the current player's king is in check
}

// Theme colors
const THEMES: Record<BoardTheme, { light: string; dark: string; lightHighlight: string; darkHighlight: string; lightSelected: string; darkSelected: string }> = {
  green: {
    light: "#ebecd0",
    dark: "#779556",
    lightHighlight: "#f5f682",
    darkHighlight: "#bbcc44",
    lightSelected: "#f7f769",
    darkSelected: "#bbcc44",
  },
  wood: {
    light: "#f0d9b5",
    dark: "#b58863",
    lightHighlight: "#cdd26a",
    darkHighlight: "#aaa23a",
    lightSelected: "#cdd26a",
    darkSelected: "#aaa23a",
  },
  blue: {
    light: "#dee3e6",
    dark: "#8ca2ad",
    lightHighlight: "#a8d8e8",
    darkHighlight: "#6ba8c0",
    lightSelected: "#a8d8e8",
    darkSelected: "#6ba8c0",
  },
  purple: {
    light: "#f0e6f6",
    dark: "#9b72b0",
    lightHighlight: "#d8b8e8",
    darkHighlight: "#a872c0",
    lightSelected: "#d8b8e8",
    darkSelected: "#a872c0",
  },
  coral: {
    light: "#fce4d8",
    dark: "#eb7762",
    lightHighlight: "#ffb8a8",
    darkHighlight: "#d85545",
    lightSelected: "#ffb8a8",
    darkSelected: "#d85545",
  },
  ice: {
    light: "#e8f4f8",
    dark: "#6fa8c0",
    lightHighlight: "#b8e8f8",
    darkHighlight: "#4888a8",
    lightSelected: "#b8e8f8",
    darkSelected: "#4888a8",
  },
  neon: {
    light: "#1a1a2e",
    dark: "#16213e",
    lightHighlight: "#0f3460",
    darkHighlight: "#e94560",
    lightSelected: "#00ff88",
    darkSelected: "#ff00ff",
  },
  dark: {
    light: "#4a4a4a",
    dark: "#2d2d2d",
    lightHighlight: "#5a5a5a",
    darkHighlight: "#3d3d3d",
    lightSelected: "#6a6a6a",
    darkSelected: "#4d4d4d",
  },
  // New themes
  marble: {
    light: "#f5f5f5",
    dark: "#a8a8a8",
    lightHighlight: "#e8e8a8",
    darkHighlight: "#b8b878",
    lightSelected: "#ffffa0",
    darkSelected: "#c8c898",
  },
  forest: {
    light: "#c8dbb3",
    dark: "#3d5a3d",
    lightHighlight: "#a8d878",
    darkHighlight: "#5a8a5a",
    lightSelected: "#b8e888",
    darkSelected: "#689868",
  },
  sunset: {
    light: "#ffe4c9",
    dark: "#d4826a",
    lightHighlight: "#ffc8a8",
    darkHighlight: "#e8a088",
    lightSelected: "#ffb888",
    darkSelected: "#f0a898",
  },
  ocean: {
    light: "#d4e8f2",
    dark: "#2e5a7c",
    lightHighlight: "#a8d8f8",
    darkHighlight: "#4888b8",
    lightSelected: "#98c8e8",
    darkSelected: "#5898c8",
  },
  cherry: {
    light: "#fce8ec",
    dark: "#c4586c",
    lightHighlight: "#ffc8d8",
    darkHighlight: "#e8889c",
    lightSelected: "#ffb8c8",
    darkSelected: "#f098a8",
  },
  sand: {
    light: "#f4e8d4",
    dark: "#c4a882",
    lightHighlight: "#e8d8a8",
    darkHighlight: "#d8c498",
    lightSelected: "#e0d0a0",
    darkSelected: "#d0c090",
  },
  midnight: {
    light: "#2c3e50",
    dark: "#1a252f",
    lightHighlight: "#3d566e",
    darkHighlight: "#2a3f54",
    lightSelected: "#4a6a8a",
    darkSelected: "#3a5a7a",
  },
  emerald: {
    light: "#d4f0e0",
    dark: "#2d8a5a",
    lightHighlight: "#98e8b8",
    darkHighlight: "#48a878",
    lightSelected: "#88d8a8",
    darkSelected: "#58b888",
  },
};

// File letters
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

// Parse FEN to board position
function parseFEN(fen: string): (string | null)[][] {
  const board: (string | null)[][] = [];
  const [position] = fen.split(" ");
  const rows = position.split("/");

  for (const row of rows) {
    const boardRow: (string | null)[] = [];
    for (const char of row) {
      if (/\d/.test(char)) {
        for (let i = 0; i < parseInt(char); i++) {
          boardRow.push(null);
        }
      } else {
        boardRow.push(char);
      }
    }
    board.push(boardRow);
  }
  return board;
}

// Convert row/col to algebraic notation
function toAlgebraic(row: number, col: number, orientation: "white" | "black"): string {
  if (orientation === "black") {
    return FILES[7 - col] + RANKS[7 - row];
  }
  return FILES[col] + RANKS[row];
}

// Check if piece is white
function isWhitePiece(piece: string): boolean {
  return piece === piece.toUpperCase();
}

// Check if move is a pawn promotion
function isPromotionMove(piece: string, fromSquare: string, toSquare: string): boolean {
  const pieceType = piece.toLowerCase();
  if (pieceType !== "p") return false;

  const toRank = toSquare[1];
  const isWhite = isWhitePiece(piece);

  return (isWhite && toRank === "8") || (!isWhite && toRank === "1");
}

// Promotion Modal Component
function PromotionModal({
  isWhite,
  onSelect,
  position,
  theme,
}: {
  isWhite: boolean;
  onSelect: (piece: string) => void;
  position: { x: number; y: number };
  theme: BoardTheme;
}) {
  const pieces = isWhite ? ["Q", "R", "B", "N"] : ["q", "r", "b", "n"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-[#312e2b] rounded-xl shadow-2xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in duration-200"
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="text-white text-center text-sm font-medium mb-1 px-2">
          Promote to:
        </div>
        {pieces.map((piece) => (
          <button
            key={piece}
            onClick={() => onSelect(piece.toLowerCase())}
            className="w-20 h-20 bg-[#3d3935] hover:bg-[#4d4945] hover:scale-105 rounded-lg transition-all duration-150 flex items-center justify-center"
          >
            <ChessPiece piece={piece} size={64} theme={theme} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChessBoard({
  fen,
  onMove,
  orientation,
  canMove,
  theme = "green",
  pieceTheme,
  size,
  winner = null,
  className,
  isInCheck = false,
}: ChessBoardProps) {
  // Use pieceTheme if provided, otherwise fall back to theme
  const effectivePieceTheme = pieceTheme ?? theme;
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<{
    piece: string;
    from: string;
    x: number;
    y: number;
  } | null>(null);
  const [promotionData, setPromotionData] = useState<{
    from: string;
    to: string;
    isWhite: boolean;
    position: { x: number; y: number };
  } | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Responsive sizing: measure container width dynamically
  const [containerSize, setContainerSize] = useState(size ?? 400);

  useEffect(() => {
    if (size) {
      // If explicit size is provided, use it
      setContainerSize(size);
      return;
    }

    const updateSize = () => {
      if (boardRef.current) {
        const width = boardRef.current.offsetWidth;
        if (width > 0) {
          setContainerSize(width);
        }
      }
    };

    // Initial measure
    updateSize();

    // Use ResizeObserver for responsive updates
    const resizeObserver = new ResizeObserver(updateSize);
    if (boardRef.current) {
      resizeObserver.observe(boardRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [size]);

  const colors = THEMES[theme];
  const squareSize = containerSize / 8;
  const pieceSize = Math.floor(squareSize * 0.9);

  const board = parseFEN(fen);

  // Find the checked king's position (if in check)
  const checkedKingSquare = (() => {
    if (!isInCheck) return null;
    const fenTurn = fen.split(" ")[1]; // 'w' or 'b'
    const kingToFind = fenTurn === "w" ? "K" : "k"; // Current player's king is in check
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === kingToFind) {
          return FILES[c] + (8 - r); // Convert to algebraic notation
        }
      }
    }
    return null;
  })();

  // Flip board for black orientation
  const displayBoard = orientation === "black"
    ? board.map(row => [...row].reverse()).reverse()
    : board;

  // Calculate legal moves for a square
  const calculateLegalMoves = useCallback((square: string, piece: string): string[] => {
    // Basic legal move calculation based on piece type
    const file = square[0];
    const rank = parseInt(square[1]);
    const fileIndex = FILES.indexOf(file);
    const moves: string[] = [];
    const isWhite = piece === piece.toUpperCase();
    const pieceType = piece.toLowerCase();

    // Helper to check if square is valid and add if piece can move there
    const addMoveIfValid = (f: number, r: number, captureOnly = false, moveOnly = false) => {
      if (f < 0 || f > 7 || r < 1 || r > 8) return false;
      const targetSquare = FILES[f] + r;
      const targetRank = 8 - r;
      const targetFile = f;
      const targetPiece = board[targetRank]?.[targetFile];

      if (targetPiece) {
        // There's a piece
        const targetIsWhite = targetPiece === targetPiece.toUpperCase();
        if (targetIsWhite !== isWhite && !moveOnly) {
          moves.push(targetSquare);
        }
        return true; // Blocked
      } else if (!captureOnly) {
        moves.push(targetSquare);
      }
      return false;
    };

    // Direction-based move generation for sliding pieces
    const addSlidingMoves = (directions: [number, number][]) => {
      for (const [df, dr] of directions) {
        for (let i = 1; i < 8; i++) {
          if (addMoveIfValid(fileIndex + df * i, rank + dr * i)) break;
        }
      }
    };

    switch (pieceType) {
      case 'p': // Pawn
        const direction = isWhite ? 1 : -1;
        const startRank = isWhite ? 2 : 7;
        // Forward move
        addMoveIfValid(fileIndex, rank + direction, false, true);
        // Double move from start
        if (rank === startRank) {
          const nextRank = 8 - (rank + direction);
          if (!board[nextRank]?.[fileIndex]) {
            addMoveIfValid(fileIndex, rank + 2 * direction, false, true);
          }
        }
        // Captures
        addMoveIfValid(fileIndex - 1, rank + direction, true);
        addMoveIfValid(fileIndex + 1, rank + direction, true);

        // En passant - check FEN for en passant target square
        const fenParts = fen.split(" ");
        const enPassantSquare = fenParts[3]; // e.g., "e3" or "-"
        if (enPassantSquare && enPassantSquare !== "-") {
          const epFile = FILES.indexOf(enPassantSquare[0]);
          const epRank = parseInt(enPassantSquare[1]);
          // Check if this pawn can capture en passant (must be adjacent file and correct rank)
          const enPassantCaptureRank = isWhite ? 5 : 4; // Pawn must be on 5th rank for white, 4th for black
          if (rank === enPassantCaptureRank && Math.abs(fileIndex - epFile) === 1) {
            moves.push(enPassantSquare);
          }
        }
        break;
      case 'n': // Knight
        [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([df, dr]) =>
          addMoveIfValid(fileIndex + df, rank + dr)
        );
        break;
      case 'b': // Bishop
        addSlidingMoves([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
        break;
      case 'r': // Rook
        addSlidingMoves([[1, 0], [-1, 0], [0, 1], [0, -1]]);
        break;
      case 'q': // Queen
        addSlidingMoves([[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
        break;
      case 'k': // King
        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([df, dr]) =>
          addMoveIfValid(fileIndex + df, rank + dr)
        );
        break;
    }
    return moves;
  }, [board, fen]);

  const executeMove = useCallback((from: string, to: string, promotion?: string) => {
    console.log('🚀 executeMove called:', { from, to, promotion });
    setLastMove({ from, to });
    console.log('📤 Calling onMove...');
    onMove(from, to, promotion);
    console.log('✅ onMove completed');
    setSelectedSquare(null);
    setLegalMoves([]);
    setPromotionData(null);
  }, [onMove]);

  const handleMoveAttempt = useCallback((from: string, to: string, piece: string, clickPosition: { x: number; y: number }) => {
    console.log('🎯 handleMoveAttempt called:', { from, to, piece, clickPosition });
    if (isPromotionMove(piece, from, to)) {
      console.log('👑 Promotion move detected');
      setPromotionData({
        from,
        to,
        isWhite: isWhitePiece(piece),
        position: clickPosition,
      });
    } else {
      console.log('🔄 Calling executeMove...');
      executeMove(from, to);
    }
  }, [executeMove]);

  const handleSquareClick = useCallback((
    e: React.MouseEvent,
    square: string,
    piece: string | null,
    row: number,
    col: number
  ) => {
    if (!canMove || promotionData) return;

    const rect = boardRef.current?.getBoundingClientRect();
    const clickPosition = rect ? {
      x: rect.left + (col + 0.5) * squareSize,
      y: rect.top + (row + 0.5) * squareSize,
    } : { x: e.clientX, y: e.clientY };

    console.log('🖱️ Square clicked:', {
      square,
      piece,
      selectedSquare,
      legalMoves,
      isLegalMove: legalMoves.includes(square),
      canMove
    });

    if (selectedSquare) {
      // Get the piece from the original board using FEN coordinates
      const selectedFile = FILES.indexOf(selectedSquare[0]);
      const selectedRank = 8 - parseInt(selectedSquare[1]);
      const selectedPiece = board[selectedRank]?.[selectedFile];

      console.log('🎯 Selected piece info:', { selectedPiece, selectedSquare, selectedFile, selectedRank });
      console.log('🔍 Move conditions:', {
        isSameSquare: selectedSquare === square,
        isLegalMove: legalMoves.includes(square),
        hasSelectedPiece: !!selectedPiece,
        clickedOnPiece: !!piece,
        legalMovesList: legalMoves
      });

      if (selectedSquare === square) {
        console.log('❌ Deselecting - clicked same piece');
        setSelectedSquare(null);
        setLegalMoves([]);
      } else if (legalMoves.includes(square) && selectedPiece) {
        // This handles BOTH moves to empty squares AND captures
        console.log('✅ Moving piece from', selectedSquare, 'to', square);
        handleMoveAttempt(selectedSquare, square, selectedPiece, clickPosition);
      } else if (piece) {
        // Clicked on a piece that's NOT a legal capture target
        const isPieceWhite = isWhitePiece(piece);
        const fenTurn = fen.split(" ")[1];
        const isOurTurn = (fenTurn === "w" && isPieceWhite) || (fenTurn === "b" && !isPieceWhite);
        if (isOurTurn) {
          console.log('🔄 Switching to different piece');
          setSelectedSquare(square);
          setLegalMoves(calculateLegalMoves(square, piece));
        } else {
          console.log('❌ Opponent piece not in legal moves - deselecting');
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      } else {
        console.log('❌ Invalid target - deselecting');
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else if (piece) {
      const isPieceWhite = isWhitePiece(piece);
      const fenTurn = fen.split(" ")[1];
      const isOurTurn = (fenTurn === "w" && isPieceWhite) || (fenTurn === "b" && !isPieceWhite);

      if (isOurTurn) {
        const moves = calculateLegalMoves(square, piece);
        console.log('📌 Selecting piece at', square, 'Legal moves:', moves);
        setSelectedSquare(square);
        setLegalMoves(moves);
      }
    }
  }, [canMove, selectedSquare, board, orientation, handleMoveAttempt, promotionData, squareSize, calculateLegalMoves, fen, legalMoves]);

  const handleDragStart = useCallback((
    e: React.MouseEvent | React.TouchEvent,
    square: string,
    piece: string,
    fen: string
  ) => {
    if (!canMove || promotionData) return;

    // Only allow dragging our own pieces
    const isPieceWhite = isWhitePiece(piece);
    const fenTurn = fen.split(" ")[1];
    const isOurPiece = (fenTurn === "w" && isPieceWhite) || (fenTurn === "b" && !isPieceWhite);
    if (!isOurPiece) return;

    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setDraggedPiece({
      piece,
      from: square,
      x: clientX,
      y: clientY,
    });
    setSelectedSquare(square);
  }, [canMove, promotionData]);

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!draggedPiece) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setDraggedPiece(prev => prev ? { ...prev, x: clientX, y: clientY } : null);
  }, [draggedPiece]);

  const handleDragEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!draggedPiece || !boardRef.current) {
      setDraggedPiece(null);
      // Don't reset selectedSquare here - only do it in handleSquareClick if needed
      return;
    }

    const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = "changedTouches" in e ? e.changedTouches[0].clientY : e.clientY;

    const rect = boardRef.current.getBoundingClientRect();

    let col = Math.floor((clientX - rect.left) / squareSize);
    let row = Math.floor((clientY - rect.top) / squareSize);

    col = Math.max(0, Math.min(7, col));
    row = Math.max(0, Math.min(7, row));

    const toSquare = toAlgebraic(row, col, orientation);
    const clickPosition = {
      x: rect.left + (col + 0.5) * squareSize,
      y: rect.top + (row + 0.5) * squareSize,
    };

    if (draggedPiece.from !== toSquare) {
      handleMoveAttempt(draggedPiece.from, toSquare, draggedPiece.piece, clickPosition);
    } else {
      setSelectedSquare(null);
    }

    setDraggedPiece(null);
  }, [draggedPiece, orientation, handleMoveAttempt, squareSize]);

  const handlePromotionSelect = useCallback((piece: string) => {
    if (promotionData) {
      executeMove(promotionData.from, promotionData.to, piece);
    }
  }, [promotionData, executeMove]);

  return (
    <div className={`select-none ${className || ''}`}>
      {/* Board container */}
      <div
        ref={boardRef}
        className="relative rounded-sm overflow-hidden w-full aspect-square"
        style={size ? { width: size, height: size } : undefined}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => !promotionData && handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Chess board grid */}
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {displayBoard.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const square = toAlgebraic(rowIndex, colIndex, orientation);
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare === square;
              const isDragSource = draggedPiece?.from === square;
              const isLastMoveSquare = lastMove?.from === square || lastMove?.to === square;
              const isCheckedKing = checkedKingSquare === square;

              let bgColor = isLight ? colors.light : colors.dark;
              if (isLastMoveSquare) {
                bgColor = isLight ? colors.lightHighlight : colors.darkHighlight;
              }
              if (isSelected) {
                bgColor = isLight ? colors.lightSelected : colors.darkSelected;
              }
              // Red glow for checked king - override other colors
              if (isCheckedKing) {
                bgColor = "#e74c3c"; // Red color for check
              }

              return (
                <div
                  key={square}
                  className="relative flex items-center justify-center cursor-pointer aspect-square"
                  style={{
                    backgroundColor: bgColor,
                  }}
                  onClick={(e) => handleSquareClick(e, square, piece, rowIndex, colIndex)}
                  onMouseDown={(e) => piece && handleDragStart(e, square, piece, fen)}
                  onTouchStart={(e) => piece && handleDragStart(e, square, piece, fen)}
                >
                  {/* File/Rank labels */}
                  {colIndex === 0 && (
                    <span
                      className="absolute left-0.5 top-0.5 font-bold"
                      style={{
                        fontSize: squareSize * 0.16,
                        color: isLight ? colors.dark : colors.light,
                      }}
                    >
                      {orientation === "white" ? 8 - rowIndex : rowIndex + 1}
                    </span>
                  )}
                  {rowIndex === 7 && (
                    <span
                      className="absolute right-0.5 bottom-0.5 font-bold"
                      style={{
                        fontSize: squareSize * 0.16,
                        color: isLight ? colors.dark : colors.light,
                      }}
                    >
                      {orientation === "white" ? FILES[colIndex] : FILES[7 - colIndex]}
                    </span>
                  )}

                  {/* Chess piece */}
                  {piece && !isDragSource && (
                    <div
                      className="pointer-events-none"
                      style={{
                        // Smooth transition for any transforms
                        transition: "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                        // Rotate the losing king 90 degrees
                        transform: (
                          winner &&
                          piece.toLowerCase() === 'k' &&
                          ((winner === 'white' && piece === 'k') || (winner === 'black' && piece === 'K'))
                        ) ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}
                    >
                      <ChessPiece piece={piece} size={pieceSize} theme={effectivePieceTheme} />
                    </div>
                  )}

                  {/* Legal move indicator */}
                  {legalMoves.includes(square) && (
                    piece ? (
                      // Capture indicator - ring around the piece
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          border: `${squareSize * 0.08}px solid rgba(0, 0, 0, 0.15)`,
                          borderRadius: '50%',
                          margin: squareSize * 0.05,
                        }}
                      />
                    ) : (
                      // Empty square indicator - dot in center
                      <div
                        className="absolute pointer-events-none rounded-full"
                        style={{
                          width: squareSize * 0.3,
                          height: squareSize * 0.3,
                          backgroundColor: 'rgba(0, 0, 0, 0.15)',
                        }}
                      />
                    )
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Dragged piece overlay */}
        {draggedPiece && (
          <div
            className="fixed pointer-events-none z-40"
            style={{
              left: draggedPiece.x - pieceSize / 2,
              top: draggedPiece.y - pieceSize / 2,
              transform: "scale(1.15)",
              filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4))",
              transition: "filter 0.1s ease",
            }}
          >
            <ChessPiece piece={draggedPiece.piece} size={pieceSize} theme={effectivePieceTheme} />
          </div>
        )}
      </div>

      {/* Promotion Modal */}
      {promotionData && (
        <PromotionModal
          isWhite={promotionData.isWhite}
          onSelect={handlePromotionSelect}
          position={promotionData.position}
          theme={effectivePieceTheme}
        />
      )}
    </div>
  );
}