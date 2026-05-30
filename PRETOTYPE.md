# PRETOTYPE — "같은 발화, 다른 GenUI Surface" (June 4 데모)

> 이 문서는 Codex 작업 지시서다. 본 레포의 일반 README/PRD와 **별개**이며, pretotype 브랜치 전용이다.
> 설계 근거: `docs/adr/0001-pretotype-genui-surface-rendering-channel.md`.
> 용어: 참조 레포 #1의 `CONTEXT.md` (`GenUI Surface`, *Flagged ambiguities*).

## 0. 한 줄 정의

공통 발화 + 정확한 `[context]` 태그 → **진짜 MCP 서버**가 `scenario_*.json` 라우팅 manifest를 읽고 태그에 맞는 **사전 제작 GenUI Surface(HTML)**를 반환 → Claude가 **Artifact로 렌더**. 두뇌는 가짜(태그→룩업), 채널은 진짜.

- 공통 발화: `대전 유성구로 이사 왔어요. 전입신고, 전세 계약 법적 체크, 우리 동네 생활 데이터를 한곳에서 확인하고 싶어요.`
- 3 컨텍스트: `[신혼부부]` · `[프리랜서]` · `[박사후연구원]` (전부 대전 유성구)

## 1. 이건 throwaway pretotype다 (반드시 지킬 경계)

- ❌ 랭킹/엔진/카탈로그 연결 **안 함**. 3개 시나리오는 **하드코딩**.
- ❌ live fetch, 로그인, 본인인증, 제출 자동화 **없음**. (PR의 안전 notice 유지)
- ❌ `persona` enum 값 **날조 금지**. 라벨은 표현용, 내부는 가장 가까운 enum 튜플로 백킹 + 갭을 `tool-trace`에 공개.
- ❌ korean-law live 통합 **금지(parked, ADR-0022)**. 법적 체크 = `law.go.kr` 외부 링크만, inline 법령 텍스트 금지.
- ✅ 외부 CTA는 allowlist만: `gov.kr` / `hometax.go.kr` / `data.go.kr` / `law.go.kr` / `ntis.go.kr` / `innopolis.or.kr`.
- ✅ 추천은 "후보(candidate)"이지 자격 확정 아님.

## 2. 브랜치 구성

