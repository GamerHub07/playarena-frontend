export type PokerPhase =
  | "WAITING"
  | "PREFLOP"
  | "FLOP"
  | "TURN"
  | "RIVER"
  | "SHOWDOWN"
  | "ENDED";

export interface PokerPlayerState {
  sessionId: string;
  username: string;
  chips: number;
  bet: number;
  status: "ACTIVE" | "FOLDED" | "ALL_IN" | "SITTING_OUT";
  hand?: string[]; // ["AH", "Kd"] etc.
  actionRequired?: boolean;
  totalBetThisRound: number;
  position?: number;
}

export interface PokerState {
  phase: PokerPhase;
  currentTurn: number | null;
  pot: number;
  communityCards: string[];
  players: PokerPlayerState[];
  winnerIndex?: number;
  winnerHand?: string;
  currentBet: number;
  minRaise: number;
  lastAggressor: number | null;
  dealerIndex: number;
  smallBlind: number;
  bigBlind: number;
  lastAction?: {
    playerId: string;
    action: string;
    amount?: number;
  };
}