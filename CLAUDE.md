## 하네스: 정부서비스 GenUI Gateway

**목표:** 정부24 유사 UI에서 공공데이터포털 OpenAPI와 MCP Tool 응답을 GenUI block으로 렌더링하는 Gateway 프론트 기반을 만든다.

**트리거:** 정부서비스 Gateway, 정부24 유사 UI, 공공 API, MCP Tool, GenUI renderer, C 역할 프론트/DevOps 관련 작업 요청 시 `gov-service-genui-orchestrator` 스킬을 사용하라. 단순 질문은 직접 응답 가능.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-26 | 초기 하네스 구성 | `.claude/agents`, `.claude/skills`, `CLAUDE.md` | C 역할 반복 실행과 검증 체계 구축 |
| 2026-05-26 | 정부24 참고 이미지 시각 일치 기준 추가 | `gov-service-ui-design`, `gov-service-genui-orchestrator` | 사용자가 폰트·스타일·레이아웃 동일감 강화를 요청 |
| 2026-05-26 | 정부24 컴포넌트 레이어 추가 | `apps/demo-ui/src/gov24-components.tsx`, `gov-service-genui-orchestrator` | 실제 plus.gov.kr 조사 기반 GenUI 재사용 컴포넌트 확보 |
| 2026-05-26 | JSON 아이콘 fallback 기준 추가 | `gov-service-ui-design`, `gov-service-genui-orchestrator` | 로컬 asset 실패 없이 정부24형 아이콘을 안정 표시 |
