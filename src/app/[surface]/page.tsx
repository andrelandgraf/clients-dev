import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ClientFavicon } from "@/components/client-favicon";
import { SurfaceCompareTable } from "@/components/surface-compare-table";
import { getClientsForSurface } from "@/lib/clients/catalog";
import { homepageDomain, isComplete } from "@/lib/clients/facts";
import {
  SURFACES,
  SURFACE_META,
  type Client,
  type SurfaceId,
} from "@/lib/clients/schema";
import { SURFACE_ICON } from "@/lib/clients/display";

export const dynamicParams = false;

export function generateStaticParams() {
  return SURFACES.map((surface) => ({ surface }));
}

function asSurface(value: string): SurfaceId | undefined {
  return (SURFACES as readonly string[]).includes(value)
    ? (value as SurfaceId)
    : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ surface: string }>;
}): Promise<Metadata> {
  const { surface } = await params;
  const id = asSurface(surface);
  if (!id) return {};
  return {
    title: `${SURFACE_META[id].label} across clients`,
    description: SURFACE_META[id].blurb,
  };
}

/** Clients whose rules config reads a file named AGENTS.md. */
function readsAgentsMd(client: Client): boolean {
  const rules = client.surfaces.rules;
  if (!rules) return false;
  return rules.files.some((file) =>
    file.path.split("/").pop()?.toLowerCase() === "agents.md",
  );
}

function RulesInterop({ clients }: { clients: Client[] }) {
  const supporters = clients.filter(readsAgentsMd);
  if (supporters.length === 0) return null;
  return (
    <section className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <h2 className="text-sm font-semibold">
        <code className="font-mono">AGENTS.md</code> interop
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {supporters.length} of {clients.length} documented clients read the
        cross-client <code className="font-mono text-xs">AGENTS.md</code>{" "}
        convention — write your rules once and every one of these picks them
        up.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {supporters.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}?tab=rules`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
          >
            <ClientFavicon
              domain={homepageDomain(client.homepage)}
              name={client.name}
              size={14}
            />
            {client.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function SurfacePage({
  params,
}: {
  params: Promise<{ surface: string }>;
}) {
  const { surface } = await params;
  const id = asSurface(surface);
  if (!id) notFound();

  // Clients with six configuration surfaces first, then partial ones, alphabetical within.
  const clients = [...getClientsForSurface(id)].sort((a, b) => {
    const complete = Number(isComplete(b)) - Number(isComplete(a));
    return complete !== 0 ? complete : a.name.localeCompare(b.name);
  });
  const Icon = SURFACE_ICON[id];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Home
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {SURFACE_META[id].label}
            </h1>
            <p className="text-sm text-muted-foreground">
              {SURFACE_META[id].blurb}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          {SURFACES.filter((other) => other !== id).map((other) => {
            const OtherIcon = SURFACE_ICON[other];
            return (
              <Link
                key={other}
                href={`/${other}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <OtherIcon className="h-3.5 w-3.5" />
                {SURFACE_META[other].label}
              </Link>
            );
          })}
        </nav>
      </div>

      {id === "rules" && <RulesInterop clients={clients} />}

      <div className="mt-8">
        <SurfaceCompareTable surface={id} clients={clients} />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Machine-readable:{" "}
        <code className="rounded bg-secondary/50 px-1.5 py-0.5 font-mono text-xs">
          curl https://clients.dev/api/{id}.json
        </code>
      </p>
    </div>
  );
}
