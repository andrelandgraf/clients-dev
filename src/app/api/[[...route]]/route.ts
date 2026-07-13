import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import { StreamableHTTPTransport } from "@hono/mcp";
import {
  getCatalog,
  getClient,
  getClientsForSurface,
} from "@/lib/clients/catalog";
import { schemaIndex, surfaceJsonSchema } from "@/lib/clients/json-schema";
import { createClientsMcpServer } from "@/lib/clients/mcp-server";
import { SURFACES, SURFACE_META, type SurfaceId } from "@/lib/clients/schema";

const app = new Hono().basePath("/api");

app.use("*", cors());

const stripJson = (value: string) => value.replace(/\.json$/, "");

const isSurface = (value: string): value is SurfaceId =>
  (SURFACES as readonly string[]).includes(value);

app.get("/", (c) =>
  c.json({
    name: "clients.dev API",
    description:
      "Machine-readable configuration surfaces for AI coding clients.",
    endpoints: {
      catalog: "/api/catalog.json",
      clients: "/api/clients.json",
      client: "/api/clients/{id}.json",
      surface: "/api/{surface}.json",
      schemas: "/api/schemas.json",
      schema: "/api/schemas/{client}/{surface}.json",
      mcp: "/api/mcp (Streamable HTTP MCP server)",
      llms: "/llms.txt",
    },
    surfaces: SURFACES.map((id) => ({ id, ...SURFACE_META[id] })),
  }),
);

app.get("/catalog.json", (c) => c.json(getCatalog()));

app.get("/clients.json", (c) => c.json(getCatalog().clients));

app.get("/clients/:id", (c) => {
  const client = getClient(stripJson(c.req.param("id")));
  if (!client) return c.json({ error: "client not found" }, 404);
  return c.json(client);
});

app.get("/schemas.json", (c) =>
  c.json({
    description:
      "JSON Schemas for the config entries each client accepts, per surface.",
    schemas: schemaIndex(getCatalog().clients),
  }),
);

app.get("/schemas/:client/:surface", (c) => {
  const client = getClient(c.req.param("client"));
  if (!client) return c.json({ error: "client not found" }, 404);
  const surface = stripJson(c.req.param("surface"));
  if (!isSurface(surface)) return c.json({ error: "unknown surface" }, 404);
  const schema = surfaceJsonSchema(client, surface);
  if (!schema) {
    return c.json({ error: "no documented fields for this surface" }, 404);
  }
  return c.json(schema);
});

// The catalog itself as an MCP server (Streamable HTTP): agents connect to
// https://clients.dev/api/mcp and query config locations + field schemas.
app.all("/mcp", async (c) => {
  const server = createClientsMcpServer();
  const transport = new StreamableHTTPTransport();
  await server.connect(transport);
  return transport.handleRequest(c);
});

app.get("/:surface", (c) => {
  const surface = stripJson(c.req.param("surface"));
  if (!isSurface(surface)) return c.json({ error: "unknown endpoint" }, 404);
  return c.json({
    surface,
    ...SURFACE_META[surface],
    clients: getClientsForSurface(surface).map((client) => ({
      id: client.id,
      name: client.name,
      config: client.surfaces[surface],
    })),
  });
});

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
