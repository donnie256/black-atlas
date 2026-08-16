import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Black Atlas Denver",
    template: "%s | Black Atlas Denver",
  },
  description:
    "Your guide to everything Black in Denver — restaurants, barbershops, salons, events, and more from Denver's African American, African, and Caribbean community.",
  keywords: [
    "Black-owned Denver",
    "African American Denver",
    "Black businesses Denver",
    "Denver Black community",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Black Atlas Denver",
    url: siteUrl,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
