# Claude Desktop Pretotype Connector

This guide turns the checked-in pretotype HTML into a Claude Desktop MCP connector flow.

The goal is not to ask Claude to design a new page. Claude should only route the fixed staged prompt to the MCP server, receive the selected self-contained HTML, and open that HTML verbatim as an Artifact.

Claude's custom connector dialog asks for a remote MCP server URL. Use the Streamable HTTP entrypoint in this repository for that path. The older `claude_desktop_config.json` `stdio` setup is still documented below as a local fallback.

## Scenario

```text
user fixed prompt
  -> Claude Desktop MCP connector
  -> render_pretotype_scenario({ utterance })
  -> exact context tag route
  -> scenario_*.json manifest
  -> embedded/*.html
  -> Claude HTML Artifact
```

Fixed prompt body:

```text
대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

Supported context tags:

- `[신혼부부]`
- `[프리랜서]`
- `[박사후연구원]`

The context tag is the route. The rest of the prompt is staged demo copy. The pretotype does not perform live source search, source weighting, or matrix ranking yet.

## Build

From the repository root:

```bash
pnpm install
pnpm --filter pretotype-mcp-gen-ui-gateway build
pwd
```

Use the printed absolute path in the Claude Desktop config below.

## Custom Connector URL

Start the pretotype MCP server over Streamable HTTP:

```bash
MCP_HTTP_HOST=127.0.0.1 MCP_HTTP_PORT=8787 pnpm pretotype:http
```

Check that it is alive:

```bash
curl http://127.0.0.1:8787/health
```

The MCP endpoint is:

```text
http://127.0.0.1:8787/mcp
```

Claude custom connectors need a remote HTTPS URL. Expose or deploy the local server so that `/mcp` is reachable through HTTPS. Then enter this in the custom connector modal:

```text
Name: pretotype-mcp-gen-ui-gateway
Remote MCP server URL: https://YOUR-DOMAIN.example/mcp
```

For a deployed process, use:

```bash
MCP_HTTP_HOST=0.0.0.0 MCP_HTTP_PORT=$PORT pnpm pretotype:http
```

If the hosting platform provides `PORT`, `MCP_HTTP_PORT` can be omitted. The server also exposes `GET /health` for uptime checks. `MCP_HTTP_BEARER_TOKEN` is supported for simple bearer-token protection when the MCP host can send an `Authorization` header.

## Local Claude Desktop Config

Edit:

```text
~/Library/Application Support/Claude/claude_desktop_config.json
```

Add:

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

Replace both `/ABS/PATH/mcp-gen-ui-gateway` values with the path printed by `pwd`.

Restart Claude Desktop after saving the config. This local config path uses `stdio`, so it does not produce a URL for the custom connector modal.

## Claude Instruction

Use this instruction in the Claude chat or project where the connector is enabled:

```text
You render a public portal GenUI pretotype.

If the user includes exactly one of [신혼부부], [프리랜서], or [박사후연구원], call render_pretotype_scenario with:
{ "utterance": "<full user utterance>" }

If `render_pretotype_scenario` returns an embedded `text/html;profile=mcp-app` resource, render that returned self-contained HTML resource verbatim as a Claude HTML Artifact. Do not summarize it, rewrite it, redesign it, extract only parts of it, recreate it with another layout, or create separate assets.

The artifact links are external official handoff links. Do not claim that login, identity verification, application submission, legal interpretation, or tax filing happened inside the artifact.

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

## Expected Result

Claude should call `render_pretotype_scenario`, receive a `ui://pretotype/stage0/{context}.html` embedded resource with `mimeType: text/html;profile=mcp-app`, and open that HTML as an Artifact.

Expected route mapping:

```text
[신혼부부]     -> scenarios/scenario_newlywed.json   -> embedded/newlywed.html
[프리랜서]     -> scenarios/scenario_freelancer.json -> embedded/freelancer.html
[박사후연구원] -> scenarios/scenario_postdoc.json    -> embedded/postdoc.html
```

Unsupported or multiple tags should produce a short disclosure instead of a fabricated UI.

## Local Verification

After building, verify the server contract through the test suite:

```bash
pnpm --filter pretotype-mcp-gen-ui-gateway test
```

You can also run the dedicated pretotype server manually:

```bash
pnpm pretotype:mcp
```

That command starts a stdio MCP process. It will wait for an MCP host such as Claude Desktop and will not print a web URL.

For the custom connector flow, run:

```bash
pnpm pretotype:http
```

That command starts a Streamable HTTP MCP server. The connector URL is `/mcp` on the server origin.


## Troubleshooting: Connector Visible But No Artifact

If the connector is enabled but Claude writes a new checklist or dashboard in chat, verify the invocation path before changing the HTML payload:

1. Confirm the Desktop config points at the current checkout's built `packages/pretotype-server/dist/pretotype-index.js`, not an older clone.
2. Restart Claude Desktop after changing the config or rebuilding.
3. Inspect `~/Library/Logs/Claude/mcp.log` or `mcp-server-pretotype-mcp-gen-ui-gateway.log`. A healthy run shows `initialize`, `tools/list`, and then `tools/call` for `render_pretotype_scenario`.
4. If there is no `tools/call`, Claude never received the prepared HTML. Strengthen the chat/project instruction to call the Stage 0 tool for exact tags.
5. If `tools/call` exists but the Artifact does not open, inspect the result shape: the first content block should be the `text/html;profile=mcp-app` embedded resource.
