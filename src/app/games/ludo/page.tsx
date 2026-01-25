import { Metadata } from 'next';
import LudoClient from './LudoClient';

export const metadata: Metadata = {
  title: 'Play Ludo Online - Multiplayer Board Game | VersusArenas',
  description: 'Play Ludo online with friends for free. Classic board game strategy, roll the dice, and race to the finish on VersusArenas. No download required.',
  openGraph: {
    title: 'Play Ludo Online - Multiplayer Board Game',
    description: 'Join the fun! Play Ludo online with friends instantly.',
    images: ['/games/ludo3.png'],
  },
};

export default function LudoPage() {
  return <LudoClient />;
}
