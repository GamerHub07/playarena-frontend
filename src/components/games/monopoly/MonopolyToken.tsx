'use client';

import React from 'react';
import { PLAYER_TOKENS } from '@/types/monopoly';
import GamePawn from '@/components/games/shared/GamePawn';

interface MonopolyTokenProps {
  playerIndex: number;
  size?: number;
  glow?: boolean;
}

export default function MonopolyToken({
  playerIndex,
  size = 24,
  glow = false
}: MonopolyTokenProps) {
  const token = PLAYER_TOKENS[playerIndex] || PLAYER_TOKENS[0];
  const color = token.color;

  return (
    <div className="inline-flex items-center justify-center">
      <GamePawn
        color={color}
        size={size}
        glow={glow}
        useGoldAccents={true}
      />
    </div>
  );
}
