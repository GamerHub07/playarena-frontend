'use client';

import React, { useState } from 'react';
import { MonopolyGameState, PLAYER_TOKENS, BoardSquare } from '@/types/monopoly';
import { Player } from '@/types/game';
import MonopolyToken from './MonopolyToken';
import PropertyDetailsModal from './PropertyDetailsModal';
import { 
  GiCash, 
  GiPrisoner, 
  GiCityCar, 
  GiPoliceOfficerHead, 
  GiCardRandom, 
  GiChest, 
  GiSteamLocomotive, 
  GiElectric, 
  GiWaterDrop, 
  GiPayMoney,
  GiTakeMyMoney,
  GiHouse
} from 'react-icons/gi';
import { FaHotel } from 'react-icons/fa';

interface BoardProps {
  gameState: MonopolyGameState;
  players: Player[];
  currentSessionId: string;
}

// Square type icons mapping to React components
const SQUARE_ICONS: Record<string, React.ReactNode> = {
  GO: <GiCash className="text-[#c4a35a]" />,
  JAIL: <GiPrisoner className="text-gray-700" />,
  FREE_PARKING: <GiCityCar className="text-blue-600" />,
  GO_TO_JAIL: <GiPoliceOfficerHead className="text-blue-800" />,
  CHANCE: <GiCardRandom className="text-orange-600" />,
  COMMUNITY_CHEST: <GiChest className="text-blue-500" />,
  RAILROAD: <GiSteamLocomotive className="text-gray-800" />,
  UTILITY: <GiElectric className="text-yellow-600" />, // Default to electric
  TAX: <GiPayMoney className="text-red-700" />,
};

// Color display mapping to nice hex values
const COLOR_NAMES: Record<string, string> = {
  brown: '#8B4513',
  lightBlue: '#87CEEB',
  pink: '#FF69B4',
  orange: '#ff8400',
  red: '#ff6868',
  yellow: '#ecd630',
  green: '#47c447',
  blue: '#4f4fc8',
};

