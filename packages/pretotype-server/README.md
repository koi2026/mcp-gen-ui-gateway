# Pretotype MCP Artifacts

This folder contains the complete pretotype payload for Claude Desktop and the dedicated MCP server `pretotype-mcp-gen-ui-gateway`.

## Why Pretotype

The full product should eventually connect public-service sources, classify user context, weight those sources differently, run ranking or matrix-style selection over candidate service components, and render the most important pieces as GenUI.

This folder is intentionally narrower. It freezes the intelligence layer and keeps the delivery channel real: Claude sends a fixed staged prompt with one context tag, the MCP server resolves that tag through JSON, and Claude renders the selected self-contained HTML as an Artifact. The goal is to make the intended GenUI experience visible before live source orchestration and ranking exist.

Fixed staged prompt:

```text
대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

Supported context tags are `[신혼부부]`, `[프리랜서]`, and `[박사후연구원]`.

## Structure

```text
embedded/
  newlywed.html
  freelancer.html
  postdoc.html

scenarios/
  scenario_newlywed.json
  scenario_freelancer.json
  scenario_postdoc.json
```

The JSON files are human-readable routing manifests. The HTML files are the actual Claude Artifact payloads. Each HTML file contains its CSS, runtime JavaScript, photos, and Government24 logo inline, so Claude does not need to create, fetch, or attach separate assets.

## Claude Desktop Setup: Developer Clone/Build

Use this path before the npm package is published. Claude Desktop will run the compiled MCP server from your local clone.

Use Node.js 20 or 22 LTS. Avoid current majors such as Node 26 for now because the full workspace includes native dependencies that may not compile there.

### 1. Clone And Enter The Branch

```bash
git clone -b pretotype/genui-demo https://github.com/koi2026/mcp-gen-ui-gateway.git
cd mcp-gen-ui-gateway
```

### 2. Install And Build

```bash
pnpm install
pnpm --filter pretotype-mcp-gen-ui-gateway build
pwd
```

The `pwd` output is your repository root. Use it to replace `/ABS/PATH/mcp-gen-ui-gateway` below.

### 3. Add Claude Desktop Config

Open the config file:

```bash
mkdir -p "$HOME/Library/Application Support/Claude"
open -e "$HOME/Library/Application Support/Claude/claude_desktop_config.json"
```

If this is your first MCP server, use:

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

If the config already has other MCP servers, add only the `pretotype-mcp-gen-ui-gateway` entry inside the existing `mcpServers` object.

The server reads checked-in assets from `packages/pretotype-server/assets`, so no `MCP_GEN_UI_PRETOTYPE_DIST` environment variable is required.

### 4. Restart Claude Desktop

Fully quit Claude Desktop and open it again. MCP servers are loaded during app startup.

### 5. Verify With A Prompt

Paste the Host Prompt below, then run one Test Prompt. Claude should call `render_pretotype_scenario` and open the embedded `text/html;profile=mcp-app` resource as a full HTML Artifact, not a text summary or a regenerated chat UI.

## Host Prompt

Use this behavior in Claude Desktop:

```text
You render a public portal GenUI pretotype.

If the user includes exactly one of [신혼부부], [프리랜서], or [박사후연구원], call render_pretotype_scenario with:
{ "utterance": "<full user utterance>" }

`compose_genui_artifact` is available only as a compatibility alias.

If the tool returns an embedded `text/html;profile=mcp-app` resource, render that returned self-contained HTML resource verbatim as a Claude HTML Artifact. Do not summarize it, rewrite it, redesign it, extract only parts of it, recreate it with another layout, or create separate assets.

If the tag is missing, unsupported, or ambiguous, ask for exactly one of [신혼부부], [프리랜서], or [박사후연구원]. Do not invent a scenario.
```

## Test Prompts

```text
[신혼부부] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

```text
[프리랜서] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

```text
[박사후연구원] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

## Contract

MCP tool:

```json
{
  "name": "render_pretotype_scenario",
  "arguments": {
    "utterance": "[프리랜서] 대전 유성구로 이사 왔어요..."
  }
}
```

Response:

