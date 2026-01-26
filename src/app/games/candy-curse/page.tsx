import { Metadata } from 'next';
import CandyClient from './CandyClient';

export const metadata: Metadata = {
  title: 'Play Candy Curse - Match 3 Puzzle Adventure | VersusArenas',
  description: 'Swap and match candies in Candy Curse, a vibrant and exciting match-3 puzzle game. Clear levels and unleash sweet combos.',
  openGraph: {
    title: 'Play Candy Curse Online',
    description: 'Match 3 and win! Play Candy Curse puzzle game.',
    images: ['/games/candy1.png'],
  },
};

export default function CandyPage() {
  return <CandyClient />;
}
