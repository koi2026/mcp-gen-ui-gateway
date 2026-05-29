---
name: genui-contract-design
description: 정부 OpenAPI, 공공데이터포털 API, MCP Tool 응답을 React GenUI block으로 변환하는 계약을 설계·수정·검증할 때 반드시 사용한다. 다양한 API에 대응하는 Gateway envelope, sources/evidence/errors, fallback/error 상태, block renderer 작업을 할 때도 사용한다.
---

# GenUI Contract Design

## 목표

원본 공공 API 응답과 React 화면을 분리한다. A/B가 어떤 MCP Tool 결과를 넘겨도 C의 렌더러는 안정적인 block 계약만 보고 화면을 그려야 한다.

## 권장 Envelope

```ts
type GenUIResponse = {
  run: {
    id: string;
    status: "success" | "partial" | "failed";
    generatedAt: string;
    userQuery: string;
  };
  blocks: GenUIBlock[];
  sources: Source[];
  evidence: Evidence[];
  errors: GatewayError[];
  diagnostics?: ToolTrace[];
};
```

## 최소 Block

- `summary`: 질문, 의도, 결론 요약
- `stat-list`: 지표 카드
- `record-list`: 민원/혜택/시설/정책 후보 카드
- `data-table`: 비교용 표
- `step-list`: 신청/확인 절차
- `notice`: 안전고지, 오류, 부분 실패 안내

## Source / Evidence / Error

- `sources[]`는 provider, dataset, serviceType, format, status, retrievedAt, lastUpdated, uri를 가진다.
- block은 source 내용을 복사하지 말고 `sourceIds` 또는 `evidenceRefs`로 참조한다.
- `errors[]`는 code, message, retryable, scope, sourceId, blockId를 가진다.
- 부분 실패는 실패가 아니라 `run.status = "partial"`인 정상 응답으로 다룬다.

## 구현 체크리스트

- 새 block이 추가될 때 렌더러와 테스트가 같이 바뀌었는가?
- mock scenario가 실제 API 실패/캐시/대체 상태를 포함하는가?
- 사용자 화면과 diagnostics가 분리되어 있는가?
- 계약이 특정 도메인명에 과하게 묶이지 않았는가?

## 테스트 시나리오

- 전체 성공: blocks + sources + errors 없음
- 부분 실패: 일부 sources가 fallback/error이고 notice block 포함
- 전체 실패: notice block 1개와 errors만 렌더링
