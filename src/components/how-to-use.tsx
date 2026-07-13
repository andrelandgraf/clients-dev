"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SITE = "https://clients.dev";

const ENDPOINTS: { cmd: string; desc: string }[] = [
  { cmd: `curl ${SITE}/api/clients.json`, desc: "All clients with their config surfaces" },
  { cmd: `curl ${SITE}/api/catalog.json`, desc: "Full catalog ({ generatedAt, clients })" },
  { cmd: `curl ${SITE}/api/clients/cursor.json`, desc: "A single client by id" },
  { cmd: `curl ${SITE}/api/mcp.json`, desc: "One surface compared across all clients" },
  { cmd: `curl ${SITE}/api/schemas/cursor/mcp.json`, desc: "JSON Schema for a client's config entries" },
  { cmd: `curl ${SITE}/llms.txt`, desc: "The whole catalog summarized for LLMs" },
  { cmd: `npx add-mcp ${SITE}/api/mcp`, desc: "Connect your agent to the catalog over MCP" },
];

function CurlRow({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-secondary/30">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <code className="overflow-x-auto font-mono text-xs whitespace-nowrap">
          <span className="text-muted-foreground">curl </span>
          {cmd.replace("curl ", "")}
        </code>
        <CopyButton value={cmd} />
      </div>
      <p className="border-t border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

export function HowToUse() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        How to use
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono tracking-tight">
              How to use
            </DialogTitle>
            <DialogDescription>
              clients.dev is an open database of how AI coding clients are
              configured — where each reads its config and the typed fields it
              accepts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <section>
              <p className="text-sm text-muted-foreground">
                The homepage table shows the actual config file paths for every
                fully documented client. Each client has a detail page with
                formats and typed field schemas; surface pages compare one
                surface side by side across all clients.
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold">API</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                Every page is also available as JSON (CORS-enabled), so you can
                generate or validate client configs programmatically.
              </p>
              <div className="space-y-2">
                {ENDPOINTS.map((endpoint) => (
                  <CurlRow key={endpoint.cmd} {...endpoint} />
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold">Contribute</h3>
              <p className="text-sm text-muted-foreground">
                The data lives as TOML under{" "}
                <code className="font-mono text-xs">configs/</code> in the{" "}
                <a
                  href="https://github.com/agent-tooling/clients-dev"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub repo
                </a>
                . Add a client or fix a field with a PR — keep entries faithful
                to each client&apos;s official docs.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
