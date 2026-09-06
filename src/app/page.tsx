import Link from "next/link";
import { ClientsTable } from "@/components/clients-table";
import { CopyButton } from "@/components/copy-button";
import { getCompleteClients, getPartialClients } from "@/lib/clients/catalog";
import { clientFacts } from "@/lib/clients/facts";
import { SURFACES } from "@/lib/clients/schema";

export default function HomePage() {
  const complete = getCompleteClients().map(clientFacts);
  const partial = getPartialClients().map(clientFacts);

  return (
    <div className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            How AI clients work
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            The exact file paths and typed fields each client reads —{" "}
            <span className="font-medium text-foreground">
              {complete.length} clients
            </span>{" "}
            with records across all {SURFACES.length} configuration surfaces,
            plus {partial.length} more partially tracked. Readable by you and
            your agent.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          {[
            { cmd: "curl https://clients.dev/api/catalog.json", label: "API" },
            { cmd: "npx add-mcp https://clients.dev/api/mcp", label: "MCP" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-2 rounded-md border border-border/60 bg-secondary/30 py-1 pr-1 pl-2.5"
            >
              <span className="w-7 font-semibold text-muted-foreground">
                {row.label}
              </span>
              <code className="font-mono text-muted-foreground">{row.cmd}</code>
              <CopyButton value={row.cmd} />
            </div>
          ))}
          <p className="pl-1 text-muted-foreground">
            Also:{" "}
            <Link href="/llms.txt" className="text-primary hover:underline">
              llms.txt
            </Link>{" "}
            ·{" "}
            <Link
              href="/api/schemas.json"
              className="text-primary hover:underline"
            >
              JSON Schemas
            </Link>
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 rounded-lg border border-border bg-card p-4 text-sm">
        <Link
          className="font-medium text-primary hover:underline"
          href="/behaviors"
        >
          Explore search, browsers & identification →
        </Link>
        <Link
          className="text-muted-foreground hover:underline"
          href="/methodology"
        >
          Evidence & methodology
        </Link>
        <Link
          className="text-muted-foreground hover:underline"
          href="/developers"
        >
          Package & registry
        </Link>
      </div>
      <ClientsTable clients={complete} partial={partial} />
    </div>
  );
}
