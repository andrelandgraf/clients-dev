# @agent-tooling/clients

AI client configuration and behavior data with evidence, dates, and explicit
unknowns. Code is MIT; data is CC0. Requires Node 22+ or an ESM-capable bundler.

```ts
import raw from "@agent-tooling/clients/catalog.json" with { type: "json" };
import { Catalog } from "@agent-tooling/clients/validate";
const catalog = Catalog.parse(raw);
import { getClient, identify, compareBehavior } from "@agent-tooling/clients";

const client = getClient(catalog, "claude-code");
const candidates = identify(catalog, {
  headers: { "user-agent": "Claude-User/1.0" },
});
```

For typed TypeScript consumers, validate the JSON once at the input boundary:

```ts
import raw from "@agent-tooling/clients/catalog.json" with { type: "json" };
import { Catalog } from "@agent-tooling/clients/validate";
const catalog = Catalog.parse(raw);
```

Validation uses Zod 4, included for validation and type declarations. Query helpers do not load Zod and have no runtime dependency
on Zod, React, Next.js, filesystem APIs or network access. Import types from the
package root. Individual clients are available through
`@agent-tooling/clients/clients/claude-code.json`. Full catalog JSON Schema is
available at `@agent-tooling/clients/schema.json`; cross-reference and evidence
rules are additionally enforced by `/validate`.

`compareBehavior(catalog, 'markdownPreference')` includes unresearched clients
with empty profiles. Empty does not mean unsupported. Identification returns
candidates and ambiguity, never authenticated identities. UA matches can be
shared between products or spoofed.

`schemaVersion` describes the catalog contract; `dataVersion` is a SHA-256
content identifier. Releases contain immutable snapshots, so update the package
to receive corrections. A verification date is not a guarantee of current
behavior. See https://clients.dev/methodology and https://clients.dev/api/catalog.json.
