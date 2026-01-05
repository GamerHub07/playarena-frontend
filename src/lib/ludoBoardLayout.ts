/**
 * Ludo Board Layout Configuration
 * Maps game positions to visual grid coordinates (15x15 board)
 */

// Board is 15x15 grid
export const BOARD_SIZE = 15;

// Player colors - Vintage/Classic palette
export const COLORS = {
    RED: { bg: '#8B2635', light: '#D4A5A5', name: 'red' },      // Burgundy red
    GREEN: { bg: '#2D5A3D', light: '#A8C5B5', name: 'green' },  // Forest green
    YELLOW: { bg: '#C9A227', light: '#E8D9A0', name: 'yellow' },// Antique gold
    BLUE: { bg: '#2C4A6E', light: '#A3B8CC', name: 'blue' },    // Navy blue
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
    BLUE: { startRow: 9, startCol: 0 },
    YELLOW: { startRow: 9, startCol: 9 },
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
// RED starts at 0, GREEN at 13, YELLOW at 26, BLUE at 39
export const MAIN_TRACK: [number, number][] = [
    // RED start (position 0) going right
    [6, 1],   // 0 - RED START
    [6, 2],   // 1
    [6, 3],   // 2
    [6, 4],   // 3
    [6, 5],   // 4
    // Turn up toward GREEN
    [5, 6],   // 5
    [4, 6],   // 6
    [3, 6],   // 7
    [2, 6],   // 8 - SAFE
    [1, 6],   // 9
    [0, 6],   // 10
    // Turn right at top
    [0, 7],   // 11
    [0, 8],   // 12
    // GREEN start (position 13) going down
    [1, 8],   // 13 - GREEN START
    [2, 8],   // 14
    [3, 8],   // 15
    [4, 8],   // 16
    [5, 8],   // 17
    // Turn right toward YELLOW
    [6, 9],   // 18
    [6, 10],  // 19
    [6, 11],  // 20
    [6, 12],  // 21 - SAFE
    [6, 13],  // 22
    [6, 14],  // 23
    // Turn down at right side
    [7, 14],  // 24
    [8, 14],  // 25
    // YELLOW start (position 26) going left
    [8, 13],  // 26 - YELLOW START
    [8, 12],  // 27
    [8, 11],  // 28
    [8, 10],  // 29
    [8, 9],   // 30
    // Turn down toward BLUE
    [9, 8],   // 31
    [10, 8],  // 32
    [11, 8],  // 33
    [12, 8],  // 34 - SAFE
    [13, 8],  // 35
    [14, 8],  // 36
    // Turn left at bottom
    [14, 7],  // 37
    [14, 6],  // 38
    // BLUE start (position 39) going up
    [13, 6],  // 39 - BLUE START
    [12, 6],  // 40
    [11, 6],  // 41
    [10, 6],  // 42
    [9, 6],   // 43
    // Turn left toward RED
    [8, 5],   // 44
    [8, 4],   // 45
    [8, 3],   // 46
    [8, 2],   // 47 - SAFE
    [8, 1],   // 48
    [8, 0],   // 49
    // Turn up at left side
    [7, 0],   // 50
    [6, 0],   // 51 - completes the circuit back to RED home entry
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
