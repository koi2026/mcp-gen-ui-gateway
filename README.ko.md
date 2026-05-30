<div align="center">
  <h1>MCP Gen UI Gateway</h1>
  <p><strong>MCP와 Matrix 채점 엔진으로 구동되는 맥락 인식 공공서비스 UI</strong></p>

  <a href="https://github.com/koi2026/mcp-gen-ui-gateway/actions/workflows/ci.yml"><img src="https://github.com/koi2026/mcp-gen-ui-gateway/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="License"></a>
  <a href="https://pnpm.io"><img src="https://img.shields.io/badge/pnpm-9-orange.svg" alt="pnpm"></a>
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white" alt="TypeScript">
  <a href="README.md"><img src="https://img.shields.io/badge/README-English-blue" alt="English"></a>
</div>

---

**MCP Gen UI Gateway**는 오픈소스 [MCP(Model Context Protocol)](https://modelcontextprotocol.io) 서버입니다. 여러 한국 공공서비스 데이터 소스를 연결하고, 7차원 의도 벡터로 사용자 맥락을 파악하며, Matrix 채점 알고리즘으로 정보를 순위화해 개인화된 **GenUI(Generated UI)** 화면을 렌더링합니다 — 추가 인프라 없이 Claude Desktop 안에서 바로 동작합니다.

> **현재 상태:** 프리토타입 단계 (2026년 6월). 현재 릴리즈는 3개 고정 페르소나 시나리오로 Claude → MCP → GenUI Artifact 파이프라인 전 과정을 시연합니다. 실시간 데이터 랭킹을 포함한 완전한 게이트웨이는 `main` 브랜치에서 개발 중입니다.

**[English README →](README.md)**

---

## 왜 MCP Gen UI Gateway인가?

한국 공공서비스는 수십 개의 포털(정부24, 홈택스, data.go.kr, 법령정보원)에 분산되어 있습니다. 이사를 처음 가는 신혼부부, 프리랜서, 박사후연구원 모두 같은 근본 문제에 직면합니다: 같은 정보가 존재하지만 **무엇이 중요하고 무엇을 먼저 해야 하는지는 맥락에 따라 완전히 다릅니다**.

MCP Gen UI Gateway는 세 가지 아이디어로 이 문제를 해결합니다:

| 문제 | 우리의 접근법 |
|------|-------------|
| 수많은 포털, 과도한 인지 부하 | MCP 도구 한 번의 호출로 사용자 상황에 맞는 컴포넌트만 반환 |
| 규칙 기반 필터링은 새 페르소나마다 폭발적으로 증가 | Matrix 채점 알고리즘 $O(i,c) = \sum_f S(i,f) \times W(f,c)$으로 모든 맥락에 일반화 |
| GenUI 화면은 신뢰할 수 있는 출처가 필요 | 모든 렌더링 블록이 공식 정부 API 또는 문서를 명시 |

---

## 동작 원리

```
사용자 발화
      │
      ▼
┌──────────────────────┐
│  맥락 추출기          │  inferContextVector(utterance)
│  (context-ranking)   │  → ContextVector (7차원):
│                      │    지역 · 생활사건 · 가구유형
└──────────┬───────────┘    직업상태 · 주거상태 · 긴급도 · 리스크
           │
           ▼
┌──────────────────────┐
│   Matrix 채점기       │  O(i,c) = Σ S(i,f) × W(f,c)
│   (core 패키지)       │  rankComponentCandidates(vector, pool)
└──────────┬───────────┘
           │  상위 k개 컴포넌트 선택
           ▼
┌──────────────────────┐
│   GenUI 렌더러        │  5-블록 팔레트:
│   (demo-ui / MCP)    │  hero · cta · checklist · risk · evidence
└──────────┬───────────┘
           │
           ▼
   Claude HTML Artifact
   (정부24 스타일 UI)
```

### Matrix 알고리즘

$$O(i,c) = \sum_f S(i,f) \times W(f,c)$$

| 기호 | 의미 |
|-----|------|
| `i` | 사용자 의도 (발화에서 추출한 맥락 벡터) |
| `c` | UI 컴포넌트 후보 (hero, checklist, 위험 카드 등) |
| `f` | 피처 차원 (긴급도, 실행 가능성, 리스크, 증거 신뢰도 등) |
| `S(i, f)` | 의도 `i`가 피처 `f`를 활성화하는 강도 |
| `W(f, c)` | 피처 `f`가 컴포넌트 `c`에 기여하는 가중치 |

**상위 k개 O(i, c)**가 화면에 표시될 컴포넌트를 결정하고, 나머지는 숨겨집니다.

이로써 규칙 폭발을 제거합니다. 새로운 페르소나나 도메인 추가는 **가중치 벡터** 하나면 되고, 수백 개의 IF-THEN 규칙이 필요하지 않습니다.

---

## 주요 특징

- 🏗 **스키마 기반 MCP 도구** — Zod 검증 I/O 계약 + JSON Schema 내보내기; AI 호스트가 도구 응답 형태를 신뢰 가능
- 📐 **Matrix 채점 엔진** — 하드코딩 없는 맥락 인식 컴포넌트 랭킹; 가중치 벡터 교체만으로 어떤 도메인에도 확장 가능
- 🪪 **페르소나 적응형 UI** — 같은 프롬프트, 같은 5-블록 팔레트, 세 가지 최적화된 UI (신혼부부 / 프리랜서 / 박사후연구원)
- 🏛 **정부 디자인 시스템** — [KRDS](https://uiux.epeople.go.kr)(한국 정부 디자인 시스템) 토큰 기반; gov.kr 포털과 시각적 일관성
- 🔌 **MCP 네이티브 배포** — Claude Desktop에서 로컬 `stdio` MCP 서버로 실행; Vercel, 공개 URL 불필요
- 🔍 **출처 투명성** — 모든 GenUI 블록이 공식 정부 API 또는 문서를 `evidence`·`sources` 필드로 명시
- ✅ **엔드투엔드 타입 안전** — 모노레포 전체에 TypeScript 5 + Zod; `pnpm typecheck`로 스키마 드리프트를 머지 전에 포착
- 🧪 **회귀 테스트된 아티팩트** — Vitest가 세 개 페르소나 HTML 파일 간 드리프트를 방지

---

## 데모: 하나의 프롬프트, 세 개의 페르소나

프리토타입은 핵심 개념을 보여줍니다: **같은 상황, 다른 최적 화면**.

**공통 프롬프트:**
> `대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.`

| 태그 | 페르소나 | GenUI 주요 내용 |
|-----|---------|----------------|
| `[신혼부부]` | 신혼부부 | 전세대출 현황, 전입신고, 아이행복카드 체크리스트 |
| `[프리랜서]` | 프리랜서 | 사업장 주소 변경, 세금계산서 유효성, 건강보험 |
| `[박사후연구원]` | 박사후연구원 | 소속기관 주소 변경, 연구비 이전 지원 |

---

## 빠른 시작 — Claude Desktop (프리토타입)

### 사전 요구사항

- [Claude Desktop](https://claude.ai/download) 로그인 상태
- Node.js **22 LTS** 또는 **24 LTS**
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)

> ⚠️ **Node 26 Current 사용 금지** — `better-sqlite3`는 LTS 전용 사전 빌드 바이너리가 필요합니다.

### 1. 클론 및 빌드

```bash
git clone -b pretotype/genui-demo https://github.com/koi2026/mcp-gen-ui-gateway.git
cd mcp-gen-ui-gateway
pnpm install
pnpm --filter pretotype-mcp-gen-ui-gateway build
```

### 2. Claude Desktop에 MCP 서버 등록

`~/Library/Application Support/Claude/claude_desktop_config.json`을 열고 다음을 추가합니다:

```json
{
  "mcpServers": {
    "pretotype-mcp-gen-ui-gateway": {
      "command": "node",
      "args": ["<레포_절대경로>/packages/pretotype-server/dist/pretotype-index.js"]
    }
  }
}
```

`<레포_절대경로>`는 레포 루트에서 `pwd`를 실행한 결과로 교체합니다. Claude Desktop을 완전히 종료 후 재시작합니다.

### 3. 호스트 지시문 추가

Claude 대화 또는 프로젝트에 다음을 붙여넣습니다:

```
You render a public portal GenUI pretotype.

If the user includes exactly one of [신혼부부], [프리랜서], or [박사후연구원],
call render_pretotype_scenario with { "utterance": "<full user utterance>" }.

Render the returned HTML verbatim as a Claude HTML Artifact. Do not summarize,
rewrite, or redesign it. Official links are handoff URLs only — no login or
submission happens inside the artifact.

If the tag is missing or ambiguous, ask for exactly one of the three tags.
```

### 4. 데모 프롬프트 실행

```
[신혼부부] 대전 유성구로 이사 왔어요. 이사 관련 행정·세무·우리 동네 데이터를 한 곳에서 확인하고 싶어요.
```

Claude가 신혼부부 페르소나에 맞는 정부24 스타일 HTML Artifact를 열어야 합니다. 자세한 설정은 [docs/claude-desktop-pretotype-connector.ko.md](docs/claude-desktop-pretotype-connector.ko.md)를 참고하세요.

---

## 프로젝트 구조

```
mcp-gen-ui-gateway/
├── packages/
│   ├── schema/            Zod 스키마 — 의도 타입, 컴포넌트 팔레트, MCP I/O 계약
│   ├── core/              Matrix 채점 엔진 — S(i,f) × W(f,c), 컴포넌트 랭킹
│   ├── mcp-server/        MCP 게이트웨이 — 스키마 기반 도구, SQLite 저장소
│   ├── pretotype-server/  데모 프리토타입 — 고정 3-페르소나 HTML (throwaway)
│   └── browser-assist/    브라우저 보조 도구 (gov24 실시간 연동용)
├── apps/
│   └── demo-ui/           Vite React — GenUI 블록 렌더러 + 정부24 스타일 UI
├── docs/
│   ├── adr/               아키텍처 결정 기록 (ADR)
│   ├── git-workflow.md    브랜치 명명, 커밋 컨벤션, PR 규칙
│   └── ...
├── CONTRIBUTING.md        기여 가이드 (영어)
├── CONTRIBUTING.ko.md     기여 가이드 (한국어)
├── SECURITY.md
└── LICENSE                Apache-2.0
```

| 패키지 | 책임 | 의존성 |
|--------|------|-------|
| `schema` | Zod 타입 정의 + JSON Schema 내보내기 | — |
| `core` | Matrix 채점, 외부 의존 없음, 단독 테스트 가능 | `schema` |
| `mcp-server` | MCP 도구 등록, 소스 어댑터, SQLite 변경 로그 | `schema`, `core` |
| `pretotype-server` | 고정 경로 데모 *(`main`에 병합 안 함)* | `schema` |
| `demo-ui` | GenUI 렌더러 + KRDS 기반 정부24 컴포넌트 | `schema` |

---

## 개발 환경

```bash
pnpm install        # 모든 워크스페이스 의존성 설치
pnpm build          # 전체 빌드
pnpm test           # 전체 테스트
pnpm typecheck      # TypeScript 타입 검사
pnpm dev            # 데모 UI 개발 서버 → http://localhost:5173
pnpm mcp            # 메인 MCP 서버 실행 (stdio)
pnpm pretotype:mcp  # 프리토타입 MCP 서버 실행 (stdio)
pnpm pretotype:http # 프리토타입 HTTP 서버 실행 → :8787
pnpm schemas        # Zod 정의에서 JSON Schema 내보내기
```

---

## 로드맵

| 단계 | 이름 | 상태 |
|------|------|------|
| 0 | 프리토타입 — Claude Desktop 데모 | ✅ 완료 |
| 1 | 소스 계약 — `OfficialHandoffV2` 레지스트리 | ✅ 완료 |
| 2 | 맥락 랭킹 — `ContextVector` + Matrix 채점 | ✅ 완료 |
| 3 | 동적 GenUI — `GenUIResponse` 봉투 + MCP 도구 | ✅ 완료 |
| 4 | 소비자 렌더러 — KRDS 5-블록 React 컴포넌트 | 🔄 진행 중 |
| 5 | 통합 & 배포 — Vercel, 실시간 소스 연결 | ⬜ 예정 |

---

## 기여하기

버그 리포트, 기능 제안, 아키텍처 RFC, 코드, 문서 기여를 환영합니다.

| 유형 | 방법 |
|------|------|
| 버그 | [버그 리포트 템플릿](.github/ISSUE_TEMPLATE/bug_report.md) |
| 기능 제안 | [기능 요청 템플릿](.github/ISSUE_TEMPLATE/feature_request.md) |
| 아키텍처 | [RFC 템플릿](.github/ISSUE_TEMPLATE/rfc.md) → 채택된 RFC → `docs/adr/` |
| 코드/문서 | [CONTRIBUTING.ko.md](CONTRIBUTING.ko.md) 및 [docs/git-workflow.ko.md](docs/git-workflow.ko.md) 참고 |

**귀속 정책:** 커밋 메시지, PR 설명, 이슈 코멘트에 AI 귀속 표시(`Co-Authored-By: Claude`, `🤖 Generated with Claude Code` 등)를 추가하지 않습니다.

---

## 팀 역할

| 역할 | 영역 | 책임 |
|------|------|------|
| **A** | 소스 / MCP 어댑터 | 공공 데이터 연동 (gov24, RSS, SRT), MCP 도구 스키마 설계 |
| **B** | 의사결정 / Matrix / 렌즈 | 의도 파싱, Claude API 오케스트레이션, 가중치 보정 |
| **C** | 렌더러 / 데모 | GenUI React 컴포넌트 (KRDS), 데모 UI, Vercel/Docker 배포 |

---

## 라이선스

[Apache License 2.0](LICENSE) — Copyright 2026 MCP-Gen UI Gateway contributors.
