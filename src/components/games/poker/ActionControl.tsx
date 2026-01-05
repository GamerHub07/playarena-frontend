import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

interface ActionProps {
    minBet: number;
    myChips: number;
    onAction: (action: 'fold' | 'call' | 'check' | 'raise' | 'nextRound', amount?: number) => void;
}

export default function ActionControls({ minBet, myChips, onAction }: ActionProps) {
    const [raiseAmount, setRaiseAmount] = useState(minBet * 2);

    // Update default raise amount when minBet changes
    useEffect(() => {
        const minimalRaise = minBet > 0 ? minBet * 2 : 20; // Default to BB*2 or similar
        setRaiseAmount(Math.min(minimalRaise, myChips));
    }, [minBet, myChips]);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        };

        const handlePointerUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging, dragStart]);

    const startDrag = (e: React.PointerEvent) => {
        // Only allow dragging from the header area/background, not inputs/buttons
        if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'INPUT') return;

        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    return (
        <div
            className="bg-slate-900/95 backdrop-blur-md p-6 rounded-2xl border border-slate-700 flex flex-col gap-4 shadow-2xl touch-none cursor-grab active:cursor-grabbing"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                userSelect: 'none'
            }}
            onPointerDown={startDrag}
        >
            {/* Raise Control Slider - Draggable Header Area */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-slate-300 text-sm font-bold pointer-events-none">
                    <span>Raise Amount</span>
                    <span className="text-emerald-400">${raiseAmount}</span>
                </div>
                <input
                    type="range"
                    min={minBet + 1}
                    max={myChips}
                    value={raiseAmount}
                    onChange={(e) => setRaiseAmount(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    onPointerDown={(e) => e.stopPropagation()}
                />
                <div className="flex justify-between text-xs text-slate-500 pointer-events-none">
                    <span>Min: ${minBet + 1}</span>
                    <span>All In: ${myChips}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <Button
                    onClick={() => onAction('fold')}
                    className="bg-red-900/50 hover:bg-red-800"
                >
                    Fold
                </Button>
                <Button
                    onClick={() => onAction(minBet === 0 ? 'check' : 'call')}
                    className="bg-slate-800 hover:bg-slate-700"
                >
                    {minBet === 0 ? 'Check' : `Call $${minBet}`}
                </Button>
                <Button
                    onClick={() => onAction('raise', raiseAmount)}
                    className="bg-emerald-600 hover:bg-emerald-500"
                >
                    Raise
                </Button>
            </div>
        </div>
    );
}
