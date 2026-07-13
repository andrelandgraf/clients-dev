import { getClients } from "@/lib/clients/catalog";
import { isComplete } from "@/lib/clients/facts";
import { SURFACES, SURFACE_META } from "@/lib/clients/schema";

export const dynamic = "force-static";

/**
 * llms.txt — a compact, agent-friendly summary of the whole catalog so an
 * agent can answer "where does client X read its Y config?" from one fetch.
 */
export function GET(): Response {
  const clients = getClients();
  const complete = clients.filter(isComplete);
  const partial = clients.filter((client) => !isComplete(client));

  const lines: string[] = [
    "# clients.dev",
    "",
    "> An open, machine-readable database of how AI coding clients (Cursor, Claude Code, Codex, …) are configured: for every client and every config surface, the exact file paths (project/global/enterprise), formats, and typed fields — verified from official vendor docs.",
    "",
    `Surfaces: ${SURFACES.map((s) => `${s} (${SURFACE_META[s].blurb})`).join("; ")}`,
    "",
    "## API",
    "",
    "- [Full catalog](https://clients.dev/api/catalog.json): every client, every surface, one JSON document",
    "- [Single client](https://clients.dev/api/clients/cursor.json): replace `cursor` with any client id below",
    "- [Surface comparison](https://clients.dev/api/mcp.json): one surface across all clients (mcp, skills, rules, hooks, commands, settings)",
    "- [JSON Schemas](https://clients.dev/api/schemas.json): validate/generate config entries per client per surface",
    "- MCP server (Streamable HTTP): https://clients.dev/api/mcp — tools: list_clients, get_client, compare_surface, get_config_schema",
    "",
    "## Fully documented clients",
    "",
  ];

  for (const client of complete) {
    const facts: string[] = [];
    for (const surface of SURFACES) {
      const config = client.surfaces[surface];
      if (!config) continue;
      if (config.status === "unsupported") {
        facts.push(`${surface}: not supported`);
      } else if (config.files.length > 0) {
        facts.push(
          `${surface}: ${config.files.map((file) => file.path).join(", ")}`,
        );
      }
    }
    lines.push(
      `- [${client.name}](https://clients.dev/api/clients/${client.id}.json): ${facts.join(" | ")}`,
    );
  }

  if (partial.length > 0) {
    lines.push("", "## Partially documented clients", "");
    for (const client of partial) {
      const documented = SURFACES.filter((surface) => client.surfaces[surface]);
      lines.push(
        `- [${client.name}](https://clients.dev/api/clients/${client.id}.json): ${documented.join(", ")}`,
      );
    }
  }

  lines.push(
    "",
    "## Contributing",
    "",
    "- [GitHub](https://github.com/agent-tooling/clients-dev): data is plain TOML under configs/<client-id>/, one file per surface; PRs welcome, official docs only",
    "",
  );

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
