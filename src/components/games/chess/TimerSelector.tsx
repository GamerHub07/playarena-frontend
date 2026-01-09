'use client';

import { TIME_CONTROL_PRESETS, TimeControl } from '@/types/chess';
import { Clock } from 'lucide-react';

interface TimerSelectorProps {
    selectedKey: string;
    onSelect: (key: string) => void;
    disabled?: boolean;
}

const TIMER_CATEGORIES = {
    bullet: { label: 'Bullet', description: '1-2 min', color: 'text-red-400' },
    blitz: { label: 'Blitz', description: '3-5 min', color: 'text-yellow-400' },
    rapid: { label: 'Rapid', description: '10-30 min', color: 'text-green-400' },
    classical: { label: 'Classical', description: '30+ min', color: 'text-blue-400' },
    unlimited: { label: 'Unlimited', description: 'No clock', color: 'text-gray-400' },
    armageddon: { label: 'Armageddon', description: 'Black wins draws', color: 'text-purple-400' },
};

export default function TimerSelector({ selectedKey, onSelect, disabled }: TimerSelectorProps) {
    const presets = Object.entries(TIME_CONTROL_PRESETS);

    // Group presets by type
    const grouped = presets.reduce((acc, [key, control]) => {
        if (!acc[control.type]) acc[control.type] = [];
        acc[control.type].push({ key, ...control });
        return acc;
    }, {} as Record<string, (TimeControl & { key: string })[]>);

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                Time Control
            </div>

            <div className="space-y-3">
                {Object.entries(TIMER_CATEGORIES).map(([type, meta]) => {
                    const options = grouped[type] || [];
                    if (options.length === 0) return null;

                    return (
                        <div key={type}>
                            <div className={`text-xs font-bold mb-2 ${meta.color}`}>
                                {meta.label}
                                <span className="text-gray-500 font-normal ml-2">{meta.description}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {options.map(({ key, name }) => (
                                    <button
                                        key={key}
                                        onClick={() => !disabled && onSelect(key)}
                                        disabled={disabled}
                                        className={`
                                            px-3 py-2 rounded-lg text-sm font-semibold transition-all
                                            ${selectedKey === key
                                                ? 'bg-white text-gray-900 shadow-lg scale-105'
                                                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                                            }
                                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
