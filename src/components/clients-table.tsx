"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ClientFavicon } from "@/components/client-favicon";
import type { ClientFacts, SurfaceFact } from "@/lib/clients/facts";
import { homepageDomain } from "@/lib/clients/facts";
import { SURFACES, SURFACE_META, type SurfaceId } from "@/lib/clients/schema";
import { CLIENT_TYPE_LABEL, clientTypeLabel } from "@/lib/clients/display";
import { cn } from "@/lib/utils";

/**
 * The homepage facts table: one row per client with six configuration surfaces, one column
 * per surface, and every cell a real file path (models.dev-style) instead of
 * a status dot.
 */

function SurfaceCell({
  clientId,
  surface,
  fact,
}: {
  clientId: string;
  surface: SurfaceId;
  fact?: SurfaceFact;
}) {
  if (!fact) {
    return <span className="text-xs text-muted-foreground/50">—</span>;
  }
  if (fact.status === "unsupported") {
    return (
      <span className="text-xs text-muted-foreground/60 italic">
        not supported
      </span>
    );
  }
  const [primary, ...rest] = fact.paths;
  return (
    <Link
      href={`/clients/${clientId}?tab=${surface}`}
      className="group/cell block"
    >
      {primary ? (
        <>
          <code
            title={primary.path}
            className="block max-w-[11.5rem] truncate font-mono text-xs group-hover/cell:text-primary"
          >
            {primary.path}
          </code>
          <span className="mt-0.5 block text-[10px] text-muted-foreground">
            {fact.status === "partial" && (
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-middle" />
            )}
            {fact.status === "deprecated" && (
              <span className="mr-1 text-muted-foreground/80">deprecated ·</span>
            )}
            {rest.length > 0
              ? `${primary.scope} +${rest.length} more`
              : primary.scope}
          </span>
        </>
      ) : (
        <span
          className={cn(
            "text-xs",
            fact.status === "partial"
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground",
          )}
        >
          {fact.status === "supported" ? "supported" : fact.status}
        </span>
      )}
    </Link>
  );
}

export function ClientsTable({
  clients,
  partial,
}: {
  clients: ClientFacts[];
  partial: ClientFacts[];
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("all");

  const types = useMemo(() => {
    const present = new Set(
      clients.map((client) => client.type).filter((t): t is string => !!t),
    );
    return ["all", ...Object.keys(CLIENT_TYPE_LABEL).filter((t) => present.has(t))];
  }, [clients]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients
      .filter((client) =>
        type === "all" ? true : client.type === type,
      )
      .filter((client) =>
        q
          ? `${client.name} ${client.vendor} ${client.id}`
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, query, type]);

  const filteredPartial = useMemo(() => {
    const q = query.trim().toLowerCase();
    return partial
      .filter((client) =>
        q
          ? `${client.name} ${client.vendor} ${client.id}`
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [partial, query]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter clients…"
            className="h-9 w-full rounded-md border border-border/60 bg-secondary/30 pr-3 pl-9 text-sm outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {types.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              className={cn(
                "rounded-md px-2 py-1 font-medium transition-colors",
                type === option
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option === "all" ? "All" : CLIENT_TYPE_LABEL[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/30 text-left">
              <th className="sticky left-0 z-10 bg-secondary/30 px-4 py-3 font-medium backdrop-blur-sm">
                Client
              </th>
              {SURFACES.map((surface) => (
                <th key={surface} className="px-3 py-3 font-medium">
                  <Link
                    href={`/${surface}`}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {SURFACE_META[surface].label}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr
                key={client.id}
                className="border-b border-border/40 align-top transition-colors last:border-0 hover:bg-secondary/20"
              >
                <td className="sticky left-0 z-10 bg-background/95 px-4 py-3 backdrop-blur-sm">
                  <Link
                    href={`/clients/${client.id}`}
                    className="group flex items-center gap-2.5"
                  >
                    <ClientFavicon
                      domain={homepageDomain(client.homepage)}
                      name={client.name}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium group-hover:text-primary">
                        {client.name}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {[client.vendor, clientTypeLabel(client.type)]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </Link>
                </td>
                {SURFACES.map((surface) => (
                  <td key={surface} className="px-3 py-3">
                    <SurfaceCell
                      clientId={client.id}
                      surface={surface}
                      fact={client.surfaces[surface]}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={SURFACES.length + 1}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  No clients match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredPartial.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold">More clients</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Partially documented — only the surfaces we have verified so far.{" "}
            <a
              href="https://github.com/agent-tooling/clients-dev"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Help complete them
            </a>
            .
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPartial.map((client) => {
              const documented = SURFACES.filter(
                (surface) => client.surfaces[surface],
              );
              return (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="group flex items-center gap-2.5 rounded-lg border border-border/50 px-3 py-2.5 transition-colors hover:border-primary/40"
                >
                  <ClientFavicon
                    domain={homepageDomain(client.homepage)}
                    name={client.name}
                    size={18}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium group-hover:text-primary">
                      {client.name}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {documented
                      .map((surface) => SURFACE_META[surface].label.toLowerCase())
                      .join(" · ")}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
