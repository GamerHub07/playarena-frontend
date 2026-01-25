'use client';

import React, { useState } from 'react';
import { MonopolyGameState, BoardSquare, PROPERTY_COLORS } from '@/types/monopoly';
import { Player } from '@/types/game';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IoClose } from 'react-icons/io5';

/* ---------------- Improved Property Card ---------------- */
function PropertyCardSelectable({
    property,
    selected,
    onToggle,
}: {
    property: BoardSquare;
    selected?: boolean;
    onToggle?: () => void;
}) {
    const color = property.color
        ? PROPERTY_COLORS[property.color] || '#888'
        : '#888';

    return (
        <div
            onClick={onToggle}
            className={`
        relative group cursor-pointer transition-all duration-200
        rounded-lg border overflow-hidden
        ${selected
                    ? 'border-yellow-400 bg-yellow-900/20 ring-1 ring-yellow-400/50 transform scale-[1.02]'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-500 hover:bg-slate-700'
                }
      `}
        >
            {/* Color Header */}
            <div className="h-3 w-full" style={{ backgroundColor: color }} />

            <div className="p-3">
                <h4 className="text-white font-bold text-sm mb-1 leading-tight">
                    {property.name}
                </h4>
                <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Price: <span className="text-slate-200">₹{property.price}</span></span>
                    {selected && (
                        <span className="bg-yellow-500 text-black text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                            Selected
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ---------------- Trade Modal ---------------- */
export default function TradeModal({
    gameState,
    players,
    mySessionId,
    onClose,
    onProposeTrade,
    onAcceptTrade,
    onRejectTrade,
    onCancelTrade,
}: {
    gameState: MonopolyGameState;
    players: Player[];
    mySessionId: string;
    onClose: () => void;
    onProposeTrade: (data: any) => void;
    onAcceptTrade: (tradeId: string) => void;
    onRejectTrade: (tradeId: string) => void;
    onCancelTrade: (tradeId: string) => void;
}) {
    const [tab, setTab] = useState<'create' | 'pending'>('create');
    const [targetPlayer, setTargetPlayer] = useState('');
    const [offeringProperties, setOfferingProperties] = useState<string[]>([]);
    const [requestingProperties, setRequestingProperties] = useState<string[]>([]);
    const [offeringCash, setOfferingCash] = useState(0);
    const [requestingCash, setRequestingCash] = useState(0);

    const myState = gameState.playerState[mySessionId];

    const myProps = gameState.board.filter(
        s => s.owner === mySessionId && (s.houses ?? 0) === 0
    );

    const targetProps = targetPlayer
        ? gameState.board.filter(
            s => s.owner === targetPlayer && (s.houses ?? 0) === 0
        )
        : [];

    const pendingTrades =
        gameState.pendingTrades?.filter(
            t =>
                t.status === 'pending' &&
                (t.fromPlayerId === mySessionId ||
                    t.toPlayerId === mySessionId)
        ) || [];

    const toggle = (id: string, type: 'offer' | 'request') => {
        const setter =
            type === 'offer'
                ? setOfferingProperties
                : setRequestingProperties;

        setter(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const submitTrade = () => {
        if (!targetPlayer) return;
        onProposeTrade({
            toPlayerId: targetPlayer,
            offeringProperties,
            offeringCash,
            requestingProperties,
            requestingCash,
        });
        setOfferingProperties([]);
        setRequestingProperties([]);
        setOfferingCash(0);
        setRequestingCash(0);
        setTab('pending');
    };

    const playerName = (id: string) =>
        players.find(p => p.sessionId === id)?.username || 'Player';

    const getPropName = (id: string) =>
        gameState.board.find(s => s.id === id)?.name || id;

    const getPropColor = (id: string) => {
        const p = gameState.board.find(s => s.id === id);
        return p?.color ? PROPERTY_COLORS[p.color] : '#888';
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div onClick={e => e.stopPropagation()} className="w-full max-w-5xl">
                <Card className="w-full max-h-[90vh] overflow-hidden bg-[#1a1a1a] border-slate-700 shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-slate-700 bg-[#222]">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                🤝 Trade Center
                            </h2>

                            <div className="flex bg-[#111] rounded-lg p-1 border border-slate-700">
                                <button
                                    onClick={() => setTab('create')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'create'
                                            ? 'bg-yellow-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                >
                                    Create Trade
                                </button>
                                <button
                                    onClick={() => setTab('pending')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all relative ${tab === 'pending'
                                            ? 'bg-yellow-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                >
                                    Pending Trades
                                    {pendingTrades.length > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                                            {pendingTrades.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                        >
                            <IoClose className="text-xl" />
                        </button>
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 overflow-hidden relative">
                        {tab === 'create' && (
                            <div className="h-full flex flex-col">
                                {/* Player Selector Bar */}
                                <div className="p-4 border-b border-slate-700 bg-[#222] flex items-center justify-center gap-3">
                                    <label className="text-slate-400 text-sm">Trade with:</label>
                                    <select
                                        value={targetPlayer}
                                        onChange={e => {
                                            setTargetPlayer(e.target.value);
                                            setRequestingProperties([]);
                                        }}
                                        className="bg-[#333] border border-slate-600 rounded-md px-3 py-2 text-white min-w-[200px] focus:ring-2 focus:ring-yellow-500 outline-none"
                                    >
                                        <option value="">Select a Player...</option>
                                        {players
                                            .filter(
                                                p =>
                                                    p.sessionId !== mySessionId &&
                                                    !gameState.playerState[p.sessionId]?.bankrupt
                                            )
                                            .map(p => (
                                                <option key={p.sessionId} value={p.sessionId}>
                                                    {p.username} (₹{gameState.playerState[p.sessionId]?.cash})
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {targetPlayer ? (
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                                            {/* MY OFFER */}
                                            <div className="flex flex-col gap-4 bg-[#222] p-5 rounded-xl border border-slate-700">
                                                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                                                    <h3 className="text-green-400 font-bold text-lg flex items-center gap-2">
                                                        📤 You Offer
                                                    </h3>
                                                    <div className="text-xs text-slate-400">
                                                        Your Balance: <span className="text-white font-mono">₹{myState?.cash || 0}</span>
                                                    </div>
                                                </div>

                                                {/* Cash Input */}
                                                <div className="bg-[#111] p-3 rounded-lg border border-slate-700">
                                                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Add Cash</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-500 font-bold">₹</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={myState?.cash || 0}
                                                            value={offeringCash}
                                                            onChange={e => setOfferingCash(Math.min(Number(e.target.value), myState?.cash || 0))}
                                                            className="bg-transparent text-white font-mono text-lg w-full outline-none placeholder-slate-700"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Properties */}
                                                <div className="flex-1">
                                                    <label className="text-xs text-slate-500 uppercase font-bold mb-3 block">Your Properties</label>
                                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {myProps.length === 0 ? (
                                                            <p className="col-span-full text-center text-slate-600 py-8 italic text-sm">
                                                                No tradeable properties available
                                                            </p>
                                                        ) : (
                                                            myProps.map(p => (
                                                                <PropertyCardSelectable
                                                                    key={p.id}
                                                                    property={p}
                                                                    selected={offeringProperties.includes(p.id)}
                                                                    onToggle={() => toggle(p.id, 'offer')}
                                                                />
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* THEIR OFFER */}
                                            <div className="flex flex-col gap-4 bg-[#222] p-5 rounded-xl border border-slate-700">
                                                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                                                    <h3 className="text-amber-600 font-bold text-lg flex items-center gap-2">
                                                        📥 You Receive
                                                    </h3>
                                                    <div className="text-xs text-slate-400">
                                                        Their Balance: <span className="text-white font-mono">₹{gameState.playerState[targetPlayer]?.cash || 0}</span>
                                                    </div>
                                                </div>

                                                {/* Cash Input */}
                                                <div className="bg-[#111] p-3 rounded-lg border border-slate-700">
                                                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Request Cash</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-blue-500 font-bold">₹</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={gameState.playerState[targetPlayer]?.cash || 0}
                                                            value={requestingCash}
                                                            onChange={e => setRequestingCash(Math.min(Number(e.target.value), gameState.playerState[targetPlayer]?.cash || 0))}
                                                            className="bg-transparent text-white font-mono text-lg w-full outline-none placeholder-slate-700"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Properties */}
                                                <div className="flex-1">
                                                    <label className="text-xs text-slate-500 uppercase font-bold mb-3 block">Their Properties</label>
                                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {targetProps.length === 0 ? (
                                                            <p className="col-span-full text-center text-slate-600 py-8 italic text-sm">
                                                                No tradeable properties available
                                                            </p>
                                                        ) : (
                                                            targetProps.map(p => (
                                                                <PropertyCardSelectable
                                                                    key={p.id}
                                                                    property={p}
                                                                    selected={requestingProperties.includes(p.id)}
                                                                    onToggle={() => toggle(p.id, 'request')}
                                                                />
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#151515]">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-3xl">👋</div>
                                        <p className="text-lg font-medium">Select a player above to start trading</p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="p-4 bg-[#222] border-t border-slate-700 flex justify-end">
                                    <Button
                                        onClick={submitTrade}
                                        disabled={
                                            !targetPlayer ||
                                            (!offeringCash &&
                                                !requestingCash &&
                                                offeringProperties.length === 0 &&
                                                requestingProperties.length === 0)
                                        }
                                        className={`font-bold py-3 px-8 text-lg shadow-lg transition-all ${targetPlayer
                                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-900/20'
                                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {!targetPlayer ? 'Select Player to Trade' : '🚀 Propose Trade'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* PENDING */}
                        {tab === 'pending' && (
                            <div className="h-full overflow-y-auto p-6 bg-[#151515]">
                                {pendingTrades.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-3xl">📭</div>
                                        <p>No pending trades found</p>
                                    </div>
                                ) : (
                                    <div className="max-w-3xl mx-auto space-y-4">
                                        {pendingTrades.map(trade => {
                                            const incoming = trade.toPlayerId === mySessionId;
                                            const other = incoming ? trade.fromPlayerId : trade.toPlayerId;
                                            return (
                                                <div key={trade.id} className="bg-[#222] border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                                                    <div className={`h-1 w-full ${incoming ? 'bg-yellow-500' : 'bg-slate-500'}`} />
                                                    <div className="p-5">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${incoming ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-500/20 text-slate-400'}`}>
                                                                        {incoming ? 'Incoming Request' : 'Outgoing Offer'}
                                                                    </span>
                                                                    <span className="text-slate-500 text-xs">• {new Date(trade.createdAt).toLocaleTimeString()}</span>
                                                                </div>
                                                                <h3 className="text-white text-lg font-bold">
                                                                    {incoming ? `Trade with ${playerName(other)}` : `Trade with ${playerName(other)}`}
                                                                </h3>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                                                            {/* Left Side */}
                                                            <div className="flex-1 bg-[#1a1a1a] rounded p-3 border border-slate-700/50">
                                                                <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                                                                    {incoming ? 'They Offer' : 'You Give'}
                                                                </p>
                                                                {trade.offeringCash > 0 && (
                                                                    <div className="inline-block px-2 py-1 bg-green-900/20 text-green-400 text-sm font-bold rounded mb-2 border border-green-900/30">
                                                                        + ₹{trade.offeringCash} Cash
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-wrap gap-2">
                                                                    {trade.offeringProperties.length > 0 ? trade.offeringProperties.map(pid => (
                                                                        <div key={pid} className="flex items-center gap-1.5 bg-[#2a2a2a] pl-1 pr-2 py-1 rounded border border-slate-700 text-xs text-slate-300">
                                                                            <div className="w-2 h-2 rounded-full" style={{ background: getPropColor(pid) }} />
                                                                            {getPropName(pid)}
                                                                        </div>
                                                                    )) : (
                                                                        !trade.offeringCash && <span className="text-slate-600 text-xs italic">No properties</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-center text-slate-600">
                                                                <span className="text-2xl">⇄</span>
                                                            </div>

                                                            {/* Right Side */}
                                                            <div className="flex-1 bg-[#1a1a1a] rounded p-3 border border-slate-700/50">
                                                                <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                                                                    {incoming ? 'You Give' : 'They Receive'}
                                                                </p>
                                                                {trade.requestingCash > 0 && (
                                                                    <div className="inline-block px-2 py-1 bg-amber-900/20 text-amber-600 text-sm font-bold rounded mb-2 border border-amber-900/30">
                                                                        + ₹{trade.requestingCash} Cash
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-wrap gap-2">
                                                                    {trade.requestingProperties.length > 0 ? trade.requestingProperties.map(pid => (
                                                                        <div key={pid} className="flex items-center gap-1.5 bg-[#2a2a2a] pl-1 pr-2 py-1 rounded border border-slate-700 text-xs text-slate-300">
                                                                            <div className="w-2 h-2 rounded-full" style={{ background: getPropColor(pid) }} />
                                                                            {getPropName(pid)}
                                                                        </div>
                                                                    )) : (
                                                                        !trade.requestingCash && <span className="text-slate-600 text-xs italic">No properties</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-3">
                                                            {incoming ? (
                                                                <>
                                                                    <Button onClick={() => onAcceptTrade(trade.id)} className="flex-1 bg-green-600 hover:bg-green-700 py-2.5">Accept Deal</Button>
                                                                    <Button onClick={() => onRejectTrade(trade.id)} className="flex-1 bg-red-600 hover:bg-red-700 py-2.5">Reject</Button>
                                                                </>
                                                            ) : (
                                                                <Button onClick={() => onCancelTrade(trade.id)} className="w-full bg-slate-700 hover:bg-slate-600 py-2.5">Cancel Offer</Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
