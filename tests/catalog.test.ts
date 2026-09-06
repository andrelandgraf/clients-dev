import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { Catalog } from "../packages/clients/src/schema";
import { Claim, Observation } from "../packages/clients/src/behavior";
import { identify } from "../packages/clients/src/identify";
import { compareBehavior } from "../packages/clients/src/query";
import { clientMarkdown } from "../src/lib/clients/markdown";
import { registryItemSchema } from "shadcn/schema";
const catalog = Catalog.parse(
  JSON.parse(readFileSync("src/data/catalog.json", "utf8")),
);

describe("catalog integrity", () => {
  it("rejects unsupported claims without evidence and unknown assertions", () => {
    expect(
      Claim.safeParse({
        key: "markdownPreference",
        status: "documented",
        value: true,
        note: "Claim without a source",
      }).success,
    ).toBe(false);
    expect(
      Claim.safeParse({
        key: "markdownPreference",
        status: "unknown",
        value: false,
        note: "Unknown is not no",
      }).success,
    ).toBe(false);
    expect(
      Claim.safeParse({
        key: "markdownPreference",
        status: "documented",
        value: "yes",
        note: "Wrong type",
        verified: "2026-09-06",
        evidence: ["source"],
      }).success,
    ).toBe(false);
  });
  it("rejects dangling sources, tool references and invalid dates", () => {
    const changed = structuredClone(catalog);
    const profile = changed.clients.flatMap((c) => c.behaviors)[0];
    if (!profile) throw new Error("No profiles");
    profile.tool = "does-not-exist";
    expect(Catalog.safeParse(changed).success).toBe(false);
    profile.tool = catalog.tools[0].id;
    profile.claims[0].evidence = ["does-not-exist"];
    expect(Catalog.safeParse(changed).success).toBe(false);
    expect(
      Claim.safeParse({
        key: "accept",
        status: "documented",
        value: "text/html",
        note: "x",
        verified: "2026-02-31",
        evidence: ["source"],
      }).success,
    ).toBe(false);
  });
  it("keeps catalog bytes and version stable across an unchanged build", () => {
    const before = readFileSync("src/data/catalog.json", "utf8");
    execFileSync("bun", ["run", "scripts/generate-catalog.ts"]);
    expect(readFileSync("src/data/catalog.json", "utf8")).toBe(before);
  });
});

describe("identity and unknowns", () => {
  it("explains a shared actor without authenticating a client", () => {
    const result = identify(catalog, {
      headers: { "User-Agent": "Claude-User/1.0" },
    });
    expect(result.status).toBe("candidates");
    expect(result.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attribution: "tool",
          actor: "Claude user retrieval",
        }),
      ]),
    );
    expect(result.candidates[0].ambiguity).toContain(
      "does not uniquely identify",
    );
  });
  it("does not identify Accept, partial product names or generic browsers", () => {
    for (const headers of [
      { accept: "text/markdown" },
      { "user-agent": "NotClaude-User/1.0" },
      { "user-agent": "Mozilla/5.0" },
      { "user-agent": "Claude-UserImpostor/1.0" },
    ]) {
      expect(identify(catalog, { headers }).status).toBe("unknown");
    }
  });
  it("retains clients with no researched profile", () => {
    const rows = compareBehavior(catalog, "markdownPreference");
    expect(rows).toHaveLength(catalog.clients.length);
    expect(rows.some((r) => r.profiles.length === 0)).toBe(true);
    expect(
      rows
        .find((r) => r.id === "claude-code")
        ?.profiles.some((p) => p.claims.some((c) => c.value === true)),
    ).toBe(true);
  });
});

it("publishes evidence and conditions in client Markdown", () => {
  const client = catalog.clients.find((c) => c.id === "claude-code");
  if (!client) throw new Error("Missing Claude Code");
  const md = clientMarkdown(client, catalog);
  expect(md).toContain("Explicit Markdown preference: Yes");
  expect(md).toContain("https://code.claude.com/docs/en/tools-reference");
  expect(md).toContain("not shell commands or installed MCP tools");
  expect(md).toContain("Accept header: Unknown");
  expect(md).toContain(catalog.dataVersion);
});

it("ships valid registry items without embedded catalog snapshots", () => {
  for (const name of [
    "client-picker",
    "evidence-badge",
    "client-behavior-table",
  ]) {
    const item = registryItemSchema.parse(
      JSON.parse(readFileSync(`public/r/${name}.json`, "utf8")),
    );
    expect(
      item.files?.some((file) => file.content?.includes("export function")),
    ).toBe(true);
    expect(item.files?.[0].content).not.toContain(catalog.dataVersion);
  }
});

it("rejects credential-bearing observation fields", () => {
  const trace = JSON.parse(
    readFileSync("observations/codex-agent-browser.json", "utf8"),
  );
  expect(Observation.safeParse(trace).success).toBe(true);
  trace.records[0].headers.authorization = "not-a-real-secret";
  expect(Observation.safeParse(trace).success).toBe(false);
});
