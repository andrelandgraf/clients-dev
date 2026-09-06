# clients.dev: current state and expansion recommendations

Reviewed September 6, 2026 against `main` at `f5613e1`, the live website,
and the official sources linked below. This is a product and technical review;
this document records the baseline and recommendations. See
[implementation status](./implementation-status.md) for delivered features.

## Recommendation

Expand the promise to **an open database of how AI clients are configured,
access information, and identify themselves**. The useful unit is a client
variant performing an operation through a particular tool, with evidence.
“Cursor requests Markdown” is too broad; “this version and mode of this tool
requests Markdown when fetching a URL” is actionable.

Keep the existing configuration reference. Add behavior profiles, publish them
through the same website/API/MCP pipeline, then extract a versioned data package.
Offer a shadcn registry for reusable components and integration examples.

## Verified current state

The clean local checkout was already current after `git pull --ff-only`.
GitHub returned no open PRs or issues during this review.

| Area                | Current implementation                                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalog             | 76 clients; 172 surface records; 19 clients meet the current completeness predicate; 57 do not                                                                                |
| Coverage            | MCP: 23; skills: 73; rules, hooks, commands, settings: 19 each                                                                                                                |
| Statuses            | 158 supported, 6 partial, 3 deprecated, 5 unsupported                                                                                                                         |
| Evidence            | All 172 records have a verification date; 62 have no surface-level `docs` URL. Other notes or metadata may contain references; this is not a claim that all 62 are unsourced. |
| Freshness           | Recorded verification dates are June 21, July 12, and July 22, 2026. These dates were inventoried, not refreshed by this review.                                              |
| Website             | Homepage configuration comparison, six surface comparison routes, client detail tabs, search, and consumption examples                                                        |
| Programmatic access | JSON catalog/client/surface endpoints, generated config-entry JSON Schemas, `llms.txt`, and MCP tools/resource                                                                |
| Distribution        | App package is `private: true`; no public-package build/export/release setup or custom shadcn registry in this repository                                                     |
| Validation          | CI generates and checks catalog synchronization, lints, and builds; weekly link checking exists; no test script or test suite found                                           |

Live GET checks returned 200 for `/api/catalog.json`, `/llms.txt`, and `/`.
The live catalog's client data exactly matches the checked-in catalog; only
`generatedAt` differs. The JSON response was 350,895 bytes and `llms.txt` was
15,432 bytes. Requesting `/` with `Accept: text/markdown` returned
`text/html; charset=utf-8`. This single probe establishes the current root
response, not behavior for every route, agent, or CDN variant.

Relevant implementation:

- [Contract](../src/lib/clients/schema.ts): client metadata plus six configuration surfaces; no structured network behavior, tools, fingerprints, variants, or per-claim evidence.
- [Compiler](../scripts/generate-catalog.ts): reads only the six enumerated surface filenames. Adding `web.toml` alone would not publish it.
- [Completeness](../src/lib/clients/facts.ts): checks that each surface exists and is not `missing`; `partial` and `deprecated` count. It does not require a source URL or verification date.
- [Schema exporter](../src/lib/clients/json-schema.ts): best-effort translation of informal type strings; unions can remain unconstrained. These are documented config-entry schemas, not comprehensive vendor validators or a catalog interchange schema.
- [API](../src/app/api/[[...route]]/route.ts), [MCP](../src/lib/clients/mcp-server.ts), and [client page](../src/app/clients/[id]/page.tsx): all organized around configuration surfaces.

There are isolated related facts, such as Codex's `web_search` setting and MCP
custom-header configuration. Those do not establish which actual requests a
client emits or which browser/search backend it uses.

## What we can document already

These are current documentation findings, not captured request traces. Unknown
fields must remain unknown until separately sourced or measured.

| Client / operation        | Established fact                                                                                                                                                  | Boundary                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Claude Code / `WebSearch` | Uses Anthropic's search backend and returns titles and URLs; reading result pages is a separate fetch operation                                                   | Does not establish a destination-page request or its headers for each search query                   |
| Claude Code / `WebFetch`  | Sends a UA beginning with `Claude-User` and an `Accept` preference for Markdown over HTML                                                                         | The docs do not supply the exact full header or establish an exclusive Claude Code fingerprint       |
| Cursor / agent            | Documents separate web search and browser tools; browser can navigate, interact, and capture screenshots                                                          | The reviewed overview does not identify a search provider, wire headers, or browser engine           |
| Codex / local search      | Documents cached search using an OpenAI-maintained index, live search, and a full-access default of live; hosted search is separate from local command networking | Does not establish origin-facing UA, Markdown preference, or that every query causes an origin fetch |
| OpenAI / web actors       | Separately documents OAI-SearchBot for search, GPTBot for potential training use, and ChatGPT-User for certain user actions                                       | These actors must not be silently mapped to Codex                                                    |

