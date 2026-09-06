import type { Catalog } from "./schema.ts";
import type { IdentificationRule } from "./behavior.ts";

export type IdentityInput = {
  headers?: Record<string, string>;
  mcpClientName?: string;
};
function matches(value: string, rule: IdentificationRule): boolean {
  // Product tokens are case-sensitive and bounded; do not match NotClaude-User.
  if (rule.match === "exact") return value === rule.pattern;
  if (rule.match === "prefix") return value.startsWith(rule.pattern);
  return value
    .split(/[\s;(),]+/)
    .some(
      (token) => token === rule.pattern || token.startsWith(`${rule.pattern}/`),
    );
}
export function identify(catalog: Catalog, input: IdentityInput) {
  const headers = new Map(
    Object.entries(input.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]),
  );
  const candidates = catalog.clients.flatMap((client) =>
    client.behaviors.flatMap((behavior) =>
      behavior.identification.flatMap((rule) => {
        const value =
          rule.location === "header"
            ? headers.get(rule.key.toLowerCase())
            : input.mcpClientName;
        if (!value || !matches(value, rule)) return [];
        return [
          {
            client: client.id,
            behavior: behavior.id,
            actor: rule.actor,
            attribution: rule.attribution,
            signal:
              rule.location === "header" ? rule.key : "mcp.clientInfo.name",
            ambiguity: rule.ambiguity,
            evidence: rule.evidence,
          },
        ];
      }),
    ),
  );
  return {
    dataVersion: catalog.dataVersion,
    status: candidates.length ? "candidates" : "unknown",
    candidates,
    note: "Signals are self-reported and may be shared or overridden. Matches are not authentication.",
  };
}
