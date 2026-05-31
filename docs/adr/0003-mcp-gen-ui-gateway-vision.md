# ADR-0003: mcp-gen-ui-gateway — "Real Gateway" 아키텍처 비전

**상태**: Draft  
**날짜**: 2026-05-30  
**작성자**: Role C  
**관련 이슈**: #11 (Connector vs MCP RFC)

---

## 배경

현재 `pretotype/genui-demo` 브랜치에는 **pretotype-server** 가 구현되어 있다. 이 서버는 세 개의 고정된 시나리오 태그(`[신혼부부]`, `[프리랜서]`, `[박사후연구원]`)를 받아 사전 제작된 자체완결형 HTML을 반환한다. 원래 ADR-0001에서 Demo Day(2026-06-04)용 개념 증명으로 설계되었고, 그 목표는 달성되었다. 이제는 특정 기한에 묶이지 않은 **완료된 안정 베이스라인(regression baseline)** 으로 유지된다 (ADR-0001 참조).

main 브랜치는 이 pretotype과 별도로, **실제 게이트웨이로서의 스펙**을 구현해야 한다. 팀원 합의에 따라 main 방향성을 먼저 문서화하고, 이를 기반으로 issue → PR → review 흐름으로 개발을 진행한다.

---

## 결정: "Gateway" 의 정의

### pretotype-server (현재) vs real gateway (목표)

| 항목 | pretotype-server | real gateway |
|------|-----------------|--------------|
| 입력 | 고정된 `[태그]` 3종 | 자연어 발화 + 정규화된 의도 |
| 채점 | 없음 (exact tag match) | 랭킹 파이프라인 $Q=\sum_i S_i\times W_i$ (양수 합산; 아래 "채택된 설계" 참조. $O(i,c)$ 이중선형은 개념 골격일 뿐) |
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

#### 채택된 설계 (Stage 2 — 개인 프로젝트 `maintained-public-portal-genui-mcp` 포팅)

위 $O(i,c)$ 는 컴포넌트 선택의 **개념 골격**이다. 실제 구현은 별도 매트릭스를 새로 도입하지 않고, 이미 ADR 6개로 검증된 **단일 랭킹 파이프라인**을 포팅해 채택한다 (설계 근거는 해당 레포의 ADR들이며, 본 레포에 ADR을 추가 생성하지 않는다):

- **공식**: $Q = \sum_i S_i \times W_i$ — 양수 피처만 합산. 순수 내적은 기각(민감도가 점수를 올리는 역설). [근거: maintained ADR-0005]
- **$W$ 정의 주체**: **호스트 LLM이 쿼리마다 `weight_override` 제안** → 서버가 음수 clip, 피처별 `clip_cap`, `weight_rationale` 강제, $\Sigma=1$ 정규화. 부재 시 `weights/<ver>.json` 의 합성 baseline($W_{base}+\sum\Delta_{axis}$) fallback. [maintained ADR-0006·0012]
- **$S$ 정의 주체**: Entry별 catalog 저장값. ordinal 매핑은 코드가 아니라 `weights/<ver>.json`. [maintained ADR-0002·0011]
- **안전**: `sensitivity_risk`·`confidence` 는 점수항이 아니라 **게이트** — 호스트가 가중치로 우회 불가. [maintained ADR-0005·0012]
- **파이프라인**: `context-filter → safety-gate → score → SR-shape → cut` 5단계. [maintained ADR-0010]

**컴포넌트 선택 = 슬롯 배정으로 통합** (결정 (가)): 5-블록 팔레트는 별도 $O(i,c)$ 매트릭스가 아니라, 위 파이프라인의 `ui_slot` 값 집합 확장으로 실현한다. "콘텐츠 랭킹 + 표현 슬롯"을 한 파이프라인에 두어 과설계를 피한다.

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

## Stage 매핑 (real-gateway 빌드)

pretotype 트랙의 스테이지(#2~#6, 완료·동결)와 **별개**인, 진짜 게이트웨이 빌드의 스테이지다.

| Stage | 내용 | 연결되는 패키지 | 상태 |
|-------|------|----------------|------|
| Stage 1 (Foundation) | 4개 도구 + Zod 스키마 + SQLite | `schema`·`core`·`mcp-server` | MVP 존재 |
| **Stage 2 (Matrix\*)** | maintained 랭킹 파이프라인 포팅 → 채점 두뇌 (\*"Matrix"는 라벨일 뿐, 실제 행렬 아님 — 위 "채택된 설계" 참조) | `core` (+ `weights/<ver>.json`) | **채택 — 다음 작업** |
| Stage 3 (Renderer) | 5블록/슬롯 렌더 | `apps/demo-ui` (이슈 #5) | 대기 |
| Stage 4 (Deploy) | npm publish + Vercel | `mcp-server`·`apps/demo-ui` (이슈 #6) | 대기 |

---

## 미결 사항

- [x] ~~`core` Matrix 행렬 초기값 설계 — 누가 $S(i,f)$, $W(f,c)$ 를 정의하는가~~ → **해소(2026-05-31)**: 위 "채택된 설계" 참조. $W$는 호스트 LLM 제안 + 합성 fallback, $S$는 catalog + weights JSON. maintained 포팅으로 Stage 2에서 구현.
- [x] ~~**Connector vs MCP** 방향 합의 필요~~ → **해소**: Issue #11 (CLOSED) 에서 **Option B(자체 호스팅 대시보드 우선)** 확정. MCP 서버는 시나리오 라우팅·도구 트레이스 역할로 유지, 최종 surface는 자체 대시보드. `core`(Matrix)는 transport-neutral이라 대시보드 API/MCP 어느 쪽이 호출해도 무방.
- [ ] `browser-assist` 의 gov24 실제 연동 범위 — pretotype 이후 단계에서

---

## 결과 및 트레이드오프

**이 ADR을 따를 때:**
- pretotype-server는 완료된 안정 베이스라인으로 유지되지만 main에 병합되지 않음 → 두 패키지가 병렬 존재
- schema → core → mcp-server 의존 방향을 강제하여 순환 의존 방지
- 초기 구현 복잡도가 pretotype 대비 높지만, 새 페르소나 추가 비용이 선형적으로 낮아짐

**포기하는 것:**
- 빠른 프로토타입 반복 속도 (schema-driven 설계는 upfront 비용이 있음)
