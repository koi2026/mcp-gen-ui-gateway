<div align="center">
  <h1>MCP Gen UI Gateway</h1>
  <p><strong>Context-aware public service UI — powered by MCP and a Matrix scoring engine</strong></p>

  <a href="https://github.com/koi2026/mcp-gen-ui-gateway/actions/workflows/ci.yml"><img src="https://github.com/koi2026/mcp-gen-ui-gateway/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="License"></a>
  <a href="https://pnpm.io"><img src="https://img.shields.io/badge/pnpm-9-orange.svg" alt="pnpm"></a>
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white" alt="TypeScript">
  <a href="README.ko.md"><img src="https://img.shields.io/badge/README-한국어-green" alt="한국어"></a>
</div>

---

**MCP Gen UI Gateway** is an open-source [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that connects multiple Korean public-service data sources, understands user context through a 7-dimension intent vector, ranks information with a Matrix scoring algorithm, and renders a personalized **Generated UI (GenUI)** surface — all inside Claude Desktop without extra infrastructure.

> **Status:** Pretotype phase (June 2026). The current release demonstrates the end-to-end Claude → MCP → GenUI Artifact pipeline with three fixed persona scenarios. The full gateway with live data ranking is in active development on `main`.

**[한국어 README →](README.ko.md)**

---

## Why MCP Gen UI Gateway?

Korean public services span dozens of portals (Government24, HomeTax, data.go.kr, law.go.kr). A first-time mover — a newlywed, a freelancer, a postdoctoral researcher — faces the same core problem: the same raw information exists, but **what matters and what to do first differs entirely by context**.

MCP Gen UI Gateway solves this with three ideas:

| Problem | Our approach |
|---------|-------------|
| Too many portals, too much cognitive load | A single MCP tool call returns only the components relevant to the user's situation |
| Rules-based filtering explodes with new personas | A Matrix scoring algorithm $O(i,c) = \sum_f S(i,f) \times W(f,c)$ generalizes across any context |
| GenUI surfaces need trustworthy sourcing | Every rendered block cites the official government API or document it came from |

---

## How It Works

```
User utterance
      │
      ▼
┌──────────────────────┐
│  Context Extractor   │  inferContextVector(utterance)
│  (context-ranking)   │  → ContextVector (7 dimensions):
│                      │    region · lifeEvent · household
└──────────┬───────────┘    workStatus · housing · urgency · risk
           │
           ▼
┌──────────────────────┐
│   Matrix Scorer      │  O(i,c) = Σ S(i,f) × W(f,c)
│   (core package)     │  rankComponentCandidates(vector, pool)
└──────────┬───────────┘
           │  Top-k components selected
           ▼
┌──────────────────────┐
│   GenUI Renderer     │  5-block palette:
│   (demo-ui / MCP)    │  hero · cta · checklist · risk · evidence
└──────────┬───────────┘
           │
           ▼
   Claude HTML Artifact
   (Government24-style UI)
```

### The Matrix Algorithm

$$O(i,c) = \sum_f S(i,f) \times W(f,c)$$

| Symbol | Meaning |
|--------|---------|
| `i` | User intent (the context vector derived from utterance) |
| `c` | UI component candidate (hero, checklist, risk card…) |
| `f` | Feature dimension (urgency, actionability, risk, evidenceConfidence…) |
| `S(i, f)` | How strongly intent `i` activates feature `f` |
| `W(f, c)` | How much feature `f` weights toward component `c` |

**Top-k O(i, c)** determines which components appear — the rest are suppressed.

This eliminates rule explosion: adding a new persona or domain is a new **weight vector**, not hundreds of new IF-THEN rules.

---

## Key Features

- 🏗 **Schema-driven MCP tools** — Zod-validated I/O contracts with JSON Schema export; the AI host can trust every tool response shape
- 📐 **Matrix scoring engine** — context-aware component ranking without hardcoded rules; extends to any domain by swapping weight vectors
- 🪪 **Persona-adaptive UI** — same prompt, three different optimal UIs (newlywed / freelancer / postdoc) through the same 5-block GenUI palette
- 🏛 **Government design system** — components follow [KRDS](https://uiux.epeople.go.kr) (Korean Government Design System) tokens; visually consistent with gov.kr portals
- 🔌 **MCP-native deployment** — runs as a local `stdio` MCP server inside Claude Desktop; no Vercel, no public URL required for the pretotype
- 🔍 **Source transparency** — every GenUI block carries `evidence` and `sources` fields linking back to the official government API or document
- ✅ **Type-safe end-to-end** — TypeScript 5 + Zod across the monorepo; `pnpm typecheck` catches schema drift before merge
- 🧪 **Regression-tested artifacts** — Vitest guards all three persona HTML files against per-file drift

---

## Demo: Three Personas, One Prompt

The pretotype shows the core concept: **same situation, different optimal surface**.

**Shared prompt:**
> `대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.`
> *(I just moved to Yuseong-gu, Daejeon. I want to see moving-related admin, tax, and local data in one place.)*

| Tag | Persona | GenUI highlights |
|-----|---------|-----------------|
| `[신혼부부]` | Newlywed couple | Jeonse loan status, resident registration, child benefit checklist |
| `[프리랜서]` | Freelancer | Business address update, tax invoice validity, health insurance |
| `[박사후연구원]` | Postdoctoral researcher | Institutional address change, research grant relocation support |

---

## Quick Start — Claude Desktop (Pretotype)

### Prerequisites

- [Claude Desktop](https://claude.ai/download) signed in
- Node.js **22 LTS** or **24 LTS**
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)

> ⚠️ **Avoid Node 26 Current** — `better-sqlite3` requires a prebuilt binary available only for LTS releases.

### 1. Clone and build

```bash
git clone -b pretotype/genui-demo https://github.com/koi2026/mcp-gen-ui-gateway.git
cd mcp-gen-ui-gateway
pnpm install
pnpm --filter pretotype-mcp-gen-ui-gateway build
```

### 2. Register the MCP server in Claude Desktop

Open `~/Library/Application Support/Claude/claude_desktop_config.json` and add:

```json
{
  "mcpServers": {
    "pretotype-mcp-gen-ui-gateway": {
      "command": "node",
      "args": ["<ABSOLUTE_REPO_PATH>/packages/pretotype-server/dist/pretotype-index.js"]
    }
  }
}
```

Replace `<ABSOLUTE_REPO_PATH>` with the output of `pwd` from the repo root. Fully quit and reopen Claude Desktop.

### 3. Add the host instruction

Paste this into the Claude project or conversation:

```
You render a public portal GenUI pretotype.

If the user includes exactly one of [신혼부부], [프리랜서], or [박사후연구원],
call render_pretotype_scenario with { "utterance": "<full user utterance>" }.

Render the returned HTML verbatim as a Claude HTML Artifact. Do not summarize,
rewrite, or redesign it. Official links are handoff URLs only — no login or
submission happens inside the artifact.

If the tag is missing or ambiguous, ask for exactly one of the three tags.
```

### 4. Run a demo prompt

```
[신혼부부] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

Claude should open a Government24-style HTML Artifact. See the [full pretotype guide](docs/claude-desktop-pretotype-connector.md) for troubleshooting.

---

## Project Structure

```
mcp-gen-ui-gateway/
├── packages/
│   ├── schema/            Zod schemas — intent types, component palette, MCP I/O contracts
│   ├── core/              Matrix scoring engine — S(i,f) × W(f,c), component ranking
│   ├── mcp-server/        MCP Gateway — schema-driven tools, SQLite store, routing
│   ├── pretotype-server/  Demo pretotype — fixed 3-persona HTML artifacts (throwaway)
│   └── browser-assist/    Browser interaction tools (gov24 live source integration)
├── apps/
│   └── demo-ui/           Vite React — GenUI block renderer + Government24-style UI
├── docs/
│   ├── adr/               Architecture Decision Records
│   ├── git-workflow.md    Branch naming, commit conventions, PR rules
│   └── ...
├── CONTRIBUTING.md
├── SECURITY.md
└── LICENSE                Apache-2.0
```

| Package | Responsibility | Depends on |
|---------|---------------|------------|
| `schema` | Zod type definitions and JSON Schema export | — |
| `core` | Matrix scoring, zero external deps, fully unit-testable | `schema` |
| `mcp-server` | MCP tool registration, source adapters, SQLite change log | `schema`, `core` |
| `pretotype-server` | Fixed-route demo *(not merged to `main`)* | `schema` |
| `demo-ui` | GenUI renderer + KRDS-based Government24 components | `schema` |

---

## Development

```bash
pnpm install        # install all workspace dependencies
pnpm build          # build all packages
pnpm test           # run all tests
pnpm typecheck      # TypeScript type check
pnpm dev            # demo UI dev server → http://localhost:5173
pnpm mcp            # run main MCP server (stdio)
pnpm pretotype:mcp  # run pretotype MCP server (stdio)
pnpm pretotype:http # run pretotype HTTP server → :8787
pnpm schemas        # export JSON Schemas from Zod definitions
```

---

## Roadmap

| Stage | Name | Status |
|-------|------|--------|
| 0 | Pretotype — Claude Desktop demo | ✅ Done |
| 1 | Source Contract — `OfficialHandoffV2` registry | ✅ Done |
| 2 | Context Ranking — `ContextVector` + Matrix scorer | ✅ Done |
| 3 | Dynamic GenUI — `GenUIResponse` envelope + MCP tools | ✅ Done |
| 4 | Consumer Renderer — KRDS 5-block React components | 🔄 In progress |
| 5 | Integration & Deploy — Vercel, live source connections | ⬜ Planned |

---

## Contributing

We welcome bug reports, feature proposals, architecture RFCs, code, and documentation contributions.

| Type | How |
|------|-----|
| Bug | [Bug report template](.github/ISSUE_TEMPLATE/bug_report.md) |
| Feature | [Feature request template](.github/ISSUE_TEMPLATE/feature_request.md) |
| Architecture | [RFC template](.github/ISSUE_TEMPLATE/rfc.md) → accepted RFCs → `docs/adr/` |
| Code | See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/git-workflow.md](docs/git-workflow.md) |

---

## Team Roles

| Role | Area | Responsibility |
|------|------|---------------|
| **A** | Source / MCP Adapter | Public data integration (gov24, RSS, SRT), MCP tool schema design |
| **B** | Decision / Matrix / Lens | Intent parsing, Claude API orchestration, weight calibration |
| **C** | Renderer / Demo | GenUI React components (KRDS), demo UI, Vercel/Docker deployment |

---

## License

[Apache License 2.0](LICENSE) — Copyright 2026 MCP-Gen UI Gateway contributors.
