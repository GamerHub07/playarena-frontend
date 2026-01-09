'use client';

import { usePieceStyle, PIECE_STYLES, PieceStyle } from './PieceStyle';
import { Crown, Check } from 'lucide-react';

interface PieceStyleSelectorProps {
    compact?: boolean;
}

export default function PieceStyleSelector({ compact = false }: PieceStyleSelectorProps) {
    const { styleId, setStyle, styles } = usePieceStyle();

    const styleList = Object.values(styles);

    // Render piece preview
    const renderPreview = (style: PieceStyle) => (
        <div className="flex gap-0.5">
            <span className={`text-lg ${style.whiteClass}`}>♔</span>
            <span className={`text-lg ${style.blackClass}`}>♚</span>
        </div>
    );

    if (compact) {
        return (
            <div className="flex gap-2 flex-wrap">
                {styleList.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => setStyle(style.id)}
                        className={`
                            relative px-2 py-1 rounded-lg transition-all bg-gray-800/50
                            ${styleId === style.id
                                ? 'ring-2 ring-white/50 scale-105'
                                : 'hover:scale-105 opacity-70 hover:opacity-100'
                            }
                        `}
                        title={style.name}
                    >
                        {renderPreview(style)}
                        {styleId === style.id && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-wider">
                <Crown className="w-4 h-4" />
                Piece Style
            </div>

            <div className="grid grid-cols-3 gap-3">
                {styleList.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => setStyle(style.id)}
                        className={`
                            flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                            ${styleId === style.id
                                ? 'bg-white/20 ring-2 ring-white/50'
                                : 'bg-white/5 hover:bg-white/10'
                            }
                        `}
                    >
                        {/* Large preview */}
                        <div className="flex gap-1 p-2 bg-gray-700 rounded-lg">
                            <span className={`text-2xl ${style.whiteClass}`}>♔</span>
                            <span className={`text-2xl ${style.blackClass}`}>♚</span>
                        </div>

                        <span className={`text-xs font-medium ${styleId === style.id ? 'text-white' : 'text-gray-400'}`}>
                            {style.name}
                        </span>

                        {styleId === style.id && (
                            <Check className="w-4 h-4 text-green-400" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
