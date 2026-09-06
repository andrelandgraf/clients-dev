#!/usr/bin/env bun
/**
 * Compiles the TOML source files under `configs/<client-id>/` into a single
 * validated `src/data/catalog.json`. Mirrors the models.dev compile step:
 * source-of-truth files in, one JSON catalog out.
 */
import { createHash } from "node:crypto";
import {
  Evidence,
  Tool,
  Behavior,
  Observation,
} from "../packages/clients/src/behavior";
import {
  existsSync,
  readdirSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseToml } from "smol-toml";
import {
  Catalog,
  ClientMeta,
  SurfaceConfig,
  SURFACES,
} from "../src/lib/clients/schema";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const configsDir = join(root, "configs");
const outFile = join(root, "src", "data", "catalog.json");

function readToml(path: string): unknown {
  return parseToml(readFileSync(path, "utf-8"));
}

function buildClient(id: string) {
  const dir = join(configsDir, id);
  const metaPath = join(dir, "client.toml");
  if (!existsSync(metaPath)) {
    throw new Error(`Missing client.toml for "${id}"`);
  }
  const meta = ClientMeta.parse(readToml(metaPath));

  const surfaces: Record<string, unknown> = {};
  for (const surface of SURFACES) {
    const surfacePath = join(dir, `${surface}.toml`);
    if (!existsSync(surfacePath)) continue;
    surfaces[surface] = SurfaceConfig.parse(readToml(surfacePath));
  }

  const behaviorDir = join(dir, "behaviors");
  const behaviors = existsSync(behaviorDir)
    ? readdirSync(behaviorDir)
        .filter((name) => name.endsWith(".toml"))
        .sort()
        .map((name) => Behavior.parse(readToml(join(behaviorDir, name))))
    : [];
  return { id, ...meta, surfaces, behaviors };
}

function main() {
  if (!existsSync(configsDir)) {
    throw new Error(`configs/ directory not found at ${configsDir}`);
  }
  const ids = readdirSync(configsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const clients = ids
    .map(buildClient)
    .sort((a, b) => a.name.localeCompare(b.name));

  const evidence = readdirSync(join(root, "evidence"))
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) =>
      Evidence.parse(
        JSON.parse(readFileSync(join(root, "evidence", name), "utf8")),
      ),
    );
  const tools = readdirSync(join(root, "tools"))
    .filter((name) => name.endsWith(".toml"))
    .sort()
    .map((name) => Tool.parse(readToml(join(root, "tools", name))));
  for (const source of evidence) {
    if (source.trace) {
      const path = join(root, source.trace);
      if (!existsSync(path)) throw new Error(`Missing trace: ${source.trace}`);
      const contents = readFileSync(path, "utf8");
      Observation.parse(JSON.parse(contents));
      source.traceSha256 = createHash("sha256").update(contents).digest("hex");
    }
  }
  const content = { schemaVersion: "1.0", evidence, tools, clients };
  const dataVersion = createHash("sha256")
    .update(JSON.stringify(content))
    .digest("hex");
  const previous = existsSync(outFile)
    ? JSON.parse(readFileSync(outFile, "utf8"))
    : undefined;
  const catalog = Catalog.parse({
    ...content,
    dataVersion,
    generatedAt:
      previous?.dataVersion === dataVersion
        ? previous.generatedAt
        : new Date().toISOString(),
  });

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(catalog, null, 2) + "\n");
  console.log(
    `Compiled ${catalog.clients.length} clients -> ${outFile.replace(root + "/", "")}`,
  );
}

main();
