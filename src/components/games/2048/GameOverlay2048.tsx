import React from 'react';
import Button from '@/components/ui/Button';

interface GameOverlay2048Props {
    won: boolean;
    gameOver: boolean;
    onRestart: () => void;
    onKeepPlaying: () => void;
}

export const GameOverlay2048 = ({ won, gameOver, onRestart, onKeepPlaying }: GameOverlay2048Props) => {
    if (!won && !gameOver) return null;

    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded animate-in fade-in duration-300">
            {won ? (
                <div className="text-center space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white">You Win! 🎉</h2>
                    <p className="text-zinc-600 dark:text-zinc-300 text-lg">2048 Tile Reached</p>
                    <div className="flex gap-4 mt-6">
                        <Button onClick={onKeepPlaying} variant="secondary">Keep Playing</Button>
                        <Button onClick={onRestart}>New Game</Button>
                    </div>
                </div>
            ) : (
                <div className="text-center space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white">Game Over</h2>
                    <Button size="lg" onClick={onRestart} className="mt-4">Try Again</Button>
                </div>
            )}
        </div>
    );
};
