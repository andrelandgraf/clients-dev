import rawCatalog from "@/data/catalog.json";
import { isComplete } from "./facts";
import { Catalog, type Client, SURFACES, type SurfaceId } from "./schema";

/**
 * The compiled catalog, re-validated at module load. Parsing (rather than
 * casting) keeps everything type-safe without `as` while guaranteeing the
 * committed JSON matches the schema.
 */
const catalog: Catalog = Catalog.parse(rawCatalog);

export function getCatalog(): Catalog {
  return catalog;
}

export function getClients(): Client[] {
  return catalog.clients;
}

/** Clients with every surface verified from official docs (the main table). */
export function getCompleteClients(): Client[] {
  return catalog.clients.filter(isComplete);
}

/** Clients with partial data only — listed separately, never as peer rows. */
export function getPartialClients(): Client[] {
  return catalog.clients.filter((client) => !isComplete(client));
}

export function getClient(id: string): Client | undefined {
  return catalog.clients.find((client) => client.id === id);
}

export function getClientIds(): string[] {
  return catalog.clients.map((client) => client.id);
}

/** All clients that declare support (any status) for a given surface. */
export function getClientsForSurface(surface: SurfaceId): Client[] {
  return catalog.clients.filter((client) => client.surfaces[surface]);
}

export { SURFACES };
export type { Client, SurfaceId };
