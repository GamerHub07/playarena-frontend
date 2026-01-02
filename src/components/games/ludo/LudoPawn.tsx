import { COLORS, ColorKey } from '@/lib/ludoBoardLayout';

interface LudoPawnProps {
  color: ColorKey;
  size?: number;
  glow?: boolean;
}

export default function LudoPawn({
  color,
  size = 28,
  glow = false,
}: LudoPawnProps) {
  const colorInfo = COLORS[color];
  const mainColor = colorInfo.bg;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        filter: glow ? `drop-shadow(0 0 6px ${mainColor})` : 'drop-shadow(0 3px 3px rgba(0,0,0,0.4))',
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Sphere 3D Effects */}
        <radialGradient id="sphere-highlight" cx="30%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="sphere-shadow" cx="60%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
        </radialGradient>

        {/* Cylinder/Body 3D Effects */}
        <linearGradient id="cylinder-body" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
          <stop offset="20%" stopColor="#000000" stopOpacity="0" />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.3" /> {/* Reflective shine */}
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      <g transform="translate(0, 2)">
        {/* 1. Base (Bottom part) */}
        <g>
          {/* Lower rim */}
          <ellipse cx="50" cy="85" rx="32" ry="8" fill={mainColor} />
          <ellipse cx="50" cy="85" rx="32" ry="8" fill="url(#cylinder-body)" />
          {/* Base top surface illusion (darker ring) */}
          <ellipse cx="50" cy="83" rx="28" ry="6" fill="#000000" fillOpacity="0.1" />
        </g>

        {/* 2. Main Body (Conical Stem) */}
        <path
          d="M 38 42 Q 32 65 24 85 L 76 85 Q 68 65 62 42 Z"
          fill={mainColor}
        />
        <path
          d="M 38 42 Q 32 65 24 85 L 76 85 Q 68 65 62 42 Z"
          fill="url(#cylinder-body)"
        />

        {/* 3. Collar (Ring below head) */}
        <g>
          <ellipse cx="50" cy="42" rx="15" ry="5" fill={mainColor} />
          <ellipse cx="50" cy="42" rx="15" ry="5" fill="black" fillOpacity="0.1" /> {/* Slight dim for groove */}
          <ellipse cx="50" cy="42" rx="15" ry="5" fill="url(#cylinder-body)" />
        </g>

        {/* 4. Head (Sphere) */}
        <circle cx="50" cy="24" r="16" fill={mainColor} />
        <circle cx="50" cy="24" r="16" fill="url(#sphere-shadow)" />
        <circle cx="50" cy="24" r="16" fill="url(#sphere-highlight)" />

        {/* Extra gloss reflection */}
        <ellipse cx="42" cy="18" rx="5" ry="3" fill="white" fillOpacity="0.6" transform="rotate(-45 42 18)" />
      </g>
    </svg>
  );
}
