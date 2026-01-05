// Ludo Board Theme Configuration
// Each theme defines a complete visual style for the board

export interface ThemeDecoration {
  // Corner decorations (emoji or text symbols)
  cornerSymbols?: string[];
  // Decorative elements around the board
  borderElements?: string[];
  // Center area decoration
  centerEmoji: string;
  // Safe cell indicator
  safeIndicator: string;
  // Start cell indicator
  startIndicator: string;

  // NEW — large cinematic elements
  sceneElements?: {
    symbol: string;            // emoji or SVG id
    position: {
      top?: string;
      bottom?: string;
      left?: string;
      right?: string;
    };
    size?: string;              // px (120–300 recommended)
    offset?: { x?: number; y?: number };
    opacity?: number;
    flip?: boolean;
    rotation?: number;
    float?: boolean;            // Enable floating animation
  }[];

  // OPTIONAL — subtle ground / atmosphere
  foregroundElements?: {
    symbol: string;
    position: { bottom?: string; left?: string; right?: string };
    opacity?: number;
  }[];

  // Ambient decorations (scattered around the board)
  ambientElements?: {
    symbol: string;
    positions: { top: string; left: string; rotation?: number; opacity?: number }[];
  }[];
  // Custom SVG patterns or overlays
  patternOverlay?: string;
}

export interface LudoTheme {
  id: string;
  name: string;
  description: string;

  // Player Colors
  playerColors: {
    red: { bg: string; light: string };
    green: { bg: string; light: string };
    yellow: { bg: string; light: string };
    blue: { bg: string; light: string };
  };

  // Board Colors
  board: {
    background: string;          // Main page background
    boardFrame: string;          // Outer frame of the board
    boardFrameBorder: string;    // Border of the frame
    innerBoard: string;          // Inner board background
    cellBackground: string;      // Regular track cell color
    cellBorder: string;          // Cell border color
    safeStarColor: string;       // Star/safe cell indicator
    centerBackground: string;    // Center area background
    centerAccent: string;        // Center trophy area
  };

  // UI Colors
  ui: {
    cardBackground: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accentColor: string;
    buttonGradientStart: string;
    buttonGradientEnd: string;
    buttonBorder: string;
  };

  // Dice Colors
  dice: {
    background: string;
    dotColor: string;
    borderColor: string;
    shadowColor: string;
  };

  // Special Effects
  effects: {
    useWoodTexture: boolean;
    useGoldAccents: boolean;
    fontFamily: string;
  };

  // Theme-specific decorations
  decorations: ThemeDecoration;
}

// ============================================
// THEME PRESETS
// ============================================

