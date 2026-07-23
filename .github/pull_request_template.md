## What does this PR change?

<!-- One or two sentences. For data PRs: which client(s) and which surface(s). -->

## Checklist for data changes (`configs/**`)

- [ ] Every path, field, and format is verifiable in the client's **official documentation** (no guessing).
- [ ] Each edited surface file has a `docs` link to the page that documents it.
- [ ] Each edited surface file has an updated `verified` date (`YYYY-MM-DD`, today).
- [ ] Surfaces I could not verify are marked `status = "partial"` (with a `note`) or left out — not invented.
- [ ] I ran `bun run generate` and committed the updated `src/data/catalog.json`.
- [ ] I checked the result at `/clients/<id>` with `bun run dev`.
