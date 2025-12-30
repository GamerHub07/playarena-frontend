'use client';

import { useState, useCallback } from 'react';
import { LudoGameState } from '@/types/ludo';
import { Player } from '@/types/game';
import {
    COLORS,
    PLAYER_COLOR_MAP,
    MAIN_TRACK,
    HOME_STRETCH,
    SAFE_TRACK_INDICES,
    getTokenGridPosition,
    ColorKey,
} from '@/lib/ludoBoardLayout';

interface BoardProps {
    gameState: LudoGameState;
    players: Player[];
    currentSessionId: string;
    onTokenClick: (tokenIndex: number) => void;
    selectableTokens: number[];
}

export default function Board({
    gameState,
    players,
    currentSessionId,
    onTokenClick,
    selectableTokens,
}: BoardProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const currentPlayerIndex = players.findIndex(p => p.sessionId === currentSessionId);
    const isMyTurn = gameState.currentPlayer === currentPlayerIndex;
    const currentTurnColor = PLAYER_COLOR_MAP[gameState.currentPlayer];

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    }, []);

    // Get home tokens for a player
    const getHomeTokens = (playerIndex: number) => {
        const playerState = gameState.players[playerIndex];
        if (!playerState) return [];
        return playerState.tokens
            .map((token, idx) => ({ token, idx }))
            .filter(({ token }) => token.zone === 'home');
    };

    // Get tokens on board
    const getTokensAtPosition = (row: number, col: number) => {
        const tokens: Array<{ playerIndex: number; tokenIndex: number; color: ColorKey; selectable: boolean }> = [];
        Object.entries(gameState.players).forEach(([idx, playerState]) => {
            const playerIndex = parseInt(idx);
            const color = PLAYER_COLOR_MAP[playerIndex];
            if (!color) return;
            playerState.tokens.forEach((token, tokenIdx) => {
                if (token.zone === 'home') return;
                const pos = getTokenGridPosition(playerIndex, token.zone, token.index, tokenIdx);
                if (pos && pos.row === row && pos.col === col) {
                    tokens.push({
                        playerIndex,
                        tokenIndex: tokenIdx,
                        color,
                        selectable: isMyTurn && playerIndex === currentPlayerIndex && selectableTokens.includes(tokenIdx),
                    });
                }
            });
        });
        return tokens;
    };

    // Home base
    const HomeBase = ({ color, playerIndex }: { color: ColorKey; playerIndex: number }) => {
        const colorInfo = COLORS[color];
        const homeTokens = getHomeTokens(playerIndex);
        const player = players[playerIndex];
        const isCurrentTurn = playerIndex === gameState.currentPlayer;
        // console.log('turnPhase in click:', gameState?.turnPhase);

        return (
            <div
                className={`w-full h-full rounded-xl p-2 flex flex-col transition-all ${isCurrentTurn ? 'ring-2 ring-white shadow-xl scale-[1.02]' : ''}`}
                style={{ backgroundColor: colorInfo.bg, boxShadow: isCurrentTurn ? `0 0 20px ${colorInfo.bg}80` : 'none' }}
            >
                <p className="text-white font-bold text-xs text-center truncate mb-1">{player?.username || `P${playerIndex + 1}`}</p>
                <div className="flex-1 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-2 p-2 rounded-lg" style={{ backgroundColor: colorInfo.light }}>
                        {[0, 1, 2, 3].map(slotIdx => {
                            const tokenData = homeTokens.find(t => t.idx === slotIdx);
                            const isSelectable = tokenData && isMyTurn && playerIndex === currentPlayerIndex && selectableTokens.includes(tokenData.idx);
                            return (
                                <div key={slotIdx} className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-white pointer-events-none" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                                    {tokenData && (
                                        <button
                                            onClick={() => isSelectable && onTokenClick(tokenData.idx)}
                                            disabled={!isSelectable}
                                            className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white transition-all ${isSelectable ? 'animate-bounce cursor-pointer ring-2 ring-yellow-400 pointer-events-auto' : ''}`}
                                            style={{ backgroundColor: colorInfo.bg, boxShadow: isSelectable ? `0 0 10px ${colorInfo.bg}` : '0 2px 4px rgba(0,0,0,0.3)' }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <p className="text-white/80 text-xs text-center">{gameState.players[playerIndex]?.finishedTokens || 0}/4</p>
            </div>
        );
    };

    // Track cell
    const TrackCell = ({ row, col }: { row: number; col: number }) => {
        const trackIndex = MAIN_TRACK.findIndex(([r, c]) => r === row && c === col);
        const tokens = getTokensAtPosition(row, col);

        let homeStretchColor: ColorKey | null = null;
        for (const [colorKey, cells] of Object.entries(HOME_STRETCH)) {
            if (cells.some(([r, c]) => r === row && c === col)) {
                homeStretchColor = colorKey as ColorKey;
                break;
            }
        }

        let bgColor = '#ffffff';
        let isSafe = false;
        let isStart = false;
        let startColor: ColorKey | null = null;

        if (homeStretchColor) {
            bgColor = COLORS[homeStretchColor].bg;
        } else if (trackIndex !== -1) {
            isSafe = SAFE_TRACK_INDICES.includes(trackIndex);
            if (trackIndex === 0) { isStart = true; startColor = 'RED'; }
            else if (trackIndex === 13) { isStart = true; startColor = 'GREEN'; }
            else if (trackIndex === 26) { isStart = true; startColor = 'YELLOW'; }
            else if (trackIndex === 39) { isStart = true; startColor = 'BLUE'; }
            if (startColor) bgColor = COLORS[startColor].bg;
        }

        return (
            <div className="w-full h-full flex items-center justify-center relative rounded-sm" style={{ backgroundColor: bgColor, border: '1px solid #d0d0d0' }}>
                {isSafe && !isStart && <span className="text-amber-500 text-sm font-bold absolute z-0 pointer-events-none">★</span>}
                {isStart && <span className="text-white text-sm font-bold absolute z-0 pointer-events-none">→</span>}
                {tokens.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        {tokens.length === 1 ? (
                            <Token color={tokens[0].color} selectable={tokens[0].selectable} onClick={() => tokens[0].selectable && onTokenClick(tokens[0].tokenIndex)} />
                        ) : (
                            <div className="flex flex-wrap gap-0.5 justify-center">
                                {tokens.map((t, i) => <Token key={i} color={t.color} selectable={t.selectable} onClick={() => t.selectable && onTokenClick(t.tokenIndex)} small />)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Center
    const CenterArea = () => (
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 p-1 bg-[#2a2a2a] rounded-lg">
            <div /><div className="bg-[#43A047] rounded-sm" /><div />
            <div className="bg-[#E53935] rounded-sm" />
            <div className="bg-[#1a1a1a] rounded-full flex items-center justify-center"><span className="text-white text-base">🏠</span></div>
            <div className="bg-[#FDD835] rounded-sm" />
            <div /><div className="bg-[#1E88E5] rounded-sm" /><div />
        </div>
    );

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Turn Status */}
            <div className="w-full flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ backgroundColor: currentTurnColor ? COLORS[currentTurnColor].bg : '#1a1a1a' }}>
                    <div className={`w-5 h-5 rounded-full border-2 border-white ${isMyTurn ? 'animate-pulse' : ''}`} style={{ backgroundColor: currentTurnColor ? COLORS[currentTurnColor].bg : '#888' }} />
                    <span className="text-white font-bold text-sm">{isMyTurn ? 'Your Turn!' : `${players[gameState.currentPlayer]?.username}'s Turn`}</span>
                    <span className="text-white/70 text-xs">{gameState.turnPhase === 'roll' ? '🎲 Roll' : '👆 Move'}</span>
                </div>
                <button
                    onClick={toggleFullscreen}
                    className="px-3 py-2 rounded-lg bg-[#2a2a2a] text-white text-sm flex items-center gap-2 hover:bg-[#3a3a3a] transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    {isFullscreen ? 'Exit' : 'Fullscreen'}
                </button>
            </div>

            {/* Board */}
            <div className="rounded-2xl overflow-hidden shadow-2xl p-3" style={{ background: 'linear-gradient(145deg, #3d3d3d 0%, #1a1a1a 100%)' }}>
                <div
                    className="grid rounded-xl overflow-hidden bg-[#2a2a2a]"
                    style={{
                        gridTemplateAreas: `"home-red path-top home-green" "path-left center path-right" "home-yellow path-bottom home-blue"`,
                        gridTemplateColumns: '1fr 160px 1fr',
                        gridTemplateRows: '1fr 160px 1fr',
                        width: 'min(90vw, 600px)',
                        height: 'min(90vw, 600px)',
                        gap: '3px',
                    }}
                >
                    <div style={{ gridArea: 'home-red' }}><HomeBase color="RED" playerIndex={0} /></div>
                    <div style={{ gridArea: 'home-green' }}><HomeBase color="GREEN" playerIndex={1} /></div>
                    <div style={{ gridArea: 'home-yellow' }}><HomeBase color="YELLOW" playerIndex={2} /></div>
                    <div style={{ gridArea: 'home-blue' }}><HomeBase color="BLUE" playerIndex={3} /></div>
                    <div style={{ gridArea: 'path-top' }} className="grid grid-cols-3 gap-0.5 p-1">{[0, 1, 2, 3, 4, 5].flatMap(row => [6, 7, 8].map(col => <TrackCell key={`${row}-${col}`} row={row} col={col} />))}</div>
                    <div style={{ gridArea: 'path-left' }} className="grid grid-rows-3 grid-cols-6 gap-0.5 p-1">{[6, 7, 8].flatMap(row => [0, 1, 2, 3, 4, 5].map(col => <TrackCell key={`${row}-${col}`} row={row} col={col} />))}</div>
                    <div style={{ gridArea: 'center' }}><CenterArea /></div>
                    <div style={{ gridArea: 'path-right' }} className="grid grid-rows-3 grid-cols-6 gap-0.5 p-1">{[6, 7, 8].flatMap(row => [9, 10, 11, 12, 13, 14].map(col => <TrackCell key={`${row}-${col}`} row={row} col={col} />))}</div>
                    <div style={{ gridArea: 'path-bottom' }} className="grid grid-cols-3 gap-0.5 p-1">{[9, 10, 11, 12, 13, 14].flatMap(row => [6, 7, 8].map(col => <TrackCell key={`${row}-${col}`} row={row} col={col} />))}</div>
                </div>
            </div>
        </div>
    );
}

function Token({ color, selectable, onClick, small = false }: { color: ColorKey; selectable: boolean; onClick: () => void; small?: boolean }) {
    const colorInfo = COLORS[color];
    const size = small ? 'w-4 h-4' : 'w-7 h-7';
    return (
        <button
            onClick={onClick}
            disabled={!selectable}
            className={`${size} rounded-full transition-all ${selectable ? 'cursor-pointer animate-bounce ring-2 ring-yellow-400 z-20' : ''}`}
            style={{ backgroundColor: colorInfo.bg, border: '2px solid #ffffff', boxShadow: selectable ? `0 0 12px ${colorInfo.bg}` : '0 2px 4px rgba(0,0,0,0.3)' }}
        />
    );
}
