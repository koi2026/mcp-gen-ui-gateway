#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createPretotypeMcpServer, pretotypeMcpServerName } from "./pretotype-server.js";

type PretotypeMcpSession = {
  mcpServer: ReturnType<typeof createPretotypeMcpServer>;
  transport: StreamableHTTPServerTransport;
};

const sessions = new Map<string, PretotypeMcpSession>();
const host = process.env.MCP_HTTP_HOST ?? process.env.HOST ?? "127.0.0.1";
const port = parsePort(process.env.MCP_HTTP_PORT ?? process.env.PORT ?? "8787");
const mcpPath = normalizePath(process.env.MCP_HTTP_PATH ?? "/mcp");

const httpServer = createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = parseRequestUrl(req);

  if (url.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      name: pretotypeMcpServerName,
      transport: "streamable-http",
      endpoint: mcpPath,
      sessions: sessions.size
    });
    return;
  }

  if (url.pathname !== mcpPath) {
    sendJson(res, 404, {
      error: "Not Found",
      expected: mcpPath
    });
    return;
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, {
      error: "Unauthorized"
    });
    return;
  }

  await handleMcpRequest(req, res);
});

httpServer.listen(port, host, () => {
  console.log(`${pretotypeMcpServerName} listening at http://${host}:${port}${mcpPath}`);
  console.log(`health check: http://${host}:${port}/health`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}

async function handleMcpRequest(req: IncomingMessage, res: ServerResponse) {
  let parsedBody: unknown;

  try {
    parsedBody = await readJsonBody(req);
  } catch (error) {
    sendJsonRpcError(res, 400, -32700, error instanceof Error ? error.message : "Invalid JSON request body");
    return;
  }

  const sessionId = readSingleHeader(req, "mcp-session-id");
  const existingSession = sessionId ? sessions.get(sessionId) : undefined;

  if (existingSession) {
    await existingSession.transport.handleRequest(req, res, parsedBody);
    return;
  }

  if (sessionId) {
    sendJsonRpcError(res, 404, -32000, "Invalid or expired MCP session ID");
    return;
  }

  if (req.method !== "POST" || !isInitializeRequest(parsedBody)) {
    sendJsonRpcError(res, 400, -32000, "Bad Request: initialize the MCP session with POST /mcp first");
    return;
  }

  const mcpServer = createPretotypeMcpServer();
  let transport: StreamableHTTPServerTransport;

  transport = new StreamableHTTPServerTransport({
    enableJsonResponse: true,
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (newSessionId) => {
      sessions.set(newSessionId, {
        mcpServer,
        transport
      });
    },
    onsessionclosed: (closedSessionId) => {
      sessions.delete(closedSessionId);
    }
  });

  transport.onclose = () => {
    const closedSessionId = transport.sessionId;

    if (closedSessionId) {
      sessions.delete(closedSessionId);
    }
  };

  transport.onerror = (error) => {
    console.error("MCP transport error:", error);
  };

  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, parsedBody);
}

async function readJsonBody(req: IncomingMessage) {
  if (!["POST", "PUT", "PATCH"].includes(req.method ?? "")) {
    return undefined;
  }

  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return undefined;
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();

  if (!rawBody) {
    return undefined;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON request body: ${detail}`);
  }
}

function parseRequestUrl(req: IncomingMessage) {
  const hostHeader = readSingleHeader(req, "host") ?? `${host}:${port}`;
  return new URL(req.url ?? "/", `http://${hostHeader}`);
}

function isAuthorized(req: IncomingMessage) {
  const expectedToken = process.env.MCP_HTTP_BEARER_TOKEN;

  if (!expectedToken) {
    return true;
  }

  return readSingleHeader(req, "authorization") === `Bearer ${expectedToken}`;
}

function setCorsHeaders(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", process.env.MCP_HTTP_CORS_ORIGIN ?? "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
}

function readSingleHeader(req: IncomingMessage, headerName: string) {
  const value = req.headers[headerName.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  if (res.headersSent) {
    return;
  }

  res.writeHead(statusCode, {
    "Content-Type": "application/json"
  });
  res.end(JSON.stringify(body));
}

function sendJsonRpcError(res: ServerResponse, statusCode: number, code: number, message: string) {
  sendJson(res, statusCode, {
    jsonrpc: "2.0",
    error: {
      code,
      message
    },
    id: null
  });
}

function normalizePath(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "/mcp";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function parsePort(value: string) {
  const parsedPort = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
    throw new Error(`Invalid MCP HTTP port: ${value}`);
  }

  return parsedPort;
}

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down ${pretotypeMcpServerName}`);

  for (const session of sessions.values()) {
    await session.mcpServer.close().catch((error: unknown) => {
      console.error("Failed to close MCP server:", error);
    });
  }

  sessions.clear();
  httpServer.close(() => {
    process.exit(0);
  });
}
