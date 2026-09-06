import type { Catalog, Client } from "./schema";
import { SURFACES, SURFACE_META } from "./schema";
import {
  CLAIM_LABELS,
  claimText,
} from "../../../packages/clients/src/behavior";
export function clientMarkdown(client: Client, catalog: Catalog): string {
  const lines = [
    `# ${client.name}`,
    "",
    client.description ?? "",
    "",
    `Schema: ${catalog.schemaVersion} · Data: ${catalog.dataVersion}`,
    "",
    "## Configuration",
    "",
  ];
  for (const surface of SURFACES) {
    const config = client.surfaces[surface];
    lines.push(
      `### ${SURFACE_META[surface].label}`,
      "",
      `Status: ${config?.status ?? "unknown"}`,
      "",
    );
    if (!config) continue;
    if (config.summary) lines.push(config.summary, "");
    for (const file of config.files)
      lines.push(
        `- ${file.scope}: \`${file.path}\` (${file.format})${file.key ? ` — key: ${file.key}` : ""}${file.note ? ` — ${file.note}` : ""}`,
      );
    for (const field of config.fields)
      lines.push(
        `- \`${field.name}\`: ${field.type}${field.required ? " (required)" : ""} — ${field.description}${field.values ? ` Values: ${field.values.join(", ")}` : ""}`,
      );
    for (const [label, values] of Object.entries({
      transports: config.transports,
      auth: config.auth,
      invocation: config.invocation,
      events: config.events,
    }))
      if (values.length) lines.push(`- ${label}: ${values.join(", ")}`);
    for (const cap of config.capabilities)
      lines.push(
        `- ${cap.name}: ${cap.status}${cap.note ? ` — ${cap.note}` : ""}`,
      );
    for (const note of config.notes) lines.push(`- ${note}`);
    for (const example of config.examples)
      lines.push(
        "",
        example.title ?? "Example",
        `\`\`\`${example.language}`,
        example.code,
        "```",
        "",
      );
    if (config.docs) lines.push(`Source: ${config.docs}`);
    if (config.verified) lines.push(`Checked: ${config.verified}`);
    lines.push("");
  }
  lines.push("## Search, browser & identification", "");
  if (!client.behaviors.length)
    lines.push("Not researched. Unknown does not mean unsupported.", "");
  for (const profile of client.behaviors) {
    lines.push(
      `### ${profile.variant} / ${profile.operation}`,
      "",
      `Tool: ${profile.tool} (${profile.availability})`,
      "",
      ...profile.conditions.map((c) => `- ${c}`),
      "",
    );
    for (const claim of profile.claims) {
      lines.push(
        `- ${CLAIM_LABELS[claim.key]}: ${claimText(claim)} (${claim.status}${claim.verified ? `; checked ${claim.verified}` : ""}). ${claim.note}`,
      );
      for (const ref of claim.evidence) {
        const e = catalog.evidence.find((e) => e.id === ref);
        if (e) lines.push(`  Source: [${e.title}](${e.url}) — ${e.locator}`);
      }
    }
    for (const rule of profile.identification)
      lines.push(
        `- Identification: ${rule.key} ${rule.match} ${rule.pattern}; ${rule.attribution}: ${rule.actor}. ${rule.ambiguity}`,
      );
    lines.push("");
  }
  return lines.join("\n");
}
