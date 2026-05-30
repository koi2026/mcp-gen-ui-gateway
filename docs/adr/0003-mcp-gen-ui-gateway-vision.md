# ADR-0003: mcp-gen-ui-gateway — "Real Gateway" 아키텍처 비전

**상태**: Draft  
**날짜**: 2026-05-30  
**작성자**: Role C  
**관련 이슈**: #11 (Connector vs MCP RFC)

---

## 배경

현재 `pretotype/genui-demo` 브랜치에는 **throwaway pretotype-server** 가 구현되어 있다. 이 서버는 세 개의 고정된 시나리오 태그(`[신혼부부]`, `[프리랜서]`, `[박사후연구원]`)를 받아 사전 제작된 자체완결형 HTML을 반환한다. 이는 Demo Day(2026-06-04)용 개념 증명(pretotype)으로 의도적으로 설계된 것이다 (ADR-0001 참조).

main 브랜치는 이 pretotype과 별도로, **실제 게이트웨이로서의 스펙**을 구현해야 한다. 팀원 합의에 따라 main 방향성을 먼저 문서화하고, 이를 기반으로 issue → PR → review 흐름으로 개발을 진행한다.

---

## 결정: "Gateway" 의 정의

### pretotype-server (현재) vs real gateway (목표)

| 항목 | pretotype-server | real gateway |
|------|-----------------|--------------|
| 입력 | 고정된 `[태그]` 3종 | 자연어 발화 + 정규화된 의도 |
| 채점 | 없음 (exact tag match) | Matrix 알고리즘 $O(i,c)=\sum_f S(i,f)\times W(f,c)$ |
| 컴포넌트 | 사전 제작된 HTML 파일 | 5-블록 팔레트에서 동적 조합 |
| MCP 도구 | `render_pretotype_scenario` 1개 | schema-driven 다중 도구 |
| 데이터 소스 | 내장 정적 JSON | gov24 API, data.go.kr, law.go.kr 등 연결 |
| 확장성 | 없음 (throwaway) | 새 페르소나/도메인 추가 가능 |

---

## 아키텍처 구성 요소

### 패키지 책임 경계

```
packages/
├── schema/          스키마 정의 — 의도 구조체, 컴포넌트 팔레트 타입, MCP 도구 입출력
├── core/            Matrix 채점 엔진 — S(i,f), W(f,c) 행렬 계산, 컴포넌트 선택
├── mcp-server/      Gateway 본체 — schema-driven MCP 도구, 라우팅, 오케스트레이션
├── pretotype-server/ (유지) throwaway 데모용, main에 병합하지 않음
├── browser-assist/  브라우저 보조 도구 (gov24 등 실제 연동 시)
apps/
└── demo-ui/         시각화 데모 UI
```

### Matrix 알고리즘 (core 패키지)

$$O(i,c) = \sum_f S(i,f) \times W(f,c)$$

- $i$: 사용자 의도(intent)
- $c$: 컴포넌트(component)
- $f$: 피처(feature)
- $S(i,f)$: 의도-피처 유사도 행렬
- $W(f,c)$: 피처-컴포넌트 가중치 행렬

`core` 패키지는 이 채점 로직만 담당하며, 외부 의존성 없이 단독 테스트 가능.

### 5-블록 컴포넌트 팔레트 (schema 패키지)

1. **리스크/점수 패널** — 수치 요약 (예: 전세가율, 보증보험 적용 여부)
2. **액션 번들** — 다음 할 일 3–5개
3. **체크리스트** — 완료 가능한 체크 항목
4. **데이터 레일** — 수평 스크롤 카드 목록 (후보 물건, 동네 데이터)
5. **지도 / 생애 맵** — 공간·시간 맥락

### MCP 도구 인터페이스 (mcp-server 패키지)

gateway의 MCP 도구는 schema에서 자동 생성되어야 한다 (schema-driven). 예시:

```typescript
// tool: route_genui
// input: { utterance: string, context?: UserContext }
// output: { components: ComponentSpec[], officialHandoffs: HandoffLink[] }
```

---

## Stage 매핑

| Stage | 이슈 | 연결되는 패키지 |
|-------|------|----------------|
| Stage 1 (Foundation) | #2 | `schema` 타입 정의, monorepo 기반 |
| Stage 2 (Scenario Data) | #3 | `schema` 시나리오 JSON + 3-페르소나 |
| Stage 3 (MCP Server) | #4 | `mcp-server` 라우팅 + `core` Matrix 최소 구현 |
| Stage 4 (Renderer) | #5 | `apps/demo-ui` KRDS 기반 컴포넌트 렌더 |
| Stage 5 (Deploy) | #6 | `mcp-server` npm publish + `apps/demo-ui` Vercel |

---

## 미결 사항

- [ ] **Connector vs MCP** 방향 합의 필요 → Issue #11 (ADR-0004 예정)
- [ ] `core` Matrix 행렬 초기값 설계 — 누가 $S(i,f)$, $W(f,c)$ 를 정의하는가
- [ ] `browser-assist` 의 gov24 실제 연동 범위 — pretotype 이후 단계에서

---

## 결과 및 트레이드오프

**이 ADR을 따를 때:**
- pretotype-server는 Demo Day 이후에도 유지되지만 main에 병합되지 않음 → 두 패키지가 병렬 존재
- schema → core → mcp-server 의존 방향을 강제하여 순환 의존 방지
- 초기 구현 복잡도가 pretotype 대비 높지만, 새 페르소나 추가 비용이 선형적으로 낮아짐

**포기하는 것:**
- 빠른 프로토타입 반복 속도 (schema-driven 설계는 upfront 비용이 있음)
