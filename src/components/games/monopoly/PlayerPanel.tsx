'use client';

import { Player } from '@/types/game';
import { MonopolyPlayerState } from '@/types/monopoly';
import MonopolyToken from './MonopolyToken';

interface PlayerPanelProps {
    player: Player;
    playerIndex: number;
    playerState?: MonopolyPlayerState;
    isCurrentTurn: boolean;
    isMe: boolean;
}

export default function PlayerPanel({
    player,
    playerIndex,
    playerState,
    isCurrentTurn,
    isMe,
}: PlayerPanelProps) {


    if (!playerState) return null;

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
                <span className="text-lg font-bold text-[#16a34a]">${playerState.cash}</span>
            </div>

            {/* Properties */}
            <div className="py-2 px-3 bg-[#2a2a2a] rounded-lg">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-[#888]">Properties</span>
                    <span className="text-sm font-medium text-white">{playerState.properties.length}</span>
                </div>
                {playerState.properties.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {playerState.properties.map((propId) => (
                            <span
                                key={propId}
                                className="text-[10px] px-1.5 py-0.5 bg-[#333] rounded text-white"
                                title={propId}
                            >
                                {propId.split('_')[0]}
                            </span>
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
