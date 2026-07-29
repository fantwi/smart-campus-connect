import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://smart-campus-connect.sites.openai.com"),
  title: "UCC Campus Connect | University of Cape Coast",
  description: "Navigate the University of Cape Coast — facilities, halls, updates, services, and safety in one place.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "UCC Campus Connect",
    description: "Your University of Cape Coast campus, connected.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "UCC Campus Connect" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UCC Campus Connect",
    description: "Your University of Cape Coast campus, connected.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