- **기반 브랜치**: `gov24-genui-gateway-ui` (PR #1, Gov24 GenUI ~85% 완성). **빈 `pretotype/genui-demo`에서 시작하지 말 것** — 거기서 분기하거나 PR 브랜치를 병합해 재사용률을 확보한다.
- 작업 브랜치: `pretotype/genui-demo` (PR #1 내용을 base로).
- git push/PR은 **명시 요청 시에만**.

### 재사용 자산 (그대로 사용, 재작성 금지)
| 위치 | 역할 |
|---|---|
| `apps/demo-ui/src/App.tsx` | Gov24 셸, `demoScenarios[0]` 기반 렌더, `activeScenarioId` 스위처, `BlockRenderer` |
| `apps/demo-ui/src/a2ui.ts` | `A2UIBlock` 유니온(11종), `scenarioToA2UI`, `scenarioToGenUIResponse` |
| `apps/demo-ui/src/demo-data.ts` | `DemoScenario` 타입 + 기존 시나리오들 (저작 패턴 참고) |
| `apps/demo-ui/src/gov24-components.tsx`, `styles.css` | Gov24 컴포넌트/스타일 (그대로) |
| `packages/mcp-server/src/index.ts` | stdio MCP 서버 (도구 추가 지점) |
| `docs/host-prompts.md` | host prompt (verbatim 렌더 지시 추가 지점) |

## 3. 작업 항목 (순서대로)

### STEP 0 — Day-0 spike (코드 작업 전 필수, 하나라도 실패 시 ADR-0001 채널 재검토)
1. **verbatim 렌더**: 최소 MCP 도구가 `{html:"<!doctype html>…간단한 페이지"}`를 반환 → Claude가 **의역 없이** 그대로 HTML artifact로 띄우는지 확인.
2. **artifact 크기**: `vite build`+`vite-plugin-singlefile`로 시나리오 1개를 single HTML로 인라인 → 번들 크기 측정, Claude artifact 한도 내 렌더되는지 확인. 초과하면 ADR-0001 Consequences에 따라 **경량 정적 렌더**를 사용한다.
3. **외부 새 탭**: artifact 안의 `<a target="_blank" href="https://www.gov.kr/...">` 클릭이 실제로 새 탭을 여는지 확인.

### STEP 1 — demo-ui: 3 시나리오 저작
`apps/demo-ui/src/demo-data.ts`의 `demoScenarios`에 아래 3개 `DemoScenario`를 추가 (§4 명세). 기존 시나리오 필드 구조를 그대로 따른다.

### STEP 2 — 외부 링크 전환 (타입 변경 필요)
현재 카드 클릭은 `openDetailPage`(내부 상세). 외부 링크 모델로 바꾼다:
- `ServiceResult`, `ServiceAction`에 `href?: string` 추가 (allowlist URL).
- `App.tsx`의 `BlockRenderer` 카드 CTA를 `href` 있으면 `<a target="_blank" rel="noopener noreferrer">`로 렌더, 없으면 기존 동작 유지.
- (내부 detail 페이지는 남겨도 무방하나, 데모 클릭 동선은 외부 링크 우선.)

### STEP 3 — tool-trace 공개 (타입 변경 필요)
- `ToolTrace`에 `note?: string` 추가.
- 각 시나리오 `toolTrace`에 디스클로저 행 추가:
  - `note: "'신혼부부'/'박사후연구원'은 표현 라벨 — persona enum 값 아님(gap). backing: persona=<…>, life_event=<…>"`
  - `note: "korean-law live 통합 parked (ADR-0022) — 법적 체크는 law.go.kr 외부 링크"`

### STEP 4 — context별 self-contained HTML 빌드
- Day-0에서 React singlefile가 artifact 크기/렌더 리스크를 키우면 경량 정적 렌더로 폴백한다.
- 현재 pretotype 산출물은 `apps/demo-ui/public/pretotype/embedded/{newlywed,freelancer,postdoc}.html` 3장이다.
- 사람이 확인할 라우팅 manifest는 `apps/demo-ui/public/pretotype/scenarios/scenario_{newlywed,freelancer,postdoc}.json` 3장이다.
- manifest에는 `artifact.html`, `surface.modules`, `officialHandoffs`, `boundaries`, `assets` inventory를 둔다.
- 각 HTML은 CSS/JS/이미지를 모두 포함한 self-contained artifact이며, MCP 서버는 JSON `utterance` 안의 정확한 태그로 manifest를 고르고, manifest의 `artifact.html` 파일만 읽어 반환한다.
- Claude가 별도 asset을 만들거나 가져오지 않도록 이미지·CSS·런타임 JS는 HTML 안에 inline한다. 공식 포털 URL은 CTA handoff 링크만 허용한다.

### STEP 5 — MCP 서버 도구
`packages/mcp-server/src/index.ts`에 도구 추가:
- 전용 Claude Desktop 서버: `pretotype-mcp-gen-ui-gateway`
- 전용 도구: `render_pretotype_scenario({ utterance: string })`
- 호환 도구: `compose_genui_artifact({ utterance: string })`
- 동작: `utterance` 안의 정확한 태그(`[신혼부부]`, `[프리랜서]`, `[박사후연구원]`) → `scenario_*.json` manifest 선택 → 해당 pre-built HTML 파일 읽어 `{ content:[{type:"text", text:"<!doctype html>…"}] }`로 반환.
- 태그가 없거나, 알 수 없거나, 여러 개면 갭 디스클로저 텍스트 반환(날조 금지).

### STEP 6 — host prompt
`docs/host-prompts.md`에 추가: "`render_pretotype_scenario`가 html을 반환하면 그 내용을 **그대로** HTML artifact로 렌더하라. 요약·재작성·재디자인 금지. pretotype에서는 자연어 의미 추론 없이 발화의 정확한 `[…]` 태그만 라우팅 근거로 삼는다."

## 4. 3 컨텍스트 명세

공통: `region: 대전 유성구`, 공통 발화 사용, `sources`에 정부24·홈택스·공공데이터포털, `caveats`에 candidate-not-definitive.

| 컨텍스트(라벨) | enum 백킹 (tool-trace 공개) | season | Surface 시그니처 | 핵심 카드(CTA → allowlist URL) |
|---|---|---|---|---|
| **신혼부부** | `persona: tenant`(+`expectant_parent`), `life_event: marriage\|relocation` | 이사 | **체크리스트** 중심 | 전입신고(gov.kr) · 신혼부부 특별공급/전세자금 대출(gov.kr) · 보육·돌봄 어린이집(gov.kr) · 전세 계약 법적 체크(law.go.kr 주택임대차보호법) · 근거 데이터: 대전 유성구 생활·주거 통계(data.go.kr) |
| **프리랜서** | `persona: freelancer` ✓, `life_event: relocation`+`tax_season` | 5월(종소세) | **세금 일정/타임라인** 중심 | 전입신고(gov.kr) · 종합소득세 신고(hometax.go.kr) · 사업장 주소 변경(hometax.go.kr) · 프리랜서/청년 지원사업(gov.kr) · 전세 계약 법적 체크(law.go.kr) · 근거 데이터(data.go.kr) |
| **박사후연구원** | `persona: salary_worker`/`data_user`(≈, gap), `life_event: relocation` | 11월 | **지역 데이터 테이블** 중심 | 전입신고(gov.kr) · 연말정산 준비(hometax.go.kr) · 연구기관/특구 handoff(innopolis.or.kr) · 국가R&D/NTIS 데이터(ntis.go.kr) · 전세 계약 법적 체크(law.go.kr) · 지역 통계·인프라 data-table(data.go.kr) |

> "다른 Surface"는 **같은 셸/문법**에 카드 종류·순서·블록 시그니처(체크리스트 vs 일정 vs data-table)가 컨텍스트별로 달라지는 것으로 표현한다(=PR이 이미 지원). 새 레이아웃 3종을 만들 필요 없음.

## 5. 검증

- `pnpm typecheck && pnpm test && pnpm build` green (better-sqlite3 NODE_MODULE_VERSION는 환경 문제 → `pnpm rebuild better-sqlite3`).
- STEP 0 spike 3종 통과 기록.
- 3 컨텍스트 각각 Claude에서 발화+태그 → 서로 다른 Surface가 artifact로 렌더 + 카드 클릭 시 allowlist 포털 새 탭.

## 6. 참조
- `docs/adr/0001-pretotype-genui-surface-rendering-channel.md` (채널 결정·spike·제약)
- 참조 레포 #1 `CONTEXT.md`: `GenUI Surface`, *Flagged ambiguities*, `Handoff allowlist`, ADR-0022(korean-law park)
- PR #1 `gov24-genui-gateway-ui`, `docs/gov24-interaction-audit.md`
- `public_portal_genui_mcp_10slides.pdf` (시각 레퍼런스: 슬라이드 4/8/9)
