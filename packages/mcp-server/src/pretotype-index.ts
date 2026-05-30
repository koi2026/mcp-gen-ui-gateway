#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { composeGenuiArtifactText } from "./compose-pretotype.js";

const pretotypeInputShape = {
  utterance: z.string().min(1)
};

const server = new McpServer({
  name: "pretotype-mcp-gen-ui-gateway",
  version: "0.1.0"
});

server.tool(
  "render_pretotype_scenario",
  "Render one fixed public-portal pretotype scenario as a self-contained Claude HTML Artifact.",
  pretotypeInputShape,
  async (input) => textToolResult(await composeGenuiArtifactText(input))
);

server.tool(
  "compose_genui_artifact",
  "Compatibility alias for render_pretotype_scenario.",
  pretotypeInputShape,
  async (input) => textToolResult(await composeGenuiArtifactText(input))
);

const transport = new StdioServerTransport();
await server.connect(transport);

function textToolResult(text: string) {
  return {
    content: [
      {
        type: "text" as const,
        text
      }
    ]
  };
}
