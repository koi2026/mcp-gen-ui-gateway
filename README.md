# MCP-Gen UI Gateway

[![CI](https://github.com/koi2026/mcp-gen-ui-gateway/actions/workflows/ci.yml/badge.svg)](https://github.com/koi2026/mcp-gen-ui-gateway/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-9-orange.svg)](https://pnpm.io)

Open-source MCP gateway for public-benefit discovery and Gen UI rendering.

The MVP focuses on Korean public-benefit and Government24-style service discovery. It exposes deterministic MCP tools, validates domain JSON with Zod, records snapshots and change logs in SQLite, and renders fixture-backed results in a Vite React demo UI.

## Scope

- Local stdio MCP server
- Transport-neutral core tool service
- Zod domain schemas with JSON Schema export
- Fixture-backed public-benefit search
- Rule-based consistency checks
- SQLite snapshot/change-log store
- Vite React demo for `domain JSON -> A2UI -> UI`
- Experimental Playwright browser-assist boundary, documented but isolated from core

Out of scope: Government24 login automation, identity verification, automatic form submission, resident registration numbers, passwords, certificates, auth tokens, definitive eligibility decisions, scheduled crawling, and hosted HTTP/SSE gateway mode.

## Quick Start

```bash
pnpm install
pnpm build
pnpm test
pnpm dev
```

Run the MCP server over stdio:

```bash
pnpm mcp
```

Export JSON Schemas:

```bash
pnpm schemas
```

## MCP Tools

- `searchBenefits`: find benefit candidates from non-identifying profile conditions.
- `getBenefitDetail`: return structured details for a benefit.
- `buildChecklist`: produce application preparation items.
- `getApplicationGuide`: return step-by-step application guidance.
- `getChangeLog`: return recorded snapshot and diff events.

The server does not include an LLM. The MCP host is expected to orchestrate natural language, follow-up questions, and tool calls.
