import { Metadata } from 'next';
import MemoryClient from './MemoryClient';

export const metadata: Metadata = {
  title: 'Play Memory Flip - Card Matching Game Online | VersusArenas',
  description: 'Test your memory with Memory Flip. Match pairs of cards, improve your concentration, and beat your high score. Free online memory game.',
  openGraph: {
    title: 'Play Memory Flip Online',
    description: 'Test your memory and match the cards!',
    images: ['/games/memory1.png'],
  },
};

export default function MemoryPage() {
  return <MemoryClient />;
}
