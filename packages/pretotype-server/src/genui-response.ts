import { loadPretotypeScenarios, resolvePretotypeRoute, type PretotypeScenario } from "./compose-pretotype.js";
import { inferContextVector, rankComponentCandidates, type ComponentCandidate, type ContextVector } from "./context-ranking.js";
import {
  createScenarioV2,
  validateOfficialHandoffs,
  type HandoffValidationIssue,
  type OfficialHandoffV2,
  type PretotypeScenarioV2
} from "./source-handoffs.js";

export type GenUIRunStatus = "success" | "partial" | "failed";

export type GenUISource = {
  id: string;
  provider: string;
  dataset: string;
  serviceType: string;
  format: "official-url";
  status: "verified" | "manual-review" | "fallback" | "broken";
  retrievedAt: string;
  lastUpdated: string;
  uri: string;
};

export type GenUIEvidence = {
  id: string;
  sourceId: string;
  label: string;
  claim: string;
  confidence: "high" | "medium" | "low";
  uri: string;
};

export type GatewayError = {
  code: string;
  message: string;
  retryable: boolean;
  scope: string;
  sourceId?: string;
  blockId?: string;
};

export type ToolTrace = {
  tool: string;
  status: "success" | "partial" | "failed";
  detail: string;
};

export type GenUIBlock = {
  id: string;
  type: "summary" | "action-checklist" | "service-card-list" | "handoff-link-list" | "timeline" | "local-data-panel" | "notice";
  title: string;
  body?: string;
  items?: {
    id: string;
    label: string;
    description: string;
    href?: string;
    score?: number;
  }[];
  sourceRefs: string[];
  evidenceRefs: string[];
};

export type GenUIResponse = {
  run: {
    id: string;
    status: GenUIRunStatus;
    generatedAt: string;
    userQuery: string;
    contractVersion: "genui.gateway.v1";
  };
  context: ContextVector;
  blocks: GenUIBlock[];
  sources: GenUISource[];
  evidence: GenUIEvidence[];
  errors: GatewayError[];
  diagnostics?: ToolTrace[];
};

const supportedTags = ["[신혼부부]", "[프리랜서]", "[박사후연구원]"] as const;

export async function composeDynamicGenuiResponse({
  utterance,
  generatedAt = new Date().toISOString()
}: {
  utterance: string;
  generatedAt?: string;
}): Promise<GenUIResponse> {
  const context = inferContextVector(utterance);
  let scenarios: PretotypeScenario[];

  try {
    scenarios = await loadPretotypeScenarios();
  } catch (error) {
    return composeScenarioLoadFailureResponse({ utterance, generatedAt, context, error });
  }

  return composeDynamicGenuiResponseFromScenarios({
    utterance,
    generatedAt,
    scenarios
  });
}

