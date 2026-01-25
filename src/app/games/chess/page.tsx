import { Metadata } from 'next';
import ChessClient from './ChessClient';

export const metadata: Metadata = {
  title: 'Play Chess Online - 2 Player Strategy Game | VersusArenas',
  description: 'The ultimate game of strategy. Play Chess online with friends or challenge yourself. Checkmate your opponent in this timeless classic.',
  openGraph: {
    title: 'Play Chess Online - Strategy Board Game',
    description: 'Checkmate! Play Chess online with friends.',
    images: ['/games/chess2.png'],
  },
};

export default function ChessPage() {
  return <ChessClient />;
}
