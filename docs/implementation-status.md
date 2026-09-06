# Behavior catalog implementation

The first release adds six profiles across Claude Code, Cursor and Codex.
Five profiles use official documentation. A sixth records Codex invoking the
optional agent-browser CLI in two controlled local runs. The trace contains
10 requests and eight rendering checks. These observations do not identify
Codex's built-in web tools.

Delivered interfaces:

- `/behaviors`: property, operation, built-in/optional and client filters;
  explicit unknowns; evidence links; local request-identity inspector.
- `/clients/<id>`: configuration plus behavior and identification details.
- `/clients/<id>.md`: generated Markdown with conditions and sources.
- `/methodology`: definitions, identification boundaries and review policy.
- `/developers`: API/package/registry instructions and live component preview.
- `/api/v1/catalog.json`, `/api/behaviors/<key>.json`, `/api/evidence.json`,
  `/api/catalog-schema.json`; existing API routes remain available.
- MCP `compare_behavior`; client reads include referenced evidence.
- `packages/clients`: ESM helpers, types, optional validation import, full and
  per-client JSON, JSON Schema, MIT code and CC0 data notices.
- `/r/registry.json`: picker, evidence badge and behavior table. Each item
  includes tested UI primitives and accepts caller-supplied data.

Known claims require evidence and verification dates. The compiler checks
references and sanitized observation shape. Trace digests participate in the
catalog content hash. Unchanged generation preserves catalog bytes.

Validation includes unit tests, lint, production build, real HTTP/MCP requests,
clean tarball installation with strict TypeScript compilation, clean shadcn CLI
installation, and browser checks of filters, identity results, mobile layout,
and installed registry components. Reproduction scripts live in `scripts/`.

The first npm publication requires authenticated bootstrap and trusted-publisher
configuration. See [release procedure](./releases.md). Website and registry
shipping are independent of npm publication.

Further research: expand beyond three clients, identify default custom headers
from sources or real traces, test hosted fetch/search separately, and add
version-specific profiles as behavior changes. Per-client `.md` is available;
HTTP Accept negotiation and a generic request-adaptation library remain future
work. Current identification rules cover the sourced Claude retrieval token,
not a universal AI-client detector.
