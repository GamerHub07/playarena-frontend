import { Metadata } from 'next';
import Game2048Client from './Game2048Client';

export const metadata: Metadata = {
  title: 'Play 2048 Online - Addictive Number Puzzle Strategy | VersusArenas',
  description: 'Join the numbers and get to the 2048 tile! Classic 2048 puzzle game online. Simple, addictive, and fun. Play on mobile or desktop.',
  openGraph: {
    title: 'Play 2048 Online',
    description: 'Can you reach 2048? Play the addictive puzzle game now.',
    images: ['/games/2048-.png'],
  },
};

export default function Game2048Page() {
  return <Game2048Client />;
}
