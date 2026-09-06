import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
const dir = mkdtempSync(join(tmpdir(), "clients-registry-"));
const packages = [
  "next",
  "react",
  "react-dom",
  "typescript",
  "@types/react",
  "@types/node",
  "tailwindcss",
  "@tailwindcss/postcss",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  "radix-ui",
  "lucide-react",
];
const dependencies = Object.fromEntries(
  packages.map((name) => [
    name,
    JSON.parse(readFileSync(`node_modules/${name}/package.json`, "utf8"))
      .version,
  ]),
);
writeFileSync(
  join(dir, "package.json"),
  JSON.stringify({
    name: "clients-registry-consumer",
    private: true,
    scripts: { dev: "next dev" },
    dependencies,
  }),
);
mkdirSync(join(dir, "app"));
mkdirSync(join(dir, "lib"));
writeFileSync(
  join(dir, "components.json"),
  JSON.stringify({
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: true,
    tsx: true,
    tailwind: {
      config: "",
      css: "app/globals.css",
      baseColor: "neutral",
      cssVariables: true,
    },
    aliases: {
      components: "@/components",
      ui: "@/components/ui",
      utils: "@/lib/utils",
      lib: "@/lib",
      hooks: "@/hooks",
    },
  }),
);
writeFileSync(
  join(dir, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      lib: ["dom", "esnext"],
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      module: "esnext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      esModuleInterop: true,
      resolveJsonModule: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./*"] },
    },
    include: ["**/*.ts", "**/*.tsx"],
    exclude: ["node_modules"],
  }),
);
writeFileSync(
  join(dir, "lib/utils.ts"),
  `import {clsx,type ClassValue} from 'clsx'; import {twMerge} from 'tailwind-merge'; export function cn(...v:ClassValue[]){return twMerge(clsx(v))}`,
);
writeFileSync(join(dir, "app/globals.css"), '@import "tailwindcss";\n');
writeFileSync(
  join(dir, "postcss.config.mjs"),
  'export default {plugins:{"@tailwindcss/postcss":{}}};',
);
writeFileSync(
  join(dir, "app/layout.tsx"),
  `import './globals.css'; export default function Layout({children}:{children:React.ReactNode}) {return <html><body>{children}</body></html>}`,
);
execFileSync(
  "npm",
  ["install", "--ignore-scripts", "--no-audit", "--no-fund"],
  { cwd: dir, stdio: "inherit" },
);
execFileSync(
  "node",
  [
    resolve("node_modules/shadcn/dist/index.js"),
    "add",
    "--yes",
    "--overwrite",
    "--cwd",
    dir,
    ...["client-picker", "evidence-badge", "client-behavior-table"].map(
      (name) => `http://localhost:4317/r/${name}.json`,
    ),
  ],
  { stdio: "inherit" },
);
const catalog = JSON.parse(readFileSync("src/data/catalog.json", "utf8"));
const client = catalog.clients.find(
  (c: { id: string }) => c.id === "claude-code",
);
const evidence = catalog.evidence.find(
  (e: { id: string }) => e.id === "claude-code-tools",
);
const props = {
  clients: catalog.clients.map((c: { id: string; name: string }) => ({
    id: c.id,
    name: c.name,
  })),
  dataVersion: catalog.dataVersion,
  rows: [
    {
      id: "claude-fetch",
      client: client.name,
      operation: "fetch",
      tool: "WebFetch",
      finding: String(
        client.behaviors
          .find((p: { id: string }) => p.id === "web-fetch")
          .claims.find((c: { key: string }) => c.key === "markdownPreference")
          .value,
      ),
      status: "documented",
      source: { title: evidence.title, url: evidence.url },
    },
  ],
};
writeFileSync(join(dir, "app/data.json"), JSON.stringify(props));
writeFileSync(
  join(dir, "app/page.tsx"),
  `"use client"; import {useState} from 'react'; import {ClientPicker} from '@/components/client-picker'; import {EvidenceBadge} from '@/components/evidence-badge'; import {ClientBehaviorTable} from '@/components/client-behavior-table'; import data from './data.json'; export default function Page(){const [value,setValue]=useState('claude-code');return <main className="mx-auto max-w-4xl space-y-6 p-8"><h1>Registry consumer</h1><ClientPicker clients={data.clients} value={value} onChange={setValue}/><p>Selected: {value}</p><EvidenceBadge status="documented" verified="2026-09-06"/><ClientBehaviorTable rows={data.rows} dataVersion={data.dataVersion}/></main>}`,
);
execFileSync(
  "node",
  [
    resolve("node_modules/typescript/bin/tsc"),
    "--noEmit",
    "-p",
    join(dir, "tsconfig.json"),
  ],
  { stdio: "inherit" },
);
console.log(`Registry installed and typechecked in ${dir}`);
writeFileSync("/tmp/clients-registry-consumer-path", dir);
