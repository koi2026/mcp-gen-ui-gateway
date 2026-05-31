# 정부서비스 GenUI Gateway

공공 서비스 발화를 받아, 검증된 공식 출처로 뒷받침되는 GenUI 블록으로 응답하는 게이트웨이. **Pretotype 가족**(고정 아티팩트 Stage 0 + 확장 0.5/0.6)과 그것이 지향하는 **Gateway**(Ranking Pipeline 채점 + 멀티소스 Federation)가 한 제품의 연속 단계로 이어진다. 단계별 로드맵·할일은 `docs/STATUS.md`.

## Language

**Pretotype**:
고정된 3개 컨텍스트 태그(`[신혼부부]`·`[프리랜서]`·`[박사후연구원]`)를 받아 사전 제작된 자체완결형 HTML을 반환하는 Stage 0 기준선(regression baseline). **Stage 0 산출물 자체는 동결**(불변 회귀 기준선)이되, pretotype *가족*은 가산 확장(0.5 korean-law GenUI 렌더, 0.6 Federation)으로 이어진다 — Stage 0을 수정하지 않는 한 동결 원칙과 충돌하지 않음.
_Avoid_: 데모서버, 목업 (Pretotype은 폐기 대상이 아니라 회귀 기준선)

**Gateway**:
자연어 발화 + 정규화된 의도를 받아 출처로 뒷받침되는 컴포넌트를 동적 조합해 응답하는 목표 시스템. ADR-0003이 정의하는 "real gateway".

**Federation**:
**Gateway**가 스스로 **MCP 클라이언트**가 되어 downstream MCP 서버(korean-law-mcp, 향후 gov24 등)를 호출·집약해 **커넥터 하나** 뒤로 노출하는 것. 호스트 안 형제 커넥터끼리 못 부르는 제약을 넘어 "Gateway" 이름값을 버는 능력(0.6에서 첫 실현). korean-law-mcp는 재구현 없이 downstream으로 재사용.
_Avoid_: proxy (너무 좁음), 단순 래퍼

**GenUI Renderer**:
`kind`(예: `law_action_plan`·`law_explain`) + 콘텐츠(0.5는 markdown 패스스루)를 받아 정부포털 스타일 자체완결 HTML을 반환하는 도구. 호스트가 Artifact로 띄운다. **0.5(Claude가 데이터 주입)와 0.6(Gateway가 Federation으로 주입)이 공유** — 데이터 출처만 다르고 렌더러는 동일.
_Avoid_: 동적 렌더러 (pretotype의 experimental `render_dynamic_genui_template`과 혼동), 템플릿엔진

**Context Vector**:
발화에서 추론한 정규화된 의도 — 지역·생애사건·가구·고용·주거·긴급도·리스크초점의 구조체. Pretotype과 Gateway 모두의 입력.
_Avoid_: intent (너무 광의), 프로필

**Context Routing**:
발화를 **3개 고정 시나리오(newlywed/freelancer/postdoc) 중 하나로 귀속**시키는 단계. 정확한 태그가 있으면 그것으로(exact-tag), 없으면 **Context Vector**로 추론해(context-vector) 택1. 새 시나리오를 만들지는 않는다.
_Avoid_: 생성, dynamic (← Flagged ambiguities 참조)

**Component Ranking**:
**Context Routing**으로 정해진 시나리오의 **저작된 Module들을 재정렬**하는 단계. 컴포넌트 후보에 **가산식**(기본우선순위에 적합도 가점을 더하고 마찰 페널티를 빼는 방식)으로 점수를 매겨 상위 N개를 고른다. 현재의 **실험적** 방식이며 `pretotype-server`에 위치. 채택될 **Ranking Pipeline의 단순화된 선행 버전**(호스트 제안 가중치·안전 게이트·슬롯 배정·catalog $S$가 아직 없음). 새 Module을 만들지 않는다.
_Avoid_: weighting matrix (← Flagged ambiguities 참조), Matrix

