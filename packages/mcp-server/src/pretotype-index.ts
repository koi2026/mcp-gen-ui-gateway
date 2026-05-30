#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPretotypeMcpServer } from "./pretotype-server.js";

const server = createPretotypeMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);
