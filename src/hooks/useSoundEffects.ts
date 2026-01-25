'use client';

/**
 * Enhanced Sound Effects Hook
 * 
 * A comprehensive audio utility for Next.js that:
 * - Uses Web Audio API for synthesized sounds (no external files needed)
 * - Handles SSR safety
 * - Supports volume control and muting
 * - Provides game-specific sound effects
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// Sound effect types
export type SoundEffect =
    // General
    | 'CLICK'
    | 'SUCCESS'
    | 'ERROR'
    | 'WIN'
    | 'LOSE'
    // Chess
    | 'MOVE'
    | 'CAPTURE'
    | 'CHECK'
    | 'CHECKMATE'
    // 2048
    | 'TILE_SLIDE'
    | 'TILE_MERGE'
    // Memory
    | 'CARD_FLIP'
    | 'MATCH'
    | 'MISMATCH'
    // Candy Crush
    | 'SWAP'
    | 'CASCADE'
    // Tic Tac Toe
    | 'PLACE_X'
    | 'PLACE_O'
    | 'DRAW'
    // Board games (existing)
    | 'DICE_ROLL'
    | 'SNAKE_BITE';

// Legacy sound file paths (for existing sounds)
const LEGACY_SOUND_FILES: Partial<Record<SoundEffect, string>> = {
    DICE_ROLL: '/dice.mp3',
    SNAKE_BITE: '/snake.mp3',
};

interface UseSoundEffectsOptions {
    volume?: number; // 0.0 to 1.0
    enabled?: boolean;
}

interface UseSoundEffectsReturn {
    playSound: (sound: SoundEffect) => void;
    // Legacy convenience methods
    playDiceRoll: () => void;
    playSnakeBite: () => void;
    // New convenience methods
    playMove: () => void;
    playCapture: () => void;
    playCheck: () => void;
    playWin: () => void;
    playLose: () => void;
    playClick: () => void;
    playSuccess: () => void;
    playError: () => void;
    playCardFlip: () => void;
    playMatch: () => void;
    playMismatch: () => void;
    playTileSlide: () => void;
    playTileMerge: () => void;
    playSwap: () => void;
    playCascade: () => void;
    playPlaceX: () => void;
    playPlaceO: () => void;
    // Controls
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    isMuted: boolean;
    isReady: boolean;
}

/**
 * Creates a synthesized sound using Web Audio API
 */
