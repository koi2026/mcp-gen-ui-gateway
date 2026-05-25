# MCP-Gen UI Gateway

Open-source MCP gateway for public-service discovery and GenUI rendering.

The MVP focuses on Korean public-service and Government24-style gateway UX. It exposes deterministic MCP tools, validates domain JSON with Zod, records snapshots and change logs in SQLite, and renders fixture-backed public API/MCP results in a Vite React demo UI.

## Role C: Frontend / GenUI Renderer / Demo DevOps

Role C owns the public-service UI layer that turns public OpenAPI and MCP Tool responses into user-facing Government24-like screens. The current React demo provides a reusable GenUI renderer foundation for arbitrary government API results, including summary sections, metric cards, service actions, data tables, source status, fallback visibility, and tool traces.

In team architecture, this role sits after the MCP backend and AI orchestration layers:

- Team A exposes public data sources as MCP tools and schemas.
- Team B interprets user intent, calls tools, and produces GenUI response plans.
- Team C renders those responses as trustworthy government-service UI and maintains the demo/deployment surface.

## Scope

- Local stdio MCP server
- Transport-neutral core tool service
- Zod domain schemas with JSON Schema export
- Fixture-backed public-service scenarios
- Rule-based consistency checks
- SQLite snapshot/change-log store
- Vite React demo for `public API/MCP response -> GenUI blocks -> Government24-like UI`
- Reusable Government24-style component layer for future generated UI
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
