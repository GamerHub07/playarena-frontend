import { Metadata } from 'next';
import SnakeLadderClient from './SnakeLadderClient';

export const metadata: Metadata = {
  title: 'Play Snakes and Ladders Online - Multiplayer Dice Game | VersusArenas',
  description: 'Climb the ladders and avoid the snakes! Play Snakes & Ladders online with friends. Classic fun for all ages.',
  openGraph: {
    title: 'Play Snakes and Ladders Online',
    description: 'Roll the dice! Play Snakes & Ladders with friends.',
    images: ['/games/s%26l.png'],
  },
};

export default function SnakeLadderPage() {
  return <SnakeLadderClient />;
}
