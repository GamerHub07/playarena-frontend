import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

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
        image: 'https://versusarenas.in/games/ludo.png',
        description: 'Classic Ludo board game for 2-4 players',
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'VideoGame',
        name: 'Business (Monopoly)',
        url: 'https://versusarenas.in/games/business',
        image: 'https://versusarenas.in/games/business.png',
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
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Analytics />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
