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

Paste the Host Prompt below, then run one Test Prompt. Claude should call `render_pretotype_scenario` and open a full HTML Artifact, not a text summary.

## Host Prompt

Use this behavior in Claude Desktop:

```text
You render a public portal GenUI pretotype.

If the user includes exactly one of [신혼부부], [프리랜서], or [박사후연구원], call render_pretotype_scenario with:
{ "utterance": "<full user utterance>" }

`compose_genui_artifact` is available only as a compatibility alias.

If the tool returns HTML, render that returned self-contained HTML verbatim as a Claude HTML Artifact. Do not summarize it, rewrite it, redesign it, extract only parts of it, recreate it with another layout, or create separate assets.

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
      "type": "text",
      "text": "<!DOCTYPE html>..."
    }
  ]
}
```

The server loads `scenarios/scenario_*.json`, matches the exact tag, reads the manifest's `artifact.html`, and returns that HTML string.

## Experimental Stage 1-3 Tools

The June 4 demo tool remains `render_pretotype_scenario`: exact tag in, fixed self-contained HTML out.

This package also includes experimental follow-up tools for the post-demo roadmap:

- `compose_dynamic_genui_response`: returns `genui.gateway.v1` JSON. It upgrades fixed scenario manifests into sourced handoff metadata, infers a `ContextVector`, ranks component candidates with a weighting trace, and returns renderable blocks with sources/evidence/errors.
- `render_dynamic_genui_template`: renders the same `GenUIResponse` through a lightweight self-contained HTML template.

These tools are not the demo path. They exist to develop Stage 1-3 without mutating the Stage 0 fixed HTML artifacts.

Unlike `render_pretotype_scenario`, the experimental dynamic tools may infer a close scenario from context when an exact tag is absent. They still return safe partial or failed envelopes for unsupported context, scenario metadata load failures, unresolved handoff validation, or unknown component mappings.

Implemented contract layers:

- Stage 1: `pretotype.scenario.v2`, official handoff metadata, URL/domain validator, source/evidence/error propagation.
- Stage 2: `ContextVector`, broader context inference, component weighting matrix, machine-readable ranking trace.
- Stage 3: `genui.gateway.v1`, dynamic block response, self-contained HTML template renderer, HTTPS-only outbound links.

## Boundaries

- No live API fetch.
- No login, identity verification, application submission, or tax filing.
- No eligibility or legal conclusion is finalized inside the artifact.
- Official URLs are handoff links only.
- Missing, unsupported, or multiple tags return a disclosure instead of fabricated content.