function createSynthSound(
    audioContext: AudioContext,
    type: OscillatorType,
    frequency: number,
    duration: number,
    volume: number,
    frequencyEnd?: number,
    attack: number = 0.01,
    decay: number = 0.1
): void {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    if (frequencyEnd) {
        oscillator.frequency.exponentialRampToValueAtTime(
            frequencyEnd,
            audioContext.currentTime + duration
        );
    }

    // ADSR envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + attack);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, audioContext.currentTime + attack + decay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

/**
 * Creates noise for percussive sounds
 */
function createNoiseSound(
    audioContext: AudioContext,
    duration: number,
    volume: number
): void {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    noise.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noise.start();
    noise.stop(audioContext.currentTime + duration);
}

/**
 * Sound definitions using synthesized audio
 */
function playSynthesizedSound(audioContext: AudioContext, sound: SoundEffect, volume: number): void {
    const v = volume * 0.5; // Scale down to avoid being too loud

    switch (sound) {
        // General UI sounds
        case 'CLICK':
            createSynthSound(audioContext, 'sine', 800, 0.08, v, 600);
            break;

        case 'SUCCESS':
            createSynthSound(audioContext, 'sine', 523, 0.1, v); // C5
            setTimeout(() => createSynthSound(audioContext, 'sine', 659, 0.1, v), 100); // E5
            setTimeout(() => createSynthSound(audioContext, 'sine', 784, 0.15, v), 200); // G5
            break;

        case 'ERROR':
            createSynthSound(audioContext, 'sawtooth', 200, 0.2, v * 0.3, 100);
            break;

        case 'WIN':
            // Victory fanfare
            createSynthSound(audioContext, 'sine', 523, 0.15, v); // C5
            setTimeout(() => createSynthSound(audioContext, 'sine', 659, 0.15, v), 150); // E5
            setTimeout(() => createSynthSound(audioContext, 'sine', 784, 0.15, v), 300); // G5
            setTimeout(() => createSynthSound(audioContext, 'sine', 1047, 0.3, v), 450); // C6
            break;

        case 'LOSE':
            // Sad descending tone
            createSynthSound(audioContext, 'sine', 400, 0.15, v);
            setTimeout(() => createSynthSound(audioContext, 'sine', 350, 0.15, v), 150);
            setTimeout(() => createSynthSound(audioContext, 'sine', 300, 0.3, v), 300);
            break;

        // Chess sounds
        case 'MOVE':
            createSynthSound(audioContext, 'sine', 400, 0.1, v, 300);
            createNoiseSound(audioContext, 0.05, v * 0.3);
            break;

        case 'CAPTURE':
            createNoiseSound(audioContext, 0.08, v * 0.5);
            createSynthSound(audioContext, 'triangle', 300, 0.15, v, 150);
            break;

        case 'CHECK':
            createSynthSound(audioContext, 'square', 880, 0.1, v * 0.4);
            setTimeout(() => createSynthSound(audioContext, 'square', 880, 0.1, v * 0.4), 150);
            break;

        case 'CHECKMATE':
            createSynthSound(audioContext, 'sawtooth', 220, 0.3, v * 0.4, 110);
            setTimeout(() => createSynthSound(audioContext, 'sawtooth', 165, 0.4, v * 0.4, 82), 300);
            break;

        // 2048 sounds
        case 'TILE_SLIDE':
            createSynthSound(audioContext, 'sine', 300, 0.08, v * 0.4, 400);
            break;

        case 'TILE_MERGE':
            createSynthSound(audioContext, 'sine', 440, 0.1, v);
            createSynthSound(audioContext, 'sine', 554, 0.1, v * 0.7); // Major third harmony
            break;

        // Memory game sounds
        case 'CARD_FLIP':
            createSynthSound(audioContext, 'sine', 600, 0.08, v * 0.5, 800);
            break;

        case 'MATCH':
            createSynthSound(audioContext, 'sine', 523, 0.1, v);
            setTimeout(() => createSynthSound(audioContext, 'sine', 784, 0.15, v), 100);
            break;

        case 'MISMATCH':
            createSynthSound(audioContext, 'triangle', 250, 0.15, v * 0.5, 200);
            break;

        // Candy Crush sounds
        case 'SWAP':
            createSynthSound(audioContext, 'sine', 500, 0.1, v * 0.6, 700);
            break;

        case 'CASCADE':
            // Cascading arpeggios
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                setTimeout(() => createSynthSound(audioContext, 'sine', freq, 0.1, v * 0.6), i * 60);
            });
            break;

        // Tic-Tac-Toe sounds
        case 'PLACE_X':
            createSynthSound(audioContext, 'square', 440, 0.1, v * 0.4);
            createSynthSound(audioContext, 'square', 554, 0.1, v * 0.3); // Slightly dissonant
            break;

        case 'PLACE_O':
            createSynthSound(audioContext, 'sine', 349, 0.12, v * 0.5); // F4
            createSynthSound(audioContext, 'sine', 440, 0.12, v * 0.4); // A4
            break;

        case 'DRAW':
            createSynthSound(audioContext, 'triangle', 400, 0.2, v * 0.4);
            setTimeout(() => createSynthSound(audioContext, 'triangle', 400, 0.2, v * 0.4), 250);
            break;

        default:
            // Default click sound for any undefined
            createSynthSound(audioContext, 'sine', 600, 0.05, v * 0.3);
    }
}

