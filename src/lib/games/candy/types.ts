/**
 * Candy Chakachak Types (Client-side)
 */

export type GemType = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PURPLE' | 'ORANGE' | null;
export type SpecialType = 'HORIZONTAL' | 'VERTICAL' | 'BOMB' | null;

export interface CandyGem {
    id: string;
    type: GemType;
    row: number;
    col: number;
    special?: SpecialType;
    isNew?: boolean;
    isMatched?: boolean;
}

export interface CandyState {
    grid: CandyGem[][];
    score: number;
    movesLeft: number;
    targetScore: number;
    isComplete: boolean;
    comboMultiplier: number;
}

export interface CandyMovePayload {
    row1: number;
    col1: number;
    row2: number;
    col2: number;
}
