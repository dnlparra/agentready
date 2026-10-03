import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgentReady — Local Businesses for AI Agents",
  description:
    "MCP server that makes local SMBs in Mexico discoverable and bookable by AI agents. Hybrid semantic, keyword, and geospatial search over restaurants, clinics, salons, and services.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "AgentReady",
    description: "Local businesses for AI agents. One MCP endpoint.",
    type: "website",
  },
};

function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2.5">
          <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse-dot" aria-hidden="true" />
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900">AgentReady</span>
        </a>
        <div className="flex items-center gap-5 text-[13px] text-neutral-500">
          <a href="/onboard" className="link-subtle hover:text-neutral-900 focus-visible:text-neutral-900">
            Onboard
          </a>
          <a href="/api/health" className="link-subtle hover:text-neutral-900 focus-visible:text-neutral-900">
            Health
          </a>
          <a
            href="https://github.com/dnlparra/agentready"
            target="_blank"
            rel="noopener noreferrer"
            className="link-subtle hover:text-neutral-900 focus-visible:text-neutral-900"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-neutral-400">
        <p>Built for Supabase Select 2026</p>
        <p>Supabase &middot; Vercel &middot; AI SDK 7 &middot; Claude &middot; Gemini &middot; Cursor</p>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <meta name="theme-color" content="#fafafa" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
