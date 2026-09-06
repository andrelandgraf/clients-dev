import {
  mkdirSync,
  copyFileSync,
  writeFileSync,
  readFileSync,
  rmSync,
  readdirSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { z } from "zod";
import { Catalog } from "../packages/clients/src/schema";
const result = spawnSync(
  "bun",
  ["x", "--no-install", "tsc", "-p", "packages/clients/tsconfig.json"],
  { stdio: "inherit" },
);
if (result.status !== 0) process.exit(result.status ?? 1);
const catalog = Catalog.parse(
  JSON.parse(readFileSync("src/data/catalog.json", "utf8")),
);
const out = "packages/clients/dist";
// TypeScript rewrites runtime .ts specifiers; declaration specifiers need the
// emitted .js names as well for consumers without TypeScript source files.
for (const file of readdirSync(out).filter((name) => name.endsWith(".d.ts"))) {
  const path = `${out}/${file}`;
  writeFileSync(
    path,
    readFileSync(path, "utf8").replace(/(from "\.\/[^"\n]+)\.ts"/g, '$1.js"'),
  );
}
rmSync(`${out}/clients`, { recursive: true, force: true });
mkdirSync(`${out}/clients`, { recursive: true });
copyFileSync("src/data/catalog.json", `${out}/catalog.json`);
writeFileSync(
  `${out}/catalog-schema.json`,
  JSON.stringify(z.toJSONSchema(Catalog, { io: "input" }), null, 2) + "\n",
);
for (const client of catalog.clients)
  writeFileSync(
    `${out}/clients/${client.id}.json`,
    JSON.stringify(client, null, 2) + "\n",
  );
for (const name of ["LICENSE", "LICENSE-DATA"])
  copyFileSync(name, `packages/clients/${name}`);
console.log(
  `Built package with ${catalog.clients.length} clients; data ${catalog.dataVersion}`,
);
