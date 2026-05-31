# Contributing to mcp-gen-ui-gateway

Thank you for your interest in contributing. This document covers the essentials; for branch naming and commit conventions see [docs/git-workflow.md](docs/git-workflow.md).

## Getting Started

**Prerequisites**

- Node.js 22 LTS or 24 LTS (Node 26 Current may fail to install native deps such as `better-sqlite3`)
- pnpm 9.x (`npm install -g pnpm@9`)

**Setup**

```bash
pnpm install
pnpm build
pnpm test
```

Development server:

```bash
pnpm dev        # demo UI at http://localhost:5173
pnpm mcp        # MCP server over stdio
```

## How to Contribute

### Reporting Bugs

Open an issue using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Include reproduction steps, expected vs actual behavior, and your environment.

### Suggesting Features

Open an issue using the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) before starting implementation. This avoids duplicate work and lets us align on scope first.

### Proposing Architecture Changes (RFC)

For substantial design decisions (new contract versions, transport changes, schema breaking changes), open an issue using the [RFC template](.github/ISSUE_TEMPLATE/rfc.md). RFCs replace GitHub Discussions in this project — keep design conversation on issues so decisions stay searchable and linkable from PRs.

Accepted RFCs are recorded under [`docs/adr/`](docs/adr/) as numbered Architecture Decision Records.

### Submitting Code

1. Fork the repository (or create a feature branch if you have write access).
2. Branch from `main` following the prefixes in `docs/git-workflow.md`:
   - `feat/...` new feature
   - `fix/...` bug fix
   - `docs/...` documentation only
   - `chore/...` build, config, or tooling
3. Make changes, including tests for new functionality.
4. Ensure `pnpm typecheck`, `pnpm test`, and `pnpm build` all pass locally.
5. Open a PR against `main` using the pull request template.

**Stacked PRs:** For multi-stage work, open one PR per stage and set each PR's base to the previous stage's branch (not `main`). Use the PR description's *Stack position* section to clarify ordering for reviewers.

## Pull Request Requirements

- Every PR must reference an issue: include `closes #N` (for full implementation) or `refs #N` (for partial work or RFC discussion).
- PR title follows Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, `docs: ...`, `chore: ...`, `refactor(scope): ...`.
- Add appropriate labels: one of `bug` / `enhancement` / `documentation` / `architecture`, plus `role:?` (A/B/C) and `stage:N` when applicable.
- Squash and merge is the default merge strategy; keep commit history clean before merge.
- Do not push to `main` directly; do not force-push shared branches.

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add service result GenUI block
fix(pretotype): correct gov.kr authentication center URL
docs: document GitHub flow
chore: update build metadata
```

The commit body should explain **why** the change was made and **how** you verified it. Reference issues with `Closes #N`.

## Code Style

- TypeScript strict mode throughout. Avoid `any`; if unavoidable, justify with a comment.
- All exported functions and types need explicit type signatures.
- Run `pnpm typecheck` before committing.
- The repository includes an `.editorconfig` — set your editor to honor it.

## Testing

- Add tests in the affected package (Vitest, located alongside source files).
- `pnpm test` runs the full suite across the monorepo.
- New MCP tools require fixture-backed tests in `packages/core`.

## Label Reference

| Label | Meaning |
|-------|---------|
| `bug` | Something is not working as expected |
| `enhancement` | New feature or improvement |
| `documentation` | Docs-only change |
| `architecture` | ADR or design-impacting change |
| `role:A` / `role:B` / `role:C` | Owning role (A=core/schema, B=data/API, C=renderer/demo) |
| `stage:1` … `stage:5` | Maps to the project's staged delivery plan |
| `good first issue` | Suitable entry point for new contributors |
| `help wanted` | Extra attention or external help welcome |

## Monorepo Layout

| Path | Description |
|------|-------------|
| `packages/schema` | Zod domain schemas and JSON Schema export |
| `packages/core` | Transport-neutral tool service, fixtures, SQLite store |
| `packages/mcp-server` | stdio MCP server entry point |
| `packages/pretotype-server` | Throwaway pretotype MCP server for the June 4 demo (separate from the real gateway) |
| `packages/browser-assist` | Playwright boundary (experimental, isolated) |
| `apps/demo-ui` | Vite React demo — GenUI renderer and Gov24-style UI |

## Architecture Decision Records

Significant design choices are recorded in [`docs/adr/`](docs/adr/) using numbered files (`0001-...`, `0002-...`). New ADRs are introduced through an RFC issue (see above) and merged as a `docs/...` PR.

## Out of Scope

Government24 login automation, identity verification, automatic form submission, scheduled crawling, and hosted HTTP/SSE gateway mode are explicitly out of scope. PRs that touch these areas will not be merged. See [README.md](README.md) for the full list.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

## Security Reports

Please do **not** open public issues for security problems. See [SECURITY.md](SECURITY.md) for the private disclosure process.