```json
{
  "content": [
    {
      "type": "resource",
      "resource": {
        "uri": "ui://pretotype/stage0/freelancer.html",
        "mimeType": "text/html;profile=mcp-app",
        "text": "<!DOCTYPE html>..."
      },
      "_meta": {
        "mcp-gen-ui-gateway/stage": "0",
        "mcp-gen-ui-gateway/expectedRender": "prepared-html-artifact"
      }
    },
    {
      "type": "text",
      "text": "Stage 0 pretotype prepared HTML resource returned..."
    }
  ],
  "structuredContent": {
    "status": "ok",
    "context": "freelancer",
    "routePolicy": "exact-tag-only",
    "artifact": {
      "mode": "self-contained-html",
      "uri": "ui://pretotype/stage0/freelancer.html",
      "mimeType": "text/html;profile=mcp-app"
    },
    "expectedRender": "prepared-html-artifact"
  }
}
```

The server loads `scenarios/scenario_*.json`, matches the exact tag, reads the manifest's `artifact.html`, and returns that HTML as the primary embedded resource. The short text block is only a fallback/instruction for clients that do not render embedded resources.

## Stage 1 Handoff Metadata

This branch adds `pretotype.scenario.v2` helpers for official handoff metadata and validation.

Stage 1 keeps `render_pretotype_scenario` unchanged: exact tag in, fixed self-contained HTML out. The new source-handoff layer lets reviewers inspect provider, domain, service type, confidence, login/action hints, source refs, and validation issues without asking Claude to create assets or regenerate the page.

Implemented Stage 1 contract layers:

- `pretotype.scenario.v2`
- `OfficialHandoffV2`
- URL/domain validator
- source ref propagation
- manual-review diagnostics for broad homepages or mismatched official domains

## Stage 2 Context Weighting

This branch adds the Stage 2 context and ranking layer on top of Stage 1.

Stage 2 introduces `ContextVector`, `ComponentCandidate`, and `gateway.ranking.v1`. It can classify broader prompt signals such as household, work status, housing status, urgency, and risk focus, then score visible modules against official handoff source refs.

Implemented Stage 2 contract layers:

- `ContextVector`
- component candidate profiles
- weighting matrix
- source-backed ranking trace
- unmapped module diagnostics

## Stage 3 Dynamic GenUI Renderer

This branch adds the Stage 3 response and rendering layer on top of Stage 2.

Stage 3 introduces `genui.gateway.v1`, `compose_dynamic_genui_response`, and `render_dynamic_genui_template`. The fixed `render_pretotype_scenario` route still returns the original self-contained persona HTML, while the dynamic path returns sourced blocks, evidence, errors, diagnostics, and a lightweight self-contained HTML rendering of the same response.

Implemented Stage 3 contract layers:

- `genui.gateway.v1`
- `GenUIResponse`
- block/source/evidence/error separation
- partial and failed response states
- dynamic self-contained HTML template renderer
- HTTPS-only outbound links with escaped dynamic text

## Boundaries

- No live API fetch.
- No login, identity verification, application submission, or tax filing.
- No eligibility or legal conclusion is finalized inside the artifact.
- Official URLs are handoff links only.
- Missing, unsupported, or multiple tags return a disclosure instead of fabricated content.
- Dynamic Stage 3 tools are additive and do not mutate the Stage 0 fixed HTML artifacts.


## Manual Claude Verification Checklist

Use this checklist when validating the Stage 0 connector in Claude Desktop:

1. Build the current checkout: `pnpm --filter pretotype-mcp-gen-ui-gateway build`.
2. Confirm `claude_desktop_config.json` points at this checkout's `packages/pretotype-server/dist/pretotype-index.js`; stale clone paths can make Claude list an older server.
3. Fully restart Claude Desktop.
4. Run one supported tagged prompt.
5. Check `~/Library/Logs/Claude/mcp.log` or `mcp-server-pretotype-mcp-gen-ui-gateway.log` for `tools/list` followed by `tools/call` for `render_pretotype_scenario`.
6. Confirm the result includes a `ui://pretotype/stage0/{context}.html` resource with `mimeType: text/html;profile=mcp-app`.
7. The successful user-visible result is the prepared Government24-style HTML Artifact. A Claude-generated checklist/dashboard in the normal chat response is a failed Stage 0 delivery path.
