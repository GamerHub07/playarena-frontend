'use client';

import { useEffect, useRef, useState } from 'react';
import Dice3D from './Dice3D';

const FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 180, y: 0 },
};

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export default function DicePair3D({
  dice,
  seed,
  theme,
}: {
  dice: [number, number];
  seed: number;
  theme: 'dark' | 'classic';
}) {
  const [rotations, setRotations] = useState([
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
  ]);

  const prevDice = useRef<string | null>(null);

  useEffect(() => {
    if (!dice || seed == null) return;

    const key = dice.join('-') + seed;
    if (prevDice.current === key) return;

    const rng = seededRandom(seed);

    const rotate = (current: { x: number; y: number; z: number }, face: number) => {
      const target = FACE_ROTATIONS[face];
      const spins = (2 + Math.floor(rng() * 3)) * 360;

      const modX = ((current.x % 360) + 360) % 360;
      const modY = ((current.y % 360) + 360) % 360;

      return {
        x: current.x + spins + (target.x - modX),
        y: current.y + spins + (target.y - modY),
        z: 0,
      };
    };

    setRotations(prev => [
      rotate(prev[0], dice[0]),
      rotate(prev[1], dice[1]),
    ]);

    prevDice.current = key;
  }, [dice, seed]);

  return (
    <div className="flex gap-[6vmin] perspective-[600px]">
      <Dice3D rotation={rotations[0]} theme={theme} />
      <Dice3D rotation={rotations[1]} theme={theme} />
    </div>
  );
}
