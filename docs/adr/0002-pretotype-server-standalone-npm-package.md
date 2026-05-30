# Pretotype ships as a standalone, self-contained npm package

Status: Accepted — **pretotype-scoped only**. Enables open-source `npx` distribution of the June 4 pretotype. Does not bind the production/convergence architecture. Follows [ADR-0001](0001-pretotype-genui-surface-rendering-channel.md).

## Context

ADR-0001 fixed the delivery channel: the dedicated MCP server `pretotype-mcp-gen-ui-gateway` returns a checked-in self-contained HTML string that Claude renders verbatim as an Artifact.

The distribution question was still open. Two models exist:

- **HTTP connector** (`pretotype:http` → `127.0.0.1:8787` + tunnel) — requires an always-on local process. Fine for a live demo, wrong for "anyone can grab it."
- **stdio bin via `npx`** — Claude Desktop spawns the server per session on demand, no always-on process. This is the right fit for an **open-source hackathon deliverable** where each person installs it themselves.

A publish-readiness audit of `pretotype/genui-demo` found the repo could **not** be `npm publish`ed as-is:

- The pretotype logic lived in `packages/mcp-server/src/*pretotype*` and was also wired into the real gateway server (`index.ts` registered `compose_genui_artifact`). Throwaway code was entangled with the production gateway.
- The self-contained HTML + scenario JSON lived in `apps/demo-ui/public/pretotype/`, a **different workspace package** that is never published. `compose-pretotype.ts` resolved them via `findWorkspaceRoot()` walking up for a dir named `mcp-gen-ui-gateway` — works in the monorepo, breaks after `npm install` (no such ancestor; assets absent).
- `mcp-server` had no `files` whitelist while `.gitignore` ignores `dist`; an `npm publish` tarball would have **omitted the compiled `bin`/`main` targets**.
- `mcp-server` depended on `@mcp-gen-ui-gateway/core` and `schema` via `workspace:*` — these would have had to be published too, and plain `npm publish` does not rewrite the `workspace:` protocol.

A code check confirmed the pretotype path imports **nothing** from `core`/`schema`: only `@modelcontextprotocol/sdk`, `zod`, and node builtins.

## Decision

Extract the pretotype into a **new, self-contained workspace package** `packages/pretotype-server`, published to npm **unscoped** as `pretotype-mcp-gen-ui-gateway`.

- **Owns its payload.** `assets/embedded/{newlywed,freelancer,postdoc}.html` and `assets/scenarios/scenario_*.json` move into the package. It is the single source of truth; `apps/demo-ui/public/pretotype/` is removed (the React demo renders from `demo-data.ts`, not these files, so it is unaffected).
- **Package-relative asset resolution.** `resolvePretotypeBasePath()` resolves `new URL("../assets", import.meta.url)` (with `MCP_GEN_UI_PRETOTYPE_DIST` still honored as an override). `src/` and `dist/` both sit one level under the package root, so dev (`tsx`) and published (`dist`) resolve identically — verified to work from an unrelated cwd.
- **Zero workspace dependencies.** Only `@modelcontextprotocol/sdk` + `zod`. No `core`/`schema` to co-publish; plain `npm publish` is safe.
- **`files: ["dist","assets","README.md"]`** so the tarball ships the compiled bin targets and the HTML payload, and excludes `src`/tests.
- **Isolation.** The pretotype tool registration and `pretotype-*` bins are removed from `mcp-server`, which returns to being only the real benefit-gateway server. The compatibility `compose_genui_artifact` tool survives inside `pretotype-server` (its dedicated server already exposes both `render_pretotype_scenario` and the alias).

## Considered options

- **New `packages/pretotype-server`, unscoped, self-contained (chosen).** Kept: one `npx pretotype-mcp-gen-ui-gateway`, no npm org, throwaway isolated from the real gateway, folder structure that reads as "pretotype = this package." Matches the `packages/pretotype-server` location implied by issue #3.
- **Keep it in `mcp-server`, just bundle assets + fix paths (rejected).** Smaller diff, but the throwaway pretotype stays welded to the production gateway and the gateway tarball carries 4.5 MB of demo HTML.
- **Inline the HTML as TS string literals in scenario `.ts` files (rejected).** Trivially bundled, but 1.5 MB × 3 string literals destroy readability.
- **Scoped name `@mcp-gen-ui-gateway/pretotype-server` (rejected).** Consistent with the monorepo, but requires owning the npm org and `publishConfig.access: public` — friction for individual hackathon installers.

## Consequences

- `npx pretotype-mcp-gen-ui-gateway` works after a clean install from any directory (verified: build green, 8/8 tests green, `npm pack --dry-run` ships `dist` + `assets` only, smoke run from `/tmp` returns the real artifact for each tag and a disclosure for unknown tags).
- `mcp-server` is decoupled from the pretotype and keeps its `workspace:*` deps; it is **not** part of this publish. To avoid an accidental `pnpm -r publish` shipping the still-unpublishable scoped packages, `core`/`schema`/`mcp-server`/`browser-assist` should be marked `private: true` (follow-up, not done here).
- The embedded HTML is intentionally large (≈1.5 MB each: high-fidelity inline base64 imagery, kept for completeness per the author). This is **not** treated as a defect to compress at the pretotype stage.
- The handoff-domain allowlist is **not** enforced as a build gate at the pretotype stage (deliberately deferred).
- Issue #3 ("[Stage 2] Scenario Data") stays a scenario-content milestone; the npm-publish work is tracked as a separate **[Stage 3]** issue. Persona labels standardize on **postdoc / 박사후연구원** (issue #3's "교수/professor" to be reconciled to match the branch + ADR-0001).
- A real release still needs `npm login` and `npm publish` (unscoped → no `--access public` needed). Deliberately left for an explicit request.
