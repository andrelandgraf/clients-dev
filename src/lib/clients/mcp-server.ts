import { ClaimKey } from "../../../packages/clients/src/behavior";
import { compareBehavior } from "../../../packages/clients/src/query";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getCatalog,
  getClient,
  getClients,
  getClientsForSurface,
} from "./catalog";
import { isComplete } from "./facts";
import { surfaceJsonSchema } from "./json-schema";
import { SURFACES, SURFACE_META, type SurfaceId } from "./schema";

/**
 * The clients.dev catalog exposed over MCP, so agents can look up where any
 * client reads its config and which fields that config accepts.
 */

const surfaceParam = z
  .enum(SURFACES)
  .describe("Config surface: mcp, skills, rules, hooks, commands, or settings");

function json(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  };
}

export function createClientsMcpServer(): McpServer {
  const server = new McpServer({
    name: "clients-dev",
    version: "1.0.0",
  });

  server.registerTool(
    "list_clients",
    {
      title: "List AI coding clients",
      description:
        "List every AI coding client in the clients.dev catalog with vendor, type, and which config surfaces are documented.",
      inputSchema: {},
    },
    async () =>
      json(
        getClients().map((client) => ({
          id: client.id,
          name: client.name,
          vendor: client.vendor,
          type: client.type,
          homepage: client.homepage,
          fullyDocumented: isComplete(client),
          configurationCoverage: isComplete(client)
            ? "six-surfaces"
            : "partial",
          behaviorProfiles: client.behaviors.length,
          surfaces: Object.fromEntries(
            SURFACES.filter((surface) => client.surfaces[surface]).map(
              (surface) => [surface, client.surfaces[surface]?.status],
            ),
          ),
        })),
      ),
  );

  server.registerTool(
    "get_client",
    {
      title: "Get a client's full configuration reference",
      description:
        "Everything documented about one client, including behavior profiles and evidence references: config file paths (project/global/enterprise), formats, and the typed fields each surface accepts. Use the client id from list_clients (e.g. cursor, claude-code, codex).",
      inputSchema: {
        id: z.string().describe("Client id, e.g. cursor or claude-code"),
      },
    },
    async ({ id }) => {
      const client = getClient(id);
      if (!client) {
        return json({
          error: `Unknown client "${id}"`,
          availableIds: getClients().map((c) => c.id),
        });
      }
      return json({
        ...client,
        evidence: getCatalog().evidence.filter((e) =>
          client.behaviors.some(
            (b) =>
              b.claims.some((c) => c.evidence.includes(e.id)) ||
              b.identification.some((r) => r.evidence.includes(e.id)),
          ),
        ),
      });
    },
  );

  server.registerTool(
    "compare_surface",
    {
      title: "Compare one surface across all clients",
      description:
        "How every documented client handles one config surface (mcp, skills, rules, hooks, commands, settings) — file paths, formats, transports, and fields. Ideal for questions like 'which clients read AGENTS.md?' or 'where does each client configure MCP servers?'.",
      inputSchema: { surface: surfaceParam },
    },
    async ({ surface }: { surface: SurfaceId }) =>
      json({
        surface,
        ...SURFACE_META[surface],
        clients: getClientsForSurface(surface).map((client) => ({
          id: client.id,
          name: client.name,
          config: client.surfaces[surface],
        })),
      }),
  );

  server.registerTool(
    "get_config_schema",
    {
      title: "Get JSON Schema for a client's config entries",
      description:
        "JSON Schema for the fields a client accepts on one surface — use it to generate or validate config (e.g. an mcpServers entry for .cursor/mcp.json).",
      inputSchema: {
        id: z.string().describe("Client id, e.g. cursor"),
        surface: surfaceParam,
      },
    },
    async ({ id, surface }: { id: string; surface: SurfaceId }) => {
      const client = getClient(id);
      if (!client) {
        return json({
          error: `Unknown client "${id}"`,
          availableIds: getClients().map((c) => c.id),
        });
      }
      const schema = surfaceJsonSchema(client, surface);
      if (!schema) {
        return json({
          error: `No documented fields for ${id}/${surface}`,
          documented: SURFACES.filter(
            (s) => (client.surfaces[s]?.fields.length ?? 0) > 0,
          ),
        });
      }
      return json(schema);
    },
  );

  server.registerTool(
    "compare_behavior",
    {
      title: "Compare client behavior",
      description:
        "Compare search, browsers, request formats or identity signals. Unknown is not unsupported. Includes evidence and applicability conditions.",
      inputSchema: { key: ClaimKey },
    },
    async ({ key }) =>
      json({
        dataVersion: getCatalog().dataVersion,
        clients: compareBehavior(getCatalog(), key),
        evidence: getCatalog().evidence,
        tools: getCatalog().tools,
      }),
  );

  server.registerResource(
    "catalog",
    "clients-dev://catalog",
    {
      title: "Full clients.dev catalog",
      description:
        "The complete catalog of AI coding client configuration surfaces.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(getCatalog(), null, 2),
        },
      ],
    }),
  );

  return server;
}
