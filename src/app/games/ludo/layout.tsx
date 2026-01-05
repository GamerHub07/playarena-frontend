import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Play Ludo Online Free | Multiplayer Board Game | PlayArena | VersusArenas',
  description:
    'Play Ludo online with friends for free! Classic multiplayer Ludo board game - no download or signup required. Create a room, share the code, and enjoy the timeless dice game instantly in your browser.',
  keywords: [
    'ludo online',
    'play ludo',
    'ludo multiplayer',
    'ludo game online',
    'free ludo game',
    'ludo board game',
    'play ludo with friends',
    'online board games',
    'ludo free',
    'multiplayer ludo',
    'browser ludo game',
    'ludo no download',
  ],
  openGraph: {
    title: 'Play Ludo Online Free - Multiplayer Board Game | VersusArenas',
    description:
      'Play classic Ludo board game online with 2-4 friends. No download required! Create a room and start playing in seconds.',
    type: 'website',
    url: 'https://www.versusarenas.in/games/ludo',
    siteName: 'VersusArenas',
    images: [
      {
        url: '/games/ludo.png',
        width: 1200,
        height: 630,
        alt: 'Play Ludo Online - Classic Multiplayer Board Game',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play Ludo Online Free - VersusArenas',
    description:
      'Play classic Ludo with 2-4 friends online. No signup needed! Roll the dice and race your tokens home.',
    images: ['/games/ludo.png'],
  },
  alternates: {
    canonical: 'https://versusarenas.in/games/ludo',
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
    'application-name': 'VersusArenas Ludo',
  },
};

// JSON-LD Structured Data for rich snippets
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Ludo Online',
  description:
    'Classic Ludo board game playable online with friends. Roll the dice, move your tokens, and be the first to get all pieces home!',
  genre: ['Board Game', 'Strategy', 'Multiplayer'],
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
    ratingValue: '4.8',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
  publisher: {
    '@type': 'Organization',
    name: 'VersusArenas',
    url: 'https://versusarenas.in',
  },
  url: 'https://versusarenas.in/games/ludo',
  image: 'https://versusarenas.in/games/ludo.png',
  inLanguage: 'en',
};

export default function LudoLayout({
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
