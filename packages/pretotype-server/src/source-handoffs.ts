import type { PretotypeContext, PretotypeScenario } from "./compose-pretotype.js";

export type HandoffServiceType =
  | "civil-application"
  | "tax"
  | "housing"
  | "legal-information"
  | "local-data"
  | "research"
  | "childcare"
  | "postal";

export type HandoffUserAction = "read" | "apply" | "download" | "check" | "reserve";

export type OfficialHandoffV2 = {
  id: string;
  label: string;
  provider: string;
  domain: string;
  url: string;
  purpose: string;
  serviceType: HandoffServiceType;
  status: "verified" | "manual-review" | "fallback" | "broken";
  confidence: "high" | "medium" | "low";
  lastVerifiedAt: string;
  sourceRefs: string[];
  requiresLogin: boolean;
  userAction: HandoffUserAction;
};

export type PretotypeScenarioV2 = {
  version: "pretotype.scenario.v2";
  id: PretotypeContext;
  context: {
    tag: string;
    stagedPrompt: string;
    region: "대전 유성구";
    lifeEvent: "move";
    persona: PretotypeContext;
  };
  route: {
    policy: "exact-tag-only";
  };
  artifact: PretotypeScenario["artifact"];
  assets: PretotypeScenario["assets"];
  surface: PretotypeScenario["surface"];
  officialHandoffs: OfficialHandoffV2[];
  boundaries: string[];
  diagnostics: {
    generatedAt: string;
    resolverVersion: string;
    unresolvedCount: number;
  };
};

export type HandoffValidationIssue = {
  code: "missing-url" | "invalid-url" | "domain-mismatch" | "broad-homepage";
  label: string;
  domain?: string;
  url?: string;
  detail: string;
};

export type HandoffValidation = {
  status: "verified" | "manual-review";
  unresolvedCount: number;
  issues: HandoffValidationIssue[];
};

const broadHomepageReviewDomains = new Set([
  "gov.kr",
  "hometax.go.kr",
  "bokjiro.go.kr",
  "iros.go.kr",
  "epost.go.kr",
  "nhis.or.kr",
  "nrf.re.kr",
  "ntis.go.kr",
  "myhome.go.kr",
  "info.childcare.go.kr"
]);

export function createScenarioV2(
  scenario: PretotypeScenario,
  options: { generatedAt?: string; resolverVersion?: string } = {}
): PretotypeScenarioV2 {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const resolverVersion = options.resolverVersion ?? "pretotype-handoff-resolver.v1";
  const validation = validateOfficialHandoffs(scenario);

  return {
    version: "pretotype.scenario.v2",
    id: scenario.id,
    context: {
      tag: scenario.tag,
      stagedPrompt: scenario.stagedPrompt,
      region: "대전 유성구",
      lifeEvent: "move",
      persona: scenario.id
    },
    route: {
      policy: scenario.routePolicy
    },
    artifact: scenario.artifact,
    assets: scenario.assets,
    surface: scenario.surface,
    officialHandoffs: scenario.officialHandoffs.map((handoff, index) =>
      normalizeOfficialHandoff(scenario.id, handoff, index, generatedAt)
    ),
    boundaries: scenario.boundaries,
    diagnostics: {
      generatedAt,
      resolverVersion,
      unresolvedCount: validation.unresolvedCount
    }
  };
}

export function validateOfficialHandoffs(scenario: Pick<PretotypeScenario, "officialHandoffs">): HandoffValidation {
  const issues = scenario.officialHandoffs.flatMap((handoff) => validateOfficialHandoff(handoff));

  return {
    status: issues.length === 0 ? "verified" : "manual-review",
    unresolvedCount: issues.length,
    issues
  };
}

function normalizeOfficialHandoff(
  context: PretotypeContext,
  handoff: PretotypeScenario["officialHandoffs"][number],
  index: number,
  lastVerifiedAt: string
): OfficialHandoffV2 {
  const issues = validateOfficialHandoff(handoff);
  const domain = handoff.domain;

  return {
    id: `${context}-handoff-${String(index + 1).padStart(2, "0")}`,
    label: handoff.label,
    provider: deriveProvider(domain),
    domain,
    url: typeof handoff.url === "string" ? handoff.url : "",
    purpose: handoff.purpose,
    serviceType: deriveServiceType(handoff),
    status: issues.length === 0 ? "verified" : "manual-review",
    confidence: issues.length === 0 ? "high" : "medium",
    lastVerifiedAt,
    sourceRefs: [`source:${context}:${String(index + 1).padStart(2, "0")}`],
    requiresLogin: deriveRequiresLogin(handoff),
    userAction: deriveUserAction(handoff)
  };
}

