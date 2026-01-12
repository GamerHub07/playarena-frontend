'use client';

import { motion } from 'framer-motion';

interface Dice3DProps {
  rotation: { x: number; y: number; z: number };
  theme: 'dark' | 'classic';
}

export default function Dice3D({ rotation, theme }: Dice3DProps) {
  return (
    <motion.div
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
        rotateZ: rotation.z,
      }}
      transition={{
        duration: 3,
        type: 'spring',
        stiffness: 45,
        damping: 10,
        mass: 1.2,
      }}
      className="relative w-[8vmin] h-[8vmin]"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Inner core */}
      <div
        className={`absolute inset-0 ${theme === 'dark' ? 'bg-[#f8fafc]' : 'bg-[#dc2626]'
          }`}
        style={{ transform: 'rotateY(90deg)' }}
      />
      <div
        className={`absolute inset-0 ${theme === 'dark' ? 'bg-[#f8fafc]' : 'bg-[#dc2626]'
          }`}
        style={{ transform: 'rotateX(90deg)' }}
      />
      <div
        className={`absolute inset-0 ${theme === 'dark' ? 'bg-[#f8fafc]' : 'bg-[#dc2626]'
          }`}
      />

      {[1, 2, 3, 4, 5, 6].map(face => {
        const pipsMap: Record<number, number[]> = {
          1: [4],
          2: [0, 8],
          3: [0, 4, 8],
          4: [0, 2, 6, 8],
          5: [0, 2, 4, 6, 8],
          6: [0, 2, 3, 5, 6, 8],
        };

        const transformMap: Record<number, string> = {
          1: 'translateZ(4vmin)',
          2: 'rotateX(90deg) translateZ(4vmin)',
          3: 'rotateY(90deg) translateZ(4vmin)',
          4: 'rotateY(-90deg) translateZ(4vmin)',
          5: 'rotateX(-90deg) translateZ(4vmin)',
          6: 'rotateY(180deg) translateZ(4vmin)',
        };

        return (
          <div
            key={face}
            className={`
              absolute inset-0 grid grid-cols-3 grid-rows-3
              p-[1.2vmin] gap-[0.8vmin]
              rounded-[1.2vmin]
              ${theme === 'dark'
                ? 'bg-[#f8fafc] text-black'
                : 'bg-[#dc2626] text-white'
              }
            `}
            style={{
              transform: transformMap[face],
              backfaceVisibility: 'hidden',
            }}
          >
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                {pipsMap[face].includes(i) && (
                  <div className="w-full h-full rounded-full bg-current" />
                )}
              </div>
            ))}
          </div>
        );
      })}
    </motion.div>
  );
}