**Ranking Pipeline**:
ADR-0003이 **채택한 목표** 채점 방식 — 개인 프로젝트(`maintained-public-portal-genui-mcp`, ADR 6개로 검증)에서 포팅하는 단일 랭킹 파이프라인. 공식 $Q=\sum_i S_i\times W_i$(**양수 피처만 합산**; 순수 내적은 민감도 역설로 기각). $W$는 **호스트 LLM이 쿼리마다 제안** → 서버가 음수 clip·`clip_cap`·`weight_rationale`·Σ=1 정규화, $S$는 Entry catalog 저장값, `sensitivity_risk`·`confidence`는 점수항이 아닌 **게이트**, 컴포넌트 선택은 `ui_slot` 배정으로 통합, 파이프라인 `context-filter → safety-gate → score → SR-shape → cut`. `core` 패키지 대상이며 **아직 미구현**.
_Avoid_: Matrix (실제 행렬 아님 — Flagged ambiguities 참조), 이중선형, Matrix Scoring

**Official Handoff**:
공식 서비스로 연결되는 검증된 링크 단위(제공자·도메인·serviceType·검증상태·신뢰도 포함). 컴포넌트의 증거 기반.
_Avoid_: 링크, 외부URL

### Pretotype 한정 용어 (Gateway 도메인 언어 아님 — pretotype과 함께 동결)

**Context Tag**:
사용자 발화에 들어가는 트리거 문자열(`[신혼부부]`·`[프리랜서]`·`[박사후연구원]`). **Pretotype**의 exact-match 라우팅 키.
_Avoid_: persona, 시나리오 (Tag는 트리거 문자열일 뿐)

**Scenario**:
**Pretotype**이 사전 저작한 번들 전체(artifact + `surface.modules` + handoffs + boundaries). `id`(`newlywed`/`freelancer`/`postdoc`)로 식별. Gateway에는 존재하지 않는 고정 fixture.
_Avoid_: Gateway 시나리오 (Scenario는 pretotype 한정)

**Persona**:
시나리오가 겨냥하는 사람 유형. **개념으로서의 persona는 Gateway의 확장 가능 데이터 차원**이지만(ADR-0003: "새 페르소나 추가 가능"), **3개 값(newlywed/freelancer/postdoc)은 pretotype 한정**이며 Scenario와 1:1. Context Vector의 신호 필드값(예: `workStatus="researcher"`)과는 **다른 네임스페이스** — 그래서 persona `postdoc` ↔ workStatus `researcher` 불일치는 충돌이 아님(아래 참조).
_Avoid_: Scenario id를 Context Vector 값과 통일하려는 시도

### 시각 단위 3층 (Module → Component → Block)

**Module**:
특정 시나리오에 저작자가 배치하는 도메인 명명 재료(예: `legal-checklist`, `tax-action-panel`). 시나리오의 `surface.modules` 목록에 나열되는 입력 단위.
_Avoid_: Component, Block (Module은 채점 이전의 저작 단위)

**Component**:
**Context Vector**로 채점·선택된 단위(점수·선택여부·시각형태(componentType)를 가짐). **Module**이 채점되면 **Component**가 된다.
_Avoid_: Module, Block, 후보 (Component는 랭킹 산출물 한정)

**Block**:
최종 응답 엔벨로프의 렌더 단위(고정 팔레트 타입: summary/action-checklist/service-card-list/handoff-link-list/notice 등). 사용자가 실제로 보는 단위.
_Avoid_: Component, 카드, 패널

## Relationships

