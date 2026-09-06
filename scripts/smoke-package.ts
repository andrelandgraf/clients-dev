import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
const dir = mkdtempSync(join(tmpdir(), "clients-package-"));
const packed = JSON.parse(
  execFileSync("npm", ["pack", "--json", "--pack-destination", dir], {
    cwd: "packages/clients",
    encoding: "utf8",
  }),
);
const tarball = join(dir, packed[0].filename);
writeFileSync(
  join(dir, "package.json"),
  JSON.stringify({ private: true, type: "module" }),
);
execFileSync(
  "npm",
  ["install", tarball, "--ignore-scripts", "--no-audit", "--no-fund"],
  { cwd: dir, stdio: "inherit" },
);
writeFileSync(
  join(dir, "check.mjs"),
  `
import assert from 'node:assert/strict';
import raw from '@agent-tooling/clients/catalog.json' with {type:'json'};
import single from '@agent-tooling/clients/clients/claude-code.json' with {type:'json'};
import schema from '@agent-tooling/clients/schema.json' with {type:'json'};
import { getClient, compareBehavior, identify } from '@agent-tooling/clients';
import { Catalog } from '@agent-tooling/clients/validate';
const catalog = Catalog.parse(raw);
assert.equal(getClient(catalog, 'claude-code').id, single.id);
assert.equal(compareBehavior(catalog, 'markdownPreference').length, 76);
assert.equal(identify(catalog, {headers:{'user-agent':'Claude-User/1.0'}}).status, 'candidates');
assert.equal(schema.type, 'object');
assert.equal(catalog.dataVersion, '${JSON.parse(readFileSync("src/data/catalog.json", "utf8")).dataVersion}');
console.log('Clean package runtime smoke passed');
`,
);
execFileSync("node", ["check.mjs"], { cwd: dir, stdio: "inherit" });
writeFileSync(
  join(dir, "check.ts"),
  `
import { Catalog } from '@agent-tooling/clients/validate';
import { getClient, identify, type Client } from '@agent-tooling/clients';
const raw = await import('@agent-tooling/clients/catalog.json', { with: { type: 'json' } });
const catalog = Catalog.parse(raw.default);
const client: Client | undefined = getClient(catalog, 'codex');
identify(catalog, { headers: { accept: 'text/markdown' } });
void client;
`,
);
execFileSync(
  "node",
  [
    resolve("node_modules/typescript/bin/tsc"),
    "--strict",
    "--noEmit",
    "--target",
    "es2022",
    "--module",
    "nodenext",
    "--moduleResolution",
    "nodenext",
    "check.ts",
  ],
  { cwd: dir, stdio: "inherit" },
);
console.log(`Clean TypeScript consumer passed. Artifact: ${tarball}`);
