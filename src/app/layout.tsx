import type { Metadata } from "next";
import { Inter, Space_Grotesk, Roboto_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://versusarenas.in'),
  title: "VersusArenas - Free Online Multiplayer Games | Play Ludo, Business & More",
  description: "Play classic board games online with friends for free! No downloads, no signup required. Create a room, share the code, and start playing Ludo, Business, Snakes & Ladders instantly.",
  keywords: ["online games", "multiplayer games", "ludo online", "monopoly online", "snakes ladders", "play with friends", "board games", "free games", "versus arenas"],
  authors: [{ name: "VersusArenas" }],
  openGraph: {
    title: "VersusArenas - Free Online Multiplayer Games",
    description: "Play classic board games online with friends. No downloads required.",
    type: "website",
    locale: "en_US",
    siteName: "VersusArenas",
    url: "https://versusarenas.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "VersusArenas - Free Online Multiplayer Games",
    description: "Play classic board games online with friends. No downloads required.",
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
  alternates: {
    canonical: "https://versusarenas.in",
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.png',
  },
};

// JSON-LD Structured Data for the homepage
const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'VersusArenas',
  alternateName: 'Versus Arenas',
  url: 'https://versusarenas.in',
  description: 'Free online multiplayer board games platform. Play Ludo, Business, Snakes & Ladders with friends.',
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VersusArenas',
  url: 'https://versusarenas.in',
  logo: 'https://versusarenas.in/logo.png',
};

const jsonLdGamesList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Available Games',
  description: 'List of multiplayer board games available on VersusArenas',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'VideoGame',
        name: 'Ludo Online',
        url: 'https://versusarenas.in/games/ludo',
        image: 'https://versusarenas.in/games/ludo3.png',
        description: 'Classic Ludo board game for 2-4 players',
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'VideoGame',
        name: 'Business (Monopoly)',
        url: 'https://versusarenas.in/games/monopoly',
        image: 'https://versusarenas.in/games/business2.png',
        description: 'Property trading board game for 2-4 players',
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'VideoGame',
        name: 'Snakes & Ladders',
        url: 'https://versusarenas.in/games/snake-ladder',
        image: 'https://versusarenas.in/games/s&l.png',
        description: 'Classic dice game for 2-4 players',
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'VideoGame',
        name: 'Poker Online',
        url: 'https://versusarenas.in/games/poker',
        image: 'https://versusarenas.in/games/poker1.png',
        description: 'Texas Hold\'em Poker for 2-6 players',
      },
    },
    {
      '@type': 'ListItem',
      position: 5,
      item: {
        '@type': 'VideoGame',
        name: 'Chess Online',
        url: 'https://versusarenas.in/games/chess',
        image: 'https://versusarenas.in/games/chess2.png',
        description: 'Classic Strategy game for 2 players',
      },
    },
    {
      '@type': 'ListItem',
      position: 6,
      item: {
        '@type': 'VideoGame',
        name: 'Tic Tac Toe',
        url: 'https://versusarenas.in/games/tictactoe',
        image: 'https://versusarenas.in/games/tictactoe.png',
        description: 'Classic X and O game for 2 players',
      },
    },
    {
      '@type': 'ListItem',
      position: 7,
      item: {
        '@type': 'VideoGame',
        name: 'Sudoku',
        url: 'https://versusarenas.in/games/sudoku',
        image: 'https://versusarenas.in/games/sudoku2.png',
        description: 'Number puzzle game',
      },
    },
    {
      '@type': 'ListItem',
      position: 8,
      item: {
        '@type': 'VideoGame',
        name: '2048',
        url: 'https://versusarenas.in/games/2048',
        image: 'https://versusarenas.in/games/2048-.png',
        description: 'Slide tile puzzle game',
      },
    },
    {
      '@type': 'ListItem',
      position: 9,
      item: {
        '@type': 'VideoGame',
        name: 'Memory Flip',
        url: 'https://versusarenas.in/games/memory',
        image: 'https://versusarenas.in/games/memory1.png',
        description: 'Card matching memory game',
      },
    },
    {
      '@type': 'ListItem',
      position: 10,
      item: {
        '@type': 'VideoGame',
        name: 'Candy Curse',
        url: 'https://versusarenas.in/games/candy-curse',
        image: 'https://versusarenas.in/games/candy1.png',
        description: 'Match 3 puzzle game',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGamesList) }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${robotoMono.variable} antialiased`}>

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            <AuthProvider>
              {children}
            </AuthProvider>
          </Providers>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
