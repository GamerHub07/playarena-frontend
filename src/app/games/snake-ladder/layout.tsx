import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Play Snakes & Ladders Online Free | Multiplayer Board Game | VersusArenas',
  description:
    'Play Snakes and Ladders online with friends for free! Classic dice-rolling board game - no download or signup required. Climb ladders, avoid snakes, and race to the finish!',
  keywords: [
    'snakes and ladders online',
    'play snakes ladders',
    'snake ladder game',
    'snakes ladders multiplayer',
    'free snakes ladders game',
    'saanp seedi online',
    'play with friends',
    'online board games',
    'snakes ladders free',
    'multiplayer snake ladder',
    'browser snake ladder game',
  ],
  openGraph: {
    title: 'Play Snakes & Ladders Online Free - VersusArenas',
    description:
      'Play classic Snakes and Ladders online with 2-4 friends. Roll the dice, climb ladders, avoid snakes!',
    type: 'website',
    url: 'https://versusarenas.in/games/snake-ladder',
    siteName: 'VersusArenas',
    images: [
      {
        url: '/games/s&l.png',
        width: 1200,
        height: 630,
        alt: 'Play Snakes & Ladders Online - Multiplayer Board Game',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play Snakes & Ladders Online Free - VersusArenas',
    description:
      'Play classic Snakes & Ladders with 2-4 friends online. No signup needed! Roll and race to victory!',
    images: ['/games/s&l.png'],
  },
  alternates: {
    canonical: 'https://versusarenas.in/games/snake-ladder',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'application-name': 'VersusArenas Snakes & Ladders',
  },
};

// JSON-LD Structured Data for rich snippets
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Snakes and Ladders Online',
  alternateName: 'Saanp Seedi',
  description:
    'Classic Snakes and Ladders board game playable online with friends. Roll the dice, climb ladders, avoid snakes, and be the first to reach 100!',
  genre: ['Board Game', 'Family', 'Multiplayer', 'Casual'],
  playMode: ['MultiPlayer', 'CoOp'],
  numberOfPlayers: {
    '@type': 'QuantitativeValue',
    minValue: 2,
    maxValue: 4,
  },
  gamePlatform: ['Web Browser', 'Mobile Browser'],
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.6',
    ratingCount: '850',
    bestRating: '5',
    worstRating: '1',
  },
  publisher: {
    '@type': 'Organization',
    name: 'VersusArenas',
    url: 'https://versusarenas.in',
  },
  url: 'https://versusarenas.in/games/snake-ladder',
  image: 'https://versusarenas.in/games/s&l.png',
  inLanguage: 'en',
};

export default function SnakeLadderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
