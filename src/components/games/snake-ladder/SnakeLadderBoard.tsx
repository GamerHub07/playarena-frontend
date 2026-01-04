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
}

export default function SnakeLadderBoard({
    gameState,
    players,
    displayedPositions,
    isAnimating,
}: SnakeLadderBoardProps) {
    const cellSize = 60;
    const boardSize = cellSize * 10;

    const cells = useMemo(() => getBoardCells().map(cell => {
        const isDark = (cell.row + cell.col) % 2 !== 0;
        return { ...cell, isDark };
    }), []);

    // Group players by position
    const playersByPosition: Record<number, number[]> = {};
    const waitingPlayers: number[] = [];

    Object.entries(displayedPositions).forEach(([playerIdx, position]) => {
        const idx = parseInt(playerIdx);
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

                    {/* Slim Realistic Snakes */}
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

                        // Body Generation (Centerline)
                        const steps = 30;
                        const points = [];
                        const waves = Math.max(1, distance / 100);
                        const amplitude = 25 * (index % 2 === 0 ? 1 : -1);

                        for (let i = 0; i <= steps; i++) {
                            const t = i / steps;
                            const x = t * distance;
                            // Smooth sine wave
                            const y = amplitude * Math.sin(t * waves * Math.PI * 2);
                            points.push({ x, y });
                        }

                        // Construct simple centerline path
                        const pathD = points.map((p, i) =>
                            (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)
                        ).join(' ');

                        // Theme Config
                        const themeColors = [
                            { head: '#2E7D32' }, // Green
                            { head: '#EF6C00' }, // Orange
                            { head: '#C62828' }, // Red
                            { head: '#1565C0' }, // Blue
                            { head: '#6A1B9A' }  // Purple
                        ];
                        const themeIdx = index % 5;
                        const headColor = themeColors[themeIdx].head;
                        const gradientId = `snakeGradient-${themeIdx}`;

                        return (
                            <g key={`snake-${headStr}`} transform={`translate(${x1}, ${y1}) rotate(${angle})`}>
                                {/* Snake Body - Slim Vector Path */}
                                {/* Layer 1: Base Color Gradient */}
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke={`url(#${gradientId})`}
                                    strokeWidth="15"
                                    strokeLinecap="round"
                                    filter="url(#shadow)"
                                />
                                {/* Layer 2: Scale Texture Overlay */}
                                <path
                                    d={pathD}
                                    fill="none"
                                    stroke="url(#snakeScales)"
                                    strokeWidth="15"
                                    strokeLinecap="round"
                                    style={{ mixBlendMode: 'multiply' }}
                                    opacity="0.5"
                                />

                                {/* Head Group - Slim & Small */}
                                {/* Positioned at 0,0 (Start) and rotated 180 to face backwards */}
                                <g transform="rotate(180)">

                                    {/* Tongue */}
                                    <path
                                        d="M 12 0 L 22 -4 M 12 0 L 22 4"
                                        stroke="#D32F2F"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        transform="translate(-24, 0)"
                                    />

                                    {/* Head Shape - Slimmer Ellipse */}
                                    <ellipse
                                        cx="0" cy="0"
                                        rx="13" ry="16"
                                        fill={headColor}
                                        stroke="rgba(0,0,0,0.2)" strokeWidth="1"
                                    />

                                    {/* Eyes - Smaller */}
                                    <g transform="translate(-4, 0)">
                                        {/* Left Eye */}
                                        <g transform="translate(-5, -6)">
                                            <circle r="3.5" fill="#fff" />
                                            <circle cx="-1" cy="0" r="1.5" fill="#000" />
                                            <circle cx="-1.5" cy="-1" r="1" fill="#fff" opacity="0.8" />
                                        </g>

                                        {/* Right Eye */}
                                        <g transform="translate(-5, 6)">
                                            <circle r="3.5" fill="#fff" />
                                            <circle cx="-1" cy="0" r="1.5" fill="#000" />
                                            <circle cx="-1.5" cy="-1" r="1" fill="#fff" opacity="0.8" />
                                        </g>
                                    </g>

                                    {/* Nostrils */}
                                    <circle cx="-12" cy="-2.5" r="0.8" fill="rgba(0,0,0,0.4)" />
                                    <circle cx="-12" cy="2.5" r="0.8" fill="rgba(0,0,0,0.4)" />

                                </g>
                            </g>
                        );
                    })}
                </svg>

                {/* Tokens Layer */}
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30 }}>
                    {Object.entries(playersByPosition).map(([posStr, pIndices]) => {
                        const pos = parseInt(posStr);
                        const grid = positionToGrid(pos);
                        const cellX = grid.col * cellSize;
                        const cellY = grid.row * cellSize;

                        return (
                            <div
                                key={pos}
                                className="absolute flex items-center justify-center transition-all duration-300"
                                style={{
                                    left: cellX,
                                    top: cellY,
                                    width: cellSize,
                                    height: cellSize,
                                }}
                            >
                                {pIndices.map((pIdx, i) => (
                                    <SnakeLadderToken
                                        key={pIdx}
                                        playerIndex={pIdx}
                                        username={players[pIdx]?.username || 'Player'}
                                        size={cellSize}
                                        isMultiple={pIndices.length > 1}
                                        stackIndex={i}
                                        totalInStack={pIndices.length}
                                    />
                                ))}
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
