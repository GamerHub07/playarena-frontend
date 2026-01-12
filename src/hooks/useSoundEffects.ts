'use client';

/**
 * Sound Effects Hook
 * 
 * A safe audio utility for Next.js that handles:
 * - SSR (server-side rendering) safety
 * - Audio preloading
 * - Multiple concurrent plays
 * - Volume control
 * - Error handling
 */

import { useCallback, useEffect, useRef } from 'react';

// Sound effect paths (relative to public folder)
export const SOUND_EFFECTS = {
    DICE_ROLL: '/dice.mp3',
    SNAKE_BITE: '/snake.mp3',
    // Add more sounds here as needed
    // WIN: '/win.mp3',
    // LADDER_CLIMB: '/ladder.mp3',
} as const;

type SoundEffect = keyof typeof SOUND_EFFECTS;

interface UseSoundEffectsOptions {
    volume?: number; // 0.0 to 1.0
    enabled?: boolean;
}

interface UseSoundEffectsReturn {
    playSound: (sound: SoundEffect) => void;
    playDiceRoll: () => void;
    playSnakeBite: () => void;
    setVolume: (volume: number) => void;
    isReady: boolean;
}

/**
 * Hook for playing sound effects safely in Next.js
 * Handles SSR, preloading, and proper cleanup
 */
export function useSoundEffects(options: UseSoundEffectsOptions = {}): UseSoundEffectsReturn {
    const { volume = 0.5, enabled = true } = options;

    // Store audio elements in a ref to persist across renders
    const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
    const volumeRef = useRef(volume);
    const isReadyRef = useRef(false);

    // Update volume ref when prop changes
    useEffect(() => {
        volumeRef.current = volume;
        // Update volume on all cached audio elements
        audioCache.current.forEach(audio => {
            audio.volume = volume;
        });
    }, [volume]);

    // Preload audio files on mount (client-side only)
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        const preloadAudio = async () => {
            try {
                // Preload all sound effects
                for (const [key, path] of Object.entries(SOUND_EFFECTS)) {
                    const audio = new Audio(path);
                    audio.preload = 'auto';
                    audio.volume = volumeRef.current;

                    // Add to cache
                    audioCache.current.set(key, audio);

                    // Attempt to load
                    await audio.load();
                }
                isReadyRef.current = true;
            } catch (error) {
                console.warn('Failed to preload audio:', error);
            }
        };

        preloadAudio();

        // Cleanup on unmount
        return () => {
            audioCache.current.forEach(audio => {
                audio.pause();
                audio.src = '';
            });
            audioCache.current.clear();
        };
    }, []);

    /**
     * Play a sound effect by key
     * Creates a new Audio instance each time for overlapping sounds
     */
    const playSound = useCallback((sound: SoundEffect) => {
        // Don't play if disabled or not on client
        if (!enabled || typeof window === 'undefined') return;

        try {
            const path = SOUND_EFFECTS[sound];
            if (!path) {
                console.warn(`Sound effect "${sound}" not found`);
                return;
            }

            // Create a new Audio instance for this play
            // This allows overlapping sounds
            const audio = new Audio(path);
            audio.volume = volumeRef.current;

            // Play the sound
            const playPromise = audio.play();

            // Handle play promise (required for modern browsers)
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        // Cleanup after playback completes
                        audio.onended = () => {
                            audio.src = '';
                        };
                    })
                    .catch((error) => {
                        // Autoplay was prevented (user hasn't interacted yet)
                        // This is expected behavior, not an error
                        if (error.name !== 'NotAllowedError') {
                            console.warn('Audio play failed:', error);
                        }
                    });
            }
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }, [enabled]);

    /**
     * Convenience method for dice roll sound
     */
    const playDiceRoll = useCallback(() => {
        playSound('DICE_ROLL');
    }, [playSound]);

    /**
     * Convenience method for snake bite sound
     */
    const playSnakeBite = useCallback(() => {
        playSound('SNAKE_BITE');
    }, [playSound]);

    /**
     * Update volume for all future plays
     */
    const setVolume = useCallback((newVolume: number) => {
        volumeRef.current = Math.max(0, Math.min(1, newVolume));
    }, []);

    return {
        playSound,
        playDiceRoll,
        playSnakeBite,
        setVolume,
        isReady: isReadyRef.current,
    };
}

export default useSoundEffects;
