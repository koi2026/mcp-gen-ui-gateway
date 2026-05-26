---
name: gov-service-genui-orchestrator
description: 정부서비스 Gateway, 정부24 유사 UI, 공공데이터포털 OpenAPI, MCP Tool, GenUI renderer, C 역할 프론트/DevOps 작업을 수행·수정·보완·다시 실행·재검증할 때 반드시 사용한다. /goal 실행, 목표 달성 판단, 반복 개선, 하네스 기반 UI/계약/QA 워크플로우를 조율한다.
---

# Gov Service GenUI Orchestrator

## 목표

정부24와 유사한 공공서비스 UI를 유지하면서, 어떤 정부 OpenAPI나 MCP Tool 응답도 GenUI block으로 받아 렌더링할 수 있는 오픈소스 Gateway 프론트 기반을 만든다.

## 실행 모드

기본은 에이전트 팀 방식이다. 실제 도구가 없거나 가벼운 변경이면 메인 에이전트가 파일 기반으로 동일한 역할을 수행한다.

## Phase 0: 컨텍스트 확인

1. `.claude/agents`, `.claude/skills`, `CLAUDE.md` 존재 여부를 확인한다.
2. `apps/demo-ui/src/App.tsx`, `a2ui.ts`, `demo-data.ts`, `styles.css`를 읽는다.
3. 기존 산출물이 있으면 부분 재실행인지 전체 재실행인지 판단한다.

## Phase 1: 목표 고정

목표를 다음 문장으로 고정한다.

> 정부24 유사 UI에서 통합검색, 자주 찾는 서비스, 민원/혜택/정책 후보 카드, 출처/상태, 오류/fallback, GenUI block 계약을 보여주는 C 역할 demo를 만든다.

사용자가 정부24 스크린샷을 제공하면 추가 목표를 둔다.

> 참고 이미지의 폰트 무게, 헤더 높이, 네비게이션 여백, 검색창 형태, 자주 찾는 서비스 패널, 로그인 카드, 공지 카드, 메가메뉴가 같은 서비스처럼 느껴지도록 맞춘다.

## Phase 2: 설계

- `gov-service-ui-design`으로 정부서비스형 UI 기준을 점검한다.
- `genui-contract-design`으로 block/envelope/source/error 계약을 점검한다.
- 설계가 충돌하면 계약을 우선하고 UI는 계약을 표현하는 방향으로 조정한다.

## Phase 3: 구현

- mock scenario는 최소 3개를 유지한다: 생활안전, 복지서비스, 무역분석.
- renderer는 block type별로 분기한다.
- 정부서비스형 화면은 검색, 자주 찾는 서비스, 서비스 후보 카드, 지표/표, 출처, diagnostics, 안전고지를 포함한다.
- 실제 plus.gov.kr 조사에서 확인한 공통 컴포넌트는 `apps/demo-ui/src/gov24-components.tsx`에 재사용 가능하게 추가한다.
- JSON의 `icon` 필드는 `Gov24Icon`으로 렌더링하고, 알 수 없는 아이콘 키는 라벨/카테고리 기반 fallback을 적용한다.
- 민감정보 입력, 로그인 자동화, 본인인증, 자동 제출은 구현하지 않는다.

## Phase 4: 검증 루프

반복 기준은 다음과 같다.

1. `pnpm --filter @mcp-gen-ui-gateway/demo-ui typecheck`
2. `pnpm --filter @mcp-gen-ui-gateway/demo-ui test`
3. `pnpm --filter @mcp-gen-ui-gateway/demo-ui build`
4. 브라우저에서 콘솔 에러와 주요 화면 텍스트 확인
5. 목표 달성 표로 부족한 부분을 판단하고 다시 수정

## Phase 5: 완료 기준

- 정부24 유사 통합검색과 서비스 카드 흐름이 보인다.
- 참고 이미지의 홈/상세/메가메뉴 구조와 시각 밀도가 맞는다.
- 다양한 API mock이 같은 renderer로 그려진다.
- JSON 기반 아이콘이 외부 asset 없이 정부24 스타일로 표시된다.
- 출처와 상태가 보인다.
- fallback/error가 demo에 포함된다.
- 하네스 문서와 CLAUDE 포인터가 존재한다.
- 타입체크, 테스트, 빌드가 통과한다.

## 테스트 시나리오

정상 흐름: 생활안전 mock 선택 후 요약, 서비스 후보, 출처, Gateway 계약이 모두 표시된다.

오류 흐름: 복지서비스 mock에서 fallback source와 대체 결과가 표시된다.
