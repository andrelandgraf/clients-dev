import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import { ClientFavicon } from "@/components/client-favicon";
import { ConfigSurface } from "@/components/config-surface";
import {
  ClientSurfaceTabs,
  type SurfaceTab,
} from "@/components/client-surface-tabs";
import { getClient, getClientIds } from "@/lib/clients/catalog";
import { homepageDomain } from "@/lib/clients/facts";
import { SURFACES, SURFACE_META, type SurfaceId } from "@/lib/clients/schema";
import { clientTypeLabel, SURFACE_ICON } from "@/lib/clients/display";

function MissingSurface({ surface }: { surface: SurfaceId }) {
  const Icon = SURFACE_ICON[surface];
  return (
    <section className="rounded-xl border border-dashed border-border/60 bg-card/20 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-base font-semibold tracking-tight text-muted-foreground">
              {SURFACE_META[surface].label}
            </h3>
            <span className="inline-flex items-center rounded-full border border-dashed border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Information missing
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            We haven&apos;t verified this surface for this client yet.{" "}
            <a
              href="https://github.com/agent-tooling/clients-dev"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Contribute it
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getClientIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const client = getClient(id);
  if (!client) return {};
  return {
    title: client.name,
    description:
      client.description ??
      `Configuration surfaces for ${client.name}: MCP, skills, rules, hooks, commands, and settings.`,
  };
}

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) notFound();

  const items: SurfaceTab[] = SURFACES.map((surface) => {
    const config = client.surfaces[surface];
    return {
      id: surface,
      label: SURFACE_META[surface].label,
      status: config?.status,
      content: config ? (
        <ConfigSurface surface={surface} config={config} />
      ) : (
        <MissingSurface surface={surface} />
      ),
    };
  });
  const initialTab = items.find((item) => item.status)?.id ?? SURFACES[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> All clients
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <ClientFavicon
              domain={homepageDomain(client.homepage)}
              name={client.name}
              size={32}
            />
            <h1 className="font-mono text-3xl font-bold tracking-tight">
              {client.name}
            </h1>
            {client.type ? (
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-xs text-muted-foreground">
                {clientTypeLabel(client.type)}
              </span>
            ) : null}
          </div>
          {client.vendor ? (
            <p className="mt-1 text-sm text-muted-foreground">{client.vendor}</p>
          ) : null}
          {client.description ? (
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {client.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          {client.homepage ? (
            <a
              href={client.homepage}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
            >
              Website <ArrowUpRight className="h-3 w-3" />
            </a>
          ) : null}
          {client.docs ? (
            <a
              href={client.docs}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
            >
              Docs <ArrowUpRight className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <ClientSurfaceTabs items={items} initialTab={initialTab} />
      </div>
    </div>
  );
}
