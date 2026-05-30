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

## Claude Desktop Pretotype Quick Start

Use this path when you want to run the June 4 pretotype from a cloned repository, before publishing the npm package.

This is a local `stdio` MCP install. It does not require Vercel, Railway, a public HTTPS URL, or Claude's custom connector URL form. Claude Desktop starts the MCP server from your local checkout.

### 1. Prerequisites

- Claude Desktop installed and signed in.
- Node.js 20 or 22 LTS.
- pnpm 9.x or newer.
- macOS path examples below assume Claude Desktop's default config path.

Check local versions:

```bash
node -v
pnpm -v
```

Expected Node examples are `v20.x` or `v22.x`. Avoid unreleased/current majors such as Node 26 for now because the workspace includes native dependencies that may not compile there.

If `pnpm` is missing:

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

### 2. Clone This Branch

```bash
git clone -b pretotype/genui-demo https://github.com/koi2026/mcp-gen-ui-gateway.git
cd mcp-gen-ui-gateway
```

### 3. Install And Build Only The Pretotype MCP Server

```bash
pnpm install
pnpm --filter pretotype-mcp-gen-ui-gateway build
```

Optional but recommended:

```bash
pnpm --filter pretotype-mcp-gen-ui-gateway test
```

The build output must include:

```text
packages/pretotype-server/dist/pretotype-index.js
packages/pretotype-server/assets/embedded/newlywed.html
packages/pretotype-server/assets/embedded/freelancer.html
packages/pretotype-server/assets/embedded/postdoc.html
packages/pretotype-server/assets/scenarios/scenario_newlywed.json
packages/pretotype-server/assets/scenarios/scenario_freelancer.json
packages/pretotype-server/assets/scenarios/scenario_postdoc.json
```

### 4. Get Your Absolute Repository Path

Run this from the repository root:

```bash
pwd
```

Example output:

```text
/Users/you/projects/mcp-gen-ui-gateway
```

Use your own output wherever this README says `/ABS/PATH/mcp-gen-ui-gateway`.

### 5. Edit Claude Desktop MCP Config

Open the Claude Desktop config file:

```bash
mkdir -p "$HOME/Library/Application Support/Claude"
open -e "$HOME/Library/Application Support/Claude/claude_desktop_config.json"
```

If the file is empty or does not exist yet, use this full JSON:

```json
{
  "mcpServers": {
    "pretotype-mcp-gen-ui-gateway": {
      "command": "node",
      "args": [
        "/ABS/PATH/mcp-gen-ui-gateway/packages/pretotype-server/dist/pretotype-index.js"
      ]
    }
  }
}
```

If your config already has other MCP servers, add only this entry inside the existing `mcpServers` object:

```json
"pretotype-mcp-gen-ui-gateway": {
  "command": "node",
  "args": [
    "/ABS/PATH/mcp-gen-ui-gateway/packages/pretotype-server/dist/pretotype-index.js"
  ]
}
```

Do not leave `/ABS/PATH/mcp-gen-ui-gateway` in the file. Replace it with the exact `pwd` output from step 4.

No `MCP_GEN_UI_PRETOTYPE_DIST` env var is required for the current pretotype package. The package is self-contained and reads its own `assets/` directory.

### 6. Restart Claude Desktop

Fully quit Claude Desktop and open it again.

On macOS, use `Cmd+Q`, then reopen Claude Desktop. A normal window close is not always enough because MCP servers are loaded at app startup.

### 7. Add The Host Instruction In Claude

Paste this instruction into the Claude chat or project where the MCP server is enabled:

```text
You render a public portal GenUI pretotype.

If the user includes exactly one of [신혼부부], [프리랜서], or [박사후연구원], call render_pretotype_scenario with:
{ "utterance": "<full user utterance>" }

If render_pretotype_scenario returns HTML, render that returned self-contained HTML verbatim as a Claude HTML Artifact. Do not summarize it, rewrite it, redesign it, extract only parts of it, recreate it with another layout, or create separate assets.

The artifact links are external official handoff links. Do not claim that login, identity verification, application submission, legal interpretation, or tax filing happened inside the artifact.

If the tag is missing, unsupported, or ambiguous, ask for exactly one of [신혼부부], [프리랜서], or [박사후연구원]. Do not invent a scenario.
```

### 8. Run The Demo Prompt

Use one of these exact prompts:

```text
[신혼부부] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

```text
[프리랜서] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

```text
[박사후연구원] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

Expected result:

```text
Claude prompt
  -> render_pretotype_scenario
  -> exact context tag route
  -> scenario_*.json
  -> embedded/*.html
  -> Claude HTML Artifact
```

The successful demo is not a text summary. Claude should open a full HTML Artifact that looks like a Government24-style page for the selected persona.

### 9. Troubleshooting

If Claude does not show the MCP tool:

- Confirm the JSON file is valid. A missing comma can prevent all MCP servers from loading.
- Confirm the path in `args` exists:

  ```bash
  ls "/ABS/PATH/mcp-gen-ui-gateway/packages/pretotype-server/dist/pretotype-index.js"
  ```

- Confirm you ran:

  ```bash
  pnpm --filter pretotype-mcp-gen-ui-gateway build
  ```

- Fully quit and reopen Claude Desktop.

If `pnpm install` fails while compiling `better-sqlite3`, check `node -v`. Use Node 20 or 22 LTS, reinstall dependencies, then rebuild:

```bash
node -v
rm -rf node_modules
pnpm install
pnpm --filter pretotype-mcp-gen-ui-gateway build
```

If Claude says `node` cannot be found, use the absolute Node path:

```bash
which node
```

Then change the config:

```json
{
  "mcpServers": {
    "pretotype-mcp-gen-ui-gateway": {
      "command": "/ABS/PATH/TO/node",
      "args": [
        "/ABS/PATH/mcp-gen-ui-gateway/packages/pretotype-server/dist/pretotype-index.js"
      ]
    }
  }
}
```

If Claude calls the tool but returns a disclosure instead of HTML, the prompt probably has no supported tag or has multiple tags. Use exactly one of:

```text
[신혼부부]
[프리랜서]
[박사후연구원]
```

## Pretotype Scope

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

Post-demo development stages are outlined in [docs/pretotype-follow-up-roadmap.md](docs/pretotype-follow-up-roadmap.md).

## Optional Remote Custom Connector

Claude's custom connector form expects a remote MCP server URL. That is a different deployment path from the local clone/build flow above.

Run the HTTP entrypoint locally:

```bash
pnpm --filter pretotype-mcp-gen-ui-gateway build
MCP_HTTP_HOST=127.0.0.1 MCP_HTTP_PORT=8787 pnpm pretotype:http
curl http://127.0.0.1:8787/health
```

Expose `http://127.0.0.1:8787` through a tunnel or deployment that gives you an HTTPS origin. In the custom connector modal, enter:

```text
Name: pretotype-mcp-gen-ui-gateway
Remote MCP server URL: https://YOUR-DOMAIN.example/mcp
```

For the June 4 pretotype, the local Claude Desktop config is the recommended path. Use the remote connector only when you intentionally want an externally reachable MCP server.

## Repository Development

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
