# Pretotype Stage-Up Roadmap

Status: Active stage-up roadmap after the baseline pretotype shipped. The branch `codex/pretotype-stage-1-3-ultragoal` implements the first experimental tracer bullet across Stages 1-3 while preserving the Stage 0 fixed Artifact route.

This document reviews the intended development direction after the fixed Artifact pretotype and breaks it into staged, contract-safe milestones.

## Executive Review

The proposed direction is sound, with one important sequencing rule:

> Keep the fixed pretotype as the stable Stage 0 baseline, then expand the contract one layer at a time.

The pretotype has already proven the core interaction path. Its success criterion remains deliberately small and should stay useful as a regression fixture:

```text
Claude Desktop MCP install
  -> user prompt includes exactly one context tag
  -> pretotype MCP server selects one fixed scenario
  -> server returns the matching self-contained HTML
  -> Claude renders it as an HTML Artifact
```

For the baseline prompt:

```text
[신혼부부] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

the server should select the newlywed scenario and return the newlywed HTML. The same staged utterance with `[프리랜서]` or `[박사후연구원]` should select the corresponding HTML.

The next stages should evolve from fixed scenario delivery toward a real GenUI Gateway:

```text
Stage 0: fixed tag -> fixed HTML
Stage 1: fixed HTML + sourced official handoff data
Stage 2: more contexts + weighting matrix
Stage 3: dynamic component composition from a versioned GenUI contract
```

The main architectural risk is JSON contract sprawl. Each stage should introduce one new contract boundary and keep older contracts runnable.

## Stage 0: Baseline Fixed Artifact Pretotype

Goal: preserve the repeatable fixed Artifact route.

### Product Behavior

- The MCP server exposes `render_pretotype_scenario`.
- The user prompt must include exactly one supported context tag:
  - `[신혼부부]`
  - `[프리랜서]`
  - `[박사후연구원]`
- The route is deterministic and non-generative.
- Claude receives a self-contained HTML string and renders it as an Artifact.
- The result is not a text summary and not a newly generated layout.

### Non-Goals

- No live API calls.
- No link freshness update at runtime.
- No eligibility decision.
- No login, 본인인증, 신청, 제출, 세금 신고, or 법률 해석.
- No open-ended natural-language persona inference.

### Acceptance Checklist

- `npx` or local clone/build install path works in Claude Desktop.
- The three exact tagged prompts open three different HTML Artifacts.
- Missing or ambiguous tags return a clear disclosure instead of guessing.
- Artifact links open official handoff destinations only.
- The baseline flow can be repeated without external network dependency except outbound link clicks.

## Stage 1: Official Handoff Source Update

Goal: keep the fixed surfaces but make their official links and handoff metadata more trustworthy.

This stage should not yet rebuild the page dynamically. It should upgrade the scenario JSON so reviewers can see that links are sourced, checked, and explainable.

### Proposed Capability

Add a source-resolution layer for official handoff links:

```text
scenario_*.json
  -> official handoff resolver
  -> verified URL / status / freshness metadata
  -> scenario manifest v2
  -> same self-contained HTML delivery path
```

The initial implementation can be a build-time or maintainer-run command rather than runtime API fetching.

### Candidate Tools

- `resolve_official_handoffs`: given handoff labels and providers, return canonical URLs and metadata.
- `validate_handoff_links`: check that known URLs still resolve and stay on allowed official domains.
- `refresh_scenario_manifest`: update `scenario_*.json` with verified metadata without changing the HTML by default.

### Manifest v2 Shape

```ts
type PretotypeScenarioV2 = {
  version: "pretotype.scenario.v2";
  id: "newlywed" | "freelancer" | "postdoc";
  context: {
    tag: "[신혼부부]" | "[프리랜서]" | "[박사후연구원]";
    stagedPrompt: string;
    region: "대전 유성구";
    lifeEvent: "move";
  };
  route: {
    policy: "exact-tag-only";
  };
  artifact: {
    mode: "self-contained-html";
    html: string;
  };
  officialHandoffs: OfficialHandoff[];
  boundaries: string[];
  diagnostics: {
    generatedAt: string;
    resolverVersion: string;
    unresolvedCount: number;
  };
};

