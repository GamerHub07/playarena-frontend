'use client';

import { useState, useCallback } from 'react';
import { LudoGameState } from '@/types/ludo';
import { Player } from '@/types/game';
import {
    PLAYER_COLOR_MAP,
    MAIN_TRACK,
    HOME_STRETCH,
    SAFE_TRACK_INDICES,
    getTokenGridPosition,
    ColorKey,
} from '@/lib/ludoBoardLayout';
import { useLudoTheme } from '@/contexts/LudoThemeContext';
import LudoPawn from './LudoPawn';

interface BoardProps {
    gameState: LudoGameState;
    players: Player[];
    currentSessionId: string;
    onTokenClick: (tokenIndex: number) => void;
    selectableTokens: number[];
    getAnimatedTokenPosition?: (playerIndex: number, tokenIndex: number) => { row: number; col: number } | null;
    isAnimating?: boolean;
}

export default function Board({
    gameState,
    players,
    currentSessionId,
    onTokenClick,
    selectableTokens,
    getAnimatedTokenPosition,
    isAnimating = false,
}: BoardProps) {
    const { theme } = useLudoTheme();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const currentPlayerIndex = players.findIndex(p => p.sessionId === currentSessionId);
    const isMyTurn = gameState.currentPlayer === currentPlayerIndex;
    const currentTurnColor = PLAYER_COLOR_MAP[gameState.currentPlayer];

    // Get colors from theme based on color key
    const getThemeColor = (colorKey: ColorKey) => {
        const colorMap: Record<ColorKey, keyof typeof theme.playerColors> = {
            'RED': 'red',
            'GREEN': 'green',
            'YELLOW': 'yellow',
            'BLUE': 'blue',
        };
        return theme.playerColors[colorMap[colorKey]];
    };

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

    // Get tokens on board - uses animated positions when available
    const getTokensAtPosition = (row: number, col: number) => {
        const tokens: Array<{ playerIndex: number; tokenIndex: number; color: ColorKey; selectable: boolean }> = [];
        Object.entries(gameState.players).forEach(([idx, playerState]) => {
            const playerIndex = parseInt(idx);
            const color = PLAYER_COLOR_MAP[playerIndex];
            if (!color) return;
            playerState.tokens.forEach((token, tokenIdx) => {
                if (token.zone === 'home') return;

                // Check for animated position first
                let pos: { row: number; col: number } | null = null;
                if (getAnimatedTokenPosition) {
                    const animPos = getAnimatedTokenPosition(playerIndex, tokenIdx);
                    if (animPos) {
                        pos = animPos;
                    }
                }

                // Fall back to game state position
                if (!pos) {
                    pos = getTokenGridPosition(playerIndex, token.zone, token.index, tokenIdx);
                }

                if (pos && pos.row === row && pos.col === col) {
                    tokens.push({
                        playerIndex,
                        tokenIndex: tokenIdx,
                        color,
                        // Disable selection during animation
                        selectable: !isAnimating && isMyTurn && playerIndex === currentPlayerIndex && selectableTokens.includes(tokenIdx),
                    });
                }
            });
        });
        return tokens;
    };

    // Home base with theme-based styling
    const HomeBase = ({ color, playerIndex }: { color: ColorKey; playerIndex: number }) => {
        const colorInfo = getThemeColor(color);
        const homeTokens = getHomeTokens(playerIndex);
        const player = players[playerIndex];
        const isCurrentTurn = playerIndex === gameState.currentPlayer;

        return (
            <div
                className={`w-full h-full rounded-lg p-2 flex flex-col transition-all relative overflow-hidden`}
                style={{
                    backgroundColor: colorInfo.bg,
                    boxShadow: isCurrentTurn
                        ? `0 0 0 2px ${theme.ui.accentColor}, 0 0 25px ${colorInfo.bg}80, inset 0 2px 4px rgba(255,255,255,0.15)`
                        : 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.2)',
                    border: `3px solid ${theme.board.cellBorder}`,
                }}
            >
                {/* Texture overlay for wood-themed boards */}
                {theme.effects.useWoodTexture && (
                    <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                )}

                {/* Player name */}
                <p
                    className="font-bold text-xs text-center truncate mb-1 drop-shadow-md"
                    style={{
                        color: theme.ui.textPrimary,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        fontFamily: theme.effects.fontFamily,
                    }}
                >
                    {player?.username || `P${playerIndex + 1}`}
                </p>

                {/* Token slots */}
                <div className="flex-1 flex items-center justify-center">
                    <div
                        className="grid grid-cols-2 gap-2 p-2 rounded-md"
                        style={{
                            backgroundColor: colorInfo.light,
                            border: `2px solid ${theme.board.cellBorder}`,
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
                        }}
                    >
                        {[0, 1, 2, 3].map(slotIdx => {
                            const tokenData = homeTokens.find(t => t.idx === slotIdx);
                            const isSelectable = !!(
                                tokenData &&
                                isMyTurn &&
                                playerIndex === currentPlayerIndex &&
                                gameState.turnPhase === 'move' &&
                                selectableTokens.includes(tokenData.idx)
                            );

                            return (
                                <div
                                    key={slotIdx}
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center pointer-events-none"
                                    style={{
                                        backgroundColor: theme.board.cellBackground,
                                        boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.2), 0 1px 2px rgba(255,255,255,0.3)',
                                        border: `2px solid ${theme.board.cellBorder}`,
                                    }}
                                >
                                    {tokenData && (
                                        <Token
                                            color={color}
                                            selectable={isSelectable}
                                            onClick={() => {
                                                if (isSelectable) {
                                                    onTokenClick(tokenData.idx);
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Finished count */}
                <p
                    className="text-xs text-center"
                    style={{
                        color: theme.ui.textPrimary,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        fontFamily: theme.effects.fontFamily,
                    }}
                >
                    {gameState.players[playerIndex]?.finishedTokens || 0}/4 {theme.decorations.safeIndicator}
                </p>
            </div>
        );
    };

    // Track cell with theme-based styling
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

        let bgColor = theme.board.cellBackground;
        let isSafe = false;
        let isStart = false;
        let startColor: ColorKey | null = null;

        if (homeStretchColor) {
            bgColor = getThemeColor(homeStretchColor).bg;
        } else if (trackIndex !== -1) {
            isSafe = SAFE_TRACK_INDICES.includes(trackIndex);
            if (trackIndex === 0) { isStart = true; startColor = 'RED'; }
            else if (trackIndex === 13) { isStart = true; startColor = 'GREEN'; }
            else if (trackIndex === 26) { isStart = true; startColor = 'YELLOW'; }
            else if (trackIndex === 39) { isStart = true; startColor = 'BLUE'; }
            if (startColor) bgColor = getThemeColor(startColor).bg;
        }

        return (
            <div
                className="w-full h-full flex items-center justify-center relative rounded-sm"
                style={{
                    backgroundColor: bgColor,
                    border: `1px solid ${theme.board.cellBorder}`,
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                }}
            >
                {/* Safe star */}
                {isSafe && !isStart && (
                    <span
                        className="text-sm font-bold absolute z-0 pointer-events-none"
                        style={{
                            color: theme.board.safeStarColor,
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        }}
                    >
                        {theme.decorations.safeIndicator}
                    </span>
                )}
                {/* Arrow for start cells */}
                {isStart && (
                    <span
                        className="text-sm font-bold absolute z-0 pointer-events-none"
                        style={{
                            color: theme.ui.textPrimary,
                            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                        }}
                    >
                        {theme.decorations.startIndicator}
                    </span>
                )}
                {tokens.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 overflow-hidden p-0.5">
                        {tokens.length === 1 ? (
                            <Token
                                color={tokens[0].color}
                                selectable={tokens[0].selectable}
                                onClick={() => {
                                    console.log('Token clicked', tokens[0].tokenIndex);
                                    tokens[0].selectable && onTokenClick(tokens[0].tokenIndex);
                                }}
                                size="normal"
                            />
                        ) : (
                            <div
                                className={`
                                    grid gap-0.5 w-full h-full place-items-center
                                    ${tokens.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'}
                                `}
                            >
                                {tokens.slice(0, 4).map((t, i) => (
                                    <Token
                                        key={i}
                                        color={t.color}
                                        selectable={t.selectable}
                                        onClick={() => {
                                            console.log('Token clicked', t.tokenIndex);
                                            t.selectable && onTokenClick(t.tokenIndex);
                                        }}
                                        size={tokens.length === 2 ? 'medium' : 'small'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Get finished tokens for a player
    const getFinishedTokens = (playerIndex: number) => {
        const playerState = gameState.players[playerIndex];
        if (!playerState) return [];
        return playerState.tokens
            .map((token, idx) => ({ token, idx }))
            .filter(({ token }) => token.zone === 'finish');
    };

    // Center area with theme-based styling
    const CenterArea = () => {
        const renderFinished = (playerIndex: number) => {
            const tokens = getFinishedTokens(playerIndex);
            const color = PLAYER_COLOR_MAP[playerIndex];
            if (!color || tokens.length === 0) return null;

            return (
                <div className="grid grid-cols-2 gap-0.5 justify-items-center items-center">
                    {tokens.map((t, i) => (
                        <Token
                            key={i}
                            color={color}
                            selectable={false}
                            onClick={() => { }}
                            size="small"
                        />
                    ))}
                </div>
            );
        };

        return (
            <div
                className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 p-1 rounded-lg"
                style={{
                    backgroundColor: theme.board.centerBackground,
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }}
            >
                <div />
                <div
                    className="rounded-sm flex items-center justify-center overflow-hidden relative"
                    style={{ backgroundColor: getThemeColor('GREEN').bg }}
                >
                    {renderFinished(1)}
                </div>
                <div />

                <div
                    className="rounded-sm flex items-center justify-center overflow-hidden relative"
                    style={{ backgroundColor: getThemeColor('RED').bg }}
                >
                    {renderFinished(0)}
                </div>
                <div
                    className="rounded-full flex items-center justify-center relative z-10"
                    style={{
                        background: theme.board.centerAccent,
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.4)',
                        border: theme.effects.useGoldAccents ? `2px solid ${theme.ui.accentColor}` : '2px solid rgba(255,255,255,0.2)',
                    }}
                >
                    <span className="text-base" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>{theme.decorations.centerEmoji}</span>
                </div>
                <div
                    className="rounded-sm flex items-center justify-center overflow-hidden relative"
                    style={{ backgroundColor: getThemeColor('YELLOW').bg }}
                >
                    {renderFinished(2)}
                </div>

                <div />
                <div
                    className="rounded-sm flex items-center justify-center overflow-hidden relative"
                    style={{ backgroundColor: getThemeColor('BLUE').bg }}
                >
                    {renderFinished(3)}
                </div>
                <div />
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Turn Status */}
            <div className="w-full flex items-center justify-between gap-4 flex-wrap">
                <div
                    className="flex items-center gap-3 px-4 py-2 rounded-lg"
                    style={{
                        backgroundColor: currentTurnColor ? getThemeColor(currentTurnColor).bg : theme.ui.cardBackground,
                        border: `2px solid ${theme.ui.accentColor}50`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                >
                    <div
                        className={`w-5 h-5 rounded-full border-2 ${isMyTurn ? 'animate-pulse' : ''}`}
                        style={{
                            backgroundColor: currentTurnColor ? getThemeColor(currentTurnColor).bg : '#888',
                            borderColor: theme.ui.accentColor,
                        }}
                    />
                    <span
                        className="font-bold text-sm"
                        style={{
                            color: theme.ui.textPrimary,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                            fontFamily: theme.effects.fontFamily,
                        }}
                    >
                        {isMyTurn ? 'Your Turn!' : `${players[gameState.currentPlayer]?.username}'s Turn`}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: theme.ui.textSecondary }}
                    >
                        {gameState.turnPhase === 'roll' ? '🎲 Roll' : '👆 Move'}
                    </span>
                </div>
                <button
                    onClick={toggleFullscreen}
                    className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                    style={{
                        backgroundColor: theme.ui.cardBackground,
                        color: theme.ui.textPrimary,
                        border: `2px solid ${theme.ui.cardBorder}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    {isFullscreen ? 'Exit' : 'Fullscreen'}
                </button>
            </div>

            {/* Board with theme frame */}
            <div
                className="rounded-xl overflow-hidden p-4 relative"
                style={{
                    background: theme.board.boardFrame,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
                    border: `4px solid ${theme.board.boardFrameBorder}`,
                }}
            >
                {/* Wood grain texture overlay */}
                {theme.effects.useWoodTexture && (
                    <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M0 50c25-5 50 5 75-5s50 15 25 5' stroke='%23000' stroke-opacity='0.1' fill='none'/%3E%3Cpath d='M0 30c30-10 40 10 70 0s60 10 30 0' stroke='%23000' stroke-opacity='0.08' fill='none'/%3E%3Cpath d='M0 70c20 5 45-10 65 5s55-5 35 0' stroke='%23000' stroke-opacity='0.12' fill='none'/%3E%3Cpath d='M0 15c35-8 45 12 80-3' stroke='%23000' stroke-opacity='0.06' fill='none'/%3E%3Cpath d='M0 85c25 8 55-6 100 4' stroke='%23000' stroke-opacity='0.09' fill='none'/%3E%3C/svg%3E")`,
                            backgroundSize: '100px 100px',
                        }}
                    />
                )}

                {/* Decorative corner ornaments */}
                {theme.decorations.cornerSymbols && (
                    <>
                        <div className="absolute top-2 left-2 text-xl" style={{ color: theme.ui.accentColor, opacity: 0.5 }}>{theme.decorations.cornerSymbols[0]}</div>
                        <div className="absolute top-2 right-2 text-xl" style={{ color: theme.ui.accentColor, opacity: 0.5 }}>{theme.decorations.cornerSymbols[1]}</div>
                        <div className="absolute bottom-2 left-2 text-xl" style={{ color: theme.ui.accentColor, opacity: 0.5 }}>{theme.decorations.cornerSymbols[2]}</div>
                        <div className="absolute bottom-2 right-2 text-xl" style={{ color: theme.ui.accentColor, opacity: 0.5 }}>{theme.decorations.cornerSymbols[3]}</div>
                    </>
                )}

                {/* Ambient decorations */}
                {theme.decorations.ambientElements?.map((element, i) => (
                    element.positions.map((pos, j) => (
                        <div
                            key={`${i}-${j}`}
                            className="absolute text-2xl pointer-events-none select-none"
                            style={{
                                top: pos.top,
                                left: pos.left,
                                opacity: pos.opacity ?? 0.3,
                                transform: `translate(-50%, -50%) ${pos.rotation ? `rotate(${pos.rotation}deg)` : ''}`,
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                            }}
                        >
                            {element.symbol}
                        </div>
                    ))
                ))}

                {/* Inner board */}
                <div
                    className="grid rounded-lg overflow-hidden relative"
                    style={{
                        gridTemplateAreas: `"home-red path-top home-green" "path-left center path-right" "home-blue path-bottom home-yellow"`,
                        gridTemplateColumns: '1fr 160px 1fr',
                        gridTemplateRows: '1fr 160px 1fr',
                        width: 'min(90vw, 600px)',
                        height: 'min(90vw, 600px)',
                        gap: '3px',
                        backgroundColor: theme.board.innerBoard,
                        border: `3px solid ${theme.board.cellBorder}`,
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
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

function Token({
    color,
    selectable,
    onClick,
    size = 'normal',
}: {
    color: ColorKey;
    selectable: boolean;
    onClick: () => void;
    size?: 'normal' | 'medium' | 'small';
}) {
    const sizeMap = {
        normal: 28,
        medium: 20,
        small: 14,
    };
    const pixelSize = sizeMap[size];

    return (
        <div
            onClick={() => selectable && onClick()}
            className={`
        flex items-center justify-center
        transition-transform duration-150
        ${selectable ? 'cursor-pointer animate-breathe' : 'cursor-default'}
      `}
            style={{
                pointerEvents: selectable ? 'auto' : 'none',
            }}
        >
            <LudoPawn
                color={color}
                size={pixelSize}
                glow={selectable}
            />
        </div>
    );
}

