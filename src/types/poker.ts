export type PokerPhase =
  | 'preflop'
  | 'flop'
  | 'turn'
  | 'river'
  | 'showdown';

export interface PokerPlayerState {
  chips: number;
  bet: number;
  folded: boolean;
  hand: string[];
}

export interface PokerGameState {
  phase: PokerPhase;
  pot: number;
  dealerIndex: number;
  currentPlayer: number;
  communityCards: string[];
  players: PokerPlayerState[];
  winner?: number;
}
