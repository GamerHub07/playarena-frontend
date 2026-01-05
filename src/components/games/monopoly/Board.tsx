'use client';

import React from 'react';
import { MonopolyGameState, PLAYER_TOKENS, BoardSquare, PROPERTY_COLORS } from '@/types/monopoly';
import { Player } from '@/types/game';
import MonopolyToken from './MonopolyToken';
import { 
  GiMoneyStack, 
  GiHandcuffs, 
  GiCarWheel, 
  GiPoliceBadge,
  GiPerspectiveDiceSixFacesRandom,
  GiTreasureMap,
  GiSteamLocomotive,
  GiLightBulb,
  GiReceiveMoney
} from 'react-icons/gi';
import { FaHouseChimney, FaHotel } from 'react-icons/fa6';

interface BoardProps {
  gameState: MonopolyGameState;
  players: Player[];
  currentSessionId: string;
}

// 3D Icon wrapper component with gradient and shadow effects
interface Icon3DProps {
  icon: React.ReactNode;
  bgGradient: string;
  size?: 'sm' | 'md' | 'lg';
}

function Icon3D({ icon, bgGradient, size = 'md' }: Icon3DProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-lg',
    lg: 'w-10 h-10 text-2xl',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-lg
        flex items-center justify-center
        text-white
        shadow-lg
        transform hover:scale-110 transition-transform
      `}
      style={{
        background: bgGradient,
        boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)',
      }}
    >
      {icon}
    </div>
  );
}

// Square type icons with 3D styling
const SQUARE_ICON_CONFIGS: Record<string, { icon: React.ReactElement; gradient: string }> = {
  GO: { 
    icon: <GiMoneyStack />, 
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
  },
  JAIL: { 
    icon: <GiHandcuffs />, 
    gradient: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)' 
  },
  FREE_PARKING: { 
    icon: <GiCarWheel />, 
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
  },
  GO_TO_JAIL: { 
    icon: <GiPoliceBadge />, 
    gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' 
  },
  CHANCE: { 
    icon: <GiPerspectiveDiceSixFacesRandom />, 
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
  },
  COMMUNITY_CHEST: { 
    icon: <GiTreasureMap />, 
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' 
  },
  RAILROAD: { 
    icon: <GiSteamLocomotive />, 
    gradient: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
  },
  UTILITY: { 
    icon: <GiLightBulb />, 
    gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' 
  },
  TAX: { 
    icon: <GiReceiveMoney />, 
    gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' 
  },
};

// Render a 3D icon for a square type
function renderSquareIcon(type: string, size: 'sm' | 'md' | 'lg' = 'md') {
  const config = SQUARE_ICON_CONFIGS[type];
  if (!config) return null;
  return <Icon3D icon={config.icon} bgGradient={config.gradient} size={size} />;
}

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
          bg-gradient-to-br from-[#f5f0e6] via-[#e8e4d9] to-[#d4cfc0]
          border-2 border-[#1a472a]
          flex flex-col items-center justify-center
          shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.1)]
          ${rotation}
        `}
      >
        <div className={`text-center flex flex-col items-center ${rotation ? `-${rotation}` : ''}`}>
          <div className="mb-2">{renderSquareIcon(square.type, 'lg')}</div>
          <div 
            className="text-[11px] font-black uppercase tracking-wider px-1"
            style={{
              color: '#1a472a',
              textShadow: '1px 1px 0 rgba(255,255,255,0.8), -1px -1px 0 rgba(0,0,0,0.1), 2px 2px 2px rgba(0,0,0,0.15)',
              letterSpacing: '0.05em',
            }}
          >
            {square.name}
          </div>
        </div>

        {/* Player Tokens */}
        {playersHere.length > 0 && (
          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 ${rotation ? `-${rotation}` : ''}`}>
            {playersHere.map(p => (
              <MonopolyToken key={p.idx} playerIndex={p.idx} size={32} />
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

    // Content rotation based on side
    const contentRotation = {
      top: 'rotate-180',
      bottom: '',
      left: 'rotate-90',
      right: '-rotate-90',
    }[orientation];

    // Color bar position - with increased size
    const colorBarPosition = {
      top: 'bottom-0 left-0 right-0 h-[22px]',
      bottom: 'top-0 left-0 right-0 h-[22px]',
      left: 'top-0 bottom-0 right-0 w-[22px]',
      right: 'top-0 bottom-0 left-0 w-[22px]',
    }[orientation];

    return (
      <div
        key={square.id}
        className="
          relative
          bg-gradient-to-br from-[#f5f0e6] via-[#e8e4d9] to-[#d4cfc0]
          border border-[#1a472a]/50
          flex flex-col items-center justify-center
          overflow-hidden
          group
          hover:z-10
          transition-transform
          shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.05)]
        "
      >
        {/* Property color bar */}
        {isProperty && square.color && (
          <div
            className={`absolute ${colorBarPosition} z-10`}
            style={{
              background: `linear-gradient(135deg, ${PROPERTY_COLORS[square.color] || square.color} 0%, ${PROPERTY_COLORS[square.color] || square.color}DD 50%, ${PROPERTY_COLORS[square.color] || square.color}BB 100%)`,
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {/* Houses/Hotels display */}
            {(square.houses ?? 0) > 0 && (
              <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                {square.houses === 5 ? (
                  // Hotel
                  <FaHotel className="text-[10px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" title="Hotel" />
                ) : (
                  // Houses (1-4)
                  Array.from({ length: square.houses ?? 0 }).map((_, i) => (
                    <FaHouseChimney key={i} className="text-[7px] text-green-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" title={`House ${i + 1}`} />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Main content */}
        <div className={`flex flex-col items-center justify-center p-1 ${contentRotation}`}>
          {/* Icon for non-properties */}
          {renderSquareIcon(square.type, 'sm')}

          {/* Name */}
          <div 
            className="text-[8px] font-black text-center leading-tight uppercase mt-0.5"
            style={{
              color: '#1a472a',
              textShadow: '0.5px 0.5px 0 rgba(255,255,255,0.8), 1px 1px 1px rgba(0,0,0,0.1)',
              letterSpacing: '0.03em',
            }}
          >
            {square.name}
          </div>

          {/* Price */}
          {(square.price || square.amount) && (
            <div 
              className="text-[9px] font-bold mt-0.5"
              style={{
                color: '#166534',
                textShadow: '0.5px 0.5px 0 rgba(255,255,255,0.9), 1px 1px 1px rgba(0,0,0,0.1)',
              }}
            >
              ₹{square.price || square.amount}
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
              <MonopolyToken key={p.idx} playerIndex={p.idx} size={28} />
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
                    bg-gradient-to-br from-[#d4edda] via-[#b8e0c0] to-[#9ed4a8]
                    flex flex-col items-center justify-center
                    relative
                    overflow-hidden
                  "
                  style={{
                    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.15), inset 0 -4px 20px rgba(255,255,255,0.3)'
                  }}
                >
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-6 left-6 w-28 h-28 border-4 border-[#1a472a] rounded-full" />
                    <div className="absolute bottom-6 right-6 w-28 h-28 border-4 border-[#1a472a] rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-4 border-[#1a472a] rotate-45" />
                  </div>

                  {/* Main content */}
                  <div className="text-center relative z-10">
                    {/* Bank icon with 3D effect */}
                    <div 
                      className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #1a472a 0%, #0d2818 100%)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      <GiMoneyStack className="text-5xl text-[#c4a35a]" />
                    </div>
                    
                    {/* 3D Title */}
                    <h1
                      className="text-5xl font-black tracking-[0.2em] mb-2"
                      style={{ 
                        fontFamily: "'Times New Roman', serif",
                        color: '#1a472a',
                        textShadow: `
                          2px 2px 0 #c4a35a,
                          4px 4px 0 rgba(0,0,0,0.2),
                          6px 6px 10px rgba(0,0,0,0.3)
                        `,
                      }}
                    >
                      MONOPOLY
                    </h1>
                    
                    {/* Decorative divider */}
                    <div className="flex items-center justify-center gap-2 my-3">
                      <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-[#c4a35a]" />
                      <div className="w-3 h-3 rotate-45 bg-[#c4a35a]" />
                      <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-[#c4a35a]" />
                    </div>
                    
                    <p 
                      className="text-sm font-bold tracking-[0.3em] uppercase"
                      style={{
                        color: '#2d5a3d',
                        textShadow: '1px 1px 0 rgba(255,255,255,0.8), 2px 2px 3px rgba(0,0,0,0.15)',
                      }}
                    >
                      PlayArena Edition
                    </p>

                    {/* Dice display with 3D effect */}
                    {gameState.dice && (
                      <div className="mt-6 flex justify-center gap-4">
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black"
                          style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #e5e5e5 100%)',
                            color: '#1a472a',
                            boxShadow: '0 6px 15px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,1), inset 0 -2px 4px rgba(0,0,0,0.1)',
                            border: '3px solid #1a472a',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                          }}
                        >
                          {gameState.dice[0]}
                        </div>
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black"
                          style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #e5e5e5 100%)',
                            color: '#1a472a',
                            boxShadow: '0 6px 15px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,1), inset 0 -2px 4px rgba(0,0,0,0.1)',
                            border: '3px solid #1a472a',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                          }}
                        >
                          {gameState.dice[1]}
                        </div>
                      </div>
                    )}

                    {/* Cards display area with 3D effect */}
                    <div className="mt-5 flex justify-center gap-5">
                      <div 
                        className="w-16 h-22 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          boxShadow: '0 6px 15px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)',
                          border: '2px solid rgba(255,255,255,0.5)',
                        }}
                      >
                        <GiPerspectiveDiceSixFacesRandom className="text-3xl text-white drop-shadow-lg" />
                      </div>
                      <div 
                        className="w-16 h-22 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                          boxShadow: '0 6px 15px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)',
                          border: '2px solid rgba(255,255,255,0.5)',
                        }}
                      >
                        <GiTreasureMap className="text-3xl text-white drop-shadow-lg" />
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
