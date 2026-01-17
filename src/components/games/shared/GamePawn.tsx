'use client';

import React from 'react';

interface GamePawnProps {
  color: string;  // Main color (hex)
  size?: number | string;
  glow?: boolean;
  accentColor?: string;
  useGoldAccents?: boolean;
  useWoodTexture?: boolean;
  label?: string;  // Optional label (e.g., player initial)
}

/**
 * A beautiful, premium 3D pawn component that can be used across games.
 * Based on the Ludo pawn design.
 */
export default function GamePawn({
  color,
  size = 28,
  glow = false,
  accentColor = '#FFD700',
  useGoldAccents = true,
  useWoodTexture = false,
  label,
}: GamePawnProps) {
  // Create a unique ID for this pawn instance
  const uniqueId = React.useId().replace(/:/g, '');

  // Darker shade for details
  const getDarkerShade = (hex: string) => {
    // Handle non-hex colors
    if (!hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.floor(r * 0.6)}, ${Math.floor(g * 0.6)}, ${Math.floor(b * 0.6)})`;
  };

  const mainColor = color;
  const darkShade = getDarkerShade(mainColor);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        filter: glow
          ? `drop-shadow(0 0 8px ${mainColor}) drop-shadow(0 0 4px ${accentColor}80)`
          : 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Wood grain gradient (for vintage themes) */}
        <linearGradient id={`wood-grain-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4A574" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#8B7355" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#D4A574" stopOpacity="0.2" />
        </linearGradient>

        {/* Highlight */}
        <radialGradient id={`pawn-highlight-${uniqueId}`} cx="35%" cy="25%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        {/* Shadow for depth */}
        <radialGradient id={`pawn-shadow-${uniqueId}`} cx="65%" cy="65%" r="55%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
        </radialGradient>

        {/* Body shading */}
        <linearGradient id={`body-shade-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
          <stop offset="25%" stopColor="#000000" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.15" />
          <stop offset="75%" stopColor="#000000" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>

        {/* Accent ring (gold for vintage, accent color for others) */}
        <linearGradient id={`accent-ring-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={useGoldAccents ? '#D4AF37' : accentColor} />
          <stop offset="50%" stopColor={useGoldAccents ? '#F4E4A5' : `${accentColor}AA`} />
          <stop offset="100%" stopColor={useGoldAccents ? '#C9A227' : accentColor} />
        </linearGradient>
      </defs>

      <g transform="translate(0, 0)">
        {/* Base platform */}
        <g>
          {/* Base shadow */}
          <ellipse cx="50" cy="92" rx="30" ry="6" fill="rgba(0,0,0,0.3)" />

          {/* Lower base rim */}
          <ellipse cx="50" cy="88" rx="28" ry="7" fill={darkShade} />

          {/* Base top */}
          <ellipse cx="50" cy="86" rx="26" ry="6" fill={mainColor} />
          <ellipse cx="50" cy="86" rx="26" ry="6" fill={`url(#body-shade-${uniqueId})`} />

          {/* Decorative ring on base */}
          {useGoldAccents && (
            <ellipse cx="50" cy="86" rx="22" ry="5" fill="none" stroke={`url(#accent-ring-${uniqueId})`} strokeWidth="1.5" />
          )}
        </g>

        {/* Main body - elegant curved profile */}
        <g>
          {/* Body shape */}
          <path
            d="M 34 45 
               C 28 60 22 78 26 86 
               L 74 86 
               C 78 78 72 60 66 45 
               Z"
            fill={mainColor}
          />
          <path
            d="M 34 45 
               C 28 60 22 78 26 86 
               L 74 86 
               C 78 78 72 60 66 45 
               Z"
            fill={`url(#body-shade-${uniqueId})`}
          />

          {/* Decorative waist band */}
          {useGoldAccents && (
            <ellipse cx="50" cy="65" rx="18" ry="4" fill="none" stroke={`url(#accent-ring-${uniqueId})`} strokeWidth="2" />
          )}
        </g>

        {/* Neck collar */}
        <g>
          <ellipse cx="50" cy="45" rx="17" ry="5" fill={darkShade} />
          <ellipse cx="50" cy="43" rx="15" ry="4" fill={mainColor} />
          <ellipse cx="50" cy="43" rx="15" ry="4" fill={`url(#body-shade-${uniqueId})`} />

          {/* Collar decoration */}
          {useGoldAccents && (
            <ellipse cx="50" cy="43" rx="13" ry="3.5" fill="none" stroke={`url(#accent-ring-${uniqueId})`} strokeWidth="1.5" />
          )}
        </g>

        {/* Neck stem */}
        <rect x="42" y="30" width="16" height="15" rx="2" fill={mainColor} />
        <rect x="42" y="30" width="16" height="15" rx="2" fill={`url(#body-shade-${uniqueId})`} />

        {/* Head - spherical top */}
        <g>
          {/* Main head sphere */}
          <circle cx="50" cy="22" r="18" fill={mainColor} />
          <circle cx="50" cy="22" r="18" fill={`url(#pawn-shadow-${uniqueId})`} />
          <circle cx="50" cy="22" r="18" fill={`url(#pawn-highlight-${uniqueId})`} />

          {/* Wood grain effect for vintage themes */}
          {useWoodTexture && (
            <circle cx="50" cy="22" r="18" fill={`url(#wood-grain-${uniqueId})`} />
          )}

          {/* Crown/top decoration */}
          {useGoldAccents && (
            <>
              <circle cx="50" cy="8" r="4" fill={`url(#accent-ring-${uniqueId})`} />
              <circle cx="50" cy="8" r="2.5" fill={mainColor} />
            </>
          )}

          {/* Highlight glint */}
          <ellipse cx="42" cy="15" rx="4" ry="2.5" fill="white" fillOpacity="0.5" transform="rotate(-30 42 15)" />

          {/* Optional label */}
          {label && (
            <text
              x="50"
              y="27"
              fill="white"
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
            >
              {label}
            </text>
          )}
        </g>

        {/* Glow effect indicator */}
        {glow && (
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={`${accentColor}50`}
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        )}
      </g>
    </svg>
  );
}
