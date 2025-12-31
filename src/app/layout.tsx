import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Providers from "@/components/Providers";
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
  title: "PlayArena - Free Online Multiplayer Games | Play Ludo, Chess & More",
  description: "Play classic board games online with friends. No downloads, no signup required. Create a room, share the code, and start playing Ludo, Chess, Carrom instantly.",
  keywords: ["online games", "multiplayer games", "ludo online", "chess online", "play with friends", "board games", "free games"],
  authors: [{ name: "PlayArena" }],
  openGraph: {
    title: "PlayArena - Free Online Multiplayer Games",
    description: "Play classic board games online with friends. No downloads required.",
    type: "website",
    locale: "en_US",
    siteName: "PlayArena",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlayArena - Free Online Multiplayer Games",
    description: "Play classic board games online with friends. No downloads required.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://playarena.com" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
