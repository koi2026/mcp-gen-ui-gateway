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

## Contribution Workflow

Branch naming, atomic commits, Conventional Commits, and PR review rules are documented in [docs/git-workflow.md](docs/git-workflow.md).

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

## Claude Desktop Pretotype

The June 4 pretotype is a fixed staged demo: Claude sends one tagged utterance to the MCP tool, the server resolves the tag through `scenario_*.json`, and it returns one checked-in self-contained HTML artifact.

```bash
pnpm install
pnpm --filter @mcp-gen-ui-gateway/mcp-server build
```

Add this server to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "public-portal-pretotype": {
      "command": "node",
      "args": [
        "/Users/reliqbit_mac/Downloads/Public portal gateway GenUI MCP/mcp-gen-ui-gateway/packages/mcp-server/dist/index.js"
      ],
      "env": {
        "MCP_GEN_UI_PRETOTYPE_DIST": "/Users/reliqbit_mac/Downloads/Public portal gateway GenUI MCP/mcp-gen-ui-gateway/apps/demo-ui/public/pretotype"
      }
    }
  }
}
```

Restart Claude Desktop, then ask it to call `compose_genui_artifact` and render the returned HTML verbatim as an Artifact:

```text
[프리랜서] 대전 유성구로 이사 왔어요. 전입신고, 전세 계약 법적 체크, 우리 동네 생활 데이터를 한곳에서 확인하고 싶어요.
```

Supported tags are `[신혼부부]`, `[프리랜서]`, and `[박사후연구원]`. The pretotype does not infer from free text; the tag is the route. Details are in [apps/demo-ui/public/pretotype/README.md](apps/demo-ui/public/pretotype/README.md).

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
