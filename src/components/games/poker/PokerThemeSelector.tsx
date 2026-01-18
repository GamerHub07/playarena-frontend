'use client';

import { useState } from 'react';

export type PokerTheme = 'classic' | 'premium';

interface ThemeConfig {
    id: PokerTheme;
    name: string;
    description: string;
    preview: {
        background: string;
        felt: string;
        accent: string;
    };
}

const POKER_THEMES: ThemeConfig[] = [
    {
        id: 'premium',
        name: 'Premium',
        description: 'Modern emerald with gradients and glow effects',
        preview: {
            background: '#0f172a',
            felt: '#0d5c2e',
            accent: '#10b981',
        },
    },
    {
        id: 'classic',
        name: 'Classic',
        description: 'PokerNow style - clean minimal design',
        preview: {
            background: '#1f1f1f',
            felt: '#35654d',
            accent: '#4caf50',
        },
    },
];

interface PokerThemeSelectorProps {
    currentTheme: PokerTheme;
    onThemeChange: (theme: PokerTheme) => void;
    compact?: boolean;
}

export default function PokerThemeSelector({
    currentTheme,
    onThemeChange,
    compact = true
}: PokerThemeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const currentConfig = POKER_THEMES.find(t => t.id === currentTheme) || POKER_THEMES[0];

    const handleThemeSelect = (themeId: PokerTheme) => {
        onThemeChange(themeId);
        setIsOpen(false);
    };

    const ThemePreview = ({ theme, isActive }: { theme: ThemeConfig; isActive: boolean }) => (
        <button
            onClick={() => handleThemeSelect(theme.id)}
            className={`
                w-full p-3 rounded-lg transition-all duration-200
                ${isActive ? 'ring-2 ring-emerald-500 scale-[1.02]' : 'hover:scale-[1.01]'}
            `}
            style={{
                background: theme.preview.background,
                border: `2px solid ${isActive ? theme.preview.accent : '#374151'}`,
                boxShadow: isActive ? `0 0 12px ${theme.preview.accent}40` : '0 2px 8px rgba(0,0,0,0.3)',
            }}
        >
            <div className="flex items-center gap-3">
                {/* Mini table preview */}
                <div
                    className="w-12 h-8 rounded-full flex-shrink-0"
                    style={{
                        backgroundColor: theme.preview.felt,
                        border: `2px solid ${theme.preview.accent}40`,
                    }}
                />

                {/* Theme info */}
                <div className="flex-1 text-left">
                    <p className="font-semibold text-sm text-white">
                        {theme.name}
                    </p>
                    {!compact && (
                        <p className="text-xs text-gray-400">
                            {theme.description}
                        </p>
                    )}
                </div>

                {/* Active indicator */}
                {isActive && (
                    <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.preview.accent }}
                    >
                        <svg className="w-3 h-3" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>
        </button>
    );

    if (compact) {
        return (
            <div className="relative">
                {/* Trigger Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:bg-slate-800 transition-all"
                >
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span className="text-sm font-medium text-white">
                        {currentConfig.name}
                    </span>
                    <svg
                        className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <>
                        {/* Backdrop - catches clicks outside to close */}
                        <div
                            className="fixed inset-0"
                            style={{ zIndex: 40 }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown Menu - must be above backdrop */}
                        <div
                            className="absolute top-full right-0 mt-2 w-64 rounded-xl overflow-hidden bg-slate-800 border border-slate-600"
                            style={{
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                zIndex: 50,
                            }}
                        >
                            <div className="p-3">
                                <p className="text-xs font-medium px-2 py-1 mb-2 text-gray-400">
                                    Select Table Theme
                                </p>
                                <div className="space-y-2">
                                    {POKER_THEMES.map((theme) => (
                                        <ThemePreview
                                            key={theme.id}
                                            theme={theme}
                                            isActive={theme.id === currentTheme}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Full theme selector grid
    return (
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-600">
            <h3 className="text-lg font-semibold mb-4 text-white">
                🎨 Table Theme
            </h3>
            <div className="space-y-2">
                {POKER_THEMES.map((theme) => (
                    <ThemePreview
                        key={theme.id}
                        theme={theme}
                        isActive={theme.id === currentTheme}
                    />
                ))}
            </div>
        </div>
    );
}
