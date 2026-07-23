# Contributing to clients.dev

Thanks for helping keep the database accurate! The most valuable contributions
are new clients, completed surfaces for partial clients, and corrections when
a client changes how it is configured.

## Ground rule: no hallucinated config

Every path, field, format, and capability must be verifiable in the client's
**official documentation** (or its source code, for open-source clients).
When you are unsure, mark the surface `status = "partial"` and add a `note`
rather than inventing details. A smaller, correct entry beats a complete,
wrong one.

## How the data works

The source of truth is plain TOML under [`configs/`](./configs), one folder
per client:

```
configs/<client-id>/
├── client.toml     # metadata (name, vendor, type, links)
├── mcp.toml        # one file per surface (all optional)
├── skills.toml
├── rules.toml
├── hooks.toml
├── commands.toml
└── settings.toml
```

The full schema lives in
[`src/lib/clients/schema.ts`](./src/lib/clients/schema.ts). At build time
[`scripts/generate-catalog.ts`](./scripts/generate-catalog.ts) validates every
file with Zod and compiles everything into `src/data/catalog.json` (committed,
so the diff is reviewable).

A client appears in the homepage main table only when **all six** surface
files exist with verified statuses. `unsupported` counts as verified —
knowing a client has no hooks is a fact. Anything less appears under
"More clients".

## Making a change

1. Edit or add TOML under `configs/<client-id>/`.
2. Set `docs` on each surface to the official page you verified it against.
3. Set `verified = "YYYY-MM-DD"` (today) on each surface you checked.
4. Run `bun run generate` — this validates your TOML and regenerates
   `src/data/catalog.json`. Commit both.
5. Optionally run `bun run dev` and check `/clients/<client-id>`.
6. Open a PR. CI runs the same generate + lint + build steps.

## Development setup

```bash
bun install
bun run dev        # generate catalog + start Next.js (http://localhost:3000)
bun run build      # generate catalog + production build
bun run lint
```

## Licensing

Code is MIT. The data in `configs/` and the generated catalog are dedicated
to the public domain under CC0 1.0 — by contributing data you agree to that
dedication.
