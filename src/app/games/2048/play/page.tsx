'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Board2048 } from '@/components/games/2048/Board2048';
import { GameOverlay2048 } from '@/components/games/2048/GameOverlay2048';
import { Engine2048, Game2048State, Direction } from '@/lib/games/2048';
import { saveGame, loadGame } from '@/lib/localGameStore';
import { Loader2, RefreshCw, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Play2048Page() {
    const [engine, setEngine] = useState<Engine2048 | null>(null);
    const [gameState, setGameState] = useState<Game2048State | null>(null);
    const [lastActionTime, setLastActionTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize engine from localStorage or start new game
    useEffect(() => {
        const savedState = loadGame<Game2048State>('2048');
        if (savedState && !savedState.gameOver) {
            const eng = new Engine2048(savedState);
            setEngine(eng);
            setGameState(eng.getState());
        } else {
            const eng = new Engine2048();
            setEngine(eng);
            setGameState(eng.getState());
        }
        setIsLoading(false);
    }, []);

    // Save game state to localStorage whenever it changes
    useEffect(() => {
        if (gameState) {
            saveGame('2048', gameState);
        }
    }, [gameState]);

    // Keyboard controls
    useEffect(() => {
        if (!gameState || gameState.gameOver || (gameState.won && !gameState.keepPlaying)) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const now = Date.now();
            if (now - lastActionTime < 100) return;

            let direction: Direction | null = null;

            switch (e.key) {
                case 'ArrowUp': direction = 'up'; break;
                case 'ArrowDown': direction = 'down'; break;
                case 'ArrowLeft': direction = 'left'; break;
                case 'ArrowRight': direction = 'right'; break;
            }

            if (direction && engine) {
                e.preventDefault();
                setLastActionTime(now);
                const newState = engine.handleAction('move', { direction });
                setGameState({ ...newState });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, engine, lastActionTime]);

    // Touch/swipe controls
    useEffect(() => {
        if (!gameState || gameState.gameOver || (gameState.won && !gameState.keepPlaying)) return;

        let touchStartX = 0;
        let touchStartY = 0;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!engine) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            const minSwipeDistance = 30;

            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) return;

            let direction: Direction;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                direction = deltaY > 0 ? 'down' : 'up';
            }

            const newState = engine.handleAction('move', { direction });
            setGameState({ ...newState });
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [gameState, engine]);

    const handleRestart = useCallback(() => {
        if (!engine) return;
        const newState = engine.startNewGame();
        setGameState({ ...newState });
    }, [engine]);

    const handleKeepPlaying = useCallback(() => {
        if (!engine) return;
        const newState = engine.handleAction('keep_playing');
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
                            <Link href="/games/2048" className="text-zinc-400 hover:text-zinc-600">
                                <Home className="w-5 h-5" />
                            </Link>
                            <h1 className="text-5xl font-bold text-zinc-800 dark:text-zinc-100">2048</h1>
                        </div>
                        <p className="text-zinc-500 mt-1">Join the numbers!</p>
                    </div>

                    <div className="flex gap-2">
                        <div className="bg-[#bbada0] p-2 rounded min-w-[80px] text-center">
                            <div className="text-xs font-bold text-[#eee4da] uppercase">Score</div>
                            <div className="text-xl font-bold text-white">{gameState.score}</div>
                        </div>
                        <div className="bg-[#bbada0] p-2 rounded min-w-[80px] text-center">
                            <div className="text-xs font-bold text-[#eee4da] uppercase">Best</div>
                            <div className="text-xl font-bold text-white">{gameState.bestScore}</div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex justify-end mb-4">
                    <Button size="sm" variant="outline" onClick={handleRestart}>
                        <RefreshCw className="w-4 h-4 mr-2" /> New Game
                    </Button>
                </div>

                {/* Game Board Container */}
                <div className="relative">
                    <Board2048 grid={gameState.grid} />

                    <GameOverlay2048
                        won={gameState.won}
                        gameOver={gameState.gameOver}
                        onRestart={handleRestart}
                        onKeepPlaying={handleKeepPlaying}
                    />
                </div>

                <div className="mt-8 text-center text-zinc-500">
                    <p>Use arrow keys or swipe to move tiles</p>
                </div>
            </div>
        </div>
    );
}
