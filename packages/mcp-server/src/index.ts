#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { BenefitToolService, FixtureBenefitRepository, SnapshotStore } from "@mcp-gen-ui-gateway/core";
import { BenefitSearchRequestSchema } from "@mcp-gen-ui-gateway/schema";
import { composeGenuiArtifactText } from "./compose-pretotype.js";

let tools: BenefitToolService | undefined;

const server = new McpServer({
  name: "mcp-gen-ui-gateway",
  version: "0.1.0"
});

server.tool(
  "searchBenefits",
  "Find public-benefit candidates from non-identifying user profile conditions.",
  BenefitSearchRequestSchema.shape,
  async (input) => jsonToolResult(await getTools().searchBenefits(input))
);

server.tool(
  "getBenefitDetail",
  "Return structured detail for a benefit candidate.",
  { id: z.string().min(1) },
  async ({ id }) => jsonToolResult(await getTools().getBenefitDetail(id))
);

server.tool(
  "buildChecklist",
  "Build a preparation checklist for a benefit application.",
  { benefitId: z.string().min(1) },
  async ({ benefitId }) => jsonToolResult(await getTools().buildChecklist(benefitId))
);

server.tool(
  "getApplicationGuide",
  "Return user-action-only application guidance for a benefit.",
  { benefitId: z.string().min(1) },
  async ({ benefitId }) => jsonToolResult(await getTools().getApplicationGuide(benefitId))
);

server.tool(
  "getChangeLog",
  "Return snapshot and change-log entries for all benefits or one benefit.",
  { entityId: z.string().optional() },
  async ({ entityId }) => jsonToolResult(await getTools().getChangeLog(entityId))
);

server.tool(
  "compose_genui_artifact",
  "Return a self-contained HTML GenUI artifact for a fixed pretotype tag.",
  {
    utterance: z.string().min(1)
  },
  async (input) => textToolResult(await composeGenuiArtifactText(input))
);

const transport = new StdioServerTransport();
await server.connect(transport);

function getTools() {
  tools ??= new BenefitToolService(
    new FixtureBenefitRepository(),
    new SnapshotStore(process.env.MCP_GEN_UI_DB_PATH ?? "mcp-gen-ui-gateway.db")
  );

  return tools;
}

function jsonToolResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
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
