
import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: '#1E1B18', // Dark background
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          {/* V shape - Left Wing */}
          <path
            d="M8 12 L20 34 L32 12"
            stroke="url(#logo-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Crossbar / A shape */}
          <path
            d="M14 23 L26 23"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* Center Diamond / Spark */}
          <rect
            x="18"
            y="8"
            width="4"
            height="4"
            transform="rotate(45 20 10)"
            fill="#F59E0B"
          />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
