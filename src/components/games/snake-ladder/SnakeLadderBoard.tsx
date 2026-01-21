'use client';

import React, { useMemo } from 'react';
import {
    SnakeLadderGameState,
    PLAYER_COLORS,
    SNAKES,
    LADDERS,
    positionToGrid,
    getBoardCells
} from '@/types/snakeLadder';
import { Player } from '@/types/game';
import SnakeLadderToken from './SnakeLadderToken';

interface SnakeLadderBoardProps {
    gameState: SnakeLadderGameState;
    players: Player[];
    displayedPositions: Record<number, number>;
    currentSessionId: string;
    isAnimating: boolean;
    onTokenClick?: () => void;
    myPlayerIndex: number;
    canMove: boolean;
}

export default function SnakeLadderBoard({
    gameState,
    players,
    displayedPositions,
    isAnimating,
    onTokenClick,
    myPlayerIndex,
    canMove,
}: SnakeLadderBoardProps) {
    const cellSize = 60;
    const boardSize = cellSize * 10;

    const cells = useMemo(() => getBoardCells().map(cell => {
        const isDark = (cell.row + cell.col) % 2 !== 0;
        return { ...cell, isDark };
    }), []);

    // Group players by position
    // Fall back to gameState.players if displayedPositions is empty or missing
    const playersByPosition: Record<number, number[]> = {};
    const waitingPlayers: number[] = [];

    // Use gameState.players as the source of truth for which players exist
    // but use displayedPositions for the animated position (with fallback to gameState)
    Object.entries(gameState.players).forEach(([playerIdx, pState]) => {
        const idx = parseInt(playerIdx);
        // Use displayed position if available, otherwise fall back to game state position
        const position = displayedPositions[idx] ?? pState.position;

        if (position === 0) {
            waitingPlayers.push(idx);
        } else if (position > 0) {
            if (!playersByPosition[position]) {
                playersByPosition[position] = [];
            }
            playersByPosition[position].push(idx);
        }
    });

    const getLadderPath = (startPos: number, endPos: number) => {
        const start = positionToGrid(startPos);
        const end = positionToGrid(endPos);
        const x1 = (start.col + 0.5) * cellSize;
        const y1 = (start.row + 0.5) * cellSize;
        const x2 = (end.col + 0.5) * cellSize;
        const y2 = (end.row + 0.5) * cellSize;
        return { x1, y1, x2, y2 };
    };



    return (
        <div className={`relative flex flex-col items-center justify-center p-8 ${isAnimating ? 'pointer-events-none' : ''}`}
            style={{
                backgroundImage: 'url(/jungle-frame.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '30px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                padding: '60px' // Add padding to show the frame
            }}
        >
            <div
                className="relative overflow-hidden rounded-lg shadow-2xl bg-[#E8F5E9]" // Light background base
                style={{
                    width: boardSize,
                    height: boardSize,
                }}
            >
                {/* Grid Cells - Green Checkerboard */}
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                    {cells.map((cell) => {
                        // In valid checkerboard, (row + col) % 2 determines color
                        // Reference image: 100 is Light, 99 is Dark.
                        // Row 0 (top), Col 0 (left) -> 100.
                        // Let's adjust to match visual preference.
                        const isEven = (cell.row + cell.col) % 2 === 0;
                        return (
                            <div
                                key={cell.position}
                                className={`relative flex items-center justify-center`}
                                style={{
                                    gridRow: cell.row + 1,
                                    gridColumn: cell.col + 1,
                                    backgroundColor: isEven ? '#C5E1A5' : '#7CB342', // Light Green 200 vs Light Green 600
                                }}
                            >
                                {/* Cell Number */}
                                <span className={`text-sm font-bold ${cell.position === 100 ? 'text-yellow-400' : 'text-slate-900'} z-10`}
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        left: '6px',
                                        fontSize: '14px'
                                    }}
                                >
                                    {cell.position}
                                </span>

                                {/* Start/End Icons */}
                                {cell.position === 1 && (
                                    <span className="text-[10px] font-bold text-slate-800 absolute bottom-1">START</span>
                                )}
                                {cell.position === 100 && (
                                    <span className="text-3xl filter drop-shadow-md">👑</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* SVG Layer for Snakes & Laddders */}
                <svg
                    className="absolute inset-0 pointer-events-none"
                    width={boardSize}
                    height={boardSize}
                    viewBox={`0 0 ${boardSize} ${boardSize}`}
                    style={{ zIndex: 20 }}
                >
                    <defs>
                        {/* Shadow Filter */}
                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
                        </filter>

                        <linearGradient id="woodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8D6E63" />
                            <stop offset="50%" stopColor="#D7CCC8" />
                            <stop offset="100%" stopColor="#8D6E63" />
                        </linearGradient>

                        {/* Scale Texture Pattern */}
                        <pattern id="snakeScales" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                            <circle cx="3" cy="3" r="1.5" fill="#000" opacity="0.2" />
                        </pattern>

                        {/* Snake Gradients (Realistic Tones) */}
                        {/* Green Theme */}
                        <linearGradient id="snakeGradient-0" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#43A047" />
                            <stop offset="50%" stopColor="#2E7D32" />
                            <stop offset="100%" stopColor="#1B5E20" />
                        </linearGradient>
                        {/* Orange Theme */}
                        <linearGradient id="snakeGradient-1" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FB8C00" />
                            <stop offset="50%" stopColor="#EF6C00" />
                            <stop offset="100%" stopColor="#E65100" />
                        </linearGradient>
                        {/* Red Theme */}
                        <linearGradient id="snakeGradient-2" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#E53935" />
                            <stop offset="50%" stopColor="#C62828" />
                            <stop offset="100%" stopColor="#B71C1C" />
                        </linearGradient>
                        {/* Blue Theme */}
                        <linearGradient id="snakeGradient-3" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#42A5F5" />
                            <stop offset="50%" stopColor="#1E88E5" />
                            <stop offset="100%" stopColor="#1565C0" />
                        </linearGradient>
                        {/* Purple Theme */}
                        <linearGradient id="snakeGradient-4" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#AB47BC" />
                            <stop offset="50%" stopColor="#8E24AA" />
                            <stop offset="100%" stopColor="#6A1B9A" />
                        </linearGradient>
                    </defs>

                    {/* Programmatic Ladders */}
                    {Object.entries(LADDERS).map(([bottom, top]) => {
                        const { x1, y1, x2, y2 } = getLadderPath(parseInt(bottom), top);
                        const dx = x2 - x1;
                        const dy = y2 - y1;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        const angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;

                        const width = 24;
                        const steps = Math.floor(length / 20); // One rung every 20px

                        return (
                            <g key={`ladder-${bottom}`} transform={`translate(${x1}, ${y1}) rotate(${angle})`} filter="url(#shadow)">
                                {/* Rails */}
                                <rect x={-width / 2} y={0} width={4} height={length} rx={2} fill="url(#woodGradient)" stroke="#5D4037" strokeWidth="0.5" />
                                <rect x={width / 2 - 4} y={0} width={4} height={length} rx={2} fill="url(#woodGradient)" stroke="#5D4037" strokeWidth="0.5" />

                                {/* Rungs */}
                                {Array.from({ length: steps }).map((_, i) => {
                                    const y = (i + 0.5) * (length / steps);
                                    return (
                                        <rect
                                            key={i}
                                            x={-width / 2 + 2}
                                            y={y - 2}
                                            width={width - 4}
                                            height={4}
                                            rx={1}
                                            fill="#A1887F"
                                            stroke="#5D4037"
                                            strokeWidth="0.5"
                                        />
                                    );
                                })}
                            </g>
                        );
                    })}

                    {/* === FUN CARTOONISH SNAKES WITH BIG CUTE EYES === */}
                    {Object.entries(SNAKES).map(([headStr, tail], index) => {
                        const head = parseInt(headStr);
                        const start = positionToGrid(head);
                        const end = positionToGrid(tail);

                        const x1 = (start.col + 0.5) * cellSize;
                        const y1 = (start.row + 0.5) * cellSize;
                        const x2 = (end.col + 0.5) * cellSize;
                        const y2 = (end.row + 0.5) * cellSize;

                        const dx = x2 - x1;
                        const dy = y2 - y1;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                        // Fun colorful cartoon snake themes
                        const cartoonThemes = [
                            { body: '#4ADE80', bodyDark: '#22C55E', belly: '#86EFAC', spots: '#166534', cheek: '#FB7185' }, // Happy Green
                            { body: '#FB923C', bodyDark: '#F97316', belly: '#FED7AA', spots: '#C2410C', cheek: '#F472B6' }, // Friendly Orange  
                            { body: '#F87171', bodyDark: '#EF4444', belly: '#FECACA', spots: '#B91C1C', cheek: '#FDA4AF' }, // Cute Red
                            { body: '#D97706', bodyDark: '#D97706', belly: '#FEF3C7', spots: '#92400E', cheek: '#F9A8D4' }, // Happy Amber
                            { body: '#C084FC', bodyDark: '#A855F7', belly: '#E9D5FF', spots: '#7E22CE', cheek: '#FBCFE8' }, // Playful Purple
                        ];
                        const theme = cartoonThemes[index % cartoonThemes.length];
                        const snakeId = `cartoon-snake-${head}`;

                        // Smooth curvy body path
                        const steps = 25;
                        const points: { x: number, y: number }[] = [];
                        const waves = Math.max(1.5, distance / 90);
                        const amplitude = 22 * (index % 2 === 0 ? 1 : -1);

                        for (let i = 0; i <= steps; i++) {
                            const t = i / steps;
                            const x = t * distance;
                            const taper = Math.sin(t * Math.PI);
                            const y = amplitude * Math.sin(t * waves * Math.PI * 2) * taper;
                            points.push({ x, y });
                        }

                        const pathD = points.map((p, i) =>
                            i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
                        ).join(' ');

                        return (
                            <g key={`snake-${headStr}`} transform={`translate(${x1}, ${y1}) rotate(${angle})`}>
                                {/* Defs for this snake */}
                                <defs>
                                    {/* Body gradient - cute 3D look */}
                                    <linearGradient id={`${snakeId}-body`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={theme.belly} />
                                        <stop offset="30%" stopColor={theme.body} />
                                        <stop offset="70%" stopColor={theme.bodyDark} />
                                        <stop offset="100%" stopColor={theme.spots} />
                                    </linearGradient>

                                    {/* Cute spots pattern */}
                                    <pattern id={`${snakeId}-spots`} x="0" y="0" width="20" height="14" patternUnits="userSpaceOnUse">
                                        <circle cx="5" cy="7" r="3" fill={theme.spots} opacity="0.3" />
                                        <circle cx="15" cy="3" r="2" fill={theme.spots} opacity="0.25" />
                                        <circle cx="15" cy="11" r="2.5" fill={theme.spots} opacity="0.2" />
                                    </pattern>
                                </defs>

                                {/* === SNAKE BODY WITH SHADOW === */}
                                {/* Shadow layer */}
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke="rgba(0,0,0,0.25)"
                                    strokeWidth={20}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    transform="translate(2, 4)"
                                />

                                {/* Main body */}
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke={`url(#${snakeId}-body)`}
                                    strokeWidth={18}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {/* Cute spots overlay */}
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke={`url(#${snakeId}-spots)`}
                                    strokeWidth={16}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {/* Shiny highlight on body */}
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.4)"
                                    strokeWidth={5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="10 20"
                                    transform="translate(-1, -3)"
                                />

                                {/* Belly line */}
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke={theme.belly}
                                    strokeWidth={6}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    opacity="0.5"
                                    transform="translate(0, 3)"
                                />

                                {/* === CUTE CARTOON HEAD === */}
                                <g transform="rotate(180)">
                                    {/* Head shadow */}
                                    <ellipse cx="3" cy="4" rx="22" ry="18" fill="rgba(0,0,0,0.2)" />

                                    {/* Playful tongue sticking out */}
                                    <g transform="translate(-32, 0)">
                                        <path
                                            d="M 0 0 C 8 0 12 -3 16 -5"
                                            stroke="#FF6B6B"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            fill="none"
                                        />
                                        <path
                                            d="M 0 0 C 8 0 12 3 16 5"
                                            stroke="#FF6B6B"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            fill="none"
                                        />
                                        {/* Tongue tips */}
                                        <circle cx="16" cy="-5" r="2" fill="#EF4444" />
                                        <circle cx="16" cy="5" r="2" fill="#EF4444" />
                                    </g>

                                    {/* Main head shape */}
                                    <ellipse
                                        cx="0" cy="0"
                                        rx="22" ry="18"
                                        fill={theme.body}
                                        stroke={theme.bodyDark}
                                        strokeWidth="2"
                                    />

                                    {/* Head highlight */}
                                    <ellipse
                                        cx="-5" cy="-6"
                                        rx="12" ry="8"
                                        fill={theme.belly}
                                        opacity="0.5"
                                    />

                                    {/* Cute rosy cheeks */}
                                    <ellipse cx="8" cy="-10" rx="5" ry="3" fill={theme.cheek} opacity="0.6" />
                                    <ellipse cx="8" cy="10" rx="5" ry="3" fill={theme.cheek} opacity="0.6" />

                                    {/* Snout bump */}
                                    <ellipse
                                        cx="-18" cy="0"
                                        rx="6" ry="5"
                                        fill={theme.body}
                                    />

                                    {/* Cute nostrils */}
                                    <circle cx="-20" cy="-2" r="1.5" fill={theme.spots} />
                                    <circle cx="-20" cy="2" r="1.5" fill={theme.spots} />

                                    {/* === BIG CUTE CARTOON EYES === */}
                                    {/* Left Eye */}
                                    <g transform="translate(-2, -10)">
                                        {/* Eye shadow */}
                                        <ellipse cx="1" cy="2" rx="10" ry="9" fill="rgba(0,0,0,0.15)" />

                                        {/* Eye white (sclera) */}
                                        <ellipse cx="0" cy="0" rx="10" ry="9" fill="white" stroke={theme.bodyDark} strokeWidth="1" />

                                        {/* Iris - big and colorful */}
                                        <ellipse cx="-2" cy="1" rx="6" ry="6" fill="#2D3748" />

                                        {/* Pupil */}
                                        <ellipse cx="-2" cy="1" rx="3" ry="3" fill="#0A0A0A" />

                                        {/* Big main sparkle */}
                                        <ellipse cx="-4" cy="-2" rx="3" ry="2.5" fill="white" />

                                        {/* Small sparkle */}
                                        <circle cx="1" cy="3" r="1.5" fill="white" opacity="0.8" />

                                        {/* Tiny sparkle */}
                                        <circle cx="-1" cy="-4" r="1" fill="white" opacity="0.6" />

                                        {/* Cute eyelid curve */}
                                        <path d="M -9 -4 Q 0 -8 9 -4" stroke={theme.bodyDark} strokeWidth="1.5" fill="none" />
                                    </g>

                                    {/* Right Eye */}
                                    <g transform="translate(-2, 10)">
                                        {/* Eye shadow */}
                                        <ellipse cx="1" cy="-2" rx="10" ry="9" fill="rgba(0,0,0,0.15)" />

                                        {/* Eye white (sclera) */}
                                        <ellipse cx="0" cy="0" rx="10" ry="9" fill="white" stroke={theme.bodyDark} strokeWidth="1" />

                                        {/* Iris - big and colorful */}
                                        <ellipse cx="-2" cy="-1" rx="6" ry="6" fill="#2D3748" />

                                        {/* Pupil */}
                                        <ellipse cx="-2" cy="-1" rx="3" ry="3" fill="#0A0A0A" />

                                        {/* Big main sparkle */}
                                        <ellipse cx="-4" cy="-4" rx="3" ry="2.5" fill="white" />

                                        {/* Small sparkle */}
                                        <circle cx="1" cy="1" r="1.5" fill="white" opacity="0.8" />

                                        {/* Tiny sparkle */}
                                        <circle cx="-1" cy="-6" r="1" fill="white" opacity="0.6" />

                                        {/* Cute eyelid curve */}
                                        <path d="M -9 4 Q 0 8 9 4" stroke={theme.bodyDark} strokeWidth="1.5" fill="none" />
                                    </g>

                                    {/* Cute eyebrows (friendly expression) */}
                                    <path d="M -12 -16 Q -4 -20 4 -17" stroke={theme.spots} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                                    <path d="M -12 16 Q -4 20 4 17" stroke={theme.spots} strokeWidth="2.5" strokeLinecap="round" fill="none" />

                                    {/* Optional smile lines near eyes */}
                                    <path d="M 8 -4 Q 12 -2 10 2" stroke={theme.spots} strokeWidth="1" fill="none" opacity="0.3" />
                                    <path d="M 8 4 Q 12 2 10 -2" stroke={theme.spots} strokeWidth="1" fill="none" opacity="0.3" />
                                </g>

                                {/* === CUTE TAIL TIP === */}
                                <g transform={`translate(${distance}, ${points[points.length - 1]?.y || 0})`}>
                                    <path
                                        d="M 0 0 Q 10 0 18 0"
                                        stroke={theme.body}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M 12 0 Q 20 0 26 0"
                                        stroke={theme.bodyDark}
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M 22 0 Q 28 0 32 0"
                                        stroke={theme.spots}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                    {/* Tail highlight */}
                                    <circle cx="10" cy="-2" r="2" fill="rgba(255,255,255,0.4)" />
                                </g>
                            </g>
                        );
                    })}
                </svg>

                {/* Tokens Layer */}
                <div className="absolute inset-0" style={{ zIndex: 30 }}>
                    {Object.entries(playersByPosition).map(([posStr, pIndices]) => {
                        const pos = parseInt(posStr);
                        const grid = positionToGrid(pos);
                        const cellX = grid.col * cellSize;
                        const cellY = grid.row * cellSize;

                        return (
                            <div
                                key={pos}
                                className="absolute transition-all duration-500"
                                style={{
                                    left: cellX,
                                    top: cellY,
                                    width: cellSize,
                                    height: cellSize,
                                }}
                            >
                                {pIndices.map((pIdx, i) => {
                                    // Check if this token is clickable (belongs to current player and canMove)
                                    const isMyToken = pIdx === myPlayerIndex;
                                    const isClickable = isMyToken && canMove && !isAnimating;

                                    return isClickable ? (
                                        <button
                                            key={pIdx}
                                            onClick={onTokenClick}
                                            className="absolute inset-0 w-full h-full"
                                            style={{
                                                cursor: 'pointer',
                                                outline: 'none',
                                                background: 'transparent',
                                                border: 'none',
                                                padding: 0,
                                                zIndex: 100, // Ensure clickable token is always on top
                                            }}
                                            title="Click to move!"
                                        >
                                            {/* Glowing ring to indicate clickable */}
                                            <div
                                                className="absolute rounded-full animate-ping"
                                                style={{
                                                    left: '50%',
                                                    top: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: cellSize * 0.7,
                                                    height: cellSize * 0.7,
                                                    backgroundColor: PLAYER_COLORS[pIdx]?.hex || '#fff',
                                                    opacity: 0.4,
                                                }}
                                            />
                                            <SnakeLadderToken
                                                playerIndex={pIdx}
                                                username={players[pIdx]?.username || 'Player'}
                                                size={cellSize}
                                                isMultiple={pIndices.length > 1}
                                                stackIndex={i}
                                                totalInStack={pIndices.length}
                                            />
                                        </button>
                                    ) : (
                                        <SnakeLadderToken
                                            key={pIdx}
                                            playerIndex={pIdx}
                                            username={players[pIdx]?.username || 'Player'}
                                            size={cellSize}
                                            isMultiple={pIndices.length > 1}
                                            stackIndex={i}
                                            totalInStack={pIndices.length}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div >

            {/* Waiting Area & Info */}
            < div className="mt-8 relative z-10 bg-white/90 backdrop-blur rounded-full px-6 py-3 shadow-xl border-2 border-[#7CB342]" >
                {
                    waitingPlayers.length > 0 ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-[#33691E] font-extrabold uppercase tracking-wider">Waiting Area</span>
                            <div className="flex gap-2">
                                {waitingPlayers.map((pIdx) => {
                                    const colorObj = PLAYER_COLORS[pIdx] || PLAYER_COLORS[0];
                                    const isCurrentPlayer = gameState.currentPlayer === pIdx;
                                    return (
                                        <div
                                            key={pIdx}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isCurrentPlayer
                                                ? 'bg-yellow-300 ring-4 ring-yellow-400/50 animate-bounce'
                                                : 'bg-gray-100'
                                                }`}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full border border-white shadow-sm"
                                                style={{ backgroundColor: colorObj.hex }}
                                            />
                                            <span className="text-xs font-bold text-gray-800">
                                                {players[pIdx]?.username || `P${pIdx + 1}`}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-[#33691E] font-bold text-sm">
                            All players are on the board! 🎲
                        </div>
                    )
                }
            </div >
        </div >
    );
}
