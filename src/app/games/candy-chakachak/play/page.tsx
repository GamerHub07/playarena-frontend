'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CandyEngine, CandyState } from '@/lib/games/candy';
import { CandyBoard } from '@/components/games/candy-chakachak/CandyBoard';
import { saveGame, loadGame } from '@/lib/localGameStore';
import { Loader2, RefreshCw, Trophy, Target, Move, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CandyPlayPage() {
    const [engine, setEngine] = useState<CandyEngine | null>(null);
    const [gameState, setGameState] = useState<CandyState | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize engine from localStorage or start new game
    useEffect(() => {
        const savedState = loadGame<CandyState>('candy');
        if (savedState && !savedState.isComplete) {
            const eng = new CandyEngine(savedState);
            setEngine(eng);
            setGameState(eng.getState());
        } else {
            const eng = new CandyEngine();
            setEngine(eng);
            setGameState(eng.getState());
        }
        setIsLoading(false);
    }, []);

    // Save game state to localStorage whenever it changes
    useEffect(() => {
        if (gameState) {
            saveGame('candy', gameState);
        }
    }, [gameState]);

    const handleSwap = useCallback((r1: number, c1: number, r2: number, c2: number) => {
        if (!engine || gameState?.isComplete) return;

        const newState = engine.handleAction('swap', { row1: r1, col1: c1, row2: r2, col2: c2 });
        setGameState({ ...newState });
    }, [engine, gameState]);

    const handleRestart = useCallback(() => {
        if (!engine) return;
        const newState = engine.startNewGame();
        setGameState({ ...newState });
    }, [engine]);

    if (isLoading || !gameState) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
            <div className="w-full max-w-[500px]">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link href="/games/candy-chakachak" className="text-zinc-400 hover:text-zinc-600">
                                <Home className="w-5 h-5" />
                            </Link>
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                                Candy Chakachak
                            </h1>
                        </div>
                        <p className="text-zinc-500 text-sm mt-1">Match 3 to win!</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Target: {gameState.targetScore}</span>
                        </div>
                    </div>
                </div>

                {/* Score Board */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-pink-100 dark:bg-pink-900/20 p-3 rounded-xl border border-pink-200 dark:border-pink-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-pink-500 rounded-lg text-white">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase">Score</div>
                                <div className="text-2xl font-black text-zinc-900 dark:text-white">{gameState.score}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500 rounded-lg text-white">
                                <Move className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Moves Left</div>
                                <div className="text-2xl font-black text-zinc-900 dark:text-white">{gameState.movesLeft}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Board */}
                <div className="relative mb-6">
                    <CandyBoard
                        grid={gameState.grid}
                        onSwap={handleSwap}
                    />

                    {/* Win/Loss Overlay */}
                    {gameState.isComplete && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl animate-in fade-in duration-500 p-6 text-center">
                            {gameState.score >= gameState.targetScore ? (
                                <>
                                    <Trophy className="w-24 h-24 text-yellow-500 mb-6 animate-bounce" />
                                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                                        Level Cleared!
                                    </h2>
                                    <p className="text-zinc-600 dark:text-zinc-300 mb-8 text-lg">
                                        Amazing! You scored {gameState.score}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                        <span className="text-4xl">😢</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                                        Out of Moves!
                                    </h2>
                                    <p className="text-zinc-600 dark:text-zinc-300 mb-8 text-lg">
                                        You scored {gameState.score} / {gameState.targetScore}
                                    </p>
                                </>
                            )}

                            <Button size="lg" onClick={handleRestart} className="w-full max-w-[200px] shadow-xl">
                                <RefreshCw className="mr-2 h-5 w-5" /> Try Again
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Button size="sm" variant="ghost" onClick={handleRestart}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Restart Level
                    </Button>
                </div>
            </div>
        </div>
    );
}
