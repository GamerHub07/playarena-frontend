'use client';

import { useState } from 'react';
import { Player } from '@/types/game';
import { MonopolyPlayerState, BoardSquare } from '@/types/monopoly';
import MonopolyToken from './MonopolyToken';
import { IoChevronDown, IoChevronUp, IoWallet, IoTrendingUp, IoBusiness } from 'react-icons/io5';
import { GiHouse, GiPrisoner, GiTombstone, GiMoneyStack } from 'react-icons/gi';
import { FaHotel, FaCrown } from 'react-icons/fa';

// Richer, vibrant colors for dark mode
const COLOR_NAMES: Record<string, string> = {
    brown: '#92400e',      // amber-800
    lightBlue: '#0ea5e9',  // sky-500
    pink: '#d946ef',       // fuchsia-500
    orange: '#f97316',     // orange-500
    red: '#ef4444',        // red-500
    yellow: '#eab308',     // yellow-500
    green: '#22c55e',      // green-500
    blue: '#D97706',       // amber-600
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

    // Calculate total net worth (cash + property values)
    const propertyValue = ownedProperties.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const totalWorth = playerState.cash + propertyValue;
    const isRich = totalWorth > 2000; // Just for visual flair

    return (
        <div
            className={`
                relative
                rounded-2xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                ${isCurrentTurn
                    ? 'bg-slate-900/90 backdrop-blur-xl border-t border-l border-[#22c55e]/50 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] scale-[1.03] z-10'
                    : 'bg-[#0f1115]/80 backdrop-blur-md border border-white/5 hover:border-white/10 hover:bg-[#14161b]/90'
                }
                ${playerState.bankrupt ? 'opacity-40 grayscale pointer-events-none' : ''}
                group overflow-hidden
            `}
        >
            {/* Background Gradient Mesh (Subtle) */}
            {isCurrentTurn && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/10 via-transparent to-transparent pointer-events-none animate-pulse-slow conservation-mode" />
            )}

            <div className="p-4 relative z-10">
                {/* Header Row */}
                <div className="flex items-center gap-4 mb-4">
                    {/* Avatar / Token */}
                    <div className="relative">
                        <div className={`
                            relative flex items-center justify-center w-8 h-8 rounded-2xl
                            bg-gradient-to-b from-[#2a2a35] to-[#15151a]
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.5)]
                            ${isCurrentTurn ? 'ring-2 ring-[#22c55e] ring-offset-2 ring-offset-[#0f172a]' : 'border border-white/5'}
                        `}>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/5 to-transparent opacity-50" />
                            <MonopolyToken
                                playerIndex={playerIndex}
                                size={24}
                                className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] filter contrast-125"
                            />
                        </div>

                        {/* Status Indicators */}
                        {playerState.inJail && (
                            <div className="absolute -top-3 -right-3 w-5 h-5 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg border border-orange-400 z-20 animate-bounce-subtle">
                                <GiPrisoner className="text-white text-xs" />
                            </div>
                        )}
                        {playerState.bankrupt && (
                            <div className="absolute -inset-1 bg-black/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center border border-red-900/50 z-20">
                                <GiTombstone className="text-red-600 text-2xl drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                            </div>
                        )}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                        <div className="flex items-center gap-2">
                            <h3 className={`font-bold text-base tracking-tight truncate ${isCurrentTurn ? 'text-white' : 'text-slate-300'}`}>
                                {player.username}
                            </h3>
                            {isMe && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-600/20 text-amber-600 border border-amber-600/30">
                                    You
                                </span>
                            )}
                            {isRich && !playerState.bankrupt && (
                                <FaCrown className="text-yellow-500 text-xs drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" title="High Net Worth" />
                            )}
                        </div>

                        {/* Turn Status Text */}
                        <div className="text-[11px] font-medium flex items-center h-4">
                            {playerState.bankrupt ? (
                                <span className="text-red-500 tracking-wide font-bold">BANKRUPT</span>
                            ) : playerState.inJail ? (
                                <span className="text-orange-400">Jail Term: {playerState.jailTurns} left</span>
                            ) : isCurrentTurn ? (
                                <span className="text-[#22c55e] flex items-center gap-1.5 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                                    Active Turn
                                </span>
                            ) : (
                                <span className="text-slate-500">Waiting...</span>
                            )}
                        </div>
                    </div>
                    <div className="rounded-xl bg-[#0a0a0c]/60 p-2 border border-white/5 relative overflow-hidden group/stats">
                        <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 transition-transform group-hover/stats:scale-125">
                            <GiMoneyStack className="text-white text-3xl" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                <IoWallet className="text-slate-600" /> Cash
                            </span>
                            <span className="text-lg font-mono font-bold text-[#4ade80] tracking-tight drop-shadow-[0_0_8px_rgba(74,222,128,0.2)]">
                                ₹{playerState.cash.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Glass Effect Panels */}
                {/* <div className="grid grid-cols-2 gap-2 mb-1"> */}
                {/* Cash Panel */}


                {/* Net Worth Panel */}
                {/* <div className="rounded-xl bg-[#0a0a0c]/60 p-3 border border-white/5 relative overflow-hidden">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                <IoTrendingUp className="text-slate-600" /> Net Worth
                            </span>
                            <span className="text-sm font-mono font-medium text-slate-300">
                                ₹{totalWorth.toLocaleString()}
                            </span>
                            <div className="w-full bg-slate-800/50 h-1 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-blue-500/50 rounded-full"
                                    style={{ width: `${Math.min((playerState.cash / (totalWorth || 1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div> */}
                {/* </div> */}

                {/* Properties Accordion */}
                <div className="mt-1">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`
                            w-full flex items-center justify-between p-2.5 rounded-lg
                            transition-all duration-300
                            ${isExpanded ? 'bg-[#1a1c22] text-white' : 'bg-transparent text-slate-400 hover:bg-[#1a1c22]/50 hover:text-slate-200'}
                        `}
                    >
                        <div className="flex items-center gap-2">
                            <IoBusiness className={`text-base ${isExpanded ? 'text-amber-600' : 'text-slate-600'}`} />
                            <span className="text-xs font-bold uppercase tracking-wider">Properties</span>
                            <span className="bg-[#2a2a35] text-slate-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/5">
                                {ownedProperties.length}
                            </span>
                        </div>
                        {isExpanded ? <IoChevronUp /> : <IoChevronDown />}
                    </button>

                    <div className={`
                        overflow-hidden transition-all duration-300 ease-in-out
                        ${isExpanded && ownedProperties.length > 0 ? 'opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}
                    `}>
                        <div className="flex flex-col gap-1.5 pr-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {ownedProperties.map((prop) => {
                                const propColor = (prop.color ? COLOR_NAMES[prop.color] : null) || prop.color || '#64748b';
                                return (
                                    <button
                                        key={prop.id}
                                        onClick={() => onPropertyClick?.(prop)}
                                        className="relative group/prop w-full text-left rounded-lg bg-[#141416] border border-white/5 hover:border-white/10 overflow-hidden transition-all"
                                    >
                                        <div className="flex items-stretch h-10">
                                            {/* Color Band */}
                                            <div
                                                className="w-1.5 h-full opacity-80 group-hover/prop:opacity-100 transition-opacity"
                                                style={{ backgroundColor: propColor, boxShadow: `0 0 10px ${propColor}40` }}
                                            />

                                            {/* Content */}
                                            <div className="flex-1 flex flex-col justify-center px-3 py-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-300 group-hover/prop:text-white truncate max-w-[120px]">
                                                        {prop.name || prop.id?.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-slate-500">
                                                        ₹{prop.rent}
                                                    </span>
                                                </div>

                                                {/* Buildings Indicator */}
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    {(prop.houses ?? 0) > 0 ? (
                                                        <div className={`
                                                            flex items-center gap-1 px-1.5 rounded-[3px]
                                                            ${prop.houses === 5 ? 'bg-red-900/20 text-red-400 ring-1 ring-red-900/40' : 'bg-green-900/20 text-green-400 ring-1 ring-green-900/40'}
                                                        `}>
                                                            {prop.houses === 5 ? <FaHotel className="text-[8px]" /> : <GiHouse className="text-[8px]" />}
                                                            <span className="text-[9px] font-bold leading-none py-0.5">{prop.houses === 5 ? 'Hotel' : prop.houses}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] text-slate-600">No buildings</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
