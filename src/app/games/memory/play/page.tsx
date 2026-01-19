'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { MemoryEngine, MemoryState, MemoryCard as MemoryCardType } from '@/lib/games/memory';
import { MemoryBoard } from '@/components/games/memory/MemoryBoard';
import { saveGame, loadGame } from '@/lib/localGameStore';
import { Loader2, RefreshCw, Trophy, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function MemoryPlayPage() {
    const [engine, setEngine] = useState<MemoryEngine | null>(null);
    const [gameState, setGameState] = useState<MemoryState | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize engine from localStorage or start new game
    useEffect(() => {
        const savedState = loadGame<MemoryState>('memory');
        if (savedState && !savedState.isComplete) {
            const eng = new MemoryEngine(savedState);
            setEngine(eng);
            setGameState(eng.getState());
        } else {
            const eng = new MemoryEngine();
            setEngine(eng);
            setGameState(eng.getState());
        }
        setIsLoading(false);
    }, []);

    // Save game state to localStorage whenever it changes
    useEffect(() => {
        if (gameState) {
            saveGame('memory', gameState);
        }
    }, [gameState]);

    const handleCardClick = useCallback((card: MemoryCardType) => {
        if (!engine || card.isFlipped || card.isMatched) return;

        const newState = engine.handleAction('flip', { cardId: card.id });
        setGameState({ ...newState });
    }, [engine]);

    const handleRestart = useCallback(() => {
        if (!engine) return;
        const newState = engine.startNewGame();
        setGameState({ ...newState });
    }, [engine]);

    if (isLoading || !gameState) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-50" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
            <div className="w-full max-w-[500px]">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link href="/games/memory" className="text-zinc-400 hover:text-zinc-600">
                                <Home className="w-5 h-5" />
                            </Link>
                            <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">Memory</h1>
                        </div>
                        <p className="text-zinc-500 mt-1">Find the matches!</p>
                    </div>

                    <div className="flex gap-2">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded min-w-[80px] text-center border border-indigo-200 dark:border-indigo-800">
                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Moves</div>
                            <div className="text-xl font-bold text-zinc-800 dark:text-white">{gameState.moves}</div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded min-w-[80px] text-center border border-green-200 dark:border-green-800">
                            <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Pairs</div>
                            <div className="text-xl font-bold text-zinc-800 dark:text-white">{gameState.matches}/8</div>
                        </div>
                        {gameState.bestScore > 0 && (
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded min-w-[80px] text-center border border-yellow-200 dark:border-yellow-800">
                                <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase">Best</div>
                                <div className="text-xl font-bold text-zinc-800 dark:text-white">{gameState.bestScore}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex justify-end mb-4">
                    <Button size="sm" variant="outline" onClick={handleRestart}>
                        <RefreshCw className="w-4 h-4 mr-2" /> New Game
                    </Button>
                </div>

                {/* Game Board */}
                <div className="relative">
                    <MemoryBoard
                        cards={gameState.cards}
                        onCardClick={handleCardClick}
                    />

                    {/* Win Overlay */}
                    {gameState.isComplete && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-2xl animate-in fade-in duration-500">
                            <Trophy className="w-20 h-20 text-yellow-500 mb-4 animate-bounce" />
                            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">You Win!</h2>
                            <p className="text-zinc-600 dark:text-zinc-300 mb-6">Completed in {gameState.moves} moves</p>
                            <Button size="lg" onClick={handleRestart}>
                                Play Again
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
