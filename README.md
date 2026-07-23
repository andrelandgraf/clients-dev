# clients.dev

An open, machine-readable database of **how AI coding clients are configured**.

Think [models.dev](https://models.dev), but for the *clients* (Cursor, Claude
Code, Codex, …) instead of the models. For every client and every
configuration **surface** it answers two questions:

1. **Where does the config live?** — the exact file paths (project + global +
   enterprise) and formats.
2. **What can it contain?** — the typed fields each config accepts.

Browse it at [clients.dev](https://clients.dev), or consume it as JSON via the
[API](#api).

## Surfaces

Each client is described across six configuration surfaces:

| Surface     | What it covers                                                        |
| ----------- | --------------------------------------------------------------------- |
| `mcp`       | Model Context Protocol servers — transports, auth, protocol features. |
| `skills`    | `SKILL.md` instruction sets and where they're discovered.             |
| `rules`     | Persistent instruction/memory files (`AGENTS.md`, `CLAUDE.md`, …).    |
| `hooks`     | Lifecycle hooks that observe or gate the agent loop.                  |
| `commands`  | User-invocable slash commands / custom prompts.                       |
| `settings`  | The primary configuration file and its key fields.                    |

## Data model

The source of truth is plain TOML under [`configs/`](./configs), one folder per
client:

```
configs/
└── <client-id>/
    ├── client.toml     # metadata (name, vendor, type, links)
    ├── mcp.toml        # one file per surface (optional)
    ├── skills.toml
    ├── rules.toml
    ├── hooks.toml
    ├── commands.toml
    └── settings.toml
```

Each surface file declares its `status`, the `files` it reads (path + scope +
format + key), and the typed `fields` it accepts. See
[`src/lib/clients/schema.ts`](./src/lib/clients/schema.ts) for the full schema.

At build time [`scripts/generate-catalog.ts`](./scripts/generate-catalog.ts)
validates every file with Zod and compiles them into a single
`src/data/catalog.json`, which powers both the website and the API.

## Adding or editing a client

1. Create `configs/<client-id>/client.toml` with the client metadata.
2. Add a `<surface>.toml` for each surface the client supports.
3. Run `bun run generate` to compile and validate.
4. Run `bun run dev` and check the client at `/clients/<client-id>`.

**Only document what's in the official docs.** Every field, path, and format
should be verifiable from the vendor's documentation — no guessing.

## Completeness

The homepage table only lists clients where **all six surfaces are verified**
from official docs (a surface can be verified as `unsupported` — knowing a
client has no hooks is a fact). Clients with partial data appear in a separate
"More clients" section and are never shown as peer rows, so a missing entry is
always a documentation gap, never a claim about the client.

## API

The data is exposed as JSON (CORS-enabled) via Hono route handlers:

| Endpoint                  | Returns                                       |
| ------------------------- | --------------------------------------------- |
| `GET /api`                | Index of endpoints and surfaces.              |
| `GET /api/catalog.json`   | The full catalog (`{ generatedAt, clients }`).|
| `GET /api/clients.json`   | All clients with their surfaces.              |
| `GET /api/clients/{id}.json` | A single client.                           |
| `GET /api/{surface}.json` | One surface compared across all clients.      |
| `GET /api/schemas.json`   | Index of available JSON Schemas.              |
| `GET /api/schemas/{client}/{surface}.json` | JSON Schema for the fields a client accepts on one surface — validate or generate config entries. |
| `GET /llms.txt`           | The whole catalog summarized for LLMs.        |

## MCP server

The catalog is itself an MCP server (Streamable HTTP) at
`https://clients.dev/api/mcp`:

```bash
npx add-mcp https://clients.dev/api/mcp
```

Tools: `list_clients`, `get_client`, `compare_surface`, `get_config_schema`,
plus a `catalog` resource. Agents can answer "where does client X read its MCP
config and what fields does it accept?" directly from the source of truth.

## Development

```bash
bun install
bun run dev        # generate catalog + start Next.js (http://localhost:3000)
bun run build      # generate catalog + production build
bun run lint
```

Stack: **Next.js 16** (App Router, static pages + a serverless Hono API),
**Tailwind v4**, **shadcn/ui**, **Zod**, **smol-toml**, deployed on **Vercel**.

## Contributing

Contributions of new clients and corrections are very welcome — open a PR that
adds or edits the relevant TOML under `configs/`. Keep entries faithful to the
official documentation and bump the `verified` date on every surface you
check. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow; CI
validates every PR (schema validation, lint, build, catalog sync).

## License

Code: MIT © agent-tooling.

Data: the contents of `configs/` and the generated catalog are dedicated to
the public domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) —
use them in your own tools, docs, or datasets without asking.
