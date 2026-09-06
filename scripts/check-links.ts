/**
 * Checks every external URL referenced in the catalog (client homepage, docs,
 * repo, and per-surface docs links) and reports dead links. Used by the
 * weekly link-check workflow to catch stale documentation references.
 *
 * Exits non-zero if any URL fails after retry.
 */
import catalog from "../src/data/catalog.json";
import { Catalog } from "../src/lib/clients/schema";

const { clients, evidence, tools } = Catalog.parse(catalog);

const urls = new Map<string, string[]>();
const add = (url: string | undefined, source: string) => {
  if (!url) return;
  const sources = urls.get(url) ?? [];
  sources.push(source);
  urls.set(url, sources);
};

for (const client of clients) {
  add(client.homepage, `${client.id}: homepage`);
  add(client.docs, `${client.id}: docs`);
  add(client.repo, `${client.id}: repo`);
  for (const [surface, config] of Object.entries(client.surfaces)) {
    if (config) add(config.docs, `${client.id}/${surface}: docs`);
  }
}

for (const source of evidence) add(source.url, `evidence/${source.id}`);
for (const tool of tools) add(tool.docs, `tools/${tool.id}`);

const HEADERS = {
  // Some doc sites block requests without a browser-like user agent.
  "user-agent":
    "Mozilla/5.0 (compatible; clients.dev link checker; +https://clients.dev)",
  accept: "text/html,application/xhtml+xml,*/*;q=0.8",
};

async function check(url: string): Promise<number | string> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    return res.status;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

const entries = [...urls.entries()];
console.log(`Checking ${entries.length} unique URLs…`);

const failures: { url: string; result: number | string; sources: string[] }[] =
  [];

// Small concurrency to be polite to doc sites.
const CONCURRENCY = 8;
for (let i = 0; i < entries.length; i += CONCURRENCY) {
  const batch = entries.slice(i, i + CONCURRENCY);
  await Promise.all(
    batch.map(async ([url, sources]) => {
      let result = await check(url);
      // Retry once on failure — transient errors are common.
      if (typeof result === "string" || result >= 400) {
        await new Promise((r) => setTimeout(r, 2000));
        result = await check(url);
      }
      // 403/429 usually mean bot protection, not a dead link.
      if (typeof result === "number" && ![403, 429].includes(result)) {
        if (result >= 400) failures.push({ url, result, sources });
      } else if (typeof result === "string") {
        failures.push({ url, result, sources });
      }
    }),
  );
}

if (failures.length > 0) {
  console.error(`\n${failures.length} dead or failing URLs:\n`);
  for (const failure of failures) {
    console.error(`  ${failure.result}  ${failure.url}`);
    for (const source of failure.sources) console.error(`      ← ${source}`);
  }
  process.exit(1);
}

console.log("All links OK.");
