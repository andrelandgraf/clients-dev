import type { Client, SurfaceConfig } from "./schema";
import { SURFACES, type SurfaceId } from "./schema";

/**
 * Derived, presentation-ready facts about clients. The homepage table and the
 * surface comparison pages render these instead of raw surface configs so that
 * "what file do I create?" is answerable without clicking into a client.
 */

export type PathFact = {
  path: string;
  scope: string;
  format: string;
  key?: string;
};

export type SurfaceFact = {
  status: string;
  /** Config file locations, project scope first. */
  paths: PathFact[];
};

export type ClientFacts = {
  id: string;
  name: string;
  vendor: string;
  type?: string;
  homepage?: string;
  /** True when all six surfaces have been verified (any status except missing). */
  complete: boolean;
  surfaces: Partial<Record<SurfaceId, SurfaceFact>>;
};

const SCOPE_ORDER: Record<string, number> = {
  project: 0,
  global: 1,
  enterprise: 2,
};

export function surfaceFact(config: SurfaceConfig): SurfaceFact {
  const paths = [...config.files]
    .sort(
      (a, b) => (SCOPE_ORDER[a.scope] ?? 9) - (SCOPE_ORDER[b.scope] ?? 9),
    )
    .map((file) => ({
      path: file.path,
      scope: file.scope,
      format: file.format,
      key: file.key,
    }));
  return { status: config.status, paths };
}

/**
 * A client is "complete" when every surface has been verified from official
 * docs — i.e. all six surface files exist and none is status "missing".
 * Unsupported counts as complete: knowing a client has no hooks is a fact.
 */
export function isComplete(client: Client): boolean {
  return SURFACES.every((surface) => {
    const config = client.surfaces[surface];
    return config !== undefined && config.status !== "missing";
  });
}

export function clientFacts(client: Client): ClientFacts {
  const surfaces: Partial<Record<SurfaceId, SurfaceFact>> = {};
  for (const surface of SURFACES) {
    const config = client.surfaces[surface];
    if (config) surfaces[surface] = surfaceFact(config);
  }
  return {
    id: client.id,
    name: client.name,
    vendor: client.vendor ?? "",
    type: client.type,
    homepage: client.homepage,
    complete: isComplete(client),
    surfaces,
  };
}

/** Domain of the client homepage, used for favicon lookup. */
export function homepageDomain(homepage?: string): string | undefined {
  if (!homepage) return undefined;
  try {
    return new URL(homepage).hostname;
  } catch {
    return undefined;
  }
}
