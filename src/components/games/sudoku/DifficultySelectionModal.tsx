import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface DifficultySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard', challengeMode: boolean) => void;
    title?: string;
    message?: string;
    showChallengeOption?: boolean;
}

export const DifficultySelectionModal = ({
    isOpen,
    onClose,
    onSelectDifficulty,
    title = "New Game",
    message = "Select a difficulty level to start a new game:",
    showChallengeOption = true
}: DifficultySelectionModalProps) => {
    const [challengeMode, setChallengeMode] = useState(false);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col gap-6">
                <p className="text-zinc-600 dark:text-zinc-400 text-center">
                    {message}
                </p>

                {showChallengeOption && (
                    <div className="flex items-center justify-center gap-2">
                        <input
                            type="checkbox"
                            checked={challengeMode}
                            onChange={(e) => setChallengeMode(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-zinc-300 focus:ring-blue-500"
                            id="challenge-mode"
                        />
                        <label htmlFor="challenge-mode" className="text-zinc-700 dark:text-zinc-300 select-none cursor-pointer">
                            Enable Challenging Mode (Timer + 3 Mistakes Limit)
                        </label>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <Button
                        size="lg"
                        className="w-full bg-green-500 hover:bg-green-600 text-white border-none"
                        onClick={() => onSelectDifficulty('easy', challengeMode)}
                    >
                        Easy
                    </Button>
                    <Button
                        size="lg"
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white border-none"
                        onClick={() => onSelectDifficulty('medium', challengeMode)}
                    >
                        Medium
                    </Button>
                    <Button
                        size="lg"
                        className="w-full bg-red-500 hover:bg-red-600 text-white border-none"
                        onClick={() => onSelectDifficulty('hard', challengeMode)}
                    >
                        Hard
                    </Button>
                </div>

                <div className="flex justify-center mt-2">
                    <button
                        onClick={onClose}
                        className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
};
