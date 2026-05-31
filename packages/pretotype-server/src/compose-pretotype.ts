import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

export const pretotypeHtmlResourceMimeType = "text/html;profile=mcp-app";

export type PretotypeArtifactDelivery =
  | {
      status: "ok";
      context: PretotypeContext;
      tag: string;
      routePolicy: "exact-tag-only";
      artifactMode: "self-contained-html";
      uri: string;
      mimeType: typeof pretotypeHtmlResourceMimeType;
      html: string;
    }
  | {
      status: "error";
      message: string;
    };

export async function composeGenuiArtifactText({ utterance }: { utterance: string }) {
  const delivery = await composeGenuiArtifactDelivery({ utterance });

  return delivery.status === "ok" ? delivery.html : delivery.message;
}

export async function composeGenuiArtifactDelivery({ utterance }: { utterance: string }): Promise<PretotypeArtifactDelivery> {
  let scenarios: PretotypeScenario[];

  try {
    scenarios = await loadPretotypeScenarios();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      status: "error",
      message: [
        "Pretotype scenario metadata is not available yet.",
        `Expected files: ${pretotypeScenarioFiles.map((fileName) => resolvePretotypeFilePath(path.join("scenarios", fileName))).join(", ")}`,
        `Read error: ${message}`
      ].join("\n")
    };
  }

  const route = resolvePretotypeRoute(utterance, scenarios);

  if (route.status !== "ok") {
    return {
      status: "error",
      message: [
        route.message,
        `Supported tags: ${scenarios.map(({ tag }) => tag).join(", ")}.`,
        "Pretotype only routes fixed staged prompts by exact tag.",
        "No scenario was fabricated."
      ].join("\n")
    };
  }

  try {
    const html = await readFile(resolvePretotypeFilePath(route.scenario.artifact.html), "utf8");

    return {
      status: "ok",
      context: route.scenario.id,
      tag: route.tag,
      routePolicy: route.scenario.routePolicy,
      artifactMode: route.scenario.artifact.mode,
      uri: `ui://pretotype/stage0/${route.scenario.id}.html`,
      mimeType: pretotypeHtmlResourceMimeType,
      html
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      status: "error",
      message: [
        `Pretotype HTML for tag "${route.tag}" is not available yet.`,
        `Expected file: ${resolvePretotypeFilePath(route.scenario.artifact.html)}`,
        "Ensure the pretotype-server package ships the self-contained HTML under assets/embedded.",
        `Read error: ${message}`
      ].join("\n")
    };
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
  return process.env.MCP_GEN_UI_PRETOTYPE_DIST ?? defaultPretotypeAssetsDir();
}

function defaultPretotypeAssetsDir() {
  // Resolves to <package>/assets for both `tsx src/*.ts` (dev) and compiled `dist/*.js` (prod),
  // since src and dist both sit one level below the package root. Keeps the published
  // package self-contained instead of reaching into a sibling workspace app.
  return fileURLToPath(new URL("../assets", import.meta.url));
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
