/**
 * Ludo Board Layout Configuration
 * Maps game positions to visual grid coordinates (15x15 board)
 */

// Board is 15x15 grid
export const BOARD_SIZE = 15;

// Player colors
export const COLORS = {
    RED: { bg: '#E53935', light: '#FFCDD2', name: 'red' },
    GREEN: { bg: '#43A047', light: '#C8E6C9', name: 'green' },
    YELLOW: { bg: '#FDD835', light: '#FFF9C4', name: 'yellow' },
    BLUE: { bg: '#1E88E5', light: '#BBDEFB', name: 'blue' },
} as const;

export type ColorKey = keyof typeof COLORS;

// Player index to color mapping
export const PLAYER_COLOR_MAP: Record<number, ColorKey> = {
    0: 'RED',
    1: 'GREEN',
    2: 'YELLOW',
    3: 'BLUE',
};

// Home base positions (top-left corner of 6x6 home area)
export const HOME_BASES: Record<ColorKey, { startRow: number; startCol: number }> = {
    RED: { startRow: 0, startCol: 0 },
    GREEN: { startRow: 0, startCol: 9 },
    YELLOW: { startRow: 9, startCol: 0 },
    BLUE: { startRow: 9, startCol: 9 },
};

// Token positions within home base (relative to home base start)
export const HOME_TOKEN_POSITIONS = [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
    { row: 4, col: 1 },
    { row: 4, col: 4 },
];

// The 52-cell main track path coordinates (clockwise from RED start)
// Each entry is [row, col] on the 15x15 grid
export const MAIN_TRACK: [number, number][] = [
    // RED side going up (cells 0-5)
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
    // Turn up to GREEN
    [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
    // GREEN side going right (cells 11-12)
    [0, 7], [0, 8],
    // Turn down
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
    // GREEN side going down (cells 18-23)
    [6, 9], [6, 10], [6, 11], [6, 12], [6, 13],
    // Turn right to BLUE
    [6, 14], [7, 14], [8, 14],
    // BLUE side going left (cells 27-32)
    [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
    // Turn down
    [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
    // BLUE side going down (cells 39-40)
    [14, 7], [14, 6],
    // Turn up
    [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
    // YELLOW side going up (cells 47-51)
    [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
    // Back to RED start area
    [7, 0],
];

// Starting positions for each color on the main track
export const START_POSITIONS: Record<ColorKey, number> = {
    RED: 0,
    GREEN: 13,
    YELLOW: 26,
    BLUE: 39,
};

// Home stretch paths (the 5 cells before reaching center)
export const HOME_STRETCH: Record<ColorKey, [number, number][]> = {
    RED: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
    GREEN: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
    YELLOW: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
    BLUE: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
};

// Safe positions on the main track (star positions)
export const SAFE_TRACK_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

// Center triangles (winning area) - one per color
export const CENTER_TRIANGLES: Record<ColorKey, [number, number][]> = {
    RED: [[7, 6]],
    GREEN: [[6, 7]],
    YELLOW: [[7, 8]],
    BLUE: [[8, 7]],
};

/**
 * Get grid position for a token based on game state
 */
export function getTokenGridPosition(
    playerIndex: number,
    tokenZone: 'home' | 'path' | 'safe' | 'finish',
    tokenIndex: number,
    tokenHomeSlot: number
): { row: number; col: number } | null {
    const color = PLAYER_COLOR_MAP[playerIndex];
    if (!color) return null;

    switch (tokenZone) {
        case 'home': {
            const homeBase = HOME_BASES[color];
            const slot = HOME_TOKEN_POSITIONS[tokenHomeSlot];
            return {
                row: homeBase.startRow + slot.row,
                col: homeBase.startCol + slot.col,
            };
        }
        case 'path': {
            const pos = MAIN_TRACK[tokenIndex];
            if (!pos) return null;
            return { row: pos[0], col: pos[1] };
        }
        case 'safe': {
            // Token is on home stretch
            const homeStretch = HOME_STRETCH[color];
            if (tokenIndex >= 0 && tokenIndex < homeStretch.length) {
                const pos = homeStretch[tokenIndex];
                return { row: pos[0], col: pos[1] };
            }
            return null;
        }
        case 'finish': {
            // Token has finished - show in center
            const center = CENTER_TRIANGLES[color];
            if (center && center[0]) {
                return { row: center[0][0], col: center[0][1] };
            }
            return null;
        }
        default:
            return null;
    }
}

/**
 * Check if a cell is part of the main track
 */
export function isTrackCell(row: number, col: number): boolean {
    return MAIN_TRACK.some(([r, c]) => r === row && c === col);
}

/**
 * Check if a cell is a safe zone (star)
 */
export function isSafeCell(row: number, col: number): boolean {
    return SAFE_TRACK_INDICES.some(idx => {
        const pos = MAIN_TRACK[idx];
        return pos && pos[0] === row && pos[1] === col;
    });
}

/**
 * Get which color's home stretch a cell belongs to
 */
export function getHomeStretchColor(row: number, col: number): ColorKey | null {
    for (const [color, cells] of Object.entries(HOME_STRETCH)) {
        if (cells.some(([r, c]) => r === row && c === col)) {
            return color as ColorKey;
        }
    }
    return null;
}

/**
 * Check if cell is in a home base
 */
export function getHomeBaseColor(row: number, col: number): ColorKey | null {
    for (const [color, base] of Object.entries(HOME_BASES)) {
        if (
            row >= base.startRow && row < base.startRow + 6 &&
            col >= base.startCol && col < base.startCol + 6
        ) {
            // Exclude the path cells that cut through
            if (row >= 6 && row <= 8 && col >= 6 && col <= 8) continue;
            return color as ColorKey;
        }
    }
    return null;
}

/**
 * Check if cell is center area
 */
export function isCenterCell(row: number, col: number): boolean {
    return row >= 6 && row <= 8 && col >= 6 && col <= 8;
}
