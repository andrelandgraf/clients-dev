"use client";
import { useState } from "react";
import { identify } from "../../packages/clients/src/identify";
import type { Catalog } from "@/lib/clients/schema";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function IdentityInspector({ catalog }: { catalog: Catalog }) {
  const [ua, setUa] = useState("");
  const [accept, setAccept] = useState("");
  const result = identify(catalog, { headers: { "user-agent": ua, accept } });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspect request signals</CardTitle>
        <p className="text-sm text-muted-foreground">
          Evaluated in your browser. Paste only User-Agent and Accept; cookies
          and credentials are not needed.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="block text-sm">
          User-Agent
          <Input
            className="mt-1"
            value={ua}
            onChange={(e) => setUa(e.target.value)}
            placeholder="e.g. Claude-User/1.0"
          />
        </label>
        <label className="block text-sm">
          Accept
          <Input
            className="mt-1"
            value={accept}
            onChange={(e) => setAccept(e.target.value)}
            placeholder="e.g. text/markdown, text/html;q=0.8"
          />
        </label>
        <div aria-live="polite" className="space-y-3 text-sm">
          {!result.candidates.length ? (
            <p>
              No identifying rule matched. This does not imply human traffic.
            </p>
          ) : (
            result.candidates.map((c, i) => (
              <div key={i}>
                <p className="font-medium">
                  {c.actor} · {c.attribution} candidate
                </p>
                <p className="text-muted-foreground">
                  Matched {c.signal}. {c.ambiguity}
                </p>
                {c.evidence.map((id) => {
                  const e = catalog.evidence.find((s) => s.id === id);
                  return e ? (
                    <a className="text-primary underline" key={id} href={e.url}>
                      {e.title}
                    </a>
                  ) : null;
                })}
              </div>
            ))
          )}
          <p className="text-muted-foreground">
            Accept describes a representation preference, not a client identity.{" "}
            {result.note}
          </p>
        </div>
        <p className="break-all font-mono text-xs text-muted-foreground">
          Data: {result.dataVersion}
        </p>
      </CardContent>
    </Card>
  );
}