Sources: [Claude Code tool reference](https://code.claude.com/docs/en/tools-reference#webfetch-tool-behavior),
[Cursor agent tools](https://cursor.com/docs/agent/overview#tools),
[Cursor browser](https://cursor.com/docs/agent/tools/browser),
[official local search documentation](https://learn.chatgpt.com/docs/web-search),
[OpenAI crawler reference](https://developers.openai.com/api/docs/bots).

An older Cursor `@Web` documentation search result names Exa, but the current
tools URL redirects to a broader page without that claim. Do not promote the
old result into a current provider assertion without additional evidence.

Anthropic also distinguishes search indexing, user retrieval, and training
crawlers in its [crawler reference](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler).
These distinctions deserve explicit operation labels in the database.

## Data to capture per client

Separate four things: **who the product is, what operation it performs, which
tool performs it, and what evidence supports the behavior**.

| Dimension                      | Fields worth capturing                                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Variant and availability       | CLI / IDE / desktop / cloud, version or range, OS, mode, relevant plan, feature flags, region and policy restrictions                                                                |
| Search                         | Tool name, built-in vs optional, provider if known, cached/live behavior, query filters, output shape, citations, whether results trigger a separate fetch                           |
| URL retrieval                  | Tool/backend, local vs hosted execution, methods, redirects, caching, timeouts, limits, robots behavior where documented                                                             |
| Request representation         | Exact observed `Accept` with quality values, explicit Markdown preference, JSON API requests, `.md` URL selection, documented fallback behavior                                      |
| Response processing            | Accepted MIME types, HTML-to-Markdown conversion, text extraction, PDF/image handling, truncation, summarization, what reaches the model                                             |
| Browser                        | Engine if known, local/remote, headless/headed, built-in or MCP/plugin, DOM/accessibility tree/screenshots, JavaScript, cookies/authenticated sessions, downloads                    |
| Identification                 | UA match patterns, documented default custom headers, configurable overrides, MCP identity fields for the applicable protocol revision, provider IP verification sources             |
| Other valuable client behavior | Config precedence, install/deep links, plugin support, permission defaults, sandbox/network boundaries, headless and structured output, sessions/resume, subagents, context handling |

Do not collapse “accepts Markdown,” “prefers Markdown in HTTP,” “returns
Markdown to the model,” and “follows `llms.txt`” into one boolean. Similarly,
`Content-Type` on a request describes its body; `Accept` negotiates the response.
A generic `*/*` is not an explicit Markdown preference.

Search queries generally go to the search service. Origin logs can show a
crawler or later page retrieval, but cannot alone establish who searched,
what query they used, or whether a cached result was consumed.

## Proposed contract and evidence model

Keep `surfaces` and its six configuration categories. Add optional `variants`
and `behaviors`; model reusable tools/providers separately with stable IDs.
A client may have multiple tool bindings, including optional user-installed
tools. Never attribute every possible MCP browser to the client's defaults.

Suggested source layout, pending schema implementation:

```text
configs/<client-id>/client.toml
configs/<client-id>/<existing-surface>.toml
configs/<client-id>/behaviors/<profile-id>.toml
tools/<tool-id>.toml
evidence/<evidence-id>.json
```

Each behavior profile should contain:

- Stable ID; client variant; operation (`search`, `fetch`, `browse`, `index`, `train`, `mcp-connect`); tool reference and built-in/optional status.
- Applicability: version/range, environment, mode and relevant configuration.
- Typed claims, each with `value`, knowledge status, evidence references, and last verification date. Unknown values stay absent; unknown is distinct from unsupported.
- Evidence records with kind (`official-docs`, `official-source`, `observation`), source URL, source revision where possible, checked date, and claim locator. Observations additionally reference a sanitized trace and reproduction instructions.
- Identification rules with signal location, matcher, attribution level (client/tool/provider), evidence, known ambiguity, and whether the signal is user-overridable.

Separate support from knowledge quality: a supported tool can have unknown
headers. Expose documented, observed, disputed, and stale claims independently.
Conflicting observations should coexist with their conditions rather than
overwriting the last record. Avoid numerical confidence scores until calibrated.

Require evidence and dates for new positive behavior claims. Introduce stricter
checks gradually for existing config entries rather than inventing citations
to satisfy a migration. Reject unknown keys in new behavior files so typos
cannot disappear during parsing.

Add a catalog `schemaVersion` and immutable `dataVersion`/content hash; retain
`generatedAt` as build metadata. Versioned exports must not change solely
because the build ran again.

## Identification: useful without overclaiming

Return an explanation and candidates, not always a single client ID:

| Signal                             | What it can establish                                                | Limit                                                                           |
| ---------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| UA token                           | A claimed actor/tool family                                          | Spoofable; shared fetch infrastructure can serve multiple products              |
| Default custom header              | A documented or observed tool/client hint                            | Must distinguish automatic headers from user-configured ones                    |
| `Accept`                           | Requested response representations                                   | Does not identify a product                                                     |
| MCP `clientInfo`                   | Declared client name/version for handshake-based protocol revisions  | Visible to the MCP server, not ordinary website GETs; self-reported             |
| Published provider IP verification | Network-origin evidence when verified according to provider guidance | May identify shared infrastructure; proxy trust and freshness matter            |
| Browser UA/client hints            | Browser characteristics                                              | Usually insufficient to distinguish an AI-controlled browser from other traffic |

The [MCP 2025-06-18 lifecycle](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle)
defines the initialization identity exchange. Store the protocol revision with
this claim rather than assuming all revisions use the same handshake.

Proposed helper result: candidates, matched signals, attribution level,
ambiguities, evidence IDs, and data version. Unknown and ambiguous are normal
outcomes. Header matching is not authentication and must not grant privileges.
Prefer HTTP content negotiation directly over client sniffing when deciding
whether to serve Markdown.

## Website experience

1. Add per-client **Search & retrieval**, **Browser**, **Identification**, and **Evidence** views alongside Configuration. Show variant/mode filters, facts, conditions, sources, and dates together.
2. Add comparisons answering “who explicitly requests Markdown?”, “who executes JavaScript?”, “which tools/providers are used?”, and “which request signals can identify an actor?”. Include unknowns and distinguish built-in from optional tools.
3. Add an identification playground: paste redacted headers or MCP metadata and see candidates plus the reason for each. Process locally by default; no need to upload cookies or credentials.
4. Publish a methodology page and visible correction links. Label coverage by domain rather than extending the six-surface completeness gate to everything. Rename the current badge to configuration coverage or make its evidence requirement explicit.
5. Generate per-client Markdown alongside JSON and HTML. Consider explicit `.md` routes first, then `Accept` negotiation with quality-value handling and correct `Vary: Accept`/CDN cache separation. Keep representations semantically aligned. Cloudflare's [Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/) documents the negotiation pattern; it does not prove which clients use it.

Extend API and MCP from the same validated catalog. Suggested additions are a
versioned catalog endpoint, behavior comparison endpoint, and a
`compare_behavior` tool. Existing JSON consumers and surface comparisons must
keep working. Treat all proposed route and tool names here as design proposals.

## Package and shadcn registry

**Build the npm data package first.** A tentative name is
`@agent-tooling/clients`; availability and publishing access have not been
checked. Do not publish the Next.js app as the library.

Extract a framework-independent core with types, a catalog JSON export,
per-client subpath exports, query helpers, and optional identification helpers.
Keep runtime validation in a separate export so simple consumers need not
import Zod or the full catalog. No React, Next.js, or filesystem requirement in
the core; explicit updates and no network requests at import time. Produce a
catalog JSON Schema separately from the current vendor config-entry schemas.

Ship immutable snapshots with schema/data versions, source revision, changelog,
MIT code and CC0 data notices. Document schema compatibility and stale evidence.
Keep API reads useful for consumers who want fresh data without package updates.

**Use the shadcn registry for source components and adapters:** client picker,
capability table, evidence badge, identification inspector, and optional request
negotiation integration. Have them consume the package or a caller-supplied
catalog. Copying the entire dataset into each app would create stale forks.

The registry supports component, library, and generic-file items, so helpers
are possible too. Its purpose is source installation and customization; npm
handles versioned dependency updates. See the official
[registry item contract](https://ui.shadcn.com/docs/registry/registry-item-json)
and [registry build/hosting guide](https://ui.shadcn.com/docs/registry/getting-started).

## Validation and delivery order

| Priority | Deliverable                                                 | Completion evidence                                                                                                                      |
| -------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Behavior/evidence schema, coverage labels, version contract | Real documented examples for Claude Code, Cursor, and Codex; unknowns remain visible; existing catalog still compiles                    |
| 2        | Controlled request observations                             | Real client runs against a controlled endpoint; sanitized traces tied to versions/modes and reviewed claims                              |
| 3        | Website + API/MCP behavior views                            | The same fact/source appears consistently in HTML, Markdown, JSON and MCP; comparison filters distinguish unknown/unsupported            |
| 4        | Public core package                                         | Install packed release artifact in a clean consumer and run real lookup, schema and identification examples; verify exports and licenses |
| 5        | shadcn registry                                             | Install registry items into a clean compatible app and verify rendering and data-version visibility                                      |

For observations, use a small controlled endpoint with unique run URLs and
fixtures for HTML, text, Markdown negotiation, JSON, PDF, redirects, and a
JavaScript-rendered page. Exercise explicit URL fetches and browsers separately
from search. A new unindexed URL cannot prove search behavior; absence of an
origin request is not a failed search. Test an indexed page and account for
caching. Record tool transcript, response MIME type and sanitized headers;
retain only allowlisted request metadata, not authorization or cookie values.

Run default configurations first, then explicitly configured MCP/browser
alternatives. Repeat observations before generalizing and preserve differences
across CLI/desktop/cloud variants. These experiments were not performed in this
review; no client request fingerprints have been inferred from the audit's own
HTTP probes.

Before implementing observational claims, extend CONTRIBUTING's current
official-docs/source-only rule to explain how reviewed observations are accepted
and labeled. Add evidence-link integrity, schema, determinism, ambiguity, and
content-negotiation checks as those features are built. Weekly link checks
detect dead pages, not changed behavior; add targeted re-verification reminders
and release-triggered review of affected claims.

The first useful release is a small, trustworthy behavior dataset with clear
unknowns and source links. Broad client coverage can grow from that contract.
