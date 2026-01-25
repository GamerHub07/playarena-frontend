'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CellValue, TicTacToeGameState } from '@/types/tictactoe';

interface BoardProps {
    gameState: TicTacToeGameState;
    myPlayerIndex: number;
    onCellClick: (cellIndex: number) => void;
    disabled?: boolean;
}

export default function Board({
    gameState,
    myPlayerIndex,
    onCellClick,
    disabled = false,
}: BoardProps) {
    const { board, currentPlayer, winningLine, lastMove } = gameState;
    const isMyTurn = currentPlayer === myPlayerIndex;
    const mySymbol = myPlayerIndex === 0 ? 'X' : 'O';

    const getCellContent = (value: CellValue, index: number) => {
        if (!value) return null;

        const isWinningCell = winningLine?.includes(index);
        const isLastMove = lastMove === index;

        return (
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                    scale: 1,
                    rotate: 0,
                    ...(isWinningCell && {
                        scale: [1, 1.1, 1],
                    })
                }}
                transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 12,
                    ...(isWinningCell && {
                        scale: { repeat: Infinity, duration: 0.6 }
                    })
                }}
                className={`text-6xl md:text-7xl font-bold select-none ${value === 'X'
                    ? 'text-amber-600 drop-shadow-[0_0_12px_rgba(217,119,6,0.6)]'
                    : 'text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.6)]'
                    } ${isWinningCell ? 'animate-pulse' : ''}`}
            >
                {value}
            </motion.div>
        );
    };

    const canClick = (index: number) => {
        return !disabled && isMyTurn && board[index] === null && !gameState.winner && !gameState.isDraw;
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Turn Indicator */}
            <div className="text-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPlayer}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`text-lg font-semibold px-6 py-2 rounded-full ${isMyTurn
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700'
                            }`}
                    >
                        {gameState.winner !== null
                            ? '🎉 Game Over!'
                            : gameState.isDraw
                                ? '🤝 Draw!'
                                : isMyTurn
                                    ? `Your turn (${mySymbol})`
                                    : "Opponent's turn"
                        }
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Game Board */}
            <div className="relative">
                {/* Glow effect behind board */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-purple-500/20 to-red-500/20 blur-3xl" />

                <div className="relative grid grid-cols-3 gap-2 p-4 bg-slate-900/80 rounded-2xl border border-slate-700 backdrop-blur-sm shadow-2xl">
                    {board.map((cell, index) => {
                        const row = Math.floor(index / 3);
                        const col = index % 3;
                        const isWinningCell = winningLine?.includes(index);

                        return (
                            <motion.button
                                key={index}
                                onClick={() => canClick(index) && onCellClick(index)}
                                disabled={!canClick(index)}
                                whileHover={canClick(index) ? { scale: 1.02 } : {}}
                                whileTap={canClick(index) ? { scale: 0.98 } : {}}
                                className={`
                                    w-24 h-24 md:w-28 md:h-28 
                                    flex items-center justify-center
                                    rounded-xl
                                    transition-all duration-200
                                    ${isWinningCell
                                        ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-2 border-yellow-500/50'
                                        : 'bg-slate-800/60 border border-slate-700 hover:border-slate-600'
                                    }
                                    ${canClick(index)
                                        ? 'cursor-pointer hover:bg-slate-700/50'
                                        : 'cursor-default'
                                    }
                                    ${!cell && canClick(index) ? 'hover:shadow-lg hover:shadow-amber-600/10' : ''}
                                `}
                            >
                                {getCellContent(cell, index)}

                                {/* Hover preview for empty cells */}
                                {!cell && canClick(index) && (
                                    <span className="text-4xl text-slate-600 opacity-0 hover:opacity-30 transition-opacity">
                                        {mySymbol}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Symbol Legend */}
            <div className="flex gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${myPlayerIndex === 0 ? 'text-amber-600' : 'text-red-400'}`}>
                        {mySymbol}
                    </span>
                    <span>You</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${myPlayerIndex === 0 ? 'text-red-400' : 'text-amber-600'}`}>
                        {myPlayerIndex === 0 ? 'O' : 'X'}
                    </span>
                    <span>Opponent</span>
                </div>
            </div>
        </div>
    );
}
