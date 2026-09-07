# add-mcp catalog sync

Reviewed 2026-09-07 against add-mcp **2.3.1**, main commit
[`66baaa83d621be0e6af2191994e1d66ccef9d178`](https://github.com/neon-solutions/add-mcp/tree/66baaa83d621be0e6af2191994e1d66ccef9d178).
All 20 installer client IDs map to catalog clients with MCP records. Configuration
facts are checked against the official documentation linked from each record;
installer defaults are explicitly labeled as add-mcp behavior.

| add-mcp ID | clients.dev ID | Review outcome |
| --- | --- | --- |
| antigravity | antigravity | Shared global path corrected; native workspace path added. |
| cline | cline | Existing MCP definition covers installer shape. |
| cline-cli | cline-cli | Existing MCP definition covers installer shape. |
| claude-code | claude-code | Documented approval rules in separate settings files. |
| claude-desktop | claude-desktop | Existing stdio configuration retained; native remote connectors are separate. |
| codex | codex | Added server and per-tool approval modes. |
| cursor | cursor | Existing auth scopes and transport fields retained. |
| fx | fx | New client, global profile, project trust, bearer environment field. |
| gemini-cli | gemini-cli | Existing httpUrl, timeout and OAuth fields cover installer changes. |
| goose | goose | Existing extensions configuration retained. |
| github-copilot-cli | github-copilot-cli | Project precedence, strict JSON, shared file effects, optional project tools. |
| grok-build | grok-build | New client with user/project TOML, environment home override and timeouts. |
| kilo-code | kilo | Reused existing identity; explicit JSON alternatives alongside JSONC. |
| kimi-code | kimi-code-cli | Added MCP surface to existing client, including transport and timeout fields. |
| kiro-cli | kiro-cli | Added MCP surface; partial pending verification of per-server timeout. |
| mcporter | mcporter | Existing paths already mention JSONC fallback. |
| opencode | opencode | Explicit JSONC files; conditional local/remote required fields corrected. |
| vscode | vscode | Retained separate servers-key configuration. |
| windsurf | windsurf | Existing MCP definition covers installer shape. |
| zed | zed | Retained official settings location; upstream macOS discrepancy below. |

## Differences requiring upstream follow-up

- **fx and Antigravity:** current native docs support project files, while this
  add-mcp version exposes global installation only. See [fx MCP](https://fx.sh/docs/capabilities/mcp)
  and [Antigravity MCP](https://antigravity.google/docs/mcp).
- **Zed:** add-mcp selects `~/Library/Application Support/Zed/settings.json` on
  macOS. The [official configuration guide](https://github.com/zed-industries/zed/blob/main/docs/.doc-examples/configuration.md)
  specifies `~/.config/zed/settings.json`; keep the documented native path.
- **Copilot home relocation:** add-mcp uses `XDG_CONFIG_HOME` as the config
  directory; the [official CLI reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)
  specifies `COPILOT_HOME`. The catalog retains the native override; add-mcp
  needs a separate compatibility correction.
- **Kiro timeout:** add-mcp emits a remote `timeout` in milliseconds, but the
  [MCP configuration reference](https://kiro.dev/docs/mcp/configuration/) does not
  document it. Global `mcp.initTimeout` is a separate setting. The MCP record is
  partial rather than asserting the installer field is native verified behavior.
- **Legacy locations:** add-mcp reuses `.kilocode/kilo.json[c]` and
  `.opencode/opencode.json[c]`. Its candidate order describes the installer write
  target, not native merge precedence. Mainstream JSON/JSONC paths are recorded;
  legacy paths need direct native source verification before adding file records.
- **Grok SSE:** add-mcp advertises SSE; the linked native guide explicitly
  documents stdio and HTTP. Keep the verified transport list scoped accordingly.

## Repeat this review

1. Pull add-mcp main and record its version and full commit above.
2. Compare `src/agents.ts`, `src/installer.ts`, and `CHANGELOG.md` with the table.
3. Map aliases to existing catalog IDs before creating directories.
4. Verify changed paths and fields in native documentation. Preserve richer
   catalog records; do not overwrite them with installer-specific subsets.
5. Edit TOMLs, regenerate, run tests/lint/build and package/HTTP smoke checks.

`scripts/import-sources.ts` is a historical, create-only seed importer. It skips
existing files and is not an update mechanism. Package builds consume the same
catalog as the website, so these additions also reach generated package artifacts.
