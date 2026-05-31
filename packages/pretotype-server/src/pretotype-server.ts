import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { composeGenuiArtifactDelivery, type PretotypeArtifactDelivery } from "./compose-pretotype.js";
import { composeDynamicGenuiResponse, renderDynamicGenuiHtml } from "./genui-response.js";

export const pretotypeMcpServerName = "pretotype-mcp-gen-ui-gateway";

const pretotypeInputShape = {
  utterance: z
    .string()
    .min(1)
    .describe("Full user prompt including exactly one supported context tag: [신혼부부], [프리랜서], or [박사후연구원].")
};

const dynamicPretotypeInputShape = {
  utterance: z
    .string()
    .min(1)
    .describe("Full user prompt. A supported context tag is preferred, but the experimental dynamic path can infer a scenario from broader context signals.")
};

export function createPretotypeMcpServer() {
  const server = new McpServer({
    name: pretotypeMcpServerName,
    version: "0.1.0"
  });

  server.tool(
    "render_pretotype_scenario",
    "Stage 0 pretotype connector. For exactly one supported context tag, call this tool and render its first embedded text/html resource verbatim as the prepared Claude HTML Artifact. Do not redesign or summarize it.",
    pretotypeInputShape,
    async (input) => composePretotypeScenarioToolResult(input)
  );

  server.tool(
    "compose_genui_artifact",
    "Compatibility alias for render_pretotype_scenario. Returns the same embedded text/html Stage 0 resource; prefer render_pretotype_scenario for Claude Desktop connector demos.",
    pretotypeInputShape,
    async (input) => composePretotypeScenarioToolResult(input)
  );

  server.tool(
    "compose_dynamic_genui_response",
    "Stage 1-3 experimental tool. Return a versioned GenUIResponse JSON envelope with sourced handoffs, context vector, ranking trace, blocks, evidence, and diagnostics.",
    dynamicPretotypeInputShape,
    async (input) => textToolResult(JSON.stringify(await composeDynamicGenuiResponse(input), null, 2))
  );

  server.tool(
    "render_dynamic_genui_template",
    "Stage 3 experimental tool. Compose a GenUIResponse and render it through the dynamic HTML template renderer. Keeps render_pretotype_scenario unchanged for the Stage 0 fixed Artifact baseline.",
    dynamicPretotypeInputShape,
    async (input) => textToolResult(renderDynamicGenuiHtml(await composeDynamicGenuiResponse(input)))
  );

  return server;
}

export async function composePretotypeScenarioToolResult(input: { utterance: string }): Promise<CallToolResult> {
  return pretotypeArtifactToolResult(await composeGenuiArtifactDelivery(input));
}

function pretotypeArtifactToolResult(delivery: PretotypeArtifactDelivery): CallToolResult {
  if (delivery.status !== "ok") {
    return {
      content: [
        {
          type: "text",
          text: delivery.message
        }
      ],
      structuredContent: {
        status: "error",
        expectedRender: "none",
        routePolicy: "exact-tag-only"
      }
    };
  }

  return {
    content: [
      {
        type: "resource",
        resource: {
          uri: delivery.uri,
          mimeType: delivery.mimeType,
          text: delivery.html
        },
        _meta: {
          "mcp-gen-ui-gateway/stage": "0",
          "mcp-gen-ui-gateway/context": delivery.context,
          "mcp-gen-ui-gateway/expectedRender": "prepared-html-artifact"
        }
      },
      {
        type: "text",
        text: [
          `Stage 0 pretotype prepared HTML resource returned for ${delivery.tag}.`,
          `Render ${delivery.uri} as the Claude HTML Artifact verbatim; do not summarize, redesign, or rebuild it.`
        ].join(" ")
      }
    ],
    structuredContent: {
      status: "ok",
      context: delivery.context,
      tag: delivery.tag,
      routePolicy: delivery.routePolicy,
      artifact: {
        mode: delivery.artifactMode,
        uri: delivery.uri,
        mimeType: delivery.mimeType
      },
      expectedRender: "prepared-html-artifact"
    }
  };
}

function textToolResult(text: string): CallToolResult {
  return {
    content: [
      {
        type: "text" as const,
        text
      }
    ]
  };
}
