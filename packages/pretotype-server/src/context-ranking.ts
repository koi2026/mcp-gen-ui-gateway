import type { PretotypeScenarioV2, OfficialHandoffV2 } from "./source-handoffs.js";

export type ContextVector = {
  region?: string;
  lifeEvent?: "move" | "marriage" | "job-change" | "research-start" | "business-start" | "unknown";
  household?: "single" | "newlywed" | "family" | "unknown";
  workStatus?: "freelancer" | "employee" | "student" | "researcher" | "unknown";
  housingStatus?: "jeonse" | "monthly-rent" | "owner" | "unknown";
  urgency?: "today" | "within-14-days" | "this-month" | "unknown";
  riskFocus?: ("legal" | "tax" | "housing" | "local-safety" | "benefit" | "research")[];
};

export type ComponentCandidate = {
  id: string;
  componentType: "checklist" | "service-card" | "risk-notice" | "map-panel" | "document-list" | "timeline";
  sourceRefs: string[];
  basePriority: number;
  weights: {
    personaFit: number;
    lifeEventFit: number;
    regionFit: number;
    urgency: number;
    evidenceConfidence: number;
    actionability: number;
    userFrictionPenalty: number;
  };
  score: number;
  selected: boolean;
  rationale: string;
};

export type RankingResult = {
  version: "gateway.ranking.v1";
  context: ContextVector;
  candidates: ComponentCandidate[];
  selected: ComponentCandidate[];
  trace: {
    formula: string;
    selectedCount: number;
    unmappedModuleIds: string[];
  };
};

type ModuleProfile = {
  componentType: ComponentCandidate["componentType"];
  basePriority: number;
  riskFocus?: NonNullable<ContextVector["riskFocus"]>[number];
  serviceTypes?: OfficialHandoffV2["serviceType"][];
  persona?: NonNullable<ContextVector["workStatus"] | ContextVector["household"]>;
};

const moduleProfiles: Record<string, ModuleProfile> = {
  "risk-score-panel": { componentType: "risk-notice", basePriority: 5, riskFocus: "housing", serviceTypes: ["housing", "legal-information"] },
  "action-bundle": { componentType: "checklist", basePriority: 4, serviceTypes: ["civil-application", "housing"] },
  "legal-checklist": { componentType: "checklist", basePriority: 5, riskFocus: "legal", serviceTypes: ["legal-information", "housing"] },
  "rent-evidence": { componentType: "document-list", basePriority: 4, riskFocus: "housing", serviceTypes: ["housing"] },
  "housing-candidate-rail": { componentType: "service-card", basePriority: 4, riskFocus: "benefit", serviceTypes: ["housing"] },
  "family-life-map": { componentType: "map-panel", basePriority: 3, riskFocus: "local-safety", serviceTypes: ["childcare", "local-data"] },
  "deadline-timeline": { componentType: "timeline", basePriority: 5, serviceTypes: ["tax", "civil-application"] },
  "tax-action-panel": { componentType: "service-card", basePriority: 6, riskFocus: "tax", serviceTypes: ["tax"], persona: "freelancer" },
  "business-address-task": { componentType: "checklist", basePriority: 5, serviceTypes: ["tax", "postal"], persona: "freelancer" },
  "expense-proof-checklist": { componentType: "document-list", basePriority: 4, riskFocus: "tax", serviceTypes: ["tax"] },
  "work-infra-map": { componentType: "map-panel", basePriority: 3, riskFocus: "local-safety", serviceTypes: ["local-data"] },
  "missed-risk-alert": { componentType: "risk-notice", basePriority: 4, serviceTypes: ["civil-application", "tax"] },
  "research-profile-dashboard": { componentType: "service-card", basePriority: 6, riskFocus: "research", serviceTypes: ["research"], persona: "researcher" },
  "rnd-data-panel": { componentType: "service-card", basePriority: 5, riskFocus: "research", serviceTypes: ["research"] },
  "institution-document-pack": { componentType: "document-list", basePriority: 4, serviceTypes: ["civil-application", "tax"] },
  "research-life-map": { componentType: "map-panel", basePriority: 3, serviceTypes: ["research", "local-data"] },
  "lease-basis-mini": { componentType: "checklist", basePriority: 3, riskFocus: "housing", serviceTypes: ["housing", "legal-information"] },
  "tax-prep-mini": { componentType: "checklist", basePriority: 3, riskFocus: "tax", serviceTypes: ["tax"] }
};

