import { Metadata } from 'next';
import { ChessThemeProvider } from '@/components/games/chess/ChessTheme';
import { PieceStyleProvider } from '@/components/games/chess/PieceStyle';

export const metadata: Metadata = {
    title: 'Play Chess Online Free | 2 Player Chess Game | PlayArena | VersusArenas',
    description:
        'Play Chess online with a friend for free! Classic 2-player Chess game - no download or signup required. Create a room, share the code, and enjoy the timeless strategy game instantly in your browser.',
    keywords: [
        'chess online',
        'play chess',
        'chess multiplayer',
        'chess game online',
        'free chess game',
        'chess board game',
        'play chess with friends',
        'online chess',
        'chess free',
        '2 player chess',
        'browser chess game',
        'chess no download',
    ],
    openGraph: {
        title: 'Play Chess Online Free - 2 Player Strategy Game | VersusArenas',
        description:
            'Play classic Chess online with a friend. No download required! Create a room and start playing in seconds.',
        type: 'website',
        url: 'https://www.versusarenas.in/games/chess',
        siteName: 'VersusArenas',
        images: [
            {
                url: '/games/chess.png',
                width: 1200,
                height: 630,
                alt: 'Play Chess Online - Classic 2 Player Strategy Game',
            },
        ],
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Play Chess Online Free - VersusArenas',
        description:
            'Play classic Chess with a friend online. No signup needed! Challenge your friend to the ultimate strategy game.',
        images: ['/games/chess.png'],
    },
    alternates: {
        canonical: 'https://versusarenas.in/games/chess',
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
        'application-name': 'VersusArenas Chess',
    },
};

// JSON-LD Structured Data for rich snippets
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Chess Online',
    description:
        'Classic Chess game playable online with a friend. Plan your strategy, control the board, and checkmate your opponent!',
    genre: ['Board Game', 'Strategy', 'Multiplayer'],
    playMode: ['MultiPlayer'],
    numberOfPlayers: {
        '@type': 'QuantitativeValue',
        minValue: 2,
        maxValue: 2,
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
        ratingValue: '4.9',
        ratingCount: '850',
        bestRating: '5',
        worstRating: '1',
    },
    publisher: {
        '@type': 'Organization',
        name: 'VersusArenas',
        url: 'https://versusarenas.in',
    },
    url: 'https://versusarenas.in/games/chess',
    image: 'https://versusarenas.in/games/chess.png',
    inLanguage: 'en',
};

export default function ChessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ChessThemeProvider>
            <PieceStyleProvider>
                {/* JSON-LD Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                {children}
            </PieceStyleProvider>
        </ChessThemeProvider>
    );
}
