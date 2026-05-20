# PRD: MCP-Gen UI Gateway MVP

## Problem Statement

Users who need public-service or public-benefit information currently have to search across fragmented government pages, interpret eligibility rules manually, and keep track of required documents, application paths, and changed guidance themselves.

## Solution

Build an open-source MCP server and Gen UI demo focused first on Korean public-benefit and Government24-style discovery. The MVP provides deterministic MCP tools, shared schemas, SQLite-backed snapshot/change logging, rule-based consistency checks, and a Vite React demo UI.

## Key Decisions

- Apache-2.0 license.
- TypeScript/Node.js across server, schema, core, and demo UI.
- pnpm monorepo.
- stdio as the MVP MCP transport.
- Transport-neutral core for later HTTP/SSE adapters.
- Zod as source of truth with JSON Schema export.
- SQLite for snapshots, patches, consistency results, and cache metadata.
- Fixture import/export for deterministic tests and demos.
- Host/client LLM handles natural-language orchestration; the MCP server remains deterministic.

## Out of Scope

- Government24 login automation.
- Identity verification automation.
- Automatic form submission.
- Sensitive identifier storage.
- Definitive legal eligibility decisions.
- Scheduled crawling.
- Hosted HTTP/SSE gateway mode.
