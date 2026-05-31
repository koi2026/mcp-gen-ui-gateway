# STATUS — 버전 사다리 & 스테이지별 할일

> 단일 라이브 보드. 용어 정의는 [`/CONTEXT.md`](../CONTEXT.md), 아키텍처 결정은 [`docs/adr/`](./adr).
> 갱신: 2026-05-31 (grill 수렴).

## 한눈에 — 버전 사다리

버전마다 **새 능력 하나씩**. 0.5↔0.6은 동일 **GenUI Renderer**를 공유(데이터 출처만 다름).

| 버전 | 새로 더하는 능력 | 오케스트레이션 | 커넥터 | 소속 | 상태 |
|------|------------------|----------------|--------|------|------|
| **0** | 정부서비스 고정 아티팩트 3종 | — | pretotype | pretotype (동결) | ✅ 완료·동결 |
| **0.5** | korean-law 킬러 UX(`action_plan` 5단계)를 GenUI Artifact로 렌더 | Claude가 글루 (호스트, B 계약) | korean-law + pretotype-genui **2개** | pretotype 확장판 | 🔜 다음 |
| **0.6** | Gateway가 MCP 클라이언트로 korean-law-mcp **Federation** | 게이트웨이 내부 | 게이트웨이 **1개** | gateway 트랙 | ⬜ 예정 |
| **G-1~4** | Ranking Pipeline 채점 · 멀티소스 · 배포 | 게이트웨이 | 1개 | gateway 트랙 (ADR-0003) | ⬜ 예정 |

---

## ✅ Stage 0 — Pretotype (동결 기준선)
- 정부서비스 고정 아티팩트(`[신혼부부]`/`[프리랜서]`/`[박사후연구원]`) — `packages/pretotype-server/assets/embedded/*.html`
- 버그 #9(gov.kr 링크)·#10(transform-origin) PR #17/#18 머지
- **불변.** Stage 0 산출물은 수정하지 않는다(회귀 기준선).

## 🔜 Stage 0.5 — korean-law 킬러 UX GenUI (다음 작업)

**목표:** korean-law-mcp가 지금 텍스트로 내놓는 킬러 경험을 깔끔한 Artifact GUI로. 히어로 = **`action_plan` 5단계** ("전세금 못 받았어" → STEP1 상황진단 → STEP2 권리/구제(판례) → STEP3 신청기관/기한 → STEP4 필요서류/양식 → STEP5 함정/주의). 평소 말투 → 실행 가능한 단계로 변환.

**계약 (B + 스텝 규약):** GenUI Renderer 도구가 `kind` + 콘텐츠를 받음.
- `law_action_plan`: `{ kind, title, steps: [5개 markdown 섹션] }` (스테퍼 렌더 위해 5섹션만 구분)
- `law_explain`·`law_citation_verify` 등: `{ kind, title, markdown }` 1덩어리 패스스루

**위치:** pretotype 가족 — 추천 (a) 기존 `pretotype-server`에 **새 도구 추가**(Stage 0 기존 도구는 불변). 커넥터 하나로 같이 사용.

**할일**
- [x] korean-law-mcp 콘텐츠/블록 매핑 + 시안 이미지 프롬프트
- [ ] `kind` 목록 확정 (`law_action_plan` 우선)
- [ ] GenUI Renderer 도구 + Zod 입력(B 계약) 스캐폴드 (impl + types + test)
- [ ] `action_plan` 5단계 임베디드 HTML 템플릿 (정부포털 토큰 재사용)
- [ ] 호스트 프롬프트: "법령 질의 → action_plan은 GenUI로 렌더" 유도
- [ ] Claude Desktop에 korean-law + pretotype-genui 2개 연결 → Artifact 출력 검증
- [ ] (선택) 모바일 변형

## ⬜ Stage 0.6 — Federation (Gateway 이름값)

**목표:** "형제 커넥터끼리 못 부른다"를 넘어, 게이트웨이가 **MCP 클라이언트**로 korean-law-mcp를 직접 호출. Claude Desktop엔 **게이트웨이 1개만** 연결.

**0.5 대비 새로 더하는 것 = Federation 층 뿐** (GenUI Renderer는 0.5 것 재사용, "데이터를 누가 채우나"만 Claude→게이트웨이).

**할일**
- [ ] `mcp-server`에 MCP 클라이언트(downstream stdio) 연결 관리 — greenfield
- [ ] downstream `npx korean-law-mcp` 프로세스 수명관리
- [ ] 법제처 OC 키 passthrough/설정 (env-driven, `config/`)
- [ ] 라우팅: 발화 → 어느 downstream/도구를 부를지
- [ ] downstream 출력 → 0.5 GenUI Renderer로 렌더

**한계(정직):** Federation은 "누가 데이터를 가져오나"를 풀지, "Artifact가 어떻게 그려지나"(호스트가 반환 HTML을 띄움)는 별개.

## ⬜ Gateway 트랙 (ADR-0003)
- **G-1 Foundation** — 4 도구 + Zod + SQLite — *MVP 존재* (검증·정리)
- **G-2 Matrix(=Ranking Pipeline 포팅)** — maintained 레포 파이프라인($Q=\sum_i S_iW_i$ 양수합산, 호스트 W 제안, 안전 게이트, 5단계, `ui_slot`)을 `core`로
- **G-3 Renderer** — 5블록/슬롯 렌더 (`apps/demo-ui`)
- **G-4 Deploy** — npm publish + Vercel

## 🧹 문서/하이진
- [ ] ADR-0003 상태 Draft → Accepted 결정
- [ ] `docs/pretotype-follow-up-roadmap.md`의 옛 "weighting matrix"·Stage 프레이밍을 CONTEXT.md와 reconcile
- [ ] ADR-0003 미결: `browser-assist` gov24 실연동 범위

## 정리됨 (참고)
- 모든 GitHub 이슈 CLOSED (이슈 기반 트래킹 종료, 이 보드로 대체)
- #11(Connector vs MCP) → Option B(자체 대시보드) 확정
