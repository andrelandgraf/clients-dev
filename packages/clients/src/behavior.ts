import { z } from "zod";

const Id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const DateString = z.iso.date();
export const Operation = z.enum([
  "search",
  "fetch",
  "browse",
  "index",
  "train",
  "mcp-connect",
]);
export const ClaimKey = z.enum([
  "provider",
  "searchMode",
  "output",
  "accept",
  "markdownPreference",
  "userAgent",
  "customHeaders",
  "htmlConversion",
  "javascript",
  "browserEngine",
  "screenshots",
  "execution",
  "redirects",
  "cookies",
  "formats",
  "robots",
  "limits",
]);
export type ClaimKey = z.infer<typeof ClaimKey>;
export const CLAIM_LABELS: Record<ClaimKey, string> = {
  provider: "Provider",
  searchMode: "Search mode",
  output: "Tool output",
  accept: "Accept header",
  markdownPreference: "Explicit Markdown preference",
  userAgent: "User-Agent",
  customHeaders: "Custom headers",
  htmlConversion: "HTML conversion",
  javascript: "JavaScript execution",
  browserEngine: "Browser engine",
  screenshots: "Screenshots",
  execution: "Execution location",
  redirects: "Redirects",
  cookies: "Cookies and sessions",
  formats: "Content formats",
  robots: "Robots behavior",
  limits: "Limits",
};
export const Evidence = z
  .strictObject({
    id: Id,
    kind: z.enum(["official-docs", "official-source", "observation"]),
    url: z
      .url()
      .refine(
        (value) => /^https:\/\//.test(value),
        "Use an HTTPS evidence URL",
      ),
    title: z.string().min(1),
    checked: DateString,
    locator: z.string().min(1),
    revision: z.string().optional(),
    traceSha256: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    trace: z
      .string()
      .regex(/^observations\/[a-z0-9-]+\.json$/)
      .optional(),
    reproduction: z.string().optional(),
  })
  .superRefine((e, ctx) => {
    if (
      e.kind === "observation" &&
      (!e.trace || !e.reproduction || !e.revision)
    )
      ctx.addIssue({
        code: "custom",
        message: "Observations need trace, reproduction and revision",
      });
  });
export type Evidence = z.infer<typeof Evidence>;
export const Claim = z
  .strictObject({
    key: ClaimKey,
    status: z.enum([
      "documented",
      "observed",
      "disputed",
      "unknown",
      "unsupported",
    ]),
    value: z
      .union([z.string().min(1), z.boolean(), z.array(z.string()).min(1)])
      .optional(),
    note: z.string().min(1),
    evidence: z.array(Id).default([]),
    verified: DateString.optional(),
  })
  .superRefine((c, ctx) => {
    if (c.status === "unknown") {
      if (c.value !== undefined)
        ctx.addIssue({
          code: "custom",
          message: "Unknown claims cannot assert values",
        });
    } else {
      if (!c.evidence.length || !c.verified || c.value === undefined)
        ctx.addIssue({
          code: "custom",
          message: "Known claims require value, evidence and verification date",
        });
      if (
        ["markdownPreference", "javascript", "screenshots"].includes(c.key) &&
        typeof c.value !== "boolean"
      )
        ctx.addIssue({
          code: "custom",
          message: "This claim requires a boolean value",
        });
    }
  });
export type Claim = z.infer<typeof Claim>;
export const IdentificationRule = z.strictObject({
  id: Id,
  location: z.enum(["header", "mcp-client-name"]),
  key: z.string().min(1),
  match: z.enum(["exact", "prefix", "product-token"]),
  pattern: z.string().min(1),
  actor: z.string().min(1),
  attribution: z.enum(["client", "tool", "provider"]),
  ambiguity: z.string().min(1),
  evidence: z.array(Id).min(1),
});
export type IdentificationRule = z.infer<typeof IdentificationRule>;
export const Tool = z.strictObject({
  id: Id,
  name: z.string().min(1),
  docs: z.url(),
});
export const Behavior = z
  .strictObject({
    id: Id,
    variant: z.string().min(1),
    operation: Operation,
    tool: Id,
    availability: z.enum(["built-in", "optional"]),
    conditions: z.array(z.string()).min(1),
    claims: z.array(Claim),
    identification: z.array(IdentificationRule).default([]),
  })
  .superRefine((b, ctx) => {
    const keys = b.claims.map((c) => c.key);
    if (new Set(keys).size !== keys.length)
      ctx.addIssue({
        code: "custom",
        message:
          "Duplicate claim keys; use separate profiles for differing conditions",
      });
  });
export type Behavior = z.infer<typeof Behavior>;

export function claimText(claim: Claim): string {
  if (claim.status === "unknown") return "Unknown";
  if (typeof claim.value === "boolean") return claim.value ? "Yes" : "No";
  return Array.isArray(claim.value)
    ? claim.value.join(", ")
    : (claim.value ?? "Unknown");
}

export function isStale(
  verified: string | undefined,
  now = new Date(),
  days = 90,
): boolean {
  return (
    !!verified &&
    now.getTime() - new Date(verified).getTime() > days * 86_400_000
  );
}

export const Observation = z.strictObject({
  tool: z.string().min(1),
  observedAt: z.iso.datetime(),
  context: z.string().min(1),
  environment: z.string().min(1),
  reproduction: z.string().min(1),
  records: z
    .array(
      z.strictObject({
        method: z.string(),
        path: z.string().regex(/^\/[a-z-]+$/),
        headers: z.strictObject({
          "user-agent": z.string().optional(),
          accept: z.string().optional(),
          "sec-ch-ua": z.string().optional(),
          "sec-fetch-mode": z.string().optional(),
          "sec-fetch-dest": z.string().optional(),
        }),
        responseType: z.string(),
      }),
    )
    .min(1),
  checks: z
    .array(
      z.strictObject({
        run: z.number().int().positive(),
        path: z.string().regex(/^\/[a-z-]+$/),
        result: z.string(),
      }),
    )
    .min(1),
});
