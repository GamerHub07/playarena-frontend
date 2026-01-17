'use client';

import DicePair3D from '@/components/dice/DicePair3D';
import React, { useState, useEffect, useRef } from 'react';
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
import {
  FaHotel,
} from 'react-icons/fa';

interface BoardProps {
  gameState: MonopolyGameState;
  players: Player[];
  currentSessionId: string;
  onBuildHouse?: (propertyId: string) => void;
  onBuildHotel?: (propertyId: string) => void;
  onSellProperty?: (propertyId: string) => void;
  onSellHouse?: (propertyId: string) => void;
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

// Color group sizes for monopoly check
const COLOR_GROUP_SIZES: Record<string, number> = {
  brown: 2,
  lightBlue: 3,
  pink: 3,
  orange: 3,
  red: 3,
  yellow: 3,
  green: 3,
  blue: 2,
};

export default function Board({ gameState, players, currentSessionId, onBuildHouse, onBuildHotel, onSellProperty, onSellHouse }: BoardProps) {
  const board = gameState?.board;
  const [selectedProperty, setSelectedProperty] = useState<BoardSquare | null>(null);
  const [theme, setTheme] = useState<'dark' | 'classic'>('dark');

  // THEME CONFIGURATION
  const themeConfig = {
    dark: {
      boardBg: 'radial-gradient(circle at center, #1e293b 0%, #020617 70%)',
      boardShadow: '0 0 50px rgba(0,0,0,0.9),0_0_100px_rgba(15,23,42,0.6)',
      gridGap: '0.4vmin',
      square: {
        bg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        text: '#e2e8f0',
        subText: '#94a3b8',
        iconClass: 'text-slate-400',
        priceBg: 'rgba(255, 255, 255, 0.1)',
        priceBorder: '1px solid rgba(255, 255, 255, 0.2)',
        priceText: '#94a3b8',
        shineOpacity: 1,
      },
      center: {
        bg: 'radial-gradient(circle at center, #1e5128 0%, #0d2b16 100%)', // Rich green
        ringsColor: '#c4a35a',
        titleColor: '#f0e6c8',
        textColor: '#8fb996',
      }
    },
    classic: {
      boardBg: '#dbeafe', // Very light blue/white base
      boardShadow: '0 0 40px rgba(0,0,0,0.2)',
      gridGap: '0.4vmin',
      square: {
        bg: '#ffffff',
        border: '1px solid #cbd5e1',
        text: '#0f172a', // Dark slate/black
        subText: '#64748b',
        iconClass: 'text-slate-500',
        priceBg: '#f1f5f9',
        priceBorder: '1px solid #e2e8f0',
        priceText: '#475569',
        shineOpacity: 0.3,
      },
      center: {
        bg: 'radial-gradient(circle at center, #1e5128 0%, #0d2b16 100%)', // Dark Green (Shared)
        ringsColor: '#c4a35a', // Gold Rings
        titleColor: '#f0e6c8', // Gold Text
        textColor: '#8fb996',
      }
    }
  };

  const activeTheme = themeConfig[theme];


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

  // Check if player owns a complete monopoly
  const hasMonopoly = (playerId: string, color: string): boolean => {
    if (!color || !COLOR_GROUP_SIZES[color]) return false;
    const propertiesOfColor = board.filter(
      s => s.type === 'PROPERTY' && s.color === color
    );
    const ownedCount = propertiesOfColor.filter(s => s.owner === playerId).length;
    return ownedCount === COLOR_GROUP_SIZES[color];
  };

  // Check if can build house on a property (even building rule)
  const canBuildHouseCheck = (property: BoardSquare): boolean => {
    if (!property.color || !property.owner) return false;
    if (!hasMonopoly(property.owner, property.color)) return false;
    const houses = property.houses ?? 0;
    if (houses >= 4) return false;
    const colorProps = board.filter(s => s.type === 'PROPERTY' && s.color === property.color);
    const minHouses = Math.min(...colorProps.map(p => p.houses ?? 0));
    return houses <= minHouses;
  };

  // Check if can build hotel
  const canBuildHotelCheck = (property: BoardSquare): boolean => {
    if (!property.color || !property.owner) return false;
    if (!hasMonopoly(property.owner, property.color)) return false;
    const houses = property.houses ?? 0;
    if (houses !== 4) return false;
    const colorProps = board.filter(s => s.type === 'PROPERTY' && s.color === property.color);
    const minHouses = Math.min(...colorProps.map(p => p.houses ?? 0));
    return minHouses >= 4;
  };

  // Check if can sell house (even selling rule - can only sell if this property has the most houses)
  const canSellHouseCheck = (property: BoardSquare): boolean => {
    if (!property.color || !property.owner) return false;
    const houses = property.houses ?? 0;
    if (houses === 0) return false;
    const colorProps = board.filter(s => s.type === 'PROPERTY' && s.color === property.color);
    const maxHouses = Math.max(...colorProps.map(p => p.houses ?? 0));
    return houses >= maxHouses;
  };

  // Render a corner square with Theme Support
  const renderCornerSquare = (square: BoardSquare, index: number, style?: React.CSSProperties) => {
    const playersHere = getPlayersAt(index);

    const getCornerConfig = () => {
      if (index === 0) { // GO
        return {
          bg: theme === 'dark' ? 'linear-gradient(135deg, #14532d 0%, #052e16 100%)' : '#dcfce7',
          border: '#22c55e',
          icon: <GiCash className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'} text-[4vmin] drop-shadow-md`} />,
          label: 'GO',
          labelColor: theme === 'dark' ? 'text-white/90' : 'text-green-800'
        };
      }
      if (index === 10) { // Jail
        return {
          bg: theme === 'dark' ? 'linear-gradient(135deg, #334155 0%, #0f172a 100%)' : '#f1f5f9',
          border: '#94a3b8',
          icon: <GiPrisoner className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-[4vmin]`} />,
          label: 'JAIL',
          labelColor: theme === 'dark' ? 'text-white/90' : 'text-slate-800'
        };
      }
      if (index === 20) { // Free Parking / Vacation
        return {
          bg: theme === 'dark' ? 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' : '#dbeafe',
          border: '#60a5fa',
          icon: <GiCityCar className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} text-[4vmin] drop-shadow-md`} />,
          label: 'PARKING',
          labelColor: theme === 'dark' ? 'text-white/90' : 'text-blue-800'
        };
      }
      // Go to Jail
      return {
        bg: theme === 'dark' ? 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)' : '#fee2e2',
        border: '#ef4444',
        icon: <GiPoliceOfficerHead className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'} text-[4vmin] drop-shadow-md`} />,
        label: 'ARREST',
        labelColor: theme === 'dark' ? 'text-white/90' : 'text-red-800'
      };
    };

