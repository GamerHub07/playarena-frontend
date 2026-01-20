import React from 'react';
import { Tile2048 } from './Tile2048';
import { Tile } from '@/types/game2048';

interface Board2048Props {
    grid: (Tile | null)[][];
}

export const Board2048 = ({ grid }: Board2048Props) => {
    // Flatten grid for rendering
    const tiles: Tile[] = [];
    grid.forEach(row => {
        row.forEach(tile => {
            if (tile) tiles.push(tile);
        });
    });

    return (
        <div className="relative w-full aspect-square bg-[#bbada0] rounded-lg p-1 md:p-2">
            {/* Background Grid */}
            <div className="grid grid-cols-4 grid-rows-4 w-full h-full gap-2 md:gap-3">
                {Array(16).fill(null).map((_, i) => (
                    <div key={i} className="bg-[#cdc1b4] rounded w-full h-full"></div>
                ))}
            </div>

            {/* Tiles Layer */}
            <div className="absolute top-0 left-0 w-full h-full p-1 md:p-2">
                {/* Container for tiles ensuring they align with grid padding */}
                <div className="relative w-full h-full">
                    {tiles.map(tile => (
                        <Tile2048 key={tile.id} tile={tile} />
                    ))}
                </div>
            </div>
        </div>
    );
};
