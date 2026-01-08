'use client';

import { useEffect, useRef } from 'react';
import {
    ChessGameState,
    ChessPiece,
    PIECE_SYMBOLS,
    getResultMessage,
} from '@/types/chess';
import { Player } from '@/types/game';
import { Handshake, Flag, History, Trophy, Swords } from 'lucide-react';

interface GameInfoProps {
    gameState: ChessGameState;
    players: Player[];
    myPlayerIndex: number | null;
    isMyTurn: boolean;
    onResign: () => void;
    onOfferDraw: () => void;
    onAcceptDraw: () => void;
    onDeclineDraw: () => void;
}

export default function GameInfo({
    gameState,
    players,
    myPlayerIndex,
    isMyTurn,
    onResign,
    onOfferDraw,
    onAcceptDraw,
    onDeclineDraw,
}: GameInfoProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const currentPlayerIndex = gameState.currentPlayer === 'white' ? 0 : 1;
    const currentPlayerName = players[currentPlayerIndex]?.username || 'Unknown';
    const myColor = myPlayerIndex === 0 ? 'white' : myPlayerIndex === 1 ? 'black' : null;

    // Check if draw was offered to me
    const drawOfferedToMe = gameState.drawOfferedBy && gameState.drawOfferedBy !== myColor;

    // Auto-scroll move history
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [gameState.moveHistory.length]);

    // Render captured pieces
    const renderCapturedPieces = (pieces: ChessPiece[], invertColor: boolean) => {
        if (pieces.length === 0) return <span className="text-gray-500 text-xs italic">No captures</span>;

        return (
            <div className="flex flex-wrap gap-1">
                {pieces.map((piece, i) => (
                    <span
                        key={i}
                        className={`text-2xl select-none transition-transform hover:scale-110 ${invertColor ? 'text-gray-900 drop-shadow-sm' : 'text-gray-100 drop-shadow-md'}`}
                        title={piece.type}
                    >
                        {/* Use the specific symbol for the piece's color */}
                        {PIECE_SYMBOLS[piece.color][piece.type]}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-4 font-sans">
            {/* Current Turn Card */}
            <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Swords className="w-4 h-4" /> Current Turn
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${gameState.currentPlayer === 'white' ? 'bg-gray-200 text-gray-800' : 'bg-gray-800 text-gray-200 border border-gray-600'}`}>
                        {gameState.currentPlayer}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div
                        className={`w-12 h-12 rounded-full border-4 flex items-center justify-center shadow-lg transition-all duration-300 ${isMyTurn ? 'ring-4 ring-green-500/30 scale-105' : ''}`}
                        style={{
                            backgroundColor: gameState.currentPlayer === 'white' ? '#e2e8f0' : '#1f2937',
                            borderColor: gameState.currentPlayer === 'white' ? '#fff' : '#4b5563',
                        }}
                    >
                        <span className={`text-3xl pb-1 ${gameState.currentPlayer === 'white' ? 'text-black' : 'text-white'}`}>
                            {gameState.currentPlayer === 'white' ? '♔' : '♚'}
                        </span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className={`font-bold text-lg truncate ${isMyTurn ? 'text-green-400' : 'text-white'}`}>
                            {currentPlayerName}
                            {currentPlayerIndex === myPlayerIndex && <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/30">YOU</span>}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            {isMyTurn ? <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> : null}
                            {isMyTurn ? 'Your move' : 'Thinking...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Game Status / End Game */}
            {(gameState.isCheck || gameState.isCheckmate || gameState.isDraw) && (
                <div className={`p-4 rounded-xl border backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500 ${gameState.isCheckmate ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
                    <div className="text-center">
                        {gameState.isCheckmate && <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2 animate-bounce" />}
                        {gameState.isDraw && <Handshake className="w-8 h-8 text-gray-400 mx-auto mb-2" />}

                        {gameState.isCheck && !gameState.isCheckmate && (
                            <p className="text-red-400 font-extrabold text-lg tracking-widest animate-pulse">CHECK!</p>
                        )}
                        {gameState.gameResult && (
                            <p className="text-white font-bold text-lg">
                                {getResultMessage(gameState.gameResult)}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Draw Offer */}
            {drawOfferedToMe && !gameState.gameResult && (
                <div className="p-4 bg-yellow-900/40 border border-yellow-500/50 rounded-xl backdrop-blur-sm animate-pulse">
                    <p className="text-yellow-400 text-sm font-bold mb-3 flex items-center gap-2">
                        <Handshake className="w-4 h-4" /> Opponent offers a draw
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={onAcceptDraw}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 rounded-lg transition-all"
                        >
                            Accept
                        </button>
                        <button
                            onClick={onDeclineDraw}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold py-2 rounded-lg transition-all"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            )}

            {/* Enhanced Move History */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-lg" style={{ height: '280px' }}>
                <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <History className="w-3 h-3" /> Move History
                    </h3>
                    <span className="text-[10px] text-gray-500 bg-black/20 px-2 py-0.5 rounded-full">
                        {Math.ceil(gameState.moveHistory.length / 2)} Rounds
                    </span>
                </div>

                <div
                    ref={listRef}
                    className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent space-y-0.5"
                >
                    {gameState.moveHistory.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 opacity-50">
                            <History className="w-8 h-8" />
                            <p className="text-xs">Game hasn't started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-0.5 text-sm">
                            {/* Header Row */}
                            <div className="text-xs text-gray-600 font-mono py-1 text-right px-2">#</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider py-1 font-bold">White</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider py-1 font-bold">Black</div>

                            {Array.from({ length: Math.ceil(gameState.moveHistory.length / 2) }).map((_, i) => {
                                const whiteMove = gameState.moveHistory[i * 2];
                                const blackMove = gameState.moveHistory[i * 2 + 1];

                                const formatMove = (move: any) => {
                                    if (!move) return '';
                                    const fromFile = String.fromCharCode(97 + move.from.col);
                                    const fromRank = 8 - move.from.row;
                                    const toFile = String.fromCharCode(97 + move.to.col);
                                    const toRank = 8 - move.to.row;
                                    return `${fromFile}${fromRank} → ${toFile}${toRank}`;
                                };

                                return (
                                    <div key={i} className="contents group hover:bg-white/5">
                                        <div className="text-gray-500 font-mono text-xs py-1.5 text-right px-2 border-r border-white/5 group-hover:bg-white/5 bg-black/10">
                                            {i + 1}.
                                        </div>
                                        <div className="text-gray-200 py-1.5 px-2 bg-white/5 rounded-sm font-medium tracking-wide border-l border-transparent transition-colors">
                                            {formatMove(whiteMove)}
                                        </div>
                                        <div className="text-gray-200 py-1.5 px-2 rounded-sm font-medium tracking-wide transition-colors">
                                            {blackMove ? formatMove(blackMove) : ''}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Captured Pieces Panel */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-xl">
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-2 flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full"></div> White's Captures
                    </div>
                    {renderCapturedPieces(gameState.capturedByWhite, true)}
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-xl">
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-2 flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-900 border border-gray-600 rounded-full"></div> Black's Captures
                    </div>
                    {renderCapturedPieces(gameState.capturedByBlack, false)}
                </div>
            </div>

            {/* Action Buttons */}
            {!gameState.gameResult && myPlayerIndex !== null && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                    {!gameState.drawOfferedBy && (
                        <button
                            onClick={onOfferDraw}
                            className="bg-gray-700/80 hover:bg-gray-600 text-gray-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-gray-600 hover:border-gray-500"
                        >
                            <Handshake className="w-4 h-4" /> Draw
                        </button>
                    )}
                    {gameState.drawOfferedBy === myColor && (
                        <div className="col-span-1 py-3 text-center text-xs text-yellow-500/80 italic border border-yellow-500/20 rounded-xl bg-yellow-500/10">
                            Offer sent...
                        </div>
                    )}
                    <button
                        onClick={onResign}
                        className="bg-red-900/50 hover:bg-red-800/80 text-red-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-red-800/50 hover:border-red-500/50"
                    >
                        <Flag className="w-4 h-4" /> Resign
                    </button>
                </div>
            )}
        </div>
    );
}
