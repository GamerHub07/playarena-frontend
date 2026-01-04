'use client';

import React from 'react';
import { MonopolyGameState, PLAYER_TOKENS, BoardSquare } from '@/types/monopoly';
import { Player } from '@/types/game';

interface BoardProps {
  gameState: MonopolyGameState;
  players: Player[];
  currentSessionId: string;
}

export default function Board({ gameState, players }: BoardProps) {
  const board = gameState?.board;

  // Board must have 40 squares
  if (!board || board.length < 40) {
    return (
      <div className="flex justify-center">
        <div className="bg-[#1a1a1a] p-8 rounded-2xl text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#16a34a] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white">Loading board...</p>
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

  const renderSquare = (square: BoardSquare, index: number) => {
    const playersHere = getPlayersAt(index);

    return (
      <div
        key={square.id}
        className="
          relative aspect-square
          bg-[#faf7ef]
          border border-black/30
          flex flex-col items-center justify-between
          text-[10px]
          shadow-sm
        "
      >
        {/* Property color bar */}
        {square.type === 'PROPERTY' && square.color && (
          <div
            className="absolute top-0 left-0 right-0 h-3"
            style={{ backgroundColor: square.color }}
          />
        )}

        {/* Name */}
        <div className="mt-4 px-1 text-center font-semibold text-black">
          {square.name}
        </div>

        {/* Price */}
        {(square.price || square.amount) && (
          <div className="text-black/70">
            ${square.price || square.amount}
          </div>
        )}

        {/* Owner */}
        {square.owner && (
          <div
            className="absolute top-4 right-1 w-3 h-3 rounded-full border border-black"
            style={{
              backgroundColor:
                PLAYER_TOKENS[
                  players.findIndex(p => p.sessionId === square.owner)
                ]?.color,
            }}
          />
        )}

        {/* Tokens */}
        {playersHere.length > 0 && (
          <div className="absolute bottom-1 flex gap-1">
            {playersHere.map(p => (
              <span key={p.idx}>{PLAYER_TOKENS[p.idx]?.emoji}</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Board index map (standard Monopoly)
   */
  const top = [20,21,22,23,24,25,26,27,28,29,30];
  const bottom = [10,9,8,7,6,5,4,3,2,1,0];
  const left = [19,18,17,16,15,14,13,12,11];
  const right = [31,32,33,34,35,36,37,38,39];

  return (
    <div className="flex justify-center">
      <div
        className="
          grid grid-cols-11 grid-rows-11
          gap-[2px]
          bg-[#0f172a]
          p-2
          rounded-2xl
          shadow-[0_30px_80px_rgba(0,0,0,0.8)]
        "
        style={{ width: '720px', maxWidth: '100%' }}
      >
        {/* Top row */}
        {top.map(i => renderSquare(board[i], i))}

        {/* Middle rows */}
        {left.map((l, row) => (
          <React.Fragment key={l}>
            {/* Left */}
            {renderSquare(board[l], l)}

            {/* Center */}
            {row === 0 && (
              <div
                className="
                  col-span-9 row-span-9
                  bg-[#d1fae5]
                  flex items-center justify-center
                  rounded-lg
                "
              >
                <div className="text-center">
                  <div className="text-6xl mb-3">🏦</div>
                  <div className="text-2xl font-extrabold tracking-widest">
                    MONOPOLY
                  </div>
                  <div className="text-sm opacity-70">
                    PLAYARENA EDITION
                  </div>
                </div>
              </div>
            )}

            {/* Right */}
            {renderSquare(board[right[row]], right[row])}
          </React.Fragment>
        ))}

        {/* Bottom row */}
        {bottom.map(i => renderSquare(board[i], i))}
      </div>
    </div>
  );
}
