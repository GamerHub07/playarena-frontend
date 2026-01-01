'use client';

import { useCallback, useRef, useState } from 'react';

// Audio Context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContext;
};

export interface CaptureEffect {
    id: string;
    x: number;
    y: number;
    color: string;
}

export function useGameEffects() {
    const [captureEffects, setCaptureEffects] = useState<CaptureEffect[]>([]);
    const effectIdRef = useRef(0);

    // Play capture sound - dramatic but professional
    const playCaptureSound = useCallback(() => {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume();

            // Deep impact sound
            const osc1 = ctx.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(150, ctx.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.2);

            const gain1 = ctx.createGain();
            gain1.gain.setValueAtTime(0.3, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.3);

            // Sharp click overlay
            const osc2 = ctx.createOscillator();
            osc2.type = 'square';
            osc2.frequency.value = 200;

            const gain2 = ctx.createGain();
            gain2.gain.setValueAtTime(0.15, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.1);

            // Whoosh noise
            const bufferSize = ctx.sampleRate * 0.15;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.5;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.1, ctx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(ctx.currentTime);
            noise.stop(ctx.currentTime + 0.2);
        } catch {
            // Audio not supported
        }
    }, []);

    // Trigger capture visual effect
    const triggerCaptureEffect = useCallback((color: string = '#E53935') => {
        const id = `capture-${effectIdRef.current++}`;
        const effect: CaptureEffect = {
            id,
            x: 50, // Center of screen percentage
            y: 50,
            color,
        };

        setCaptureEffects(prev => [...prev, effect]);

        // Remove effect after animation
        setTimeout(() => {
            setCaptureEffects(prev => prev.filter(e => e.id !== id));
        }, 800);

        // Play sound
        playCaptureSound();
    }, [playCaptureSound]);

    return {
        captureEffects,
        triggerCaptureEffect,
        playCaptureSound,
    };
}

// Capture effect overlay component
export function CaptureEffectOverlay({ effects }: { effects: CaptureEffect[] }) {
    if (effects.length === 0) return null;

    return (
        <div className= "fixed inset-0 pointer-events-none z-50" >
        {
            effects.map(effect => (
                <div
                    key= { effect.id }
                    className = "absolute inset-0 flex items-center justify-center"
                >
                {/* Ripple rings */ }
                < div
                        className = "absolute w-32 h-32 rounded-full opacity-0"
                        style = {{
                border: `3px solid ${effect.color}`,
                animation: 'captureRipple 0.6s ease-out forwards',
            }}
        />
        <div
                        className="absolute w-32 h-32 rounded-full opacity-0"
    style = {{
        border: `2px solid ${effect.color}`,
            animation: 'captureRipple 0.6s ease-out 0.1s forwards',
                        }
}
                    />

{/* Flash overlay */ }
<div
                        className="absolute inset-0"
style = {{
    background: `radial-gradient(circle at center, ${effect.color}20 0%, transparent 70%)`,
        animation: 'captureFlash 0.4s ease-out forwards',
                        }}
                    />
    </div>
            ))}

<style jsx > {`
                @keyframes captureRipple {
                    0% {
                        transform: scale(0.5);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                @keyframes captureFlash {
                    0% {
                        opacity: 0.6;
                    }
                    100% {
                        opacity: 0;
                    }
                }
            `}</style>
    </div>
    );
}
