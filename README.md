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
- Pretotype Streamable HTTP MCP endpoint for remote custom connector demos
- Experimental Playwright browser-assist boundary, documented but isolated from core

Out of scope: Government24 login automation, identity verification, automatic form submission, resident registration numbers, passwords, certificates, auth tokens, definitive eligibility decisions, scheduled crawling, and production-hosted multi-tenant gateway operations.

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

Run the pretotype MCP server over Streamable HTTP for a remote custom connector:

```bash
pnpm pretotype:http
```

## Claude Desktop Pretotype

This branch includes a deliberately narrow pretotype of the future GenUI Gateway MCP.

The full product direction is broader than the current demo. In the complete product, the Gateway MCP will connect multiple public-service sources, classify the user's context, apply different weights to sources and components, run ranking or matrix-style selection over the available evidence, and render only the highest-value components through GenUI. In other words, the intended full range is:

```text
user context
  -> connected source data
  -> context-specific weighting
  -> component/risk/action matrix
  -> selected GenUI blocks
  -> public-service surface
```

The current pretotype intentionally does not implement that ranking brain yet. Its purpose is to make the final interaction easy to understand inside Claude Desktop: one fixed staged prompt plus one explicit context tag routes to one of three prebuilt, self-contained HTML artifacts. This proves the MCP-to-Claude-Artifact delivery path and shows what a generated public-service GenUI surface could feel like before live source orchestration exists.

Current staged prompt:

```text
대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

Add exactly one context tag in front of that prompt:

```text
[신혼부부] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
[프리랜서] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
[박사후연구원] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

Pretotype routing is intentionally simple:

```text
Claude prompt
  -> exact context tag parser
  -> MCP tool: render_pretotype_scenario
  -> scenario_newlywed.json | scenario_freelancer.json | scenario_postdoc.json
  -> embedded/newlywed.html | embedded/freelancer.html | embedded/postdoc.html
  -> Claude HTML Artifact
```

The scenario JSON files are visible manifests for reviewers. They describe the staged prompt, context tag, selected HTML artifact, inline assets, official handoff links, visible modules, and boundaries. The JSON is not pretending to be a live ranker output yet; it documents the fixed route used by this pretotype.

The HTML files are the actual artifact payloads. Each file is self-contained: CSS, runtime JavaScript, photos, and the Government24 logo are embedded inline, so Claude does not need to create or fetch sibling assets.

Pretotype boundaries:

- Exact tag routing only: `[신혼부부]`, `[프리랜서]`, or `[박사후연구원]`.
- No live public API fetch, no source weighting, and no matrix ranking yet.
- No login, identity verification, certificate flow, application submission, or tax filing.
- No eligibility, legal, or tax conclusion is finalized inside the artifact.
- Official URLs are outbound handoff links only.
- Missing, unsupported, or multiple tags return a disclosure instead of fabricated content.

### Claude Custom Connector Setup

Claude's custom connector form expects a remote MCP server URL, not a local `stdio` command. For this pretotype, run the Streamable HTTP endpoint and expose it through HTTPS.

```bash
git clone https://github.com/koi2026/mcp-gen-ui-gateway.git
cd mcp-gen-ui-gateway
pnpm install
pnpm --filter @mcp-gen-ui-gateway/mcp-server build
MCP_HTTP_HOST=127.0.0.1 MCP_HTTP_PORT=8787 pnpm pretotype:http
```

Local checks:

```bash
curl http://127.0.0.1:8787/health
```

Expose `http://127.0.0.1:8787` with a tunnel or deployment that gives you an HTTPS origin. In the custom connector modal, enter:

```text
Name: pretotype-mcp-gen-ui-gateway
Remote MCP server URL: https://YOUR-DOMAIN.example/mcp
```

For a deployed process, set `MCP_HTTP_HOST=0.0.0.0` and use the platform-provided `PORT` or `MCP_HTTP_PORT`.

### Claude Desktop Local Config

```bash
git clone https://github.com/koi2026/mcp-gen-ui-gateway.git
cd mcp-gen-ui-gateway
pnpm install
pnpm --filter @mcp-gen-ui-gateway/mcp-server build
pwd
```

If you prefer the older local desktop config path, add this server to `~/Library/Application Support/Claude/claude_desktop_config.json`. Replace `/ABS/PATH/mcp-gen-ui-gateway` with the path printed by `pwd`.

```json
{
  "mcpServers": {
    "pretotype-mcp-gen-ui-gateway": {
      "command": "node",
      "args": [
        "/ABS/PATH/mcp-gen-ui-gateway/packages/mcp-server/dist/pretotype-index.js"
      ],
      "env": {
        "MCP_GEN_UI_PRETOTYPE_DIST": "/ABS/PATH/mcp-gen-ui-gateway/apps/demo-ui/public/pretotype"
      }
    }
  }
}
```

Restart Claude Desktop after editing the config.

### Claude Host Prompt

Use this instruction in Claude Desktop so the model does not rebuild the UI itself:

```text
You render a public portal GenUI pretotype.

If the user includes exactly one of [신혼부부], [프리랜서], or [박사후연구원], call render_pretotype_scenario with:
{ "utterance": "<full user utterance>" }

If the tool returns HTML, render that returned self-contained HTML verbatim as a Claude HTML Artifact. Do not summarize it, rewrite it, redesign it, extract only parts of it, recreate it with another layout, or create separate assets.

If the tag is missing, unsupported, or ambiguous, ask for exactly one of [신혼부부], [프리랜서], or [박사후연구원]. Do not invent a scenario.
```

Then test with:

```text
[프리랜서] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

Details are in [docs/claude-desktop-pretotype-connector.md](docs/claude-desktop-pretotype-connector.md), [apps/demo-ui/public/pretotype/README.md](apps/demo-ui/public/pretotype/README.md), and [docs/pretotype-mcp-usage.md](docs/pretotype-mcp-usage.md).

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
- `render_pretotype_scenario`: pretotype-only tool on `pretotype-mcp-gen-ui-gateway`; returns a self-contained HTML artifact for one exact tag.

The server does not include an LLM. The MCP host is expected to orchestrate natural language, follow-up questions, and tool calls.
