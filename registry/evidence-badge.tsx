import { Badge } from "@/components/ui/badge";

export function EvidenceBadge({
  status,
  verified,
  source,
  checkedAt,
}: {
  status: "documented" | "observed" | "disputed" | "unknown" | "unsupported";
  verified?: string;
  source?: { title: string; url: string };
  /** Pass a fixed date from the server for stable rendering. */
  checkedAt?: string;
}) {
  const stale =
    verified &&
    checkedAt &&
    Date.parse(checkedAt) - Date.parse(verified) > 90 * 86400000;
  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-xs">
      <Badge variant="outline">{status}</Badge>
      {stale && <Badge variant="secondary">Needs review</Badge>}
      {verified && (
        <span className="text-muted-foreground">Checked {verified}</span>
      )}
      {source && (
        <a
          className="text-primary underline"
          href={source.url}
          target="_blank"
          rel="noreferrer"
        >
          {source.title}
        </a>
      )}
    </span>
  );
}
