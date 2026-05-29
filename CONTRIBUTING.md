# Contributing to mcp-gen-ui-gateway

Thank you for your interest in contributing. This document covers the essentials; for branch naming, commit conventions, and PR review rules see [docs/git-workflow.md](docs/git-workflow.md).

## Getting Started

**Prerequisites**

- Node.js 20+
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

### Submitting Code

1. Fork the repository and create a branch following the conventions in `docs/git-workflow.md`.
2. Make changes, including tests for new functionality.
3. Ensure `pnpm typecheck` and `pnpm test` both pass locally.
4. Open a PR against `main` using the pull request template.

## Code Style

- TypeScript strict mode throughout. No `any` unless explicitly justified with a comment.
- All exported functions and types need explicit type signatures.
- Run `pnpm typecheck` before committing.

## Testing

- Add tests in the affected package (Vitest, located alongside source files).
- `pnpm test` runs the full suite across the monorepo.
- New MCP tools require fixture-backed tests in `packages/core`.

## Monorepo Layout

| Path | Description |
|------|-------------|
| `packages/schema` | Zod domain schemas and JSON Schema export |
| `packages/core` | Transport-neutral tool service, fixtures, SQLite store |
| `packages/mcp-server` | stdio MCP server entry point |
| `packages/browser-assist` | Playwright boundary (experimental, isolated) |
| `apps/demo-ui` | Vite React demo — GenUI renderer and Gov24-style UI |

## Out of Scope

Government24 login automation, identity verification, automatic form submission, scheduled crawling, and hosted HTTP/SSE gateway mode are explicitly out of scope. PRs that touch these areas will not be merged. See [README.md](README.md) for the full list.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.
