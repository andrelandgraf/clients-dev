import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import type { SearchItem } from "@/components/search-command";
import { getClients } from "@/lib/clients/catalog";
import { clientTypeLabel } from "@/lib/clients/display";
import { SURFACES, SURFACE_META } from "@/lib/clients/schema";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clients.dev"),
  title: {
    default: "clients.dev — AI coding client configuration database",
    template: "%s | clients.dev",
  },
  description:
    "An open, machine-readable database of how AI coding clients (Cursor, Claude Code, Codex, and more) are configured: MCP, skills, rules, hooks, commands, and settings.",
  openGraph: {
    title: "clients.dev",
    description:
      "How every AI coding client is configured — MCP, skills, rules, hooks, commands, settings.",
    url: "https://clients.dev",
    siteName: "clients.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "clients.dev",
    description:
      "How every AI coding client is configured — MCP, skills, rules, hooks, commands, settings.",
  },
};

function buildSearchItems(): SearchItem[] {
  const clients = getClients().map<SearchItem>((client) => ({
    type: "client",
    title: client.name,
    subtitle: clientTypeLabel(client.type) || "Client",
    href: `/clients/${client.id}`,
    keywords: [client.id, client.vendor ?? ""].filter(Boolean),
  }));
  const surfaces = SURFACES.map<SearchItem>((surface) => ({
    type: "surface",
    title: SURFACE_META[surface].label,
    subtitle: SURFACE_META[surface].blurb,
    href: `/${surface}`,
    keywords: [surface],
  }));
  return [...clients, ...surfaces];
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex h-dvh flex-col overflow-hidden antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader searchItems={buildSearchItems()} />
          <main className="flex-1 overflow-y-auto">{children}</main>
          <SiteFooter />
          <Toaster richColors position="top-center" />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
