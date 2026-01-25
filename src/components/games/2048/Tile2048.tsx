import React, { useEffect, useState } from 'react';
import { Tile } from '@/types/game2048';

interface Tile2048Props {
    tile: Tile;
}

export const Tile2048 = ({ tile }: Tile2048Props) => {
    const [scale, setScale] = useState('scale-0');

    useEffect(() => {
        // Animation for new tiles
        requestAnimationFrame(() => {
            setScale('scale-100');
        });
    }, []);

    // Color mapping based on value (similar to original 2048)
    const getColors = (val: number) => {
        switch (val) {
            case 2: return 'bg-[#eee4da] text-[#776e65]';
            case 4: return 'bg-[#ede0c8] text-[#776e65]';
            case 8: return 'bg-[#f2b179] text-white';
            case 16: return 'bg-[#f59563] text-white';
            case 32: return 'bg-[#f67c5f] text-white';
            case 64: return 'bg-[#f65e3b] text-white';
            case 128: return 'bg-[#edcf72] text-white text-3xl';
            case 256: return 'bg-[#edcc61] text-white text-3xl';
            case 512: return 'bg-[#edc850] text-white text-3xl';
            case 1024: return 'bg-[#edc53f] text-white text-2xl';
            case 2048: return 'bg-[#edc22e] text-white text-2xl shadow-[0_0_30px_10px_rgba(243,215,116,0.3)]';
            default: return 'bg-[#3c3a32] text-white text-xl';
        }
    };

    // Calculate position
    // Grid gap is usually ~15px. Tile size ~100px.
    // We'll use absolute positioning with strict calc percentages if possible, 
    // or just let CSS Grid handle it if we structure it that way.
    // Standard 2048 usually uses absolute positioning for smooth sliding animations.
    // For this implementation, let's use a simpler CSS Grid approach first for layout stability, 
    // OR absolute positioning if we want the slide animation.
    // Let's stick to Grid for simplicity of implementation unless "sliding" is strictly required. 
    // Actually, "sliding" is key to 2048 feel. 
    // Let's use CSS transforms for position: `translate(x, y)`

    // Position calculations assuming 4x4 grid.
    // We need the parent container to be relative.
    // Each cell is 25% width/height.
    const x = tile.col * 100;
    const y = tile.row * 100;

    return (
        <div
            className={`absolute transition-transform duration-100 ease-in-out w-1/4 h-1/4 p-1 md:p-2 z-10`}
            style={{ transform: `translate(${x}%, ${y}%)` }}
        >
            <div className={`w-full h-full rounded flex items-center justify-center font-bold text-4xl transition-all duration-200 ${getColors(tile.val)} ${scale} ${tile.mergedFrom ? 'animate-pop' : ''}`}>
                {tile.val}
            </div>
        </div>
    );
};