    const config = getCornerConfig();

    // Determine rotation
    let rotation = '';
    if (index === 10) rotation = 'rotate-90';
    if (index === 20) rotation = 'rotate-180';
    if (index === 30) rotation = '-rotate-90';

    return (
      <div
        key={square.id}
        className={`
          relative
          flex flex-col items-center justify-center
          overflow-hidden
          rounded-[1vmin]
          ${rotation}
        `}
        style={{
          ...style,
          background: config.bg,
          border: `2px solid ${config.border}`,
          boxShadow: theme === 'dark'
            ? `inset 0 0 20px rgba(0,0,0,0.5), 0 0 15px ${config.border}40`
            : `inset 0 0 10px rgba(0,0,0,0.05)`,
        }}
      >
        <div className={`text-center ${rotation ? `-${rotation}` : ''} w-full flex flex-col items-center`}>
          {config.icon}
          <div className={`font-black tracking-widest text-[1.2vmin] mt-[0.5vmin] drop-shadow-sm ${config.labelColor}`}>
            {config.label}
          </div>
        </div>

        {/* Tokens */}
        {playersHere.length > 0 && (
          <div className={`absolute inset-0 pointer-events-none`}>
            {playersHere.map((p, i) => (
              <div
                key={p.idx}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform"
                style={{
                  marginLeft: `${(i - (playersHere.length - 1) / 2) * 1.5}vmin`,
                  marginTop: '2vmin'
                }}
              >
                <MonopolyToken playerIndex={p.idx} size={24} className="drop-shadow-lg w-[3vmin] h-[3vmin]" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };


  // Render a regular property square - Theme Aware
  const renderSquare = (square: BoardSquare, index: number, orientation: 'top' | 'bottom' | 'left' | 'right', style?: React.CSSProperties) => {
    const playersHere = getPlayersAt(index);
    const ownerIdx = getOwnerIndex(square.owner);
    const isProperty = square.type === 'PROPERTY';
    const isRailroad = square.type === 'RAILROAD';
    const isUtility = square.type === 'UTILITY';
    const hasOwner = ownerIdx >= 0;

    const getSquareIcon = (sq: BoardSquare) => {
      if (sq.type === 'UTILITY') {
        if (sq.name?.toLowerCase().includes('water')) return <GiWaterDrop className={theme === 'dark' ? "text-cyan-400" : "text-cyan-600"} />;
        return <GiElectric className={theme === 'dark' ? "text-yellow-400" : "text-yellow-600"} />;
      }
      return SQUARE_ICONS[sq.type];
    };

    const icon = getSquareIcon(square);
    const propertyColor = (square.color ? COLOR_NAMES[square.color] : null) || square.color || '#64748b';

    const layout = {
      bottom: {
        textRotate: '',
        badgeStyle: { top: '10%' },
        priceStyle: { bottom: '8%' },
        priceOrigin: 'bottom',
      },
      left: {
        textRotate: 'rotate-90',
        badgeStyle: { right: '10%' },
        priceStyle: { left: '8%' },
        priceOrigin: 'left',
      },
      top: {
        textRotate: 'rotate-180',
        badgeStyle: { bottom: '10%' },
        priceStyle: { top: '8%' },
        priceOrigin: 'top',
      },
      right: {
        textRotate: '-rotate-90',
        badgeStyle: { left: '10%' },
        priceStyle: { right: '8%' },
        priceOrigin: 'right',
      },
    }[orientation];

    const isClickable = ['PROPERTY', 'RAILROAD', 'UTILITY'].includes(square.type);

    return (
      <div
        key={square.id}
        className={`
          relative
          flex items-center justify-center
          overflow-hidden
          group
          ${isClickable ? 'cursor-pointer hover:z-20 hover:brightness-110' : ''}
        `}
        style={{
          ...style,
          width: '100%',
          height: '100%',
          background: activeTheme.square.bg,
          border: hasOwner ? `2px solid ${PLAYER_TOKENS[ownerIdx]?.color}` : activeTheme.square.border,
          borderRadius: '0.5vmin',
          boxShadow: hasOwner
            ? `0 0 10px ${PLAYER_TOKENS[ownerIdx]?.color}80, inset 0 0 20px ${PLAYER_TOKENS[ownerIdx]?.color}20`
            : theme === 'dark' ? 'inset 0 0 10px rgba(0,0,0,0.5)' : 'none',
        }}
        onClick={() => isClickable && setSelectedProperty(square)}
      >
        {/* Shine Effect Overlay */}
        {theme === 'dark' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        )}

        {/* PRICE TAG */}
        {(square.price || square.amount) && (
          <div
            className="absolute z-10 px-[0.6vmin] py-[0.1vmin] rounded-full backdrop-blur-sm flex items-center justify-center"
            style={{
              ...layout.priceStyle,
              background: activeTheme.square.priceBg,
              border: activeTheme.square.priceBorder,
              color: activeTheme.square.priceText,
              fontSize: '0.8vmin',
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transform: ['left', 'right'].includes(orientation) ? 'rotate(90deg)' : 'none',
            }}
          >
            {square.price || square.amount}$
          </div>
        )}

        {/* CENTER CONTENT: Name & Icon */}
        <div
          className={`flex flex-col items-center justify-center z-0 px-[1vmin] ${layout.textRotate}`}
        >
          {/* Main Icon */}
          {(!isProperty || (square.houses || 0) === 0) && icon && (
            <div className={`text-[2vmin] mb-[0.2vmin] drop-shadow-sm filter ${activeTheme.square.iconClass}`}>
              {icon}
            </div>
          )}

          {/* Property Name */}
          <div
            className="font-bold leading-tight uppercase whitespace-pre-wrap text-center"
            style={{
              color: activeTheme.square.text,
              fontSize: '0.85vmin',
              textShadow: theme === 'dark' ? '0 1px 2px rgba(0,0,0,1)' : 'none',
              maxWidth: '6vmin',
            }}
          >
            {square.name}
          </div>
        </div>

        {/* COLOR BADGE / HOUSE DISPLAY */}
        {isProperty && square.color && (
          <div
            className="absolute flex items-center justify-center rounded-full shadow-lg"
            style={{
              ...layout.badgeStyle,
              width: '2.5vmin',
              height: '2.5vmin',
              background: propertyColor,
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: `0 0 10px ${propertyColor}66`,
            }}
          >
            {(square.houses ?? 0) > 0 ? (
              square.houses === 5 ? (
                <FaHotel className="text-white drop-shadow-md text-[1.4vmin]" />
              ) : (
                <div className={`flex flex-col items-center justify-center -space-y-[0.3vmin] ${layout.textRotate}`}>
                  <GiHouse className="text-white drop-shadow-md text-[1.2vmin]" />
                  <span className="text-[0.8vmin] font-bold text-white drop-shadow-md">
                    x{square.houses}
                  </span>
                </div>
              )
            ) : (
              <GiCityCar className={`text-white/80 text-[1.2vmin] ${layout.textRotate}`} />
            )}
          </div>
        )}

        {/* Railroad/Utility Badge */}
        {(isRailroad || isUtility) && (
          <div
            className="absolute flex items-center justify-center rounded-full shadow-lg"
            style={{
              ...layout.badgeStyle,
              width: '2.5vmin',
              height: '2.5vmin',
              background: isRailroad ? '#334155' : '#d97706',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {isRailroad ? (
              <GiSteamLocomotive className={`text-white text-[1.4vmin] ${layout.textRotate}`} />
            ) : (
              <GiElectric className={`text-white text-[1.4vmin] ${layout.textRotate}`} />
            )}
          </div>
        )}

        {/* Player Tokens - Floating orbit style */}
        {playersHere.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {playersHere.map((p, i) => {
              const offset = (i * 360) / playersHere.length;
              return (
                <div
                  key={p.idx}
                  className="absolute left-1/2 top-1/2 transition-all duration-500 ease-out"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${offset}deg) translateY(-1.75vmin) rotate(-${offset}deg)`,
                  }}
                >
                  <MonopolyToken
                    playerIndex={p.idx}
                    size={20}
                    className="drop-shadow-lg shadow-black w-[2.2vmin] h-[2.2vmin]"
                  />
                </div>
              );
            })}
          </div>
        )}


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
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      {/* Theme Toggle Control */}
      <div className="mb-6 flex items-center gap-3 bg-slate-900/80 p-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider ml-3 mr-1">Theme</span>
        <div className="flex bg-slate-950/50 rounded-full p-1 border border-white/5">
          <button
            onClick={() => setTheme('dark')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${theme === 'dark'
              ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-900/50'
              : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            Dark Elegance
          </button>
          <button
            onClick={() => setTheme('classic')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${theme === 'classic'
              ? 'bg-gradient-to-r from-blue-100 to-white text-slate-900 shadow-lg'
              : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            Classic White
          </button>
        </div>
      </div>

      <div className="flex justify-center p-4 board-tilt items-center">
        <div
          className="
            relative
            preserve-3d
            p-[1vmin]
            rounded-[2vmin]
            aspect-square
            transition-all duration-700 ease-in-out
          "
          style={{
            width: 'min(90vw, 85vmin)',
            maxWidth: 'none',
            backgroundImage: activeTheme.boardBg,
            boxShadow: theme === 'classic'
              ? '0 0 40px rgba(196, 163, 90, 0.6), 0 0 80px rgba(196, 163, 90, 0.3)'
              : activeTheme.boardShadow,
            border: theme === 'dark' ? '1px solid #334155' : '12px solid #c4a35a'
          }}
        >
          {/* Decorative corner accents (Theme Aware) */}
          <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg border-[#c4a35a]`} />
          <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg border-[#c4a35a]`} />
          <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg border-[#c4a35a]`} />
          <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg border-[#c4a35a]`} />

          <div
            className="
            grid
            rounded-[1vmin]
            w-full h-full
          "
            style={{
              gap: activeTheme.gridGap,
              gridTemplateColumns: '13% repeat(9, 1fr) 13%',
              gridTemplateRows: '13% repeat(9, 1fr) 13%',
            }}
          >
            {/* Top Row - Explicit Grid Placement */}
            {top.map((idx, i) => {
              const gridStyle = { gridColumn: i + 1, gridRow: 1 };
              if (i === 0) return renderCornerSquare(board[idx], idx, gridStyle);
              if (i === 10) return renderCornerSquare(board[idx], idx, gridStyle);
              return renderSquare(board[idx], idx, 'top', gridStyle);
            })}

            {/* Middle Rows */}
            {/* Middle Rows - Explicit Grid Placement */}
            {left.map((leftIdx, row) => (
              <React.Fragment key={leftIdx}>
                {/* Left Side (Col 1) */}
                {renderSquare(board[leftIdx], leftIdx, 'left', { gridColumn: 1, gridRow: row + 2 })}

                {/* Center Area (Fixed 9x9 in the middle) */}
                {row === 0 && (
                  <div
                    className="
                    flex flex-col items-center justify-center
                    relative
                    overflow-hidden
                    rounded-[1vmin]
                    transition-all duration-500
                  "
                    style={{
                      gridColumn: '2 / span 9',
                      gridRow: '2 / span 9',
                      background: activeTheme.center.bg,
                      boxShadow: 'inset 0 0 50px rgba(0,0,0,0.1)',
                      zIndex: 1
                    }}
                  >
                    {/* Decorative faint rings */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none z-0">
                      <div className="w-[45vmin] h-[45vmin] rounded-full border-[0.2vmin]" style={{ borderColor: activeTheme.center.ringsColor }}></div>
                      <div className="absolute w-[35vmin] h-[35vmin] rounded-full border-[0.2vmin]" style={{ borderColor: activeTheme.center.ringsColor }}></div>
                    </div>

                    {/* Community Chest Deck Placement */}
                    <div
                      className="absolute top-[8%] left-[8%] w-[12vmin] h-[18vmin] rounded border border-white/10 flex flex-col items-center justify-center rotate-[135deg] transform shadow-xl pointer-events-none opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(23, 37, 84, 0.6) 100%)',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(2px)'
                      }}
                    >
                      <div className="w-[90%] h-[90%] border border-dashed border-blue-300/30 rounded flex flex-col items-center justify-center p-1">
                        <GiChest className="text-[4vmin] text-blue-200/80 mb-1" />
                        <span className="text-[0.8vmin] font-bold text-blue-100/70 text-center uppercase tracking-wider">Community<br />Chest</span>
                      </div>
                    </div>

                    {/* Chance Deck Placement */}
                    <div
                      className="absolute bottom-[8%] right-[8%] w-[12vmin] h-[18vmin] rounded border border-white/10 flex flex-col items-center justify-center rotate-[135deg] transform shadow-xl pointer-events-none opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, rgba(194, 65, 12, 0.4) 0%, rgba(124, 45, 18, 0.6) 100%)',
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(2px)'
                      }}
                    >
                      <div className="w-[90%] h-[90%] border border-dashed border-orange-300/30 rounded flex flex-col items-center justify-center p-1">
                        <GiCardRandom className="text-[4vmin] text-orange-200/80 mb-1" />
                        <span className="text-[0.8vmin] font-bold text-orange-100/70 text-center uppercase tracking-wider">Chance</span>
                      </div>
                    </div>

                    {/* MONOPOLY Title */}
                    <h1
                      className="text-[6.5vmin] font-black tracking-[0.4em] select-none pointer-events-none z-10 transition-all duration-500 text-center leading-none mt-4"
                      style={{
                        fontFamily: "'Times New Roman', serif",
                        color: activeTheme.center.titleColor,
                        textShadow: '0 0.5vmin 1vmin rgba(0,0,0,0.5)',
                      }}
                    >
                      MONOPOLY
                    </h1>

                    <div
                      className="text-[1.2vmin] tracking-[0.6em] uppercase mt-2 mb-[4vmin] opacity-90 font-bold transition-colors duration-500 z-10"
                      style={{ color: activeTheme.center.textColor }}
                    >
                      PlayArena Edition
                    </div>

                    {/* Dice Display with 3D Icons */}
                    {gameState.dice && (
                      <div className="mt-[2vmin] flex justify-center z-20">
                        <DicePair3D
                          dice={gameState.dice}
                          seed={gameState.diceSeed ?? (gameState.dice[0] + gameState.dice[1] + (gameState.currentTurnIndex || 0))}
                          theme={theme}
                        />
                      </div>
                    )}




                  </div>
                )}

                {/* Right Side (Col 11) */}
                {renderSquare(board[right[row]], right[row], 'right', { gridColumn: 11, gridRow: row + 2 })}
              </React.Fragment>
            ))}

            {/* Bottom Row - Explicit Grid Placement */}
            {bottom.map((idx, i) => {
              const gridStyle = { gridColumn: i + 1, gridRow: 11 };
              if (i === 0) return renderCornerSquare(board[idx], idx, gridStyle);
              if (i === 10) return renderCornerSquare(board[idx], idx, gridStyle);
              return renderSquare(board[idx], idx, 'bottom', gridStyle);
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
            isMyProperty={selectedProperty.owner === currentSessionId}
            hasMonopoly={selectedProperty.owner && selectedProperty.color ? hasMonopoly(selectedProperty.owner, selectedProperty.color) : false}
            canBuildHouse={canBuildHouseCheck(selectedProperty)}
            canBuildHotel={canBuildHotelCheck(selectedProperty)}
            canSellHouse={canSellHouseCheck(selectedProperty)}
            playerCash={gameState.playerState[currentSessionId]?.cash ?? 0}
            onBuildHouse={(propertyId) => {
              onBuildHouse?.(propertyId);
              setSelectedProperty(null);
            }}
            onBuildHotel={(propertyId) => {
              onBuildHotel?.(propertyId);
              setSelectedProperty(null);
            }}
            onSellProperty={(propertyId) => {
              onSellProperty?.(propertyId);
              setSelectedProperty(null);
            }}
            onSellHouse={(propertyId) => {
              onSellHouse?.(propertyId);
              setSelectedProperty(null);
            }}
          />
        )}
      </div>
    </div>
  );
}