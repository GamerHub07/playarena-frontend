'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Token move step from server
 */
export interface TokenMoveStep {
    playerIndex: number;
    tokenIndex: number;
    position: {
        zone: 'home' | 'path' | 'safe' | 'finish';
        index: number;
    };
    row: number;
    col: number;
    stepNumber: number;
    totalSteps: number;
    captured?: boolean;
}

/**
 * Animation state for a single token
 */
interface TokenAnimationState {
    playerIndex: number;
    tokenIndex: number;
    currentRow: number;
    currentCol: number;
    targetRow: number;
    targetCol: number;
    isAnimating: boolean;
}

/**
 * Hook return type
 */
interface UseTokenAnimationReturn {
    animatingTokens: Map<string, TokenAnimationState>;
    isAnimating: boolean;
    animateSteps: (steps: TokenMoveStep[], onComplete: () => void) => void;
    getTokenPosition: (playerIndex: number, tokenIndex: number) => { row: number; col: number } | null;
}

const ANIMATION_STEP_DELAY = 250; // ms between each step

/**
 * Custom hook to manage token animation state
 */
export function useTokenAnimation(): UseTokenAnimationReturn {
    const [animatingTokens, setAnimatingTokens] = useState<Map<string, TokenAnimationState>>(new Map());
    const [isAnimating, setIsAnimating] = useState(false);
    const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);

    /**
     * Generate a unique key for a token
     */
    const getTokenKey = (playerIndex: number, tokenIndex: number): string => {
        return `${playerIndex}-${tokenIndex}`;
    };

    /**
     * Animate a sequence of steps
     */
    const animateSteps = useCallback((steps: TokenMoveStep[], onComplete: () => void) => {
        if (steps.length === 0) {
            onComplete();
            return;
        }

        setIsAnimating(true);

        // Get starting position from first step
        const firstStep = steps[0];
        const tokenKey = getTokenKey(firstStep.playerIndex, firstStep.tokenIndex);

        let currentStepIndex = 0;

        const processNextStep = () => {
            if (currentStepIndex >= steps.length) {
                // Animation complete
                setAnimatingTokens(prev => {
                    const next = new Map(prev);
                    next.delete(tokenKey);
                    return next;
                });
                setIsAnimating(false);
                onComplete();
                return;
            }

            const step = steps[currentStepIndex];

            // Update animating token position
            setAnimatingTokens(prev => {
                const next = new Map(prev);
                next.set(tokenKey, {
                    playerIndex: step.playerIndex,
                    tokenIndex: step.tokenIndex,
                    currentRow: step.row,
                    currentCol: step.col,
                    targetRow: step.row,
                    targetCol: step.col,
                    isAnimating: true,
                });
                return next;
            });

            currentStepIndex++;

            // Schedule next step
            animationTimeoutRef.current = setTimeout(processNextStep, ANIMATION_STEP_DELAY);
        };

        // Start animation
        processNextStep();
    }, []);

    /**
     * Get the current visual position of a token (for rendering during animation)
     */
    const getTokenPosition = useCallback((playerIndex: number, tokenIndex: number): { row: number; col: number } | null => {
        const key = getTokenKey(playerIndex, tokenIndex);
        const animState = animatingTokens.get(key);

        if (animState && animState.isAnimating) {
            return { row: animState.currentRow, col: animState.currentCol };
        }

        return null;
    }, [animatingTokens]);

    return {
        animatingTokens,
        isAnimating,
        animateSteps,
        getTokenPosition,
    };
}
