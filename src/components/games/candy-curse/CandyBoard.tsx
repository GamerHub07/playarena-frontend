import React, { useState } from 'react';
import { CandyState, CandyGem } from '@/types/candy';
import { CandyGemComponent } from './CandyGem';

interface CandyBoardProps {
    grid: CandyGem[][];
    onSwap: (r1: number, c1: number, r2: number, c2: number) => void;
}

export const CandyBoard: React.FC<CandyBoardProps> = ({ grid, onSwap }) => {
    const [selected, setSelected] = useState<{ r: number, c: number } | null>(null);

    const handleGemClick = (r: number, c: number) => {
        if (!selected) {
            setSelected({ r, c });
        } else {
            // Check adjacency
            const isAdjacent = Math.abs(selected.r - r) + Math.abs(selected.c - c) === 1;

            if (isAdjacent) {
                onSwap(selected.r, selected.c, r, c);
                setSelected(null);
            } else if (selected.r === r && selected.c === c) {
                // Deselect
                setSelected(null);
            } else {
                // Select new
                setSelected({ r, c });
            }
        }
    };

    return (
        <div className="bg-zinc-900/40 p-2 sm:p-4 rounded-xl border border-white/10 backdrop-blur-sm shadow-2xl">
            <div className="grid grid-cols-8 gap-1 sm:gap-2 w-full aspect-square bg-black/20 p-2 rounded-lg">
                {grid.map((row, r) => (
                    row.map((gem, c) => (
                        <div key={`${r}-${c}`} className="w-full h-full aspect-square">
                            <CandyGemComponent
                                gem={gem}
                                isSelected={selected?.r === r && selected?.c === c}
                                onClick={() => handleGemClick(r, c)}
                            />
                        </div>
                    ))
                ))}
            </div>
        </div>
    );
};
