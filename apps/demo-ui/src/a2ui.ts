import type {
  ApplicationGuide,
  DemoScenario,
  GatewayContract,
  Metric,
  PublicDataSource,
  SearchSuggestion,
  ServiceAction,
  ServiceResult,
  ToolTrace
} from "./demo-data";

export type A2UIBlock =
  | { type: "hero-summary"; id: string; query: string; intent: string; answer: string }
  | { type: "search-suggestions"; id: string; suggestions: SearchSuggestion[] }
  | { type: "service-actions"; id: string; services: ServiceAction[] }
  | { type: "metric-strip"; id: string; metrics: Metric[] }
  | { type: "service-results"; id: string; title: string; results: ServiceResult[] }
  | { type: "application-guide"; id: string; guide: ApplicationGuide }
  | { type: "data-table"; id: string; title: string; columns: { key: string; label: string }[]; rows: Record<string, string>[] }
  | { type: "source-list"; id: string; sources: PublicDataSource[] }
  | { type: "tool-trace"; id: string; traces: ToolTrace[] }
  | { type: "gateway-contract"; id: string; contract: GatewayContract }
  | { type: "notice"; id: string; title: string; items: string[] };

export type GenUIRun = {
  id: string;
  status: "success" | "partial" | "failed";
  generatedAt: string;
  userQuery: string;
};

export type GenUIEnvelope = {
  run: GenUIRun;
  blocks: A2UIBlock[];
  sources: PublicDataSource[];
  errors: { code: string; message: string; retryable: boolean; sourceId?: string; blockId?: string }[];
  diagnostics: ToolTrace[];
};

export const supportedBlockTypes: A2UIBlock["type"][] = [
  "hero-summary",
  "search-suggestions",
  "service-actions",
  "metric-strip",
  "service-results",
  "application-guide",
  "data-table",
  "source-list",
  "tool-trace",
  "gateway-contract",
  "notice"
];

export function scenarioToA2UI(scenario: DemoScenario): A2UIBlock[] {
  return scenarioToGenUIResponse(scenario).blocks;
}

export function scenarioToGenUIResponse(scenario: DemoScenario): GenUIEnvelope {
  const hasFallback = scenario.sources.some((source) => source.status === "fallback");

  return {
    run: {
      id: scenario.id,
      status: hasFallback ? "partial" : "success",
      generatedAt: "2026-05-26T00:00:00.000+09:00",
      userQuery: scenario.query
    },
    blocks: [
    {
      type: "hero-summary",
      id: `${scenario.id}-summary`,
      query: scenario.query,
      intent: scenario.intent,
      answer: scenario.answer
    },
    {
      type: "search-suggestions",
      id: `${scenario.id}-suggestions`,
      suggestions: scenario.suggestions
    },
    {
      type: "service-actions",
      id: `${scenario.id}-services`,
      services: scenario.services
    },
    {
      type: "metric-strip",
      id: `${scenario.id}-metrics`,
      metrics: scenario.metrics
    },
    {
      type: "service-results",
      id: `${scenario.id}-results`,
      title: "민원 검색 결과",
      results: scenario.serviceResults
    },
    {
      type: "application-guide",
      id: `${scenario.id}-application-guide`,
      guide: scenario.applicationGuide
    },
    {
      type: "data-table",
      id: `${scenario.id}-table`,
      title: scenario.table.title,
      columns: scenario.table.columns,
      rows: scenario.table.rows
    },
    {
      type: "source-list",
      id: `${scenario.id}-sources`,
      sources: scenario.sources
    },
    {
      type: "tool-trace",
      id: `${scenario.id}-trace`,
      traces: scenario.toolTrace
    },
    {
      type: "gateway-contract",
      id: `${scenario.id}-contract`,
      contract: scenario.contract
    },
    {
      type: "notice",
      id: `${scenario.id}-caveats`,
      title: "데모 안전장치",
      items: scenario.caveats
    }
    ],
    sources: scenario.sources,
    errors: hasFallback
      ? [
          {
            code: "SOURCE_FALLBACK",
            message: "일부 공공 API가 mock fallback 응답으로 대체되었습니다.",
            retryable: true,
            sourceId: scenario.sources.find((source) => source.status === "fallback")?.id
          }
        ]
      : [],
    diagnostics: scenario.toolTrace
  };
}
