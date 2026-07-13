"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Favicon of the client's homepage domain (integrations.sh-style), with a
 * monogram fallback when the favicon is missing or fails to load.
 */
export function ClientFavicon({
  domain,
  name,
  size = 20,
  className,
}: {
  domain?: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!domain || failed) {
    return (
      <span
        style={{ width: size, height: size }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-secondary font-mono text-[10px] font-semibold text-muted-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external favicons, no optimization needed
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("shrink-0 rounded-md", className)}
    />
  );
}
