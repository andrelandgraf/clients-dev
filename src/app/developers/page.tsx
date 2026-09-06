import Link from "next/link";
import { getCatalog } from "@/lib/clients/catalog";
import { ClientBehaviorTable } from "../../../registry/client-behavior-table";
import { claimText } from "../../../packages/clients/src/behavior";
export const metadata = { title: "API, package & registry" };
export default function DevelopersPage() {
  const catalog = getCatalog();
  const rows = catalog.clients.flatMap((client) =>
    client.behaviors.flatMap((profile) =>
      profile.claims
        .filter((c) => c.key === "markdownPreference")
        .map((claim) => {
          const evidence = catalog.evidence.find((e) =>
            claim.evidence.includes(e.id),
          );
          return {
            id: `${client.id}/${profile.id}`,
            client: client.name,
            operation: profile.operation,
            tool: profile.tool,
            finding: claimText(claim),
            status: claim.status,
            source: evidence
              ? { title: evidence.title, url: evidence.url }
              : undefined,
          };
        }),
    ),
  );
  return (
    <article className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Build with clients.dev</h1>
        <p className="text-muted-foreground">
          One evidence-backed catalog, available as JSON, Markdown, MCP, a
          package build, and reusable components.
        </p>
      </header>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">JSON and Markdown</h2>
        <ul className="space-y-2 text-sm text-primary">
          <li>
            <Link href="/api/v1/catalog.json">Versioned catalog API</Link>
          </li>
          <li>
            <Link href="/api/catalog-schema.json">Catalog JSON Schema</Link>
          </li>
          <li>
            <Link href="/api/behaviors/markdownPreference.json">
              Markdown preference comparison
            </Link>
          </li>
          <li>
            <Link href="/clients/claude-code.md">Claude Code as Markdown</Link>
          </li>
          <li>
            <Link href="/api/evidence.json">Evidence index</Link>
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Connect MCP at https://clients.dev/api/mcp. Use compare_behavior
          alongside the configuration tools.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Core package</h2>
        <p className="text-sm text-muted-foreground">
          The repository builds <code>@agent-tooling/clients</code>: immutable
          catalog snapshots, per-client JSON, types, lookup, comparison and
          identity helpers. Build and pack from source while the first npm
          release is being prepared.
        </p>
        <pre className="overflow-x-auto rounded-lg border bg-muted p-4 text-xs">{`bun run build:package\ncd packages/clients\nnpm pack`}</pre>
        <a
          className="text-sm text-primary underline"
          href="https://github.com/agent-tooling/clients-dev/tree/main/packages/clients"
        >
          Package documentation
        </a>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">shadcn registry</h2>
        <p className="text-sm text-muted-foreground">
          Install the components you need. Supply data from the API or your own
          catalog snapshot; no dataset is copied into your app.
        </p>
        <pre className="overflow-x-auto rounded-lg border bg-muted p-4 text-xs">{`npx shadcn add https://clients.dev/r/client-behavior-table.json\nnpx shadcn add https://clients.dev/r/evidence-badge.json\nnpx shadcn add https://clients.dev/r/client-picker.json`}</pre>
        <Link
          className="text-sm text-primary underline"
          href="/r/registry.json"
        >
          Registry index
        </Link>
        <h3 className="pt-3 font-semibold">
          Live component preview: Markdown requests
        </h3>
        <ClientBehaviorTable rows={rows} dataVersion={catalog.dataVersion} />
      </section>
    </article>
  );
}