export default function Board({ gameState, players }: BoardProps) {
  const board = gameState?.board;
  const [selectedProperty, setSelectedProperty] = useState<BoardSquare | null>(null);

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
    
    const getSquareIcon = (sq: BoardSquare) => {
      if (sq.type === 'UTILITY') {
        if (sq.name?.toLowerCase().includes('water')) return <GiWaterDrop className="text-blue-400" />;
        return <GiElectric className="text-yellow-500" />;
      }
      return SQUARE_ICONS[sq.type] || <GiHouse className="text-[#1a472a]" />;
    };

    const icon = getSquareIcon(square);

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
          border-[0.2vmin] border-[#1a472a]
          flex flex-col items-center justify-center
          shadow-inner rounded-[1vmin]
          ${rotation}
        `}
      >
        <div className={`text-center ${rotation ? `-${rotation}` : ''} w-full px-[0.5vmin]`}>
          <div className="text-[4vmin] mb-[0.2vmin] flex justify-center drop-shadow-md">{icon}</div>
          <div className="text-[clamp(6px,1.2vmin,14px)] font-extrabold text-[#1a472a] uppercase tracking-tighter leading-[1.1] break-words">
            {square.name}
          </div>
        </div>

        {/* Player Tokens */}
        {playersHere.length > 0 && (
          <div className={`absolute bottom-[1vmin] left-1/2 -translate-x-1/2 flex gap-[0.3vmin] ${rotation ? `-${rotation}` : ''}`}>
            {playersHere.map(p => (
              <MonopolyToken key={p.idx} playerIndex={p.idx} size={28} className="w-[3.5vmin] h-[3.5vmin]" />
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
    
    const getSquareIcon = (sq: BoardSquare) => {
      if (sq.type === 'UTILITY') {
        if (sq.name?.toLowerCase().includes('water')) return <GiWaterDrop className="text-blue-400" />;
        return <GiElectric className="text-yellow-500" />;
      }
      return SQUARE_ICONS[sq.type];
    };

    const icon = getSquareIcon(square);

    // Content rotation based on side
    const contentRotation = {
      top: 'rotate-180',
      bottom: '',
      left: 'rotate-90',
      right: '-rotate-90',
    }[orientation];

    // Color bar position (outer edge of property)
    const colorBarPosition = {
      top: 'bottom-0 left-0 right-0 h-[2vmin]',
      bottom: 'top-0 left-0 right-0 h-[2vmin]',
      left: 'top-0 bottom-0 right-0 w-[2vmin]',
      right: 'top-0 bottom-0 left-0 w-[2vmin]',
    }[orientation];

    // Owner band position (inner edge, opposite to color bar)
    const ownerBandPosition = {
      top: 'top-0 left-0 right-0 h-[1.2vmin]',
      bottom: 'bottom-0 left-0 right-0 h-[1.2vmin]',
      left: 'top-0 bottom-0 left-0 w-[1.2vmin]',
      right: 'top-0 bottom-0 right-0 w-[1.2vmin]',
    }[orientation];

    // Check if this square is clickable (property, railroad, or utility)
    const isClickable = ['PROPERTY', 'RAILROAD', 'UTILITY'].includes(square.type);

    return (
      <div
        key={square.id}
        className={`
          relative
          bg-gradient-to-br from-[#e8e4d9] to-[#d4cfc0]
          border-[0.1vmin] border-[#1a472a]/60
          flex flex-col items-center justify-center
          overflow-hidden
          group
          hover:z-10
          transition-transform rounded-[0.75vmin]
          ${isClickable ? 'cursor-pointer' : ''}
        `}
        onClick={() => isClickable && setSelectedProperty(square)}
      >
        {/* Property color bar */}
        {isProperty && square.color && (
          <div
            className={`absolute ${colorBarPosition} shadow-inner`}
            style={{
              backgroundColor: COLOR_NAMES[square.color] || square.color,
              boxShadow: 'inset 0 -0.2vmin 0.4vmin rgba(0,0,0,0.3)'
            }}
          >
            {/* Houses/Hotels display */}
            {(square.houses ?? 0) > 0 && (
              <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                {square.houses === 5 ? (
                  // Hotel
                  <FaHotel className="text-[14px] text-red-600 drop-shadow-md" title="Hotel" />
                ) : (
                  // Houses (1-4)
                  Array.from({ length: square.houses ?? 0 }).map((_, i) => (
                    <GiHouse key={i} className="text-[10px] text-green-600 drop-shadow-md" title={`House ${i + 1}`} />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Main content */}
        <div className={`flex flex-col items-center justify-center p-[0.3vmin] w-full ${contentRotation}`}>
          {/* Icon for non-properties */}
          {icon && (
            <div className="text-[2.5vmin] mb-[0.1vmin] drop-shadow-sm flex justify-center">{icon}</div>
          )}

          {/* Name */}
          <div className="text-[clamp(5px,1.1vmin,12px)] font-bold text-[#1a472a] text-center leading-[1.1] uppercase tracking-tighter overflow-hidden break-words px-1 py-1">
            {square.name}
          </div>

          {/* Price */}
          {(square.price || square.amount) && (
            <div className="text-[clamp(6px,1.3vmin,14px)] font-black text-[#2d5a3d] mt-[0.1vmin]">
              ₹{square.price || square.amount}
            </div>
          )}
        </div>

        {/* Owner color band */}
        {ownerIdx >= 0 && (
          <div
            className={`absolute ${ownerBandPosition} shadow-inner`}
            style={{
              background: `linear-gradient(180deg, ${PLAYER_TOKENS[ownerIdx]?.color} 0%, ${PLAYER_TOKENS[ownerIdx]?.color}CC 100%)`,
              boxShadow: 'inset 0 0.2vmin 0.4vmin rgba(0,0,0,0.3)',
            }}
          />
        )}

        {/* Player Tokens */}
        {playersHere.length > 0 && (
          <div className={`absolute bottom-[0.8vmin] left-1/2 -translate-x-1/2 flex gap-[0.2vmin] ${contentRotation}`}>
            {playersHere.map(p => (
              <MonopolyToken key={p.idx} playerIndex={p.idx} size={24} className="w-[3vmin] h-[3vmin]" />
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
    <div className="flex justify-center p-4 board-tilt items-center min-h-[90vh]">
  <div
    className="
      relative
      preserve-3d
      bg-gradient-to-br from-[#0b3d2e] via-[#0f5132] to-[#021b10]
      p-[1vmin]
      rounded-[2vmin]
      border-[0.5vmin] border-[#c4a35a]
      neon-glow-gold
      shadow-[0_40px_120px_rgba(0,0,0,0.85)]
      aspect-square
    "
    style={{ width: 'min(90vw, 85vmin)', maxWidth: 'none' }}
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
            rounded-[1vmin]
            overflow-hidden
            w-full h-full
          "
          style={{
            gridTemplateColumns: '13% repeat(9, 1fr) 13%',
            gridTemplateRows: '13% repeat(9, 1fr) 13%',
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

              {/* Center Area - 3D Design */}
              {row === 0 && (
                <div
                  className="
                    col-span-9 row-span-9
                    flex flex-col items-center justify-center
                    relative
                    overflow-hidden
                  "
                  style={{
                    background: 'linear-gradient(145deg, #1a5c38 0%, #0d3d24 50%, #082818 100%)',
                    perspective: '1000px',
                  }}
                >
                  {/* 3D Layered background effects */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Glowing orb effect */}
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full opacity-20"
                      style={{
                        background: 'radial-gradient(circle, rgba(196,163,90,0.4) 0%, transparent 70%)',
                        filter: 'blur(20px)',
                      }}
                    />
                    {/* Animated ring 1 */}
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full border-2 border-[#c4a35a]/20 animate-spin"
                      style={{ animationDuration: '30s' }}
                    />
                    {/* Animated ring 2 */}
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full border border-[#c4a35a]/15 animate-spin"
                      style={{ animationDuration: '20s', animationDirection: 'reverse' }}
                    />
                    {/* Corner accents */}
                    <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#c4a35a]/30 rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#c4a35a]/30 rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#c4a35a]/30 rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#c4a35a]/30 rounded-br-lg" />
                  </div>

                  {/* 3D Floating platform for main content */}
                  <div 
                    className="relative z-10 text-center px-[3vmin] py-[2vmin] rounded-[2vmin]"
                    style={{
                      background: 'linear-gradient(180deg, rgba(26,71,42,0.9) 0%, rgba(13,45,26,0.95) 100%)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(196,163,90,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
                      border: '1px solid rgba(196,163,90,0.3)',
                      transform: 'translateZ(30px)',
                    }}
                  >
                    {/* Bank Icon with 3D effect */}
                    <div 
                      className="flex justify-center mb-[1.5vmin] text-[7vmin] text-[#c4a35a]"
                      style={{
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                      }}
                    >
                      <GiTakeMyMoney />
                    </div>
                    
                    {/* Title with 3D text effect */}
                    <h1
                      className="text-[4vmin] font-black tracking-[0.4em] text-transparent bg-clip-text"
                      style={{ 
                        fontFamily: "'Times New Roman', serif",
                        backgroundImage: 'linear-gradient(180deg, #f0e6c8 0%, #c4a35a 50%, #9a7b3a 100%)',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        WebkitBackgroundClip: 'text',
                      }}
                    >
                      MONOPOLY
                    </h1>
                    
                    {/* Decorative line */}
                    <div 
                      className="w-[18vmin] h-[0.4vmin] mx-auto my-[1vmin] rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, #c4a35a 50%, transparent 100%)',
                        boxShadow: '0 0 10px rgba(196,163,90,0.5)',
                      }}
                    />
                    
                    <p 
                      className="text-[1.4vmin] font-semibold tracking-[0.5em] uppercase"
                      style={{ color: '#8fb996' }}
                    >
                      PlayArena Edition
                    </p>

                    {/* 3D Dice display */}
                    {gameState.dice && (
                      <div className="mt-[2.5vmin] flex justify-center gap-[1.5vmin]">
                        <div 
                          className="w-[5.5vmin] h-[5.5vmin] rounded-[0.8vmin] flex items-center justify-center text-[2.2vmin] font-bold"
                          style={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #e0e0e0 100%)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.1)',
                            color: '#1a472a',
                            border: '1px solid rgba(0,0,0,0.1)',
                          }}
                        >
                          {gameState.dice[0]}
                        </div>
                        <div 
                          className="w-[5.5vmin] h-[5.5vmin] rounded-[0.8vmin] flex items-center justify-center text-[2.2vmin] font-bold"
                          style={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #e0e0e0 100%)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.1)',
                            color: '#1a472a',
                            border: '1px solid rgba(0,0,0,0.1)',
                          }}
                        >
                          {gameState.dice[1]}
                        </div>
                      </div>
                    )}

                    {/* 3D Cards display */}
                    <div className="mt-[2vmin] flex justify-center gap-[1.5vmin]">
                      <div 
                        className="w-[7vmin] h-[9vmin] rounded-[0.8vmin] flex items-center justify-center transition-transform hover:scale-105"
                        style={{
                          background: 'linear-gradient(145deg, #ff9a56 0%, #ff6b2b 50%, #e55a1f 100%)',
                          boxShadow: '0 8px 25px rgba(255,107,43,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                          border: '2px solid rgba(255,255,255,0.3)',
                        }}
                      >
                        <GiCardRandom className="text-white text-[3.5vmin] drop-shadow-lg" />
                      </div>
                      <div 
                        className="w-[7vmin] h-[9vmin] rounded-[0.8vmin] flex items-center justify-center transition-transform hover:scale-105"
                        style={{
                          background: 'linear-gradient(145deg, #64b5f6 0%, #2196f3 50%, #1976d2 100%)',
                          boxShadow: '0 8px 25px rgba(33,150,243,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                          border: '2px solid rgba(255,255,255,0.3)',
                        }}
                      >
                        <GiChest className="text-white text-[3.5vmin] drop-shadow-lg" />
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

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          owner={selectedProperty.owner ? players.find(p => p.sessionId === selectedProperty.owner) : undefined}
          ownerIndex={selectedProperty.owner ? players.findIndex(p => p.sessionId === selectedProperty.owner) : undefined}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}