import { Metadata } from 'next';
import PokerClient from './PokerClient';

export const metadata: Metadata = {
  title: 'Play Poker Online - Texas Hold\'em Multiplayer | VersusArenas',
  description: 'Join the table and play Poker online with friends. Texas Hold\'em style, bluff your way to victory, and win chips. Free multiplayer poker.',
  openGraph: {
    title: 'Play Poker Online - Multiplayer Texas Hold\'em',
    description: 'All in! Play Poker online with friends now.',
    images: ['/games/poker1.png'],
  },
};

export default function PokerPage() {
  return <PokerClient />;
}
