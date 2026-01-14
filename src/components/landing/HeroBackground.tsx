'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Gaming-themed shapes (Controller vibes)
const SHAPES = [
    // Circle (O)
    {
        id: 'circle',
        path: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full">
                <circle cx="12" cy="12" r="9" />
            </svg>
        )
    },
    // Cross (X)
    {
        id: 'cross',
        path: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    // Triangle (Triangle)
    {
        id: 'triangle',
        path: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full">
                <path d="M12 4L4 20h16L12 4z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    },
    // Square (Square)
    {
        id: 'square',
        path: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full">
                <rect x="5" y="5" width="14" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }
];

export function HeroBackground() {
    const [mounted, setMounted] = useState(false);

    // Randomize initial positions only on client to avoid hydration mismatch
    const [elements, setElements] = useState<any[]>([]);

    useEffect(() => {
        const count = 15; // Number of floating shapes
        const newElements = Array.from({ length: count }).map((_, i) => ({
            id: i,
            shape: SHAPES[i % SHAPES.length],
            initialX: Math.random() * 100, // %
            initialY: Math.random() * 100, // %
            duration: 15 + Math.random() * 20, // Slow float
            delay: Math.random() * 5,
            scale: 0.5 + Math.random() * 1.5,
            rotate: Math.random() * 360,
        }));
        setElements(newElements);
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_100%)]" />

            {/* Floating Shapes */}
            {elements.map((el) => (
                <motion.div
                    key={el.id}
                    className="absolute text-foreground/20 dark:text-white/20"
                    style={{
                        left: `${el.initialX}%`,
                        top: `${el.initialY}%`,
                        width: '40px',
                        height: '40px',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        y: [0, -50, 0],
                        rotate: [0, 360],
                        scale: [el.scale, el.scale * 1.2, el.scale],
                    }}
                    transition={{
                        duration: el.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: el.delay,
                    }}
                >
                    {el.shape.path}
                </motion.div>
            ))}

            {/* Glowing Orbs for subtle color - Boosted visibility slightly */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
        </div>
    );
}