export function inferContextVector(utterance: string): ContextVector {
  const text = utterance.trim();
  const riskFocus = inferRiskFocus(text);

  return {
    region: /대전|유성/.test(text) ? "대전 유성구" : undefined,
    lifeEvent: inferLifeEvent(text),
    household: inferHousehold(text),
    workStatus: inferWorkStatus(text),
    housingStatus: inferHousingStatus(text),
    urgency: inferUrgency(text),
    riskFocus
  };
}

export function rankComponentCandidates({
  context,
  scenario,
  limit = 5
}: {
  context: ContextVector;
  scenario: PretotypeScenarioV2;
  limit?: number;
}): RankingResult {
  const candidates = scenario.surface.modules.map((moduleId) => scoreModule(moduleId, context, scenario.officialHandoffs));
  const sortedCandidates = [...candidates].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const selectedIds = new Set(sortedCandidates.slice(0, limit).map(({ id }) => id));
  const rankedCandidates = sortedCandidates.map((candidate) => ({
    ...candidate,
    selected: selectedIds.has(candidate.id),
    rationale: selectedIds.has(candidate.id)
      ? `Selected because ${candidate.id} scored ${candidate.score} from context fit, evidence confidence, and actionability.`
      : `Not selected because ${candidate.id} scored ${candidate.score}, below the top ${limit} components.`
  }));

  return {
    version: "gateway.ranking.v1",
    context,
    candidates: rankedCandidates,
    selected: rankedCandidates.filter(({ selected }) => selected),
    trace: {
      formula:
        "score = basePriority + personaFit + lifeEventFit + regionFit + urgency + evidenceConfidence + actionability - userFrictionPenalty",
      selectedCount: selectedIds.size,
      unmappedModuleIds: rankedCandidates.filter(({ sourceRefs }) => sourceRefs.length === 0).map(({ id }) => id)
    }
  };
}

function scoreModule(moduleId: string, context: ContextVector, handoffs: OfficialHandoffV2[]): ComponentCandidate {
  const profile = moduleProfiles[moduleId];

  if (!profile) {
    return scoreUnknownModule(moduleId);
  }

  const sourceRefs = resolveSourceRefs(profile, handoffs);
  const weights = {
    personaFit: scorePersonaFit(profile, context),
    lifeEventFit: context.lifeEvent === "move" || context.lifeEvent === "research-start" || context.lifeEvent === "business-start" ? 2 : 0,
    regionFit: context.region === "대전 유성구" ? 1 : 0,
    urgency: scoreUrgency(profile, context),
    evidenceConfidence: sourceRefs.length > 0 ? 2 : 0,
    actionability: scoreActionability(profile, handoffs),
    userFrictionPenalty: scoreFriction(profile, handoffs)
  };
  const score =
    profile.basePriority +
    weights.personaFit +
    weights.lifeEventFit +
    weights.regionFit +
    weights.urgency +
    weights.evidenceConfidence +
    weights.actionability -
    weights.userFrictionPenalty;

  return {
    id: moduleId,
    componentType: profile.componentType,
    sourceRefs,
    basePriority: profile.basePriority,
    weights,
    score,
    selected: false,
    rationale: ""
  };
}

function scoreUnknownModule(moduleId: string): ComponentCandidate {
  return {
    id: moduleId,
    componentType: "service-card",
    sourceRefs: [],
    basePriority: 0,
    weights: {
      personaFit: 0,
      lifeEventFit: 0,
      regionFit: 0,
      urgency: 0,
      evidenceConfidence: 0,
      actionability: 0,
      userFrictionPenalty: 0
    },
    score: 0,
    selected: false,
    rationale: ""
  };
}

function resolveSourceRefs(profile: ModuleProfile, handoffs: OfficialHandoffV2[]) {
  const matchingRefs = handoffs
    .filter((handoff) => !profile.serviceTypes || profile.serviceTypes.includes(handoff.serviceType))
    .flatMap((handoff) => handoff.sourceRefs);

  if (matchingRefs.length > 0) {
    return [...new Set(matchingRefs)];
  }

  return [];
}

