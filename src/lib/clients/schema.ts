import { z } from "zod";

/**
 * The configuration surfaces a client can expose. Each surface is "a thing you
 * ship that the client consumes" (an MCP server, a skill, a rule, etc.) plus
 * where the client reads its config and the typed fields that config accepts.
 */
export const SURFACES = [
  "mcp",
  "skills",
  "rules",
  "hooks",
  "commands",
  "settings",
] as const;

export type SurfaceId = (typeof SURFACES)[number];

export const SURFACE_META: Record<
  SurfaceId,
  { label: string; blurb: string }
> = {
  mcp: {
    label: "MCP",
    blurb: "Model Context Protocol servers — tools, resources, and prompts.",
  },
  skills: {
    label: "Skills",
    blurb: "Reusable SKILL.md instruction sets the agent can load on demand.",
  },
  rules: {
    label: "Rules",
    blurb: "Persistent instructions and memory files loaded into context.",
  },
  hooks: {
    label: "Hooks",
    blurb: "Scripts that observe or gate the agent loop around lifecycle events.",
  },
  commands: {
    label: "Commands",
    blurb: "User-invocable slash commands and custom prompts.",
  },
  settings: {
    label: "Settings",
    blurb: "The primary configuration file for client behavior and permissions.",
  },
};

export const Scope = z.enum(["project", "global", "enterprise"]);

export const Format = z.enum([
  "json",
  "jsonc",
  "toml",
  "yaml",
  "markdown",
  "mdc",
  // Plain-text rule files like .rules or .goosehints.
  "text",
  // Plugin/hook source files (e.g. Amp and OpenCode plugins).
  "typescript",
  // Shebang scripts in any language (e.g. Cline hooks).
  "executable",
]);

export const SupportStatus = z.enum([
  "supported",
  "partial",
  "deprecated",
  "unsupported",
  // "missing" = we have not verified this from official docs/source yet.
  "missing",
]);

/** A concrete config file location for a surface. */
export const ConfigFile = z.object({
  path: z.string(),
  scope: Scope,
  format: Format,
  /** Top-level key the entries live under, e.g. `mcpServers`. */
  key: z.string().optional(),
  note: z.string().optional(),
});
export type ConfigFile = z.infer<typeof ConfigFile>;

/** A typed field accepted by a surface's config schema. */
export const ConfigField = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().default(false),
  description: z.string(),
  /** Allowed enum values, when the field is constrained. */
  values: z.array(z.string()).optional(),
});
export type ConfigField = z.infer<typeof ConfigField>;

/** A named capability with a support indicator (used for MCP protocol caps). */
export const Capability = z.object({
  name: z.string(),
  status: SupportStatus,
  note: z.string().optional(),
});
export type Capability = z.infer<typeof Capability>;

export const CodeExample = z.object({
  title: z.string().optional(),
  language: z.string(),
  code: z.string(),
});
export type CodeExample = z.infer<typeof CodeExample>;

/** Everything we know about one surface for one client. */
export const SurfaceConfig = z.object({
  status: SupportStatus,
  summary: z.string().optional(),
  files: z.array(ConfigFile).default([]),
  fields: z.array(ConfigField).default([]),
  /** MCP transports: stdio | sse | http. */
  transports: z.array(z.string()).default([]),
  /** Auth mechanisms, e.g. oauth, bearer-token, headers. */
  auth: z.array(z.string()).default([]),
  /** How the surface is invoked (skills/commands), e.g. `/name`, `@name`. */
  invocation: z.array(z.string()).default([]),
  /** Lifecycle events (hooks). */
  events: z.array(z.string()).default([]),
  /** Protocol/feature capabilities (e.g. MCP tools/resources/prompts). */
  capabilities: z.array(Capability).default([]),
  examples: z.array(CodeExample).default([]),
  notes: z.array(z.string()).default([]),
  docs: z.string().optional(),
});
export type SurfaceConfig = z.infer<typeof SurfaceConfig>;

export const ClientType = z.enum([
  "editor",
  "ide-extension",
  "cli",
  "desktop-app",
  "platform",
]);

/** Client metadata from `client.toml`. */
export const ClientMeta = z.object({
  name: z.string(),
  // Optional: only set when the client category is verified. Otherwise unknown.
  type: ClientType.optional(),
  vendor: z.string().optional(),
  description: z.string().optional(),
  homepage: z.string().optional(),
  repo: z.string().optional(),
  docs: z.string().optional(),
  /** Logo filename stored next to the client config, served from /logos. */
  logo: z.string().optional(),
});
export type ClientMeta = z.infer<typeof ClientMeta>;

/** A fully compiled client: metadata + its per-surface configs. */
export const Client = ClientMeta.extend({
  id: z.string(),
  // Partial: a client only includes surfaces we have verified data for.
  surfaces: z.partialRecord(z.enum(SURFACES), SurfaceConfig),
});
export type Client = z.infer<typeof Client>;

export const Catalog = z.object({
  generatedAt: z.string(),
  clients: z.array(Client),
});
export type Catalog = z.infer<typeof Catalog>;
