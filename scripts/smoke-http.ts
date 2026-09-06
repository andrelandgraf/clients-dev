import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Catalog } from "../packages/clients/src/schema";
const base = process.argv[2] ?? "http://localhost:4317";
const catalogResponse = await fetch(`${base}/api/v1/catalog.json`);
assert.equal(catalogResponse.status, 200);
const catalog = Catalog.parse(await catalogResponse.json());
const current = await (await fetch(`${base}/api/catalog.json`)).json();
assert.deepEqual(current, catalog);
const comparison = await (
  await fetch(`${base}/api/behaviors/markdownPreference.json`)
).json();
assert.equal(comparison.clients.length, catalog.clients.length);
assert.equal(comparison.dataVersion, catalog.dataVersion);
const markdown = await fetch(`${base}/clients/claude-code.md`);
assert.equal(markdown.status, 200);
assert.match(markdown.headers.get("content-type") ?? "", /text\/markdown/);
assert.match(await markdown.text(), /Explicit Markdown preference: Yes/);
for (const path of [
  "/",
  "/behaviors",
  "/developers",
  "/methodology",
  "/clients/codex",
  "/llms.txt",
  "/api/catalog-schema.json",
  "/r/client-picker.json",
  "/r/evidence-badge.json",
  "/r/client-behavior-table.json",
])
  assert.equal((await fetch(base + path)).status, 200, path);
for (const path of [
  "/clients/not-a-client.md",
  "/api/behaviors/not-a-key.json",
])
  assert.equal((await fetch(base + path)).status, 404, path);
const client = new Client({ name: "clients-dev-smoke", version: "1.0.0" });
try {
  await client.connect(
    new StreamableHTTPClientTransport(new URL(`${base}/api/mcp`)),
  );
  const tools = await client.listTools();
  assert.ok(tools.tools.some((t) => t.name === "compare_behavior"));
  const result = await client.callTool({
    name: "compare_behavior",
    arguments: { key: "markdownPreference" },
  });
  assert.ok(!result.isError);
  assert.match(JSON.stringify(result), /Claude Code/);
  assert.match(JSON.stringify(result), /claude-code-tools/);
  const resources = await client.readResource({ uri: "clients-dev://catalog" });
  assert.match(JSON.stringify(resources), new RegExp(catalog.dataVersion));
} finally {
  await client.close();
}
console.log(
  `HTTP, Markdown, registry and MCP smoke passed: ${base}; data ${catalog.dataVersion}`,
);