function scorePersonaFit(profile: ModuleProfile, context: ContextVector) {
  if (!profile.persona) {
    return 0;
  }

  return context.workStatus === profile.persona || context.household === profile.persona ? 3 : 0;
}

function scoreUrgency(profile: ModuleProfile, context: ContextVector) {
  if (context.urgency === "today") {
    return 3;
  }

  if (context.urgency === "within-14-days" && ["timeline", "checklist", "risk-notice"].includes(profile.componentType)) {
    return 2;
  }

  if (context.urgency === "this-month" && profile.riskFocus === "tax") {
    return 2;
  }

  return context.riskFocus?.includes(profile.riskFocus ?? "benefit") ? 1 : 0;
}

function scoreActionability(profile: ModuleProfile, handoffs: OfficialHandoffV2[]) {
  return handoffs.some((handoff) => (!profile.serviceTypes || profile.serviceTypes.includes(handoff.serviceType)) && handoff.status === "verified")
    ? 2
    : 0;
}

function scoreFriction(profile: ModuleProfile, handoffs: OfficialHandoffV2[]) {
  const matchingHandoffs = handoffs.filter((handoff) => !profile.serviceTypes || profile.serviceTypes.includes(handoff.serviceType));

  return matchingHandoffs.some((handoff) => handoff.requiresLogin) ? 1 : 0;
}

function inferLifeEvent(text: string): ContextVector["lifeEvent"] {
  if (/사업.*시작|창업|사무실 주소.*등록|사업장.*등록/.test(text)) {
    return "business-start";
  }

  if (/연구과제|연구.*시작|박사후연구원/.test(text)) {
    return "research-start";
  }

  if (/결혼|혼인/.test(text)) {
    return "marriage";
  }

  if (/이사|전입|주소/.test(text)) {
    return "move";
  }

  return "unknown";
}

function inferHousehold(text: string): ContextVector["household"] {
  if (/\[신혼부부\]|신혼|혼인/.test(text)) {
    return "newlywed";
  }

  if (/가족|어린이집|자녀|아이/.test(text)) {
    return "family";
  }

  if (/1인|혼자/.test(text)) {
    return "single";
  }

  return "unknown";
}

function inferWorkStatus(text: string): ContextVector["workStatus"] {
  if (/\[프리랜서\]|프리랜서|1인 사업|사업장|개인사업|사무실 주소/.test(text)) {
    return "freelancer";
  }

  if (/\[박사후연구원\]|박사후|연구원|연구과제/.test(text)) {
    return "researcher";
  }

  if (/회사원|직장인|근로자|직장/.test(text)) {
    return "employee";
  }

  if (/대학생|학생|대학원/.test(text)) {
    return "student";
  }

  return "unknown";
}

function inferHousingStatus(text: string): ContextVector["housingStatus"] {
  if (/전세|확정일자|등기/.test(text)) {
    return "jeonse";
  }

  if (/월세|임차료/.test(text)) {
    return "monthly-rent";
  }

  if (/자가|소유/.test(text)) {
    return "owner";
  }

  return "unknown";
}

function inferUrgency(text: string): ContextVector["urgency"] {
  if (/오늘|당일|즉시/.test(text)) {
    return "today";
  }

  if (/14일|이사|전입/.test(text)) {
    return "within-14-days";
  }

  if (/이번 달|이번달|5월|세금 신고|종합소득세/.test(text)) {
    return "this-month";
  }

  return "unknown";
}

function inferRiskFocus(text: string): NonNullable<ContextVector["riskFocus"]> {
  const focus = new Set<NonNullable<ContextVector["riskFocus"]>[number]>();

  if (/법|전세|확정일자|등기|대항력/.test(text)) {
    focus.add("legal");
    focus.add("housing");
  }

  if (/세금|소득|사업자|종합소득세|홈택스/.test(text)) {
    focus.add("tax");
  }

  if (/어린이집|안전|동네|생활권|CCTV|공공시설/.test(text)) {
    focus.add("local-safety");
  }

  if (/지원|급여|혜택|보조/.test(text)) {
    focus.add("benefit");
  }

  if (/연구|R&D|과제|장비/.test(text)) {
    focus.add("research");
  }

  return [...focus];
}
