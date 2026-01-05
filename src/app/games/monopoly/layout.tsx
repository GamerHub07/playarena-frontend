import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Play Business/Monopoly Online Free | Multiplayer Board Game | VersusArenas',
  description:
    'Play Business (Monopoly-style) online with friends for free! Classic property trading board game - no download or signup required. Buy properties, build houses, and bankrupt your opponents!',
  keywords: [
    'monopoly online',
    'business game online',
    'play monopoly',
    'monopoly multiplayer',
    'free monopoly game',
    'property trading game',
    'play business with friends',
    'online board games',
    'monopoly free',
    'multiplayer monopoly',
    'browser monopoly game',
  ],
  openGraph: {
    title: 'Play Business/Monopoly Online Free - VersusArenas',
    description:
      'Play classic Business board game online with 2-4 friends. Buy properties, collect rent, and dominate the board!',
    type: 'website',
    url: 'https://versusarenas.in/games/business',
    siteName: 'VersusArenas',
    images: [
      {
        url: '/games/business.png',
        width: 1200,
        height: 630,
        alt: 'Play Business/Monopoly Online - Multiplayer Board Game',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play Business/Monopoly Online Free - VersusArenas',
    description:
      'Play classic Business with 2-4 friends online. No signup needed! Buy, trade, and win!',
    images: ['/games/business.png'],
  },
  alternates: {
    canonical: 'https://versusarenas.in/games/business',
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
    'application-name': 'VersusArenas Business',
  },
};

// JSON-LD Structured Data for rich snippets
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Business Online (Monopoly)',
  description:
    'Classic property trading board game playable online with friends. Buy properties, build houses and hotels, collect rent, and bankrupt your opponents!',
  genre: ['Board Game', 'Strategy', 'Multiplayer', 'Economic Simulation'],
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
    ratingValue: '4.7',
    ratingCount: '980',
    bestRating: '5',
    worstRating: '1',
  },
  publisher: {
    '@type': 'Organization',
    name: 'VersusArenas',
    url: 'https://versusarenas.in',
  },
  url: 'https://versusarenas.in/games/business',
  image: 'https://versusarenas.in/games/business.png',
  inLanguage: 'en',
};

export default function MonopolyLayout({
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
