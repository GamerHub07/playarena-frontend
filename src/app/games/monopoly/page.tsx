import { Metadata } from 'next';
import MonopolyClient from './MonopolyClient';

export const metadata: Metadata = {
  title: 'Play Business (Monopoly) Online - Multiplayer Trading Game | VersusArenas',
  description: 'Build your empire in Business, the classic property trading board game. Play online with friends, buy properties, and bankrupt opponents.',
  openGraph: {
    title: 'Play Business (Monopoly) Online',
    description: 'Build your empire! Play Business online with friends.',
    images: ['/games/business2.png'],
  },
};

export default function MonopolyPage() {
  return <MonopolyClient />;
}