type OfficialHandoff = {
  id: string;
  label: string;
  provider: string;
  domain: string;
  url: string;
  purpose: string;
  serviceType:
    | "civil-application"
    | "tax"
    | "housing"
    | "legal-information"
    | "local-data"
    | "research"
    | "childcare"
    | "postal";
  status: "verified" | "manual-review" | "fallback" | "broken";
  confidence: "high" | "medium" | "low";
  lastVerifiedAt: string;
  sourceRefs: string[];
  requiresLogin: boolean;
  userAction: "read" | "apply" | "download" | "check" | "reserve";
};
```

### Stage 1 Acceptance

- Every visible CTA in the three HTML files has a matching `officialHandoffs[]` entry.
- Every handoff has provider, domain, purpose, status, confidence, and last-verified metadata.
- Broken or broad homepage links are marked `manual-review` or replaced with a narrower official service page.
- HTML still renders without Claude creating separate assets.
- The fixed baseline behavior remains unchanged for the three tagged prompts.

## Stage 2: More Contexts And Weighting Matrix

Goal: move from three hardcoded personas to broader context coverage without jumping straight to free-form generation.

This is where the product begins to look like the full Gateway MCP. The server should classify context, apply weights, and decide which services/components deserve screen space.

### Context Model

Start with structured context dimensions:

```ts
type ContextVector = {
  region?: string;
  lifeEvent?: "move" | "marriage" | "job-change" | "research-start" | "business-start";
  household?: "single" | "newlywed" | "family" | "unknown";
  workStatus?: "freelancer" | "employee" | "student" | "researcher" | "unknown";
  housingStatus?: "jeonse" | "monthly-rent" | "owner" | "unknown";
  urgency?: "today" | "within-14-days" | "this-month" | "unknown";
  riskFocus?: ("legal" | "tax" | "housing" | "local-safety" | "benefit")[];
};
```

### Weighting Model

Each candidate component receives a score from evidence and context:

```ts
type ComponentCandidate = {
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
```

A simple first scoring rule is enough:

```text
score =
  basePriority
  + personaFit
  + lifeEventFit
  + regionFit
  + urgency
  + evidenceConfidence
  + actionability
  - userFrictionPenalty
```

The important part is not mathematical sophistication at first. The important part is preserving traceability: the UI should be able to show why a component appeared and which official sources supported it.

### Stage 2 Acceptance

- At least six contexts are supported without adding six separate full HTML files.
- The three original personas remain regression fixtures.
- Selected components include ranking trace metadata.
- Unsupported contexts degrade to a safe default surface with clear missing-context prompts.
- No source is promoted without `sourceRefs` and evidence status.

## Stage 3: Dynamic GenUI Component Composition

Goal: replace fixed self-contained persona HTML with a dynamic renderer contract.

At this point the server should stop returning one giant prewritten page as the primary product path. Instead, it should return a versioned GenUI envelope that a renderer can compose into a page.

### Proposed Envelope

```ts
type GenUIResponse = {
  run: {
    id: string;
    status: "success" | "partial" | "failed";
    generatedAt: string;
    userQuery: string;
    contractVersion: "genui.gateway.v1";
  };
  context: ContextVector;
  blocks: GenUIBlock[];
  sources: Source[];
  evidence: Evidence[];
  errors: GatewayError[];
  diagnostics?: ToolTrace[];
};
```

Initial block types should stay small:

- `summary`
- `action-checklist`
- `service-card-list`
- `handoff-link-list`
- `timeline`
- `local-data-panel`
- `notice`

### Renderer Strategy

There are two realistic renderer paths:

- HTML template renderer: fastest path from current Artifact proof. Good for Claude Artifact output and web demo parity.
- Flutter-style widget schema: useful later if the same contract must render in mobile or multi-platform clients.

The recommended next step is HTML template renderer first. It is closer to the pretotype proof, easier to test with screenshots, and less likely to over-abstract before the scoring model is stable.

### Stage 3 Acceptance

- The same `GenUIResponse` can render at least three different layouts from block order and block type.
- The renderer can show partial failure states without breaking the whole page.
- Official source metadata remains visible or inspectable.
- Screenshots prove that generated layouts keep Government24-like density and hierarchy.
- The old Stage 0 fixed HTML artifacts still exist as regression examples or archived fixtures.

## Contract Growth Control

JSON will get larger. That is acceptable if it grows in layers rather than all at once.

Recommended version boundaries:

```text
pretotype.scenario.v1
  fixed tag, fixed HTML, basic handoff list

pretotype.scenario.v2
  verified handoff metadata, source refs, diagnostics

gateway.context.v1
  structured context vector

gateway.ranking.v1
  component candidates, weights, ranking trace

genui.gateway.v1
  final renderable blocks, sources, evidence, errors
```

Rules:

- Do not put raw API payloads directly into render blocks.
- Blocks should reference `sources[]` and `evidence[]` by id.
- Partial source failure should produce `run.status = "partial"`, not a broken page.
- Diagnostics should be available for debugging but not dominate the user surface.
- Every new contract version needs fixture JSON and renderer tests.

## Recommended Branch Sequence

This document originally listed separate branches for each stage. The current tracer-bullet branch implements the stages together behind experimental MCP tools:

- `render_pretotype_scenario` remains the Stage 0 fixed Artifact route.
- `compose_dynamic_genui_response` returns the experimental `genui.gateway.v1` JSON envelope.
- `render_dynamic_genui_template` renders that envelope as a self-contained HTML template.

Future hardening can still split by stage:

1. `codex/stage-1-handoff-source-contract`
   - Add `pretotype.scenario.v2` examples.
   - Add link/handoff validator tests.
   - Keep HTML routing unchanged.

2. `codex/stage-2-context-weighting-matrix`
   - Add `ContextVector`, `ComponentCandidate`, and scoring trace fixtures.
   - Expand beyond the three personas without generating full pages per persona.

3. `codex/stage-3-dynamic-genui-renderer`
   - Add `genui.gateway.v1`.
   - Build a template renderer from blocks.
   - Preserve current HTML artifacts as regression fixtures.

## Near-Term Recommendation

The Stage 0 pretotype has already shipped as the stable baseline. Keep `render_pretotype_scenario` as the regression fixture while Stage 1-3 continues to rise in capability.

The Stage 1-3 tracer bullet on this branch is the active contract lane, not a replacement for the fixed Artifact baseline yet. Before using it in front of external users, either hide the dynamic tools behind an explicit experiment flag or run them from a separate experimental server entrypoint.

The right hardening order remains Stage 1 first:

- it improves credibility immediately,
- it addresses the current concern that JSON feels too empty,
- it keeps the pretotype visually stable,
- and it creates the source/evidence discipline needed before any weighting matrix can be trusted.
