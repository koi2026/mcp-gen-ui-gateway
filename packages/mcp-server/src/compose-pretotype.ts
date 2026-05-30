import { readFile } from "node:fs/promises";
import path from "node:path";

export const pretotypeContexts = ["newlywed", "freelancer", "postdoc"] as const;

export type PretotypeContext = (typeof pretotypeContexts)[number];

const pretotypeScenarioFiles = ["scenario_newlywed.json", "scenario_freelancer.json", "scenario_postdoc.json"] as const;

export type PretotypeScenario = {
  id: PretotypeContext;
  tag: string;
  label: string;
  stagedPrompt: string;
  routePolicy: "exact-tag-only";
  artifact: {
    mode: "self-contained-html";
    html: string;
  };
  assets: {
    id: string;
    kind: "image" | "font" | "script" | "style";
    delivery: "inline-data-url" | "inline-source" | "system-font-stack";
    format: string;
    count: number;
    note: string;
  }[];
  surface: {
    headline: string;
    signature: string;
    modules: string[];
  };
  officialHandoffs: {
    label: string;
    domain: string;
    url?: string;
    purpose: string;
  }[];
  boundaries: string[];
};

export async function composeGenuiArtifactText({ utterance }: { utterance: string }) {
  let scenarios: PretotypeScenario[];

  try {
    scenarios = await loadPretotypeScenarios();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return [
      "Pretotype scenario metadata is not available yet.",
      `Expected files: ${pretotypeScenarioFiles.map((fileName) => resolvePretotypeFilePath(path.join("scenarios", fileName))).join(", ")}`,
      `Read error: ${message}`
    ].join("\n");
  }

  const route = resolvePretotypeRoute(utterance, scenarios);

  if (route.status !== "ok") {
    return [
      route.message,
      `Supported tags: ${scenarios.map(({ tag }) => tag).join(", ")}.`,
      "Pretotype only routes fixed staged prompts by exact tag.",
      "No scenario was fabricated."
    ].join("\n");
  }

  try {
    return await readFile(resolvePretotypeFilePath(route.scenario.artifact.html), "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return [
      `Pretotype HTML for tag "${route.tag}" is not available yet.`,
      `Expected file: ${resolvePretotypeFilePath(route.scenario.artifact.html)}`,
      "Ensure apps/demo-ui/public/pretotype/embedded contains the checked-in self-contained HTML files.",
      `Read error: ${message}`
    ].join("\n");
  }
}

export function isPretotypeContext(value: string): value is PretotypeContext {
  return (pretotypeContexts as readonly string[]).includes(value);
}

export function resolveEmbeddedPretotypeHtmlPath(context: PretotypeContext) {
  return resolvePretotypeFilePath(path.join("embedded", `${context}.html`));
}

export async function loadPretotypeScenarios() {
  return Promise.all(
    pretotypeScenarioFiles.map(async (fileName) =>
      parsePretotypeScenario(fileName, await readFile(resolvePretotypeFilePath(path.join("scenarios", fileName)), "utf8"))
    )
  );
}

export function resolvePretotypeRoute(utterance: string, scenarios: PretotypeScenario[]) {
  const matchedScenarios = scenarios.filter(({ tag }) => utterance.includes(tag));

  if (matchedScenarios.length === 1) {
    return { status: "ok" as const, tag: matchedScenarios[0].tag, scenario: matchedScenarios[0] };
  }

  if (matchedScenarios.length > 1) {
    return {
      status: "error" as const,
      message: "Ambiguous pretotype tag."
    };
  }

  return {
    status: "error" as const,
    message: "Unsupported pretotype tag."
  };
}

function resolvePretotypeBasePath() {
  return process.env.MCP_GEN_UI_PRETOTYPE_DIST ?? path.join(findWorkspaceRoot(), "apps/demo-ui/public/pretotype");
}

function resolvePretotypeFilePath(relativePath: string) {
  const basePath = path.resolve(resolvePretotypeBasePath());
  const resolvedPath = path.resolve(basePath, relativePath);

  if (resolvedPath !== basePath && !resolvedPath.startsWith(`${basePath}${path.sep}`)) {
    throw new Error(`Pretotype path escapes base directory: ${relativePath}`);
  }

  return resolvedPath;
}

function parsePretotypeScenario(fileName: string, source: string): PretotypeScenario {
  const scenario = JSON.parse(source) as Partial<PretotypeScenario>;

  if (
    !scenario ||
    !isPretotypeContext(String(scenario.id)) ||
    typeof scenario.tag !== "string" ||
    typeof scenario.label !== "string" ||
    typeof scenario.stagedPrompt !== "string" ||
    scenario.routePolicy !== "exact-tag-only" ||
    scenario.artifact?.mode !== "self-contained-html" ||
    typeof scenario.artifact.html !== "string" ||
    !Array.isArray(scenario.assets) ||
    typeof scenario.surface?.headline !== "string" ||
    typeof scenario.surface.signature !== "string" ||
    !Array.isArray(scenario.surface.modules) ||
    !Array.isArray(scenario.officialHandoffs) ||
    !Array.isArray(scenario.boundaries)
  ) {
    throw new Error(`Invalid pretotype scenario metadata: ${fileName}`);
  }

  return scenario as PretotypeScenario;
}

function findWorkspaceRoot() {
  let current = process.cwd();

  while (current !== path.dirname(current)) {
    if (path.basename(current) === "mcp-gen-ui-gateway") {
      return current;
    }

    current = path.dirname(current);
  }

  return process.cwd();
}
