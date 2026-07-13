import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ClientFavicon } from "@/components/client-favicon";
import { CopyButton } from "@/components/copy-button";
import { StatusPill } from "@/components/status-pill";
import { homepageDomain } from "@/lib/clients/facts";
import type { Client, SurfaceId } from "@/lib/clients/schema";
import { clientTypeLabel } from "@/lib/clients/display";

/**
 * Side-by-side comparison of one surface across clients: every row shows the
 * actual config file paths plus the surface-specific facts (transports,
 * events, invocation) so differences are scannable without clicking through.
 */

function extraColumns(surface: SurfaceId): { header: string; kind: "transports" | "auth" | "invocation" | "events" | "fields" }[] {
  switch (surface) {
    case "mcp":
      return [
        { header: "Transports", kind: "transports" },
        { header: "Auth", kind: "auth" },
      ];
    case "skills":
    case "commands":
      return [
        { header: "Invocation", kind: "invocation" },
        { header: "Fields", kind: "fields" },
      ];
    case "hooks":
      return [{ header: "Events", kind: "events" }];
    case "rules":
      return [{ header: "Fields", kind: "fields" }];
    case "settings":
      return [{ header: "Fields", kind: "fields" }];
  }
}

function ChipList({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <span className="text-xs text-muted-foreground/50">—</span>;
  }
  return (
    <span className="flex flex-wrap gap-1">
      {values.map((value) => (
        <Badge key={value} variant="secondary" className="font-mono text-[10px]">
          {value}
        </Badge>
      ))}
    </span>
  );
}

export function SurfaceCompareTable({
  surface,
  clients,
}: {
  surface: SurfaceId;
  clients: Client[];
}) {
  const extras = extraColumns(surface);

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-secondary/30 text-left">
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Config files</th>
            {extras.map((column) => (
              <th key={column.header} className="px-3 py-3 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const config = client.surfaces[surface];
            if (!config) return null;
            return (
              <tr
                key={client.id}
                className="border-b border-border/40 align-top transition-colors last:border-0 hover:bg-secondary/20"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/clients/${client.id}?tab=${surface}`}
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
                        {clientTypeLabel(client.type)}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <StatusPill status={config.status} />
                </td>
                <td className="px-3 py-3">
                  {config.files.length === 0 ? (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  ) : (
                    <div className="space-y-1">
                      {config.files.map((file) => (
                        <div
                          key={`${file.path}-${file.scope}`}
                          className="group/path flex items-center gap-1.5"
                        >
                          <code
                            title={file.path}
                            className="max-w-[22rem] truncate font-mono text-xs"
                          >
                            {file.path}
                          </code>
                          <Badge
                            variant="outline"
                            className="px-1 py-0 text-[9px] text-muted-foreground"
                          >
                            {file.scope}
                          </Badge>
                          <span className="opacity-0 transition-opacity group-hover/path:opacity-100">
                            <CopyButton value={file.path} />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                {extras.map((column) => (
                  <td key={column.header} className="px-3 py-3">
                    {column.kind === "fields" ? (
                      config.fields.length > 0 ? (
                        <Link
                          href={`/clients/${client.id}?tab=${surface}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {config.fields.length} fields
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">
                          —
                        </span>
                      )
                    ) : (
                      <ChipList values={config[column.kind]} />
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