- 하나의 발화 → 하나의 **Context Vector**로 추론됨
- **Component Ranking**(현재·실험)은 **Ranking Pipeline**(목표·포팅)의 **단순화된 선행 버전**이다 — 같은 양수 가산식 골격이나 호스트 제안 가중치·안전 게이트·슬롯 배정·catalog $S$가 빠져 있음
- 발화 → **Context Routing**(시나리오 택1) → **Component Ranking**(Module 재정렬)의 순서
- **Module** —(채점)→ **Component** —(렌더)→ **Block** 의 3층 변환
- **Component Ranking**의 결과 **Component**는 **Official Handoff**를 증거로 참조한다
- **Pretotype**은 고정 **Context Tag**만, **Gateway**는 임의 발화를 받는다
- **Context Tag**·**Scenario**·**Persona**(3개 값)는 Pretotype 한정 / **Context Vector**·**Ranking Pipeline**은 Gateway 횡단

## Flagged ambiguities

- **"weighting matrix"** — Stage 2 커밋(b69a4d7) 메시지가 `context-ranking.ts`의 가산식 점수를 "component weighting matrix"라 불렀다. 해소: 현재 코드는 **Component Ranking**(가산식, 실험적, pretotype-server)이고, 채택 목표는 **Ranking Pipeline**($Q=\sum_i S_i W_i$ 양수합산, core, 미구현)이다 — 둘 다 행렬이 아닌 가산식이며, Component Ranking은 Ranking Pipeline의 단순화된 선행 버전. (2026-05-31 grill에서 확정, 2026-05-31 ADR-0003 갱신 반영)
- **"Matrix" 이름 표류** — ADR-0003 "채택된 설계"는 "별도 매트릭스를 새로 도입하지 않는다"고 명시하면서도 Stage 라벨은 여전히 "Stage 2 (Matrix)"이고 비교표(ADR line 25)는 이중선형 $O(i,c)$를 적는다. 해소: "Matrix"는 이제 실제 행렬이 아니라 **포팅된 Ranking Pipeline**을 가리키는 라벨이다. 정본 채점 정의는 ADR "채택된 설계" 섹션($Q=\sum_i S_i W_i$). (2026-05-31)
- **"Stage" 번호 = 3갈래** — 번호 체계가 셋이라 반드시 갈래를 밝혀야 함. ① **Pretotype 가족 0.x 사다리**: 0(고정 아티팩트, 동결) → 0.5(korean-law GenUI, 호스트 오케스트레이션, B 계약) → 0.6(Federation: Gateway가 MCP 클라이언트로 downstream 호출). ② **Pretotype 빌드 스테이지**(b69a4d7/a831298 "Split Stage 1/2/3" 커밋, 완료·동결). ③ **real-gateway 트랙**(ADR-0003: Stage 1 Foundation → Stage 2 Matrix=Ranking Pipeline 포팅 → Stage 3 Renderer → Stage 4 Deploy). 0.5↔0.6은 동일 **GenUI Renderer** 공유(데이터 출처만 다름). 정본 로드맵·할일은 `docs/STATUS.md`. (2026-05-31 grill 확정)
- **"컴포넌트" 어휘 4중화** — `moduleId`(저작)·`componentType`(랭킹)·`GenUIBlock.type`(렌더)·ADR-0003 5블록(비전)이 서로 다른 어휘로 공존. 해소: **Module→Component→Block** 3층을 별개 용어로 확정. 현재 **Component**의 `componentType`은 **Block**.type으로 매핑되지 않고 렌더 시 버려진다 — componentType↔block 매핑은 **미구현**(향후 core/Matrix 렌더러가 닫을 갭). canonical Block 팔레트의 목표 형태는 ADR-0003의 5블록. (2026-05-31 grill에서 확정)
- **"dynamic" 과장** — `compose_dynamic_genui_response`/`render_dynamic_genui_template`의 이름·설명("broader context signals로 추론")이 개방형 생성을 시사하나, 실제로는 **Context Routing(고정 3시나리오 택1) + Component Ranking(저작 Module 재정렬)**일 뿐이다. 4번째 페르소나·새 Module 조합은 생성 못 함. 해소: 현재 "dynamic" = 고정 시나리오 내 라우팅+랭킹. 개방형 조합은 **Gateway/Matrix 목표**. (2026-05-31 grill에서 확정)
