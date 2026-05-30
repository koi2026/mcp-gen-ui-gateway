import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { composeGenuiArtifactText } from "./compose-pretotype.js";

export const pretotypeMcpServerName = "pretotype-mcp-gen-ui-gateway";

const pretotypeInputShape = {
  utterance: z
    .string()
    .min(1)
    .describe("Full user prompt including exactly one supported context tag: [신혼부부], [프리랜서], or [박사후연구원].")
};

export function createPretotypeMcpServer() {
  const server = new McpServer({
    name: pretotypeMcpServerName,
    version: "0.1.0"
  });

  server.tool(
    "render_pretotype_scenario",
    "Pretotype connector tool. When the user prompt includes exactly one supported context tag, return the matching self-contained public-portal HTML for Claude to render verbatim as an Artifact.",
    pretotypeInputShape,
    async (input) => textToolResult(await composeGenuiArtifactText(input))
  );

  server.tool(
    "compose_genui_artifact",
    "Compatibility alias for render_pretotype_scenario. Prefer render_pretotype_scenario for Claude Desktop connector demos.",
    pretotypeInputShape,
    async (input) => textToolResult(await composeGenuiArtifactText(input))
  );

  return server;
}

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
