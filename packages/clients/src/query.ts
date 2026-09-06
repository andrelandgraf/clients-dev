import type { Catalog } from "./schema.ts";
import type { ClaimKey } from "./behavior.ts";
export function getClient(catalog: Catalog, id: string) {
  return catalog.clients.find((client) => client.id === id);
}
export function compareBehavior(catalog: Catalog, key: ClaimKey) {
  return catalog.clients.map((client) => ({
    id: client.id,
    name: client.name,
    profiles: client.behaviors
      .map((profile) => ({
        ...profile,
        claims: profile.claims.filter((claim) => claim.key === key),
      }))
      .filter((profile) => profile.claims.length > 0),
  }));
}