function validateOfficialHandoff(handoff: PretotypeScenario["officialHandoffs"][number]): HandoffValidationIssue[] {
  const issues: HandoffValidationIssue[] = [];

  if (typeof handoff.url !== "string" || handoff.url.trim().length === 0) {
    return [
      {
        code: "missing-url",
        label: handoff.label,
        domain: handoff.domain,
        detail: "Official handoff URL is missing."
      }
    ];
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(handoff.url);
  } catch {
    return [
      {
        code: "invalid-url",
        label: handoff.label,
        domain: handoff.domain,
        url: handoff.url,
        detail: "Official handoff URL is not a valid URL."
      }
    ];
  }

  if (parsedUrl.protocol !== "https:") {
    issues.push({
      code: "invalid-url",
      label: handoff.label,
      domain: handoff.domain,
      url: handoff.url,
      detail: "Official handoff URL must use https."
    });
  }

  if (!hostMatchesDeclaredDomain(parsedUrl.hostname, handoff.domain)) {
    issues.push({
      code: "domain-mismatch",
      label: handoff.label,
      domain: handoff.domain,
      url: handoff.url,
      detail: "Official handoff URL host does not match its declared domain."
    });
  }

  if (isBroadHomepage(parsedUrl, handoff.domain)) {
    issues.push({
      code: "broad-homepage",
      label: handoff.label,
      domain: handoff.domain,
      url: handoff.url,
      detail: "Official handoff points to a broad homepage instead of a service-specific page."
    });
  }

  return issues;
}

function hostMatchesDeclaredDomain(hostname: string, declaredDomain: string) {
  const normalizedHost = hostname.replace(/^www\./, "");
  const normalizedDomain = declaredDomain.replace(/^www\./, "");

  return normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`);
}

function isBroadHomepage(url: URL, declaredDomain: string) {
  if (!broadHomepageReviewDomains.has(declaredDomain.replace(/^www\./, ""))) {
    return false;
  }

  return (url.pathname === "" || url.pathname === "/") && !url.search && !url.hash;
}

function deriveProvider(domain: string) {
  return domain.replace(/^www\./, "");
}

function deriveServiceType(handoff: PretotypeScenario["officialHandoffs"][number]): HandoffServiceType {
  const text = `${handoff.label} ${handoff.purpose} ${handoff.domain}`;

  if (/hometax|세금|소득|종합소득세|사업자등록/.test(text)) {
    return "tax";
  }

  if (/주거|전세|확정일자|등기|myhome|bokjiro|임대차/.test(text)) {
    return "housing";
  }

  if (/법적|법령|easylaw|law/.test(text)) {
    return "legal-information";
  }

  if (/어린이집|childcare/.test(text)) {
    return "childcare";
  }

  if (/우편|epost/.test(text)) {
    return "postal";
  }

  if (/연구|R&D|NTIS|ZEUS|nrf|zeus|ntis/.test(text)) {
    return "research";
  }

  if (/안전지도|생활권|인프라|safemap/.test(text)) {
    return "local-data";
  }

  return "civil-application";
}

function deriveRequiresLogin(handoff: PretotypeScenario["officialHandoffs"][number]) {
  return /신청|발급|정정|신고|예약|조회|확인서|증명/.test(`${handoff.label} ${handoff.purpose}`);
}

function deriveUserAction(handoff: PretotypeScenario["officialHandoffs"][number]): HandoffUserAction {
  const text = `${handoff.label} ${handoff.purpose}`;

  if (/예약/.test(text)) {
    return "reserve";
  }

  if (/신청|신고|정정/.test(text)) {
    return "apply";
  }

  if (/발급|증명|다운로드/.test(text)) {
    return "download";
  }

  if (/확인|조회|체크|진단/.test(text)) {
    return "check";
  }

  return "read";
}
