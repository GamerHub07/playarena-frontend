'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SudokuBoard } from '@/components/games/sudoku/SudokuBoard';
import { SudokuControls } from '@/components/games/sudoku/SudokuControls';
import { DifficultySelectionModal } from '@/components/games/sudoku/DifficultySelectionModal';
import { SudokuEngine, SudokuState, SudokuDifficulty } from '@/lib/games/sudoku';
import { saveGame, loadGame } from '@/lib/localGameStore';
import { Loader2, AlertCircle, Home } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function SudokuPlayPage() {
    const router = useRouter();
    const [engine, setEngine] = useState<SudokuEngine | null>(null);
    const [gameState, setGameState] = useState<SudokuState | null>(null);
    const [activeCell, setActiveCell] = useState<{ row: number, col: number } | null>(null);
    const [isDifficultyModalOpen, setIsDifficultyModalOpen] = useState(false);
    const [isGameWonModalOpen, setIsGameWonModalOpen] = useState(false);
    const [isGameLostModalOpen, setIsGameLostModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize engine from localStorage or show difficulty modal
    useEffect(() => {
        const savedState = loadGame<SudokuState>('sudoku');
        if (savedState && !savedState.isComplete) {
            const eng = new SudokuEngine(savedState);
            setEngine(eng);
            setGameState(eng.getState());
        } else {
            // No saved game or completed - show difficulty selection
            setIsDifficultyModalOpen(true);
        }
        setIsLoading(false);
    }, []);

    // Save game state to localStorage whenever it changes
    useEffect(() => {
        if (gameState) {
            saveGame('sudoku', gameState);
        }
    }, [gameState]);

    // Timer updater for challenge mode
    useEffect(() => {
        if (!gameState?.challengeMode || gameState.isComplete) return;
        const interval = setInterval(() => {
            // Force re-render to update timer display
            setGameState(gs => gs ? { ...gs } : null);
        }, 1000);
        return () => clearInterval(interval);
    }, [gameState?.challengeMode, gameState?.isComplete]);

    // Check for game completion
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
        if (!activeCell || !engine || gameState?.isComplete) return;

        const newState = engine.handleAction('move', {
            row: activeCell.row,
            col: activeCell.col,
            value: num
        });
        setGameState({ ...newState });
    }, [activeCell, engine, gameState?.isComplete]);

    const handleClearCell = useCallback(() => {
        if (!activeCell || !engine || gameState?.isComplete) return;

        const newState = engine.handleAction('move', {
            row: activeCell.row,
            col: activeCell.col,
            value: null
        });
        setGameState({ ...newState });
    }, [activeCell, engine, gameState?.isComplete]);

    const handleNewGame = useCallback((difficulty: SudokuDifficulty, challengeMode: boolean) => {
        const eng = new SudokuEngine();
        const newState = eng.generateNewGame(difficulty, challengeMode);
        setEngine(eng);
        setGameState({ ...newState });
        setIsDifficultyModalOpen(false);
        setIsGameWonModalOpen(false);
        setIsGameLostModalOpen(false);
        setActiveCell(null);
    }, []);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState?.isComplete) return;

            if (/^[1-9]$/.test(e.key)) {
                handleNumberInput(parseInt(e.key));
                return;
            }

            if (e.key === 'Backspace' || e.key === 'Delete') {
                handleClearCell();
                return;
            }

            if (activeCell) {
                let { row, col } = activeCell;
                let moved = false;

                switch (e.key) {
                    case 'ArrowUp': row = Math.max(0, row - 1); moved = true; break;
                    case 'ArrowDown': row = Math.min(8, row + 1); moved = true; break;
                    case 'ArrowLeft': col = Math.max(0, col - 1); moved = true; break;
                    case 'ArrowRight': col = Math.min(8, col + 1); moved = true; break;
                }

                if (moved) {
                    e.preventDefault();
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-50" />
                    <p className="text-zinc-500">Loading game...</p>
                </div>
            </div>
        );
    }

    const remainingTime = gameState?.challengeMode && gameState?.timeLimit
        ? Math.max(0, gameState.timeLimit - (Date.now() - gameState.startTime) / 1000)
        : null;

    // Check for timeout
    if (remainingTime !== null && remainingTime <= 0 && !gameState?.isComplete) {
        engine?.handleAction('move', { row: 0, col: 0, value: null }); // Trigger timeout check
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
            <div className="w-full max-w-2xl flex flex-col items-center">

                {/* Header */}
                <div className="flex w-full justify-between items-center mb-6">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Link href="/games/sudoku" className="text-zinc-400 hover:text-zinc-600">
                                <Home className="w-5 h-5" />
                            </Link>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Sudoku</h1>
                        </div>
                        {gameState && (
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
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {gameState?.challengeMode && (
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
                        {!gameState?.challengeMode && gameState?.isComplete && gameState?.isWon && (
                            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold animate-bounce">
                                Puzzle Solved! 🎉
                            </div>
                        )}
                    </div>
                </div>

                {/* Board */}
                {gameState && (
                    <SudokuBoard
                        board={gameState.board}
                        onCellClick={handleCellClick}
                        activeCell={activeCell}
                    />
                )}

                {/* Controls */}
                <SudokuControls
                    onNumberClick={handleNumberInput}
                    onClear={handleClearCell}
                    onNewGameClick={() => setIsDifficultyModalOpen(true)}
                />

                {/* New Game Modal (also shown on first load) */}
                <DifficultySelectionModal
                    isOpen={isDifficultyModalOpen}
                    onClose={() => {
                        // Only allow close if we have a game
                        if (gameState) setIsDifficultyModalOpen(false);
                    }}
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
                    message={`You ${gameState && gameState.mistakes >= 3 ? 'made too many mistakes' : 'ran out of time'}. Better luck next time!`}
                    onSelectDifficulty={handleNewGame}
                />
            </div>
        </div>
    );
}
