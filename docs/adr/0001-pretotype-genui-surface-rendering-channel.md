# Pretotype: GenUI Surface rendering channel is a Claude Artifact built from MCP-returned HTML

Status: Accepted — **pretotype-scoped only** (June 4 demo). Does not bind the production/convergence architecture.

## Context

The June 4 pretotype must demonstrate the product thesis — *same utterance, different [[GenUI Surface]] per context* — live inside Claude. A common prompt ("대전 유성구로 이사 왔어요. 전입신고, 전세 계약 법적 체크, 우리 동네 데이터를 한곳에서…") plus a `[context]` tag (신혼부부 / 프리랜서 / 박사후연구원) must produce a polished, interactive surface.

This is a **throwaway pretotype**: the "brain" is faked (a `[context]` → pre-built surface lookup), but the delivery channel is a **real MCP server**, so the demo is genuinely MCP-driven. It reuses ~85% of the rendering already built in PR #1 (`gov24-genui-gateway-ui`), which reproduces Government24 UI patterns audited with Playwright.

The genuinely new architectural choice is **how the MCP server's output becomes a rendered, interactive surface inside Claude**.

## Decision

For the pretotype, the GenUI Surface is delivered as a **Claude Artifact**: the dedicated MCP server `pretotype-mcp-gen-ui-gateway` exposes `render_pretotype_scenario({ utterance })`, extracts exactly one supported tag from the staged utterance, resolves it through a checked-in `scenario_*.json` manifest, and returns a **self-contained HTML string**. The preferred spike was the PR #1 React UI bundled per context via `vite build` / `vite-plugin-singlefile`; the implemented pretotype uses the ADR fallback path, a lightweight static renderer, to avoid artifact-size and runtime drift risk. A host prompt instructs Claude to render that HTML **verbatim** as an HTML artifact (no paraphrase, no rebuild). Cards link out to official portals (gov.kr / hometax.go.kr / data.go.kr / law.go.kr / ntis.go.kr / innopolis.or.kr) in a new tab; there is no in-artifact drill-in.

The **MCP Apps / MCP-UI extension (SEP-1865)** — `ui://` HTML resources rendered in a host-managed sandboxed iframe — is the conceptually correct fit and the **intended end-state**, but is **deferred** for the pretotype.

## Considered options

- **Claude Artifact from MCP-returned HTML (chosen).** Kept: works in Claude today; full look-and-feel control; reuses PR #1 verbatim. Dropped from the alternative: standards-alignment.
- **MCP Apps / MCP-UI `ui://` sandboxed iframe (deferred).** This is exactly the capability the product wants and the long-term target, but as of the demo date it is a proposal/early-access with **unverified host rendering support in Claude**. Too risky for a hard-dated demo.
- **Standalone hosted demo-ui, no MCP (rejected).** Would lose the "real MCP channel" story that makes the pretotype convincing.

## Consequences

- The tool's return contract is "full self-contained HTML"; a JSON-only / host-composes path is explicitly closed for the pretotype.
- The tool's route contract is "exact staged tag lookup"; natural-language inference, ranking, and scenario fabrication are explicitly closed for the pretotype.
- **Three Day-0 spikes gate the whole demo** (run before any feature code): (1) Claude renders MCP-returned HTML *verbatim* as an artifact; (2) the vite-singlefile bundle fits the artifact size limit (React runtime + large CSS → hundreds of KB; fall back to a lighter static render if exceeded); (3) the artifact sandbox permits external new-tab navigation to official handoff domains.
- Non-enum presentation labels (신혼부부, 박사후연구원) are backed by the nearest closed-enum tuple and the gap is disclosed in the developer `tool-trace`; no invented `persona` enum value (see CONTEXT.md *Flagged ambiguities*).
- korean-law stays parked (ADR-0022 in the reference repo): the "전세 계약 법적 체크" card is an external link to law.go.kr only, with no inline legal text; the park is disclosed in `tool-trace`. `law.go.kr` is added to the handoff allowlist.
- Pretotype work branches from `gov24-genui-gateway-ui`, not the empty `pretotype/genui-demo`.
- This ADR is pretotype-scoped: migrating to MCP Apps later is a real (intended) change, not a regression.
