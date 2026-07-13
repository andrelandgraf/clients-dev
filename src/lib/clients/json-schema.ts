import type { Client, ConfigField, SurfaceId } from "./schema";
import { SURFACES, SURFACE_META } from "./schema";

/**
 * Compiles the documented fields of a client surface into JSON Schema, so
 * editors and agents can validate the entries they write into that client's
 * config file (e.g. an mcpServers entry in .cursor/mcp.json).
 */

type JsonSchema = Record<string, unknown>;

/** Best-effort mapping of our informal type strings to JSON Schema. */
function fieldSchema(field: ConfigField): JsonSchema {
  const schema: JsonSchema = { description: field.description };
  if (field.values && field.values.length > 0) {
    schema.enum = field.values;
    return schema;
  }

  const type = field.type.trim();
  const literal = type.match(/^"(.+)"$/);
  if (literal) {
    schema.const = literal[1];
    return schema;
  }
  if (/^(string|number|boolean|integer)$/.test(type)) {
    schema.type = type === "integer" ? "integer" : type;
    return schema;
  }
  const array = type.match(/^(\w+)\[\]$/);
  if (array) {
    schema.type = "array";
    schema.items = /^(string|number|boolean)$/.test(array[1])
      ? { type: array[1] }
      : {};
    return schema;
  }
  if (/^record<\s*string\s*,\s*string\s*>$/i.test(type)) {
    schema.type = "object";
    schema.additionalProperties = { type: "string" };
    return schema;
  }
  if (/^record</i.test(type) || type.startsWith("{")) {
    schema.type = "object";
  }
  // Unions and anything else stay unconstrained; the description plus the
  // original type string carry the information.
  schema["x-source-type"] = type;
  return schema;
}

export function surfaceJsonSchema(
  client: Client,
  surface: SurfaceId,
): JsonSchema | undefined {
  const config = client.surfaces[surface];
  if (!config || config.fields.length === 0) return undefined;

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  for (const field of config.fields) {
    properties[field.name] = fieldSchema(field);
    if (field.required) required.push(field.name);
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://clients.dev/api/schemas/${client.id}/${surface}.json`,
    title: `${client.name} — ${SURFACE_META[surface].label} entry`,
    description: [
      `Fields accepted by ${client.name} ${SURFACE_META[surface].label} configuration.`,
      config.files.length > 0
        ? `Config files: ${config.files.map((file) => file.path).join(", ")}.`
        : undefined,
      config.docs ? `Docs: ${config.docs}` : undefined,
    ]
      .filter(Boolean)
      .join(" "),
    type: "object",
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

export type SchemaIndexEntry = {
  client: string;
  surface: SurfaceId;
  url: string;
};

export function schemaIndex(clients: Client[]): SchemaIndexEntry[] {
  const entries: SchemaIndexEntry[] = [];
  for (const client of clients) {
    for (const surface of SURFACES) {
      const config = client.surfaces[surface];
      if (config && config.fields.length > 0) {
        entries.push({
          client: client.id,
          surface,
          url: `https://clients.dev/api/schemas/${client.id}/${surface}.json`,
        });
      }
    }
  }
  return entries;
}
