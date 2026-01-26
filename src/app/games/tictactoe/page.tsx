import { Metadata } from 'next';
import TicTacToeClient from './TicTacToeClient';

export const metadata: Metadata = {
  title: 'Play Tic Tac Toe Online - 2 Player XO Game | VersusArenas',
  description: 'The classic game of X and O. Play Tic Tac Toe online for free. Simple, quick, and fun 2-player game.',
  openGraph: {
    title: 'Play Tic Tac Toe Online',
    description: 'X or O? Play Tic Tac Toe online now.',
    images: ['/games/tictactoe.png'],
  },
};

export default function TicTacToePage() {
  return <TicTacToeClient />;
}
