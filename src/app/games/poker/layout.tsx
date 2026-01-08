import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Play Poker Online Free | Texas Holdem Multiplayer | PlayArena | VersusArenas',
    description:
        'Play Texas Hold\'em Poker online with friends for free! 2-8 player multiplayer poker - no download or signup required. Create a room, share the code, and enjoy poker instantly in your browser.',
    keywords: [
        'poker online',
        'texas holdem',
        'poker multiplayer',
        'poker game online',
        'free poker game',
        'play poker with friends',
        'online poker',
        'poker free',
        'multiplayer poker',
        'browser poker game',
        'poker no download',
    ],
    openGraph: {
        title: 'Play Poker Online Free - Texas Hold\'em Multiplayer | VersusArenas',
        description:
            'Play Texas Hold\'em Poker online with friends. No download required! Create a room and start playing in seconds.',
        type: 'website',
        url: 'https://www.versusarenas.in/games/poker',
        siteName: 'VersusArenas',
        images: [
            {
                url: '/games/poker.png',
                width: 1200,
                height: 630,
                alt: 'Play Poker Online - Texas Hold\'em Multiplayer',
            },
        ],
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Play Poker Online Free - VersusArenas',
        description:
            'Play Texas Hold\'em Poker with friends online. No signup needed! Challenge your friends to a poker tournament.',
        images: ['/games/poker.png'],
    },
    alternates: {
        canonical: 'https://versusarenas.in/games/poker',
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
        'application-name': 'VersusArenas Poker',
    },
};

// JSON-LD Structured Data for rich snippets
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Poker Online - Texas Hold\'em',
    description:
        'Texas Hold\'em Poker game playable online with friends. Bluff, bet, and win the pot!',
    genre: ['Card Game', 'Casino', 'Multiplayer'],
    playMode: ['MultiPlayer'],
    numberOfPlayers: {
        '@type': 'QuantitativeValue',
        minValue: 2,
        maxValue: 8,
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
        ratingCount: '620',
        bestRating: '5',
        worstRating: '1',
    },
    publisher: {
        '@type': 'Organization',
        name: 'VersusArenas',
        url: 'https://versusarenas.in',
    },
    url: 'https://versusarenas.in/games/poker',
    image: 'https://versusarenas.in/games/poker.png',
    inLanguage: 'en',
};

export default function PokerLayout({
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
