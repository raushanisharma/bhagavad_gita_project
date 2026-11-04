import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Tiro_Devanagari_Sanskrit } from "next/font/google";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { VisitTracker } from "@/components/VisitTracker";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// Font payload is the biggest cost on a first mobile visit, so only load what
// the design uses: Fraunces with its optical-size axis (no SOFT axis), and Tiro
// for Devanagari only (Sanskrit text never uses its Latin glyphs or italics).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});
const deva = Tiro_Devanagari_Sanskrit({
  variable: "--font-deva",
  subsets: ["devanagari"],
  weight: "400",
  style: "normal",
});

export const metadata: Metadata = {
  title: {
    default: "Gita for Life · The Bhagavad Gita for everyday living",
    template: "%s · Gita for Life",
  },
  description:
    "Find Bhagavad Gita verses for your mood, ask an AI guide for practical wisdom, and see how each shloka applies to real life.",
};

export const viewport: Viewport = {
  themeColor: "#1a110c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} ${deva.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <VisitTracker />
        <SiteHeader />
        <main className="flex-1 w-full pt-16">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