export function composeDynamicGenuiResponseFromScenarios({
  utterance,
  generatedAt = new Date().toISOString(),
  scenarios
}: {
  utterance: string;
  generatedAt?: string;
  scenarios: PretotypeScenario[];
}): GenUIResponse {
  const context = inferContextVector(utterance);
  const route = resolveDynamicPretotypeScenario(utterance, scenarios, context);

  if (route.status !== "ok") {
    return composeUnsupportedTagResponse({ utterance, generatedAt, context });
  }

  const handoffValidation = validateOfficialHandoffs(route.scenario);
  const scenario = createScenarioV2(route.scenario, {
    generatedAt,
    resolverVersion: "dynamic-genui.v1"
  });
  const ranking = rankComponentCandidates({ context, scenario });
  const sources = toSources(scenario.officialHandoffs, generatedAt);
  const evidence = toEvidence(scenario.officialHandoffs);
  const defaultSourceRefs = sources.map(({ id }) => id);
  const defaultEvidenceRefs = evidence.map(({ id }) => id);
  const selectedSourceRefs = unique(ranking.selected.flatMap((candidate) => candidate.sourceRefs));
  const selectedEvidenceRefs = evidenceRefsForSources(evidence, selectedSourceRefs);
  const errors = handoffIssuesToErrors(handoffValidation.issues, scenario.officialHandoffs);
  const hasRankingGaps = ranking.trace.unmappedModuleIds.length > 0;
  const runStatus: GenUIRunStatus =
    ranking.selected.length === 0 || handoffValidation.unresolvedCount > 0 || hasRankingGaps ? "partial" : "success";

  return {
    run: {
      id: `genui-${scenario.id}-${stableHash(utterance)}`,
      status: runStatus,
      generatedAt,
      userQuery: utterance,
      contractVersion: "genui.gateway.v1"
    },
    context,
    blocks: [
      {
        id: "summary",
        type: "summary",
        title: scenario.surface.headline,
        body: `${scenario.surface.signature} 선택된 컴포넌트 ${ranking.selected.length}개를 공식 handoff 출처와 함께 구성했습니다.`,
        sourceRefs: defaultSourceRefs,
        evidenceRefs: defaultEvidenceRefs
      },
      {
        id: "selected-actions",
        type: "action-checklist",
        title: "우선 확인할 작업",
        items: ranking.selected.map(candidateToActionItem),
        sourceRefs: selectedSourceRefs,
        evidenceRefs: selectedEvidenceRefs
      },
      {
        id: "service-cards",
        type: "service-card-list",
        title: "추천 컴포넌트",
        items: ranking.selected.map(candidateToServiceCard),
        sourceRefs: selectedSourceRefs,
        evidenceRefs: selectedEvidenceRefs
      },
      {
        id: "official-handoffs",
        type: "handoff-link-list",
        title: "공식 출처",
        items: scenario.officialHandoffs.map(handoffToItem),
        sourceRefs: defaultSourceRefs,
        evidenceRefs: defaultEvidenceRefs
      },
      {
        id: "boundaries",
        type: "notice",
        title: "범위 안내",
        body: scenario.boundaries.join(" / "),
        sourceRefs: defaultSourceRefs,
        evidenceRefs: defaultEvidenceRefs
      }
    ],
    sources,
    evidence,
    errors,
    diagnostics: [
      {
        tool: "route",
        status: route.strategy === "exact-tag" ? "success" : "partial",
        detail:
          route.strategy === "exact-tag"
            ? `exact tag selected ${route.scenario.id}`
            : `context-vector selected ${route.scenario.id} without exact Stage 0 tag`
      },
      {
        tool: "ranking",
        status: hasRankingGaps ? "partial" : "success",
        detail: `${ranking.version}: ${ranking.trace.formula}; selected=${ranking.trace.selectedCount}; unmapped=${ranking.trace.unmappedModuleIds.join(", ") || "none"}`
      },
      {
        tool: "scenario",
        status: "success",
        detail: `${scenario.version}: ${scenario.id}`
      },
      {
        tool: "source-handoffs",
        status: handoffValidation.status === "verified" ? "success" : "partial",
        detail: `unresolved=${handoffValidation.unresolvedCount}`
      }
    ]
  };
}

type DynamicPretotypeRoute =
  | {
      status: "ok";
      tag: string;
      scenario: PretotypeScenario;
      strategy: "exact-tag" | "context-vector";
    }
  | {
      status: "error";
      message: string;
    };

function resolveDynamicPretotypeScenario(
  utterance: string,
  scenarios: PretotypeScenario[],
  context: ContextVector
): DynamicPretotypeRoute {
  const exactRoute = resolvePretotypeRoute(utterance, scenarios);

  if (exactRoute.status === "ok") {
    return {
      ...exactRoute,
      strategy: "exact-tag"
    };
  }

  if (exactRoute.message === "Ambiguous pretotype tag.") {
    return exactRoute;
  }

  const inferredScenarioId = inferScenarioIdFromContext(context);
  const inferredScenario = inferredScenarioId ? scenarios.find(({ id }) => id === inferredScenarioId) : undefined;

  if (inferredScenario) {
    return {
      status: "ok",
      tag: inferredScenario.tag,
      scenario: inferredScenario,
      strategy: "context-vector"
    };
  }

  return exactRoute;
}

function inferScenarioIdFromContext(context: ContextVector): PretotypeScenario["id"] | undefined {
  if (context.household === "newlywed") {
    return "newlywed";
  }

  if (context.workStatus === "freelancer" || context.lifeEvent === "business-start") {
    return "freelancer";
  }

  if (context.workStatus === "researcher" || context.lifeEvent === "research-start") {
    return "postdoc";
  }

  if (context.riskFocus?.includes("tax")) {
    return "freelancer";
  }

  if (context.riskFocus?.includes("research")) {
    return "postdoc";
  }

  if (context.riskFocus?.includes("housing")) {
    return "newlywed";
  }

  return undefined;
}

