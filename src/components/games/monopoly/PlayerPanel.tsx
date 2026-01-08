'use client';

import { useState } from 'react';
import { Player } from '@/types/game';
import { MonopolyPlayerState, BoardSquare, PLAYER_TOKENS } from '@/types/monopoly';
import MonopolyToken from './MonopolyToken';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

// Color display mapping to nice hex values
const COLOR_NAMES: Record<string, string> = {
    brown: '#8B4513',
    lightBlue: '#87CEEB',
    pink: '#FF69B4',
    orange: '#FFA500',
    red: '#ff6868',
    yellow: '#ecd630',
    green: '#47c447',
    blue: '#4f4fc8',
};

interface PlayerPanelProps {
    player: Player;
    playerIndex: number;
    playerState?: MonopolyPlayerState;
    isCurrentTurn: boolean;
    isMe: boolean;
    board?: BoardSquare[];
    onPropertyClick?: (property: BoardSquare) => void;
}

export default function PlayerPanel({
    player,
    playerIndex,
    playerState,
    isCurrentTurn,
    isMe,
    board = [],
    onPropertyClick,
}: PlayerPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!playerState) return null;

    // Get property details from board
    const ownedProperties = board.filter(sq => 
        playerState.properties.includes(sq.id)
    );

    return (
        <div
            className={`
                p-4 rounded-xl border-2 transition-all
                ${isCurrentTurn ? 'border-[#16a34a] bg-[#16a34a]/10 scale-105' : 'border-[#2a2a2a] bg-[#1a1a1a]'}
                ${playerState.bankrupt ? 'opacity-50 grayscale' : ''}
            `}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <MonopolyToken playerIndex={playerIndex} size={28} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate">{player.username}</span>
                        {isMe && <span className="text-xs text-[#3b82f6]">You</span>}
                    </div>
                    {playerState.inJail && (
                        <span className="text-xs text-orange-400">🔒 In Jail ({playerState.jailTurns} turns)</span>
                    )}
                    {playerState.bankrupt && (
                        <span className="text-xs text-red-400">💀 Bankrupt</span>
                    )}
                </div>
                {isCurrentTurn && (
                    <div className="w-3 h-3 rounded-full bg-[#16a34a] animate-pulse" />
                )}
            </div>

            {/* Cash */}
            <div className="flex items-center justify-between py-2 px-3 bg-[#2a2a2a] rounded-lg mb-2">
                <span className="text-xs text-[#888]">Cash</span>
                <span className="text-lg font-bold text-[#16a34a]">₹{playerState.cash}</span>
            </div>

            {/* Properties Dropdown */}
            <div className="py-2 px-3 bg-[#2a2a2a] rounded-lg">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between"
                >
                    <span className="text-xs text-[#888]">Properties</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{playerState.properties.length}</span>
                        {playerState.properties.length > 0 && (
                            isExpanded ? (
                                <IoChevronUp className="text-[#888] text-sm" />
                            ) : (
                                <IoChevronDown className="text-[#888] text-sm" />
                            )
                        )}
                    </div>
                </button>
                
                {/* Expanded property list */}
                {isExpanded && ownedProperties.length > 0 && (
                    <div className="mt-3 space-y-1.5 border-t border-[#444] pt-3">
                        {ownedProperties.map((prop) => (
                            <button
                                key={prop.id}
                                onClick={() => onPropertyClick?.(prop)}
                                className="w-full flex items-center gap-2 p-2 rounded-lg bg-[#333] hover:bg-[#444] transition-colors text-left"
                            >
                                <div 
                                    className="w-3 h-3 rounded-sm flex-shrink-0"
                                    style={{ backgroundColor: COLOR_NAMES[prop.color || ''] || prop.color || '#666' }}
                                />
                                <span className="text-xs text-white truncate flex-1">
                                    {prop.name || prop.id?.replace(/_/g, ' ')}
                                </span>
                                {prop.houses !== undefined && prop.houses > 0 && (
                                    <span className="text-[10px] text-[#888]">
                                        {prop.houses === 5 ? '🏨' : `🏠×${prop.houses}`}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Position */}
            <div className="mt-2 text-center text-xs text-[#666]">
                Position: {playerState.position}
            </div>
        </div>
    );
}
