import Link from "next/link";
import { getCatalog } from "@/lib/clients/catalog";
import { BehaviorExplorer } from "@/components/behavior-explorer";
import { IdentityInspector } from "@/components/identity-inspector";
export const metadata = { title: "Search, browsers & identification" };
export default function BehaviorsPage() {
  const catalog = getCatalog();
  const clients = catalog.clients.map(({ id, name, behaviors }) => ({
    id,
    name,
    behaviors,
  }));
  const count = clients.filter((c) => c.behaviors.length).length;
  const identityCatalog = {
    ...catalog,
    clients: catalog.clients
      .filter((c) => c.behaviors.some((b) => b.identification.length))
      .map((c) => ({ ...c, surfaces: {} })),
  };
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <p className="font-mono text-sm text-primary">CLIENT BEHAVIOR</p>
        <h1 className="text-3xl font-bold tracking-tight">
          How clients reach the web
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Search, page retrieval, and browser control are different operations.
          Compare documented behavior by tool and variant, with sources for each
          finding.
        </p>
        <p className="text-sm text-muted-foreground">
          {count} clients researched · {clients.length - count} awaiting
          research ·{" "}
          <Link className="text-primary underline" href="/methodology">
            How we verify claims
          </Link>
        </p>
      </header>
      <BehaviorExplorer clients={clients} evidence={catalog.evidence} />
      <IdentityInspector catalog={identityCatalog} />
    </div>
  );
}
