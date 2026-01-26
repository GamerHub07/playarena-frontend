import { Metadata } from 'next';
import SudokuClient from './SudokuClient';

export const metadata: Metadata = {
  title: 'Play Sudoku Online - Free Number Puzzle Game | VersusArenas',
  description: 'Challenge your mind with free online Sudoku puzzles. Multiple difficulty levels, clean interface, and daily challenges. Play now on VersusArenas.',
  openGraph: {
    title: 'Play Sudoku Online',
    description: 'Challenge your brain with free online Sudoku puzzles.',
    images: ['/games/sudoku2.png'],
  },
};

export default function SudokuPage() {
  return <SudokuClient />;
}
