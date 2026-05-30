# Pretotype MCP Artifacts

This folder contains the complete June 4 pretotype payload for Claude Desktop and the dedicated MCP server `pretotype-mcp-gen-ui-gateway`.

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

The JSON files are human-readable routing manifests. The HTML files are the actual Claude Artifact payloads. Each HTML file contains its CSS, runtime JavaScript, and JPEG images inline, so Claude does not need to create, fetch, or attach separate assets.

## Claude Desktop Setup

From the repository root:

```bash
pnpm install
pnpm --filter @mcp-gen-ui-gateway/mcp-server build
pwd
```

Add this to `~/Library/Application Support/Claude/claude_desktop_config.json`. Replace `/ABS/PATH/mcp-gen-ui-gateway` with the path printed by `pwd`.

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
[신혼부부] 대전 유성구로 이사 왔어요. 전입신고, 전세 계약 법적 체크, 우리 동네 생활 데이터를 한곳에서 확인하고 싶어요.
```

```text
[프리랜서] 대전 유성구로 이사 왔어요. 전입신고, 전세 계약 법적 체크, 우리 동네 생활 데이터를 한곳에서 확인하고 싶어요.
```

```text
[박사후연구원] 대전 유성구로 이사 왔어요. 전입신고, 전세 계약 법적 체크, 우리 동네 생활 데이터를 한곳에서 확인하고 싶어요.
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

## Boundaries

- No live API fetch.
- No login, identity verification, application submission, or tax filing.
- No eligibility or legal conclusion is finalized inside the artifact.
- Official URLs are handoff links only.
- Missing, unsupported, or multiple tags return a disclosure instead of fabricated content.
