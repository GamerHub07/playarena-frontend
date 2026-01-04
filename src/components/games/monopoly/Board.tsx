'use client';

import React from 'react';
import { MonopolyGameState, PLAYER_TOKENS, BoardSquare } from '@/types/monopoly';
import { Player } from '@/types/game';
import MonopolyToken from './MonopolyToken';

interface BoardProps {
  gameState: MonopolyGameState;
  players: Player[];
  currentSessionId: string;
}

// Square type icons
const SQUARE_ICONS: Record<string, string> = {
  GO: '💰',
  JAIL: '🔒',
  FREE_PARKING: '🅿️',
  GO_TO_JAIL: '👮',
  CHANCE: '❓',
  COMMUNITY_CHEST: '📦',
  RAILROAD: '🚂',
  UTILITY: '💡',
  TAX: '💸',
};

export default function Board({ gameState, players }: BoardProps) {
  const board = gameState?.board;

  // Board must have 40 squares
  if (!board || board.length < 40) {
    return (
      <div className="flex justify-center">
        <div className="bg-gradient-to-br from-[#1a472a] to-[#0d2818] p-8 rounded-2xl text-center border-4 border-[#c4a35a]">
          <div className="animate-spin w-10 h-10 border-4 border-[#c4a35a] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#c4a35a] font-semibold">Loading board...</p>
        </div>
      </div>
    );
  }

  const getPlayersAt = (pos: number) =>
    players
      .map((p, i) => ({
        idx: i,
        state: gameState.playerState[p.sessionId],
      }))
      .filter(p => p.state?.position === pos);

  const getOwnerIndex = (owner: string | null | undefined) => {
    if (!owner) return -1;
    return players.findIndex(p => p.sessionId === owner);
  };

  // Render a corner square (bigger, special styling)
  const renderCornerSquare = (square: BoardSquare, index: number) => {
    const playersHere = getPlayersAt(index);
    const icon = SQUARE_ICONS[square.type] || '🏠';

    // Determine rotation based on corner position
    let rotation = '';
    if (index === 10) rotation = 'rotate-90'; // Jail
    if (index === 20) rotation = 'rotate-180'; // Free Parking
    if (index === 30) rotation = '-rotate-90'; // Go to Jail

    return (
      <div
        key={square.id}
        className={`
          relative
          bg-gradient-to-br from-[#e8e4d9] to-[#d4cfc0]
          border-2 border-[#1a472a]
          flex flex-col items-center justify-center
          shadow-inner
          ${rotation}
        `}
      >
        <div className={`text-center ${rotation ? `-${rotation}` : ''}`}>
          <div className="text-3xl mb-1 drop-shadow-md">{icon}</div>
          <div className="text-[10px] font-bold text-[#1a472a] uppercase tracking-wide px-1">
            {square.name}
          </div>
        </div>

        {/* Player Tokens */}
        {playersHere.length > 0 && (
          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 ${rotation ? `-${rotation}` : ''}`}>
            {playersHere.map(p => (
              <MonopolyToken key={p.idx} playerIndex={p.idx} size={20} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render a regular property square
  const renderSquare = (square: BoardSquare, index: number, orientation: 'top' | 'bottom' | 'left' | 'right') => {
    const playersHere = getPlayersAt(index);
    const ownerIdx = getOwnerIndex(square.owner);
    const isProperty = square.type === 'PROPERTY';
    const icon = SQUARE_ICONS[square.type];

    // Content rotation based on side
    const contentRotation = {
      top: 'rotate-180',
      bottom: '',
      left: 'rotate-90',
      right: '-rotate-90',
    }[orientation];

    // Color bar position
    const colorBarPosition = {
      top: 'bottom-0 left-0 right-0 h-[18px]',
      bottom: 'top-0 left-0 right-0 h-[18px]',
      left: 'top-0 bottom-0 right-0 w-[18px]',
      right: 'top-0 bottom-0 left-0 w-[18px]',
    }[orientation];

    return (
      <div
        key={square.id}
        className="
          relative
          bg-gradient-to-br from-[#e8e4d9] to-[#d4cfc0]
          border border-[#1a472a]/60
          flex flex-col items-center justify-center
          overflow-hidden
          group
          hover:z-10
          transition-transform hover:scale-105
        "
      >
        {/* Property color bar */}
        {isProperty && square.color && (
          <div
            className={`absolute ${colorBarPosition} shadow-inner`}
            style={{
              backgroundColor: square.color,
              boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {/* Houses/Hotels display */}
            {(square.houses ?? 0) > 0 && (
              <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                {square.houses === 5 ? (
                  // Hotel
                  <span className="text-[10px] drop-shadow-md" title="Hotel">🏨</span>
                ) : (
                  // Houses (1-4)
                  Array.from({ length: square.houses ?? 0 }).map((_, i) => (
                    <span key={i} className="text-[7px] drop-shadow-md" title={`House ${i + 1}`}>🏠</span>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Main content */}
        <div className={`flex flex-col items-center justify-center p-1 ${contentRotation}`}>
          {/* Icon for non-properties */}
          {icon && (
            <div className="text-lg mb-0.5 drop-shadow-sm">{icon}</div>
          )}

          {/* Name */}
          <div className="text-[8px] font-bold text-[#1a472a] text-center leading-tight uppercase tracking-wide">
            {square.name}
          </div>

          {/* Price */}
          {(square.price || square.amount) && (
            <div className="text-[9px] font-semibold text-[#2d5a3d] mt-0.5">
              ${square.price || square.amount}
            </div>
          )}
        </div>

        {/* Owner flag */}
        {ownerIdx >= 0 && (
          <div
            className="absolute top-1 right-1 w-4 h-5 rounded-sm shadow-md flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${PLAYER_TOKENS[ownerIdx]?.color} 0%, ${PLAYER_TOKENS[ownerIdx]?.color}CC 100%)`,
              border: '1px solid rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-[6px] text-white font-bold drop-shadow">🚩</span>
          </div>
        )}

        {/* Player Tokens */}
        {playersHere.length > 0 && (
          <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 ${contentRotation}`}>
            {playersHere.map(p => (
              <MonopolyToken key={p.idx} playerIndex={p.idx} size={18} />
            ))}
          </div>
        )}

        {/* Hover tooltip */}
        <div className="
          absolute -top-12 left-1/2 -translate-x-1/2
          bg-[#1a472a] text-white text-[10px] px-2 py-1 rounded
          opacity-0 group-hover:opacity-100 transition-opacity
          whitespace-nowrap z-20 pointer-events-none
          shadow-lg border border-[#c4a35a]
        ">
          {square.name}
          {square.price && ` - $${square.price}`}
          {ownerIdx >= 0 && ` (${players[ownerIdx]?.username})`}
        </div>
      </div>
    );
  };

  // Board position indices
  const corners = { go: 0, jail: 10, freeParking: 20, goToJail: 30 };
  const top = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  const bottom = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  const left = [19, 18, 17, 16, 15, 14, 13, 12, 11];
  const right = [31, 32, 33, 34, 35, 36, 37, 38, 39];

  return (
    <div className="flex justify-center p-4">
      <div
        className="
          relative
          bg-gradient-to-br from-[#1a472a] via-[#1e5631] to-[#0d2818]
          p-1
          rounded-xl
          shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.1)]
          border-4 border-[#c4a35a]
        "
        style={{ width: '800px', maxWidth: '95vw' }}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#c4a35a] rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#c4a35a] rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#c4a35a] rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#c4a35a] rounded-br-lg" />

        <div
          className="
            grid
            gap-[1px]
            bg-[#1a472a]
            rounded-lg
            overflow-hidden
          "
          style={{
            gridTemplateColumns: '80px repeat(9, 1fr) 80px',
            gridTemplateRows: '80px repeat(9, 1fr) 80px',
          }}
        >
          {/* Top Row */}
          {top.map((idx, i) => {
            if (i === 0) return renderCornerSquare(board[idx], idx); // Free Parking
            if (i === 10) return renderCornerSquare(board[idx], idx); // Go to Jail
            return renderSquare(board[idx], idx, 'top');
          })}

          {/* Middle Rows */}
          {left.map((leftIdx, row) => (
            <React.Fragment key={leftIdx}>
              {/* Left Side */}
              {renderSquare(board[leftIdx], leftIdx, 'left')}

              {/* Center Area */}
              {row === 0 && (
                <div
                  className="
                    col-span-9 row-span-9
                    bg-gradient-to-br from-[#c8e6c9] via-[#a5d6a7] to-[#81c784]
                    flex flex-col items-center justify-center
                    relative
                    overflow-hidden
                  "
                >
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4 w-24 h-24 border-4 border-[#1a472a] rounded-full" />
                    <div className="absolute bottom-4 right-4 w-24 h-24 border-4 border-[#1a472a] rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-[#1a472a] rotate-45" />
                  </div>

                  {/* Main content */}
                  <div className="text-center relative z-10">
                    <div className="text-7xl mb-4 drop-shadow-lg animate-pulse">🏦</div>
                    <h1
                      className="text-4xl font-black tracking-[0.3em] text-[#1a472a] drop-shadow-md"
                      style={{ fontFamily: "'Times New Roman', serif" }}
                    >
                      MONOPOLY
                    </h1>
                    <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#1a472a] to-transparent mx-auto my-3" />
                    <p className="text-sm text-[#2d5a3d] font-semibold tracking-widest uppercase">
                      PlayArena Edition
                    </p>

                    {/* Dice display */}
                    {gameState.dice && (
                      <div className="mt-6 flex justify-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold text-[#1a472a] border-2 border-[#1a472a]">
                          {gameState.dice[0]}
                        </div>
                        <div className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center text-2xl font-bold text-[#1a472a] border-2 border-[#1a472a]">
                          {gameState.dice[1]}
                        </div>
                      </div>
                    )}

                    {/* Cards display area */}
                    <div className="mt-4 flex justify-center gap-4">
                      <div className="w-16 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md flex items-center justify-center border-2 border-white">
                        <span className="text-white text-2xl">❓</span>
                      </div>
                      <div className="w-16 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md flex items-center justify-center border-2 border-white">
                        <span className="text-white text-2xl">📦</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Side */}
              {renderSquare(board[right[row]], right[row], 'right')}
            </React.Fragment>
          ))}

          {/* Bottom Row */}
          {bottom.map((idx, i) => {
            if (i === 0) return renderCornerSquare(board[idx], idx); // Jail
            if (i === 10) return renderCornerSquare(board[idx], idx); // GO
            return renderSquare(board[idx], idx, 'bottom');
          })}
        </div>
      </div>
    </div>
  );
}
