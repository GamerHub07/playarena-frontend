'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGuest } from '@/hooks/useGuest';
import { SudokuBoard } from '@/components/games/sudoku/SudokuBoard';
import { SudokuControls } from '@/components/games/sudoku/SudokuControls';
import { SudokuState, SudokuDifficulty } from '@/types/sudoku';
import { Loader2, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

import { DifficultySelectionModal } from '@/components/games/sudoku/DifficultySelectionModal';

export default function SudokuRoom() {
    const { roomId } = useParams();
    const { socket, isConnected, emit, on } = useSocket();
    const { guest } = useGuest();

    const [gameState, setGameState] = useState<SudokuState | null>(null);
    const [activeCell, setActiveCell] = useState<{ row: number, col: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDifficultyModalOpen, setIsDifficultyModalOpen] = useState(false);
    const [isGameWonModalOpen, setIsGameWonModalOpen] = useState(false);
    const [isGameLostModalOpen, setIsGameLostModalOpen] = useState(false);
    const [now, setNow] = useState(Date.now());

    // Join Room
    useEffect(() => {
        if (!isConnected || !guest || !roomId) return;

        emit('room:join', {
            roomCode: roomId,
            sessionId: guest.sessionId,
            username: guest.username
        });

        const unsubState = on('game:state', (data: any) => {
            setGameState(data.state);
        });

        const unsubStart = on('game:start', (data: any) => {
            console.log('Received game:start', data);
            setGameState(data.state);
        });

        const unsubError = on('error', (err: any) => {
            setError(err.message || 'An unknown error occurred');
        });

        return () => {
            unsubState();
            unsubStart();
            unsubError();
            emit('room:leave', { roomCode: roomId });
        };
    }, [isConnected, guest, roomId, emit, on]);

    // Timer updater
    useEffect(() => {
        if (!gameState?.challengeMode || gameState.isComplete) return;
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [gameState?.challengeMode, gameState?.isComplete]);

    // Check for game completion to open modal
    useEffect(() => {
        if (gameState?.isComplete) {
            if (gameState.isWon) {
                setIsGameWonModalOpen(true);
                setIsGameLostModalOpen(false);
            } else {
                setIsGameLostModalOpen(true);
                setIsGameWonModalOpen(false);
            }
        } else {
            setIsGameWonModalOpen(false);
            setIsGameLostModalOpen(false);
        }
    }, [gameState?.isComplete, gameState?.isWon]);

    const handleCellClick = useCallback((row: number, col: number) => {
        setActiveCell({ row, col });
    }, []);

    const handleNumberInput = useCallback((num: number) => {
        if (!activeCell || !gameState || !guest || gameState.isComplete) return;

        emit('game:action', {
            roomCode: roomId,
            action: 'move',
            data: {
                row: activeCell.row,
                col: activeCell.col,
                value: num
            }
        });
    }, [activeCell, gameState, guest, roomId, emit]);

    const handleClearCell = useCallback(() => {
        if (!activeCell || !gameState || !guest || gameState.isComplete) return;

        emit('game:action', {
            roomCode: roomId,
            action: 'move',
            data: {
                row: activeCell.row,
                col: activeCell.col,
                value: null
            }
        });
    }, [activeCell, gameState, guest, roomId, emit]);

    const handleNewGame = useCallback((difficulty: SudokuDifficulty, challengeMode: boolean) => {
        if (!guest || !roomId) return;
        emit('game:action', {
            roomCode: roomId,
            action: 'new_game',
            data: { difficulty, challengeMode }
        });
        setIsDifficultyModalOpen(false);
        setIsGameWonModalOpen(false);
        setIsGameLostModalOpen(false);
    }, [guest, roomId, emit]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState?.isComplete) return;

            // Number input (1-9)
            if (/^[1-9]$/.test(e.key)) {
                handleNumberInput(parseInt(e.key));
                return;
            }

            // Deletion (Backspace or Delete)
            if (e.key === 'Backspace' || e.key === 'Delete') {
                handleClearCell();
                return;
            }

            // Navigation (Arrows)
            if (activeCell) {
                let { row, col } = activeCell;
                let moved = false;

                switch (e.key) {
                    case 'ArrowUp':
                        row = Math.max(0, row - 1);
                        moved = true;
                        break;
                    case 'ArrowDown':
                        row = Math.min(8, row + 1);
                        moved = true;
                        break;
                    case 'ArrowLeft':
                        col = Math.max(0, col - 1);
                        moved = true;
                        break;
                    case 'ArrowRight':
                        col = Math.min(8, col + 1);
                        moved = true;
                        break;
                }

                if (moved) {
                    e.preventDefault(); // Prevent scrolling
                    setActiveCell({ row, col });
                }
            } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                setActiveCell({ row: 0, col: 0 });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeCell, handleNumberInput, handleClearCell, gameState?.isComplete]);

    // Helper to format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isConnected || !gameState) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-50" />
                    <p className="text-zinc-500">Connecting to game server...</p>
                </div>
            </div>
        );
    }

    const remainingTime = gameState.challengeMode && gameState.timeLimit
        ? Math.max(0, gameState.timeLimit - (Date.now() - gameState.startTime) / 1000)
        : null;

    return (
        <div className="flex flex-col items-center min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
            <div className="w-full max-w-2xl flex flex-col items-center">

                {/* Header */}
                <div className="flex w-full justify-between items-center mb-6">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Sudoku</h1>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <span className="capitalize">{gameState.difficulty} Mode</span>
                            {gameState.challengeMode && (
                                <>
                                    <span>•</span>
                                    <span className="text-orange-600 font-medium tracking-wide flex items-center gap-1">
                                        ⚡ Challenge
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {gameState.challengeMode && (
                            <>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Mistakes</span>
                                    <span className={`text-xl font-mono font-bold ${gameState.mistakes >= 2 ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                        {gameState.mistakes}/3
                                    </span>
                                </div>
                                {remainingTime !== null && (
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Time</span>
                                        <span className={`text-xl font-mono font-bold ${remainingTime < 60 ? 'text-red-500 animate-pulse' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                            {formatTime(remainingTime)}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                        {!gameState.challengeMode && gameState.isComplete && gameState.isWon && (
                            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold animate-bounce">
                                Puzzle Solved! 🎉
                            </div>
                        )}
                    </div>
                </div>

                {/* Board */}
                <SudokuBoard
                    board={gameState.board}
                    onCellClick={handleCellClick}
                    activeCell={activeCell}
                />

                {/* Controls */}
                <SudokuControls
                    onNumberClick={handleNumberInput}
                    onClear={handleClearCell}
                    onNewGameClick={() => setIsDifficultyModalOpen(true)}
                />

                {/* Error Toast */}
                {error && (
                    <div className="fixed bottom-4 right-4 p-4 bg-red-100 text-red-700 rounded shadow-lg flex items-center gap-2 z-50">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-2 font-bold">&times;</button>
                    </div>
                )}

                {/* New Game Modal */}
                <DifficultySelectionModal
                    isOpen={isDifficultyModalOpen}
                    onClose={() => setIsDifficultyModalOpen(false)}
                    onSelectDifficulty={handleNewGame}
                />

                {/* Game Won Modal */}
                <DifficultySelectionModal
                    isOpen={isGameWonModalOpen}
                    onClose={() => setIsGameWonModalOpen(false)}
                    title="Puzzle Solved! 🎉"
                    message="Congratulations! You solved the puzzle."
                    onSelectDifficulty={handleNewGame}
                />

                {/* Game Lost Modal */}
                <DifficultySelectionModal
                    isOpen={isGameLostModalOpen}
                    onClose={() => setIsGameLostModalOpen(false)}
                    title="Game Over 💀"
                    message={`You ${gameState.mistakes >= 3 ? 'made too many mistakes' : 'ran out of time'}. Better luck next time!`}
                    onSelectDifficulty={handleNewGame}
                />
            </div>
        </div>
    );
}