export function renderDynamicGenuiHtml(response: GenUIResponse) {
  const blockHtml = response.blocks.map(renderBlock).join("\n");
  const sourceHtml = response.sources.map(renderSource).join("\n");
  const diagnosticsHtml = response.diagnostics?.map(renderTrace).join("\n") ?? "";

  return [
    "<!DOCTYPE html>",
    `<html lang="ko" data-contract-version="${escapeHtml(response.run.contractVersion)}">`,
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${escapeHtml(response.blocks[0]?.title ?? "GenUI Gateway")}</title>`,
    "<style>",
    ":root{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#14213d;background:#f5f7fb}",
    "body{margin:0}.shell{max-width:1180px;margin:0 auto;padding:28px}.topbar{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:22px}",
    ".brand{font-weight:800;font-size:22px}.badge{border-radius:999px;background:#eaf1ff;color:#2454d6;padding:6px 12px;font-size:13px}",
    ".grid{display:grid;grid-template-columns:2fr 1fr;gap:18px}.block{background:white;border:1px solid #e4eaf5;border-radius:8px;padding:18px;margin-bottom:14px;box-shadow:0 8px 24px rgba(20,33,61,.06)}",
    ".block h2{font-size:18px;margin:0 0 12px}.block p{line-height:1.65;color:#526079}.items{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.item{border:1px solid #e8eef8;border-radius:8px;padding:12px;background:#f9fbff}",
    ".item strong{display:block;margin-bottom:6px}.item a{color:#2454d6;text-decoration:none;font-weight:700}.meta{font-size:12px;color:#68758f}.notice{border-left:4px solid #2454d6}.trace{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#44516a;background:#eef3fb}",
    "@media (max-width:860px){.grid{grid-template-columns:1fr}.shell{padding:18px}}",
    "</style>",
    "</head>",
    "<body>",
    '<main class="shell">',
    '<div class="topbar">',
    '<div class="brand">정부24 GenUI Gateway</div>',
    `<div class="badge">${escapeHtml(response.run.status)} · ${escapeHtml(response.run.generatedAt)}</div>`,
    "</div>",
    '<section class="grid">',
    `<div>${blockHtml}</div>`,
    `<aside><section class="block"><h2>공식 출처</h2>${sourceHtml || "<p>출처 없음</p>"}</section><section class="block trace"><h2>ranking trace</h2>${diagnosticsHtml}</section></aside>`,
    "</section>",
    "</main>",
    "</body>",
    "</html>"
  ].join("\n");
}

function composeUnsupportedTagResponse({
  utterance,
  generatedAt,
  context
}: {
  utterance: string;
  generatedAt: string;
  context: ContextVector;
}): GenUIResponse {
  return {
    run: {
      id: `genui-unsupported-${stableHash(utterance)}`,
      status: "partial",
      generatedAt,
      userQuery: utterance,
      contractVersion: "genui.gateway.v1"
    },
    context,
    blocks: [
      {
        id: "unsupported-tag-notice",
        type: "notice",
        title: "지원되는 pretotype tag가 필요합니다",
        body: `Stage 0 pretotype routing은 정확히 하나의 태그만 허용합니다: ${supportedTags.join(", ")}.`,
        sourceRefs: [],
        evidenceRefs: []
      }
    ],
    sources: [],
    evidence: [],
    errors: [
      {
        code: "unsupported-pretotype-tag",
        message: `Use exactly one of ${supportedTags.join(", ")}.`,
        retryable: true,
        scope: "route"
      }
    ],
    diagnostics: [
      {
        tool: "route",
        status: "partial",
        detail: "No fixed pretotype route selected; dynamic response only returns a notice."
      }
    ]
  };
}

function composeScenarioLoadFailureResponse({
  utterance,
  generatedAt,
  context,
  error
}: {
  utterance: string;
  generatedAt: string;
  context: ContextVector;
  error: unknown;
}): GenUIResponse {
  const message = error instanceof Error ? error.message : String(error);

  return {
    run: {
      id: `genui-failed-${stableHash(utterance)}`,
      status: "failed",
      generatedAt,
      userQuery: utterance,
      contractVersion: "genui.gateway.v1"
    },
    context,
    blocks: [
      {
        id: "scenario-load-failed",
        type: "notice",
        title: "Pretotype scenario metadata를 읽을 수 없습니다",
        body: "고정 HTML 아티팩트 라우팅에 필요한 scenario JSON을 찾거나 파싱하지 못했습니다.",
        sourceRefs: [],
        evidenceRefs: []
      }
    ],
    sources: [],
    evidence: [],
    errors: [
      {
        code: "pretotype-scenario-load-failed",
        message,
        retryable: true,
        scope: "scenario"
      }
    ],
    diagnostics: [
      {
        tool: "scenario",
        status: "failed",
        detail: message
      }
    ]
  };
}

function toSources(handoffs: OfficialHandoffV2[], retrievedAt: string): GenUISource[] {
  const bySourceId = new Map<string, GenUISource>();

  for (const handoff of handoffs) {
    const id = handoff.sourceRefs[0] ?? `source:${handoff.domain}`;

    if (!bySourceId.has(id)) {
      bySourceId.set(id, {
        id,
        provider: handoff.provider,
        dataset: handoff.label,
        serviceType: handoff.serviceType,
        format: "official-url",
        status: handoff.status,
        retrievedAt,
        lastUpdated: handoff.lastVerifiedAt,
        uri: handoff.url
      });
    }
  }

  return [...bySourceId.values()];
}

function toEvidence(handoffs: OfficialHandoffV2[]): GenUIEvidence[] {
  return handoffs.map((handoff) => ({
    id: `evidence:${handoff.id}`,
    sourceId: handoff.sourceRefs[0] ?? `source:${handoff.domain}`,
    label: handoff.label,
    claim: handoff.purpose,
    confidence: handoff.confidence,
    uri: handoff.url
  }));
}

function handoffIssuesToErrors(issues: HandoffValidationIssue[], handoffs: OfficialHandoffV2[]): GatewayError[] {
  return issues.map((issue) => {
    const handoff = handoffs.find(
      (candidate) =>
        candidate.label === issue.label &&
        candidate.domain === issue.domain &&
        (issue.url === undefined || candidate.url === issue.url)
    );

    return {
      code: `handoff-${issue.code}`,
      message: `${issue.label}: ${issue.detail}`,
      retryable: true,
      scope: "source-handoff",
      sourceId: handoff?.sourceRefs[0]
    };
  });
}

function evidenceRefsForSources(evidence: GenUIEvidence[], sourceRefs: string[]) {
  const allowedSourceRefs = new Set(sourceRefs);

  return evidence.filter(({ sourceId }) => allowedSourceRefs.has(sourceId)).map(({ id }) => id);
}

function candidateToActionItem(candidate: ComponentCandidate) {
  return {
    id: candidate.id,
    label: candidate.id,
    description: candidate.rationale,
    score: candidate.score
  };
}

function candidateToServiceCard(candidate: ComponentCandidate) {
  return {
    id: `card-${candidate.id}`,
    label: candidate.id,
    description: `${candidate.componentType} · score ${candidate.score}`,
    score: candidate.score
  };
}

function handoffToItem(handoff: OfficialHandoffV2) {
  return {
    id: handoff.id,
    label: handoff.label,
    description: `${handoff.provider} · ${handoff.purpose}`,
    href: handoff.url
  };
}

function renderBlock(block: GenUIBlock) {
  const className = block.type === "notice" ? "block notice" : "block";
  const itemHtml = block.items?.length ? `<div class="items">${block.items.map(renderItem).join("\n")}</div>` : "";

  return [
    `<section class="${className}" data-block-id="${escapeHtml(block.id)}" data-block-type="${escapeHtml(block.type)}">`,
    `<h2>${escapeHtml(block.title)}</h2>`,
    block.body ? `<p>${escapeHtml(block.body)}</p>` : "",
    itemHtml,
    `<div class="meta">sources: ${escapeHtml(block.sourceRefs.join(", ") || "none")} · evidence: ${escapeHtml(block.evidenceRefs.join(", ") || "none")}</div>`,
    "</section>"
  ].join("\n");
}

function renderItem(item: NonNullable<GenUIBlock["items"]>[number]) {
  const label = escapeHtml(item.label);
  const href = item.href && isSafeHttpUrl(item.href) ? item.href : undefined;
  const content = [
    `<strong>${href ? `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${label}</a>` : label}</strong>`,
    `<span>${escapeHtml(item.description)}</span>`,
    item.score === undefined ? "" : `<div class="meta">score ${item.score}</div>`
  ].join("\n");

  return `<div class="item" data-item-id="${escapeAttribute(item.id)}">${content}</div>`;
}

function renderSource(source: GenUISource) {
  const provider = escapeHtml(source.provider);
  const sourceLabel = isSafeHttpUrl(source.uri)
    ? `<a href="${escapeAttribute(source.uri)}" target="_blank" rel="noopener noreferrer">${provider}</a>`
    : provider;

  return [
    `<div class="item" data-source-id="${escapeAttribute(source.id)}">`,
    `<strong>${sourceLabel}</strong>`,
    `<span>${escapeHtml(source.dataset)} · ${escapeHtml(source.status)}</span>`,
    "</div>"
  ].join("\n");
}

function renderTrace(trace: ToolTrace) {
  return `<p><strong>${escapeHtml(trace.tool)}</strong>: ${escapeHtml(trace.status)} · ${escapeHtml(trace.detail)}</p>`;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function stableHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => htmlEscapes[char] ?? char);
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}

function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
