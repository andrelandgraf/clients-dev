"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HowToUse } from "@/components/how-to-use";
import { SearchCommand, type SearchItem } from "@/components/search-command";
import { SURFACES, SURFACE_META } from "@/lib/clients/schema";

function GitHubMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
    >
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.57 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.34-1.74-1.34-1.74-1.09-.73.08-.72.08-.72 1.21.08 1.84 1.22 1.84 1.22 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.81 0-1.28.47-2.33 1.23-3.15-.12-.3-.53-1.51.12-3.15 0 0 1-.31 3.3 1.2a11.6 11.6 0 0 1 6 0c2.3-1.51 3.3-1.2 3.3-1.2.65 1.64.24 2.85.12 3.15.77.82 1.23 1.87 1.23 3.15 0 4.51-2.81 5.5-5.49 5.79.43.36.81 1.08.81 2.18 0 1.58-.01 2.85-.01 3.24 0 .32.21.69.83.57A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5Z" />
    </svg>
  );
}

export function SiteHeader({ searchItems }: { searchItems: SearchItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-sm font-bold text-primary-foreground">
              c
            </span>
            <span className="font-mono text-lg font-semibold tracking-tight">
              clients<span className="text-primary">.dev</span>
            </span>
          </Link>
          <span className="hidden truncate text-sm text-muted-foreground md:inline">
            AI client configuration & behavior
          </span>
        </div>

        <div className="flex items-center gap-1">
          <nav className="mr-1 hidden items-center lg:flex">
            {SURFACES.map((surface) => (
              <Link
                key={surface}
                href={`/${surface}`}
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {SURFACE_META[surface].label}
              </Link>
            ))}
          </nav>
          <a
            href="https://github.com/agent-tooling/clients-dev"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <GitHubMark />
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Search"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-secondary/40 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            <kbd className="hidden rounded border border-border bg-background px-1.5 font-mono text-[10px] sm:inline">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
          <HowToUse />
        </div>
      </div>
      <nav
        className="flex gap-5 overflow-x-auto border-t border-border/40 px-4 py-2 text-xs sm:px-6"
        aria-label="Explore"
      >
        <Link href="/">Configuration</Link>
        <Link href="/behaviors">Search & browsers</Link>
        <Link href="/methodology">Evidence</Link>
        <Link href="/developers">Developers</Link>
      </nav>
      <SearchCommand open={open} onOpenChange={setOpen} items={searchItems} />
    </header>
  );
}
