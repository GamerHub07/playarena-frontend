'use client';

import React from 'react';
import { PLAYER_TOKENS } from '@/types/monopoly';
import GamePawn from '@/components/games/shared/GamePawn';

interface MonopolyTokenProps {
  playerIndex: number;
  size?: number;
  glow?: boolean;
  className?: string;
}

export default function MonopolyToken({
  playerIndex,
  size = 32,
  glow = false,
  className
}: MonopolyTokenProps) {
  const token = PLAYER_TOKENS[playerIndex] || PLAYER_TOKENS[0];
  const color = token.color;

  return (
    <div className={`inline-flex items-center justify-center ${className || ''}`}>
      <GamePawn
        color={color}
        size={size}
        glow={glow}
        useGoldAccents={true}
      />
    </div>
  );
}