/**
 * Hook for playing sound effects safely in Next.js
 * Uses Web Audio API for synthesized sounds and legacy files for existing sounds
 */
export function useSoundEffects(options: UseSoundEffectsOptions = {}): UseSoundEffectsReturn {
    const { volume = 0.5, enabled = true } = options;

    const audioContextRef = useRef<AudioContext | null>(null);
    const volumeRef = useRef(volume);
    const [isMuted, setIsMuted] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Initialize AudioContext on first user interaction
    const initAudioContext = useCallback(() => {
        if (typeof window === 'undefined') return null;

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        // Resume if suspended (browser autoplay policy)
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        return audioContextRef.current;
    }, []);

    // Setup on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize on first user interaction
        const handleInteraction = () => {
            initAudioContext();
            setIsReady(true);
            // Remove listeners after first interaction
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);

            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };
    }, [initAudioContext]);

    // Update volume ref
    useEffect(() => {
        volumeRef.current = volume;
    }, [volume]);

    /**
     * Play a sound effect by key
     */
    const playSound = useCallback((sound: SoundEffect) => {
        if (!enabled || isMuted || typeof window === 'undefined') return;

        try {
            // Check for legacy sound files first
            const legacyPath = LEGACY_SOUND_FILES[sound];
            if (legacyPath) {
                const audio = new Audio(legacyPath);
                audio.volume = volumeRef.current;
                audio.play().catch(() => { });
                return;
            }

            // Use synthesized sound
            const audioContext = initAudioContext();
            if (audioContext) {
                playSynthesizedSound(audioContext, sound, volumeRef.current);
            }
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }, [enabled, isMuted, initAudioContext]);

    // Convenience methods
    const playDiceRoll = useCallback(() => playSound('DICE_ROLL'), [playSound]);
    const playSnakeBite = useCallback(() => playSound('SNAKE_BITE'), [playSound]);
    const playMove = useCallback(() => playSound('MOVE'), [playSound]);
    const playCapture = useCallback(() => playSound('CAPTURE'), [playSound]);
    const playCheck = useCallback(() => playSound('CHECK'), [playSound]);
    const playWin = useCallback(() => playSound('WIN'), [playSound]);
    const playLose = useCallback(() => playSound('LOSE'), [playSound]);
    const playClick = useCallback(() => playSound('CLICK'), [playSound]);
    const playSuccess = useCallback(() => playSound('SUCCESS'), [playSound]);
    const playError = useCallback(() => playSound('ERROR'), [playSound]);
    const playCardFlip = useCallback(() => playSound('CARD_FLIP'), [playSound]);
    const playMatch = useCallback(() => playSound('MATCH'), [playSound]);
    const playMismatch = useCallback(() => playSound('MISMATCH'), [playSound]);
    const playTileSlide = useCallback(() => playSound('TILE_SLIDE'), [playSound]);
    const playTileMerge = useCallback(() => playSound('TILE_MERGE'), [playSound]);
    const playSwap = useCallback(() => playSound('SWAP'), [playSound]);
    const playCascade = useCallback(() => playSound('CASCADE'), [playSound]);
    const playPlaceX = useCallback(() => playSound('PLACE_X'), [playSound]);
    const playPlaceO = useCallback(() => playSound('PLACE_O'), [playSound]);

    const setVolume = useCallback((newVolume: number) => {
        volumeRef.current = Math.max(0, Math.min(1, newVolume));
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    return {
        playSound,
        // Legacy
        playDiceRoll,
        playSnakeBite,
        // New
        playMove,
        playCapture,
        playCheck,
        playWin,
        playLose,
        playClick,
        playSuccess,
        playError,
        playCardFlip,
        playMatch,
        playMismatch,
        playTileSlide,
        playTileMerge,
        playSwap,
        playCascade,
        playPlaceX,
        playPlaceO,
        // Controls
        setVolume,
        toggleMute,
        isMuted,
        isReady,
    };
}

export default useSoundEffects;
