"use client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CLAIM_LABELS,
  claimText,
  type Claim,
  type ClaimKey,
  type Behavior,
  type Evidence,
} from "../../packages/clients/src/behavior";

export function BehaviorExplorer({
  clients,
  evidence,
}: {
  clients: { id: string; name: string; behaviors: Behavior[] }[];
  evidence: Evidence[];
}) {
  const [query, setQuery] = useState("");
  const [key, setKey] = useState<ClaimKey>("markdownPreference");
  const [operation, setOperation] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [knownOnly, setKnownOnly] = useState(false);
  const choices: ClaimKey[] = [
    "markdownPreference",
    "provider",
    "searchMode",
    "browserEngine",
    "javascript",
    "userAgent",
    "customHeaders",
    "accept",
  ];
  type Row = {
    client: (typeof clients)[number];
    profile?: Behavior;
    claim?: Claim;
  };
  const rows = clients
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .flatMap<Row>((client) => {
      const profiles = client.behaviors.filter(
        (p) =>
          (operation === "all" || p.operation === operation) &&
          (availability === "all" || p.availability === availability) &&
          p.claims.some((c) => c.key === key),
      );
      if (!profiles.length)
        return knownOnly
          ? []
          : [{ client, profile: undefined, claim: undefined }];
      return profiles
        .map((profile) => ({
          client,
          profile,
          claim: profile.claims.find((c) => c.key === key),
        }))
        .filter(
          (row) => !knownOnly || (row.claim && row.claim.status !== "unknown"),
        );
    });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => (
          <Button
            key={choice}
            variant={key === choice ? "default" : "outline"}
            size="sm"
            onClick={() => setKey(choice)}
          >
            {CLAIM_LABELS[choice]}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Operation filters">
        {["all", "search", "fetch", "browse"].map((value) => (
          <Button
            key={value}
            variant={operation === value ? "secondary" : "ghost"}
            aria-pressed={operation === value}
            size="sm"
            onClick={() => setOperation(value)}
          >
            {value === "all" ? "All operations" : value}
          </Button>
        ))}
        {["all", "built-in", "optional"].map((value) => (
          <Button
            key={value}
            variant={availability === value ? "secondary" : "ghost"}
            aria-pressed={availability === value}
            size="sm"
            onClick={() => setAvailability(value)}
          >
            {value === "all" ? "All tools" : value}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-sm"
          aria-label="Filter clients"
          placeholder="Filter clients…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          variant="outline"
          aria-pressed={knownOnly}
          onClick={() => setKnownOnly(!knownOnly)}
        >
          {knownOnly ? "Show unknowns" : "Hide unknowns"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {rows.length} results
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client / tool</TableHead>
            <TableHead>{CLAIM_LABELS[key]}</TableHead>
            <TableHead>Evidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ client, profile, claim }) => (
            <TableRow key={`${client.id}/${profile?.id ?? "unknown"}`}>
              <TableCell className="align-top">
                <Link
                  className="font-medium text-primary hover:underline"
                  href={`/clients/${client.id}#${profile?.id ?? "behavior"}`}
                >
                  {client.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {profile
                    ? `${profile.operation} · ${profile.tool} · ${profile.availability}`
                    : "Not researched"}
                </p>
              </TableCell>
              <TableCell className="max-w-lg whitespace-normal align-top">
                <p>{claim ? claimText(claim) : "Unknown"}</p>
                <p className="text-xs text-muted-foreground">
                  {claim?.note ?? "No researched profile for this behavior."}
                </p>
                {profile && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {profile.conditions.join(" ")}
                  </p>
                )}
              </TableCell>
              <TableCell className="whitespace-normal align-top">
                <span className="text-xs">
                  {claim?.status ?? "unknown"}
                  {claim?.verified ? ` · ${claim.verified}` : ""}
                </span>
                {claim?.evidence.map((id) => {
                  const e = evidence.find((s) => s.id === id);
                  return e ? (
                    <a
                      key={id}
                      href={e.url}
                      className="block text-xs text-primary underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {e.title}
                    </a>
                  ) : null;
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!rows.length && (
        <p className="p-6 text-muted-foreground">
          No matching clients. Try another behavior or show unknowns.
        </p>
      )}
    </div>
  );
}
