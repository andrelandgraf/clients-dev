# Core package releases

The website deploys independently from npm. `packages/clients` contains the
publishable package; the repository root remains private.

1. Update the package version and its changelog. Run generate, test, lint and
   build. Run `scripts/smoke-package.ts` with Node 22+ and a current npm; it packs
   the actual artifact and installs it in a clean consumer. With the website
   running, `scripts/smoke-http.ts` checks JSON, Markdown, registry and MCP;
   `scripts/smoke-registry.ts` installs real registry components in a clean app.
2. Configure npm trusted publishing for `@agent-tooling/clients`:
   GitHub owner `agent-tooling`, repository `clients-dev`, workflow `release.yml`.
   First publication and organization access must be bootstrapped through an
   authenticated npm account. Do not infer that a missing package already has a
   trusted-publisher binding.
3. Once CI is green and the publisher is configured, create the GitHub release
   `clients-v<package-version>` targeting the tested commit. The release workflow
   stages a public package with provenance. It does not approve the stage.
4. Review staged version, source commit, files and provenance using a current
   npm CLI. Approve through `npm stage approve`, completing npm's browser
   verification when required. Verify npm latest, integrity and attestations.

No laptop publishing fallback is part of this workflow. If first-publish setup
requires one, agree on the bootstrap procedure before using it. npm install's
seven-day age requirement remains enabled. Local tarball smoke tests install
our reviewed artifact; they do not bypass the age gate for registry dependencies.