export const THEMES: Record<string, LudoTheme> = {
  vintage: {
    id: 'vintage',
    name: 'Vintage Classic',
    description: 'Classic wooden board game aesthetic',

    playerColors: {
      red: { bg: '#8B2635', light: '#D4A5A5' },
      green: { bg: '#2D5A3D', light: '#A8C5B5' },
      yellow: { bg: '#C9A227', light: '#E8D9A0' },
      blue: { bg: '#2C4A6E', light: '#A3B8CC' },
    },

    board: {
      background: 'linear-gradient(145deg, #3D2E1F 0%, #2A1F14 50%, #1A1410 100%)',
      boardFrame: 'linear-gradient(145deg, #8B7355 0%, #5D4E37 50%, #3D2E1F 100%)',
      boardFrameBorder: '#6B5344',
      innerBoard: '#5D4E37',
      cellBackground: '#F5F5DC',
      cellBorder: 'rgba(139, 119, 101, 0.5)',
      safeStarColor: '#C9A227',
      centerBackground: '#5D4E37',
      centerAccent: 'linear-gradient(145deg, #C9A227 0%, #8B7355 50%, #5D4E37 100%)',
    },

    ui: {
      cardBackground: '#5D4E37',
      cardBorder: '#8B7355',
      textPrimary: '#FFF8DC',
      textSecondary: '#D4C8B8',
      textMuted: '#8B7355',
      accentColor: '#C9A227',
      buttonGradientStart: '#C9A227',
      buttonGradientEnd: '#8B7355',
      buttonBorder: '#D4AF37',
    },

    dice: {
      background: 'linear-gradient(145deg, #FFF8DC 0%, #F5DEB3 30%, #DEB887 70%, #D2B48C 100%)',
      dotColor: '#3D2415',
      borderColor: '#8B7355',
      shadowColor: 'rgba(93, 78, 57, 0.5)',
    },

    effects: {
      useWoodTexture: true,
      useGoldAccents: true,
      fontFamily: 'Georgia, serif',
    },

    decorations: {
      centerEmoji: '🏆',
      safeIndicator: '✦',
      startIndicator: '➤',

      sceneElements: [
        {
          symbol: '📜',
          position: { top: '10%', left: '6%' },
          size: '6rem',
          opacity: 0.25,
        },
        {
          symbol: '⚜',
          position: { bottom: '10%', right: '6%' },
          size: '6rem',
          opacity: 0.3,
        }
      ],
    }

  },

  modern: {
    id: 'modern',
    name: 'Modern Dark',
    description: 'Sleek, contemporary dark theme',

    playerColors: {
      red: { bg: '#E53935', light: '#FFCDD2' },
      green: { bg: '#43A047', light: '#C8E6C9' },
      yellow: { bg: '#FDD835', light: '#FFF9C4' },
      blue: { bg: '#1E88E5', light: '#BBDEFB' },
    },

    board: {
      background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
      boardFrame: 'linear-gradient(145deg, #3d3d3d 0%, #1a1a1a 100%)',
      boardFrameBorder: '#2a2a2a',
      innerBoard: '#2a2a2a',
      cellBackground: '#ffffff',
      cellBorder: '#d0d0d0',
      safeStarColor: '#FFA500',
      centerBackground: '#2a2a2a',
      centerAccent: '#1a1a1a',
    },

    ui: {
      cardBackground: '#1a1a1a',
      cardBorder: '#2a2a2a',
      textPrimary: '#ffffff',
      textSecondary: '#888888',
      textMuted: '#555555',
      accentColor: '#3b82f6',
      buttonGradientStart: '#3b82f6',
      buttonGradientEnd: '#2563eb',
      buttonBorder: '#3b82f6',
    },

    dice: {
      background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
      dotColor: '#1a1a1a',
      borderColor: '#d0d0d0',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
    },

    effects: {
      useWoodTexture: false,
      useGoldAccents: false,
      fontFamily: 'system-ui, sans-serif',
    },

    decorations: {
      cornerSymbols: ['◢', '◣', '◤', '◥'],
      centerEmoji: '🏆',
      safeIndicator: '★',
      startIndicator: '▶',
      ambientElements: [
        {
          symbol: '⬡',
          positions: [
            { top: '8%', left: '8%', opacity: 0.08 },
            { top: '8%', left: '92%', opacity: 0.08 },
            { top: '92%', left: '8%', opacity: 0.08 },
            { top: '92%', left: '92%', opacity: 0.08 },
          ]
        }
      ],
    },
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean Deep',
    description: 'Tranquil underwater adventure',

    playerColors: {
      red: { bg: '#E74C3C', light: '#FADBD8' },
      green: { bg: '#1ABC9C', light: '#A3E4D7' },
      yellow: { bg: '#F4D03F', light: '#FCF3CF' },
      blue: { bg: '#2E86AB', light: '#AED6F1' },
    },

    board: {
      background: 'linear-gradient(180deg, #0C3547 0%, #1A5276 30%, #0E4D64 60%, #0A2E3C 100%)',
      boardFrame: 'linear-gradient(145deg, #1A5276 0%, #0E4D64 50%, #0C3547 100%)',
      boardFrameBorder: '#5DADE2',
      innerBoard: '#154360',
      cellBackground: '#E8F8F5',
      cellBorder: 'rgba(93, 173, 226, 0.5)',
      safeStarColor: '#F4D03F',
      centerBackground: '#1A5276',
      centerAccent: 'linear-gradient(145deg, #5DADE2 0%, #1ABC9C 100%)',
    },

    ui: {
      cardBackground: '#154360',
      cardBorder: '#5DADE2',
      textPrimary: '#ECF0F1',
      textSecondary: '#AED6F1',
      textMuted: '#5DADE2',
      accentColor: '#1ABC9C',
      buttonGradientStart: '#1ABC9C',
      buttonGradientEnd: '#16A085',
      buttonBorder: '#48C9B0',
    },

    dice: {
      background: 'linear-gradient(145deg, #E8F8F5 0%, #D1F2EB 100%)',
      dotColor: '#154360',
      borderColor: '#5DADE2',
      shadowColor: 'rgba(26, 82, 118, 0.5)',
    },

    effects: {
      useWoodTexture: false,
      useGoldAccents: false,
      fontFamily: 'system-ui, sans-serif',
    },

    decorations: {
      centerEmoji: '🐙',
      safeIndicator: '⚓',
      startIndicator: '🚢',

      sceneElements: [
        {
          symbol: '🐋',
          position: { top: '12%', left: '5%' },
          size: '8rem',
          opacity: 0.4,
          float: true,
        },
        {
          symbol: '🌊',
          position: { bottom: '8%', right: '5%' },
          size: '7rem',
          opacity: 0.35,
        }
      ],
    }
  },

  nature: {
    id: 'nature',
    name: 'Forest Garden',
    description: 'Calming natural green tones',

    playerColors: {
      red: { bg: '#C0392B', light: '#F5B7B1' },
      green: { bg: '#27AE60', light: '#ABEBC6' },
      yellow: { bg: '#F39C12', light: '#FCF3CF' },
      blue: { bg: '#2980B9', light: '#AED6F1' },
    },

    board: {
      background: 'linear-gradient(145deg, #1E3A2B 0%, #0F2318 50%, #0A1A12 100%)',
      boardFrame: 'linear-gradient(145deg, #2D5A3D 0%, #1E3A2B 50%, #0F2318 100%)',
      boardFrameBorder: '#3D7A5A',
      innerBoard: '#1E3A2B',
      cellBackground: '#F5F5DC',
      cellBorder: 'rgba(61, 122, 90, 0.5)',
      safeStarColor: '#F39C12',
      centerBackground: '#1E3A2B',
      centerAccent: 'linear-gradient(145deg, #27AE60 0%, #1E8449 100%)',
    },

    ui: {
      cardBackground: '#1E3A2B',
      cardBorder: '#3D7A5A',
      textPrimary: '#E8F5E9',
      textSecondary: '#A5D6A7',
      textMuted: '#4CAF50',
      accentColor: '#81C784',
      buttonGradientStart: '#27AE60',
      buttonGradientEnd: '#1E8449',
      buttonBorder: '#2ECC71',
    },

    dice: {
      background: 'linear-gradient(145deg, #F5F5DC 0%, #E8E4C9 100%)',
      dotColor: '#1E3A2B',
      borderColor: '#3D7A5A',
      shadowColor: 'rgba(30, 58, 43, 0.5)',
    },

    effects: {
      useWoodTexture: true,
      useGoldAccents: false,
      fontFamily: 'Georgia, serif',
    },

    decorations: {
      centerEmoji: '🦋',
      safeIndicator: '🍀',
      startIndicator: '🌱',

      sceneElements: [
        {
          symbol: '🐍',
          position: { top: '10%', right: '8%' },
          size: '7rem',
          rotation: -20,
          opacity: 0.45,
          float: true,
        },
        {
          symbol: '🌳',
          position: { bottom: '5%', left: '5%' },
          size: '8rem',
          opacity: 0.35,
        },
        {
          symbol: '🍃',
          position: { top: '50%', left: '2%' },
          size: '6rem',
          opacity: 0.25,
          float: true,
        }
      ],
    }

  },

  royal: {
    id: 'royal',
    name: 'Royal Palace',
    description: 'Luxurious purple and gold royalty',

    playerColors: {
      red: { bg: '#9B2335', light: '#E8B4BC' },
      green: { bg: '#1B4332', light: '#95D5B2' },
      yellow: { bg: '#DAA520', light: '#F5E6C8' },
      blue: { bg: '#1B3A5F', light: '#A8CEED' },
    },

    board: {
      background: 'linear-gradient(145deg, #2C1654 0%, #1A0F2E 50%, #0D0717 100%)',
      boardFrame: 'linear-gradient(145deg, #4A2C7A 0%, #2C1654 50%, #1A0F2E 100%)',
      boardFrameBorder: '#DAA520',
      innerBoard: '#2C1654',
      cellBackground: '#FFF8E7',
      cellBorder: 'rgba(218, 165, 32, 0.5)',
      safeStarColor: '#DAA520',
      centerBackground: '#2C1654',
      centerAccent: 'linear-gradient(145deg, #DAA520 0%, #B8860B 50%, #8B6914 100%)',
    },

    ui: {
      cardBackground: '#2C1654',
      cardBorder: '#DAA520',
      textPrimary: '#FFF8E7',
      textSecondary: '#E6D5B8',
      textMuted: '#9A7B4F',
      accentColor: '#DAA520',
      buttonGradientStart: '#DAA520',
      buttonGradientEnd: '#B8860B',
      buttonBorder: '#FFD700',
    },

    dice: {
      background: 'linear-gradient(145deg, #FFF8E7 0%, #F5E6C8 100%)',
      dotColor: '#2C1654',
      borderColor: '#DAA520',
      shadowColor: 'rgba(44, 22, 84, 0.5)',
    },

    effects: {
      useWoodTexture: false,
      useGoldAccents: true,
      fontFamily: 'Playfair Display, serif',
    },

    decorations: {
      centerEmoji: '👑',
      safeIndicator: '💎',
      startIndicator: '🏰',

      sceneElements: [
        {
          symbol: '🏰',
          position: { top: '8%', left: '5%' },
          size: '8rem',
          opacity: 0.4,
        },
        {
          symbol: '👑',
          position: { top: '5%', right: '5%' },
          size: '6rem',
          opacity: 0.5,
          float: true,
        },
      ],
    }
  },
};

// Default theme
export const DEFAULT_THEME_ID = 'modern';

// Get theme by ID
export function getTheme(themeId: string): LudoTheme {
  return THEMES[themeId] || THEMES[DEFAULT_THEME_ID];
}

// Get all available themes
export function getAllThemes(): LudoTheme[] {
  return Object.values(THEMES);
}
