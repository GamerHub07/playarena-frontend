'use client';

import Button from '@/components/ui/Button';

interface DiceProps {
    values: [number, number] | null;
    rolling: boolean;
    canRoll: boolean;
    onRoll: () => void;
}

// Dice pip positions
const PIP_POSITIONS: Record<number, string[]> = {
    1: ['center'],
    2: ['top-right', 'bottom-left'],
    3: ['top-right', 'center', 'bottom-left'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
};

const getPipStyle = (position: string): React.CSSProperties => {
    const base: React.CSSProperties = {
        position: 'absolute',
        width: '20%',
        height: '20%',
        backgroundColor: '#1f2937',
        borderRadius: '50%',
    };

    switch (position) {
        case 'center':
            return { ...base, top: '40%', left: '40%' };
        case 'top-left':
            return { ...base, top: '15%', left: '15%' };
        case 'top-right':
            return { ...base, top: '15%', right: '15%' };
        case 'middle-left':
            return { ...base, top: '40%', left: '15%' };
        case 'middle-right':
            return { ...base, top: '40%', right: '15%' };
        case 'bottom-left':
            return { ...base, bottom: '15%', left: '15%' };
        case 'bottom-right':
            return { ...base, bottom: '15%', right: '15%' };
        default:
            return base;
    }
};

function Die({ value, rolling }: { value: number; rolling: boolean }) {
    const pips = PIP_POSITIONS[value] || [];

    return (
        <div
            className={`
                relative w-14 h-14 bg-white rounded-xl shadow-lg
                ${rolling ? 'animate-bounce' : ''}
            `}
            style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
        >
            {!rolling && pips.map((pos, idx) => (
                <div key={idx} style={getPipStyle(pos)} />
            ))}
            {rolling && (
                <div className="absolute inset-0 flex items-center justify-center text-2xl animate-spin">
                    🎲
                </div>
            )}
        </div>
    );
}

export default function Dice({ values, rolling, canRoll, onRoll }: DiceProps) {
    const [die1, die2] = values || [1, 1];
    const isDoubles = values && die1 === die2;

    return (
        <div className="space-y-4">
            {/* Dice Display */}
            <div className="flex items-center justify-center gap-4">
                <Die value={die1} rolling={rolling} />
                <Die value={die2} rolling={rolling} />
            </div>

            {/* Roll Result */}
            {values && !rolling && (
                <div className="text-center">
                    <span className="text-2xl font-bold text-white">
                        {die1 + die2}
                    </span>
                    {isDoubles && (
                        <span className="ml-2 text-sm text-[#16a34a]">Doubles! 🎉</span>
                    )}
                </div>
            )}

            {/* Roll Button */}
            {canRoll && (
                <Button
                    onClick={onRoll}
                    disabled={rolling}
                    className="w-full !bg-[#16a34a] hover:!bg-[#15803d]"
                >
                    {rolling ? 'Rolling...' : '🎲 Roll Dice'}
                </Button>
            )}
        </div>
    );
}
