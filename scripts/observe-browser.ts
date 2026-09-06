/** Real optional-tool observation. Never collect cookies, tokens, IPs or query text. */
import { createServer } from "node:http";
import { mkdirSync, writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const records: {
  method: string;
  path: string;
  headers: Record<string, string>;
  responseType: string;
}[] = [];
const server = createServer((req, res) => {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;
  const accept = req.headers.accept ?? "";
  const type =
    path === "/json"
      ? "application/json"
      : path === "/negotiate" && accept.includes("text/markdown")
        ? "text/markdown"
        : "text/html";
  const headers: Record<string, string> = {};
  for (const key of [
    "user-agent",
    "accept",
    "sec-ch-ua",
    "sec-fetch-mode",
    "sec-fetch-dest",
  ]) {
    const value = req.headers[key];
    if (typeof value === "string") headers[key] = value;
  }
  if (path !== "/favicon.ico")
    records.push({
      method: req.method ?? "GET",
      path,
      headers,
      responseType: type,
    });
  res.setHeader("Content-Type", type);
  res.setHeader("Cache-Control", "no-store");
  if (path === "/redirect") {
    res.writeHead(302, { Location: "/html" });
    res.end();
    return;
  }
  if (type === "application/json") {
    res.end(JSON.stringify({ fixture: "client-behavior" }));
    return;
  }
  if (type === "text/markdown") {
    res.end("# Markdown representation\n");
    return;
  }
  res.end(
    '<!doctype html><html><head><title>Client observation</title></head><body><h1>HTML representation</h1><p id="js">JavaScript pending</p><script>document.getElementById("js").textContent="JavaScript executed"</script></body></html>',
  );
});
await new Promise<void>((resolve) => server.listen(4318, "127.0.0.1", resolve));
try {
  const version = (await exec("agent-browser", ["--version"])).stdout.trim();
  const checks: { run: number; path: string; result: string }[] = [];
  for (const run of [1, 2]) {
    for (const path of ["/html", "/negotiate", "/redirect", "/json"]) {
      await exec("agent-browser", [
        "--session",
        "clients-observation",
        "open",
        `http://127.0.0.1:4318${path}`,
      ]);
      const result = (
        await exec("agent-browser", [
          "--session",
          "clients-observation",
          "get",
          "text",
          path === "/json" ? "body" : "#js",
        ])
      ).stdout.trim();
      checks.push({ run, path, result });
      if (path !== "/json" && result !== "JavaScript executed")
        throw new Error("Browser did not execute the fixture JavaScript");
    }
  }
  mkdirSync("observations", { recursive: true });
  writeFileSync(
    "observations/codex-agent-browser.json",
    JSON.stringify(
      {
        tool: version,
        observedAt: new Date().toISOString(),
        context:
          "Codex desktop task invoking the separately installed agent-browser CLI through shell execution; optional tool, not built-in web search or fetch.",
        environment: `${process.platform}/${process.arch}; local headless browser; fresh named session; no custom headers configured`,
        reproduction:
          "bun run scripts/observe-browser.ts (requires installed agent-browser and its browser runtime)",
        records,
        checks,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Recorded ${records.length} real requests and ${checks.length} rendered checks using ${version}`,
  );
} finally {
  await exec("agent-browser", [
    "--session",
    "clients-observation",
    "close",
  ]).catch(() => {});
  server.close();
}
