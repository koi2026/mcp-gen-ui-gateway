# mcp-gen-ui-gateway 기여 가이드

기여에 관심을 가져주셔서 감사합니다. 이 문서는 핵심 사항을 다룹니다. 브랜치 명명 및 커밋 컨벤션은 [docs/git-workflow.ko.md](docs/git-workflow.ko.md)를 참고하세요.

**[English version →](CONTRIBUTING.md)**

---

## 시작하기

**사전 요구사항**

- Node.js 22 LTS 또는 24 LTS (Node 26 Current는 `better-sqlite3` 등 네이티브 의존성 설치에 실패할 수 있습니다)
- pnpm 9.x (`corepack enable && corepack prepare pnpm@9 --activate`)

**설치 및 빌드**

```bash
pnpm install
pnpm build
pnpm test
```

개발 서버 실행:

```bash
pnpm dev        # 데모 UI → http://localhost:5173
pnpm mcp        # stdio MCP 서버 실행
```

---

## 기여 방법

### 버그 신고

[버그 리포트 템플릿](.github/ISSUE_TEMPLATE/bug_report.md)으로 이슈를 열어주세요. 재현 단계, 기대 동작과 실제 동작, 사용 환경을 포함해주세요.

### 기능 제안

구현을 시작하기 전에 [기능 요청 템플릿](.github/ISSUE_TEMPLATE/feature_request.md)으로 이슈를 먼저 열어주세요. 중복 작업을 방지하고 범위를 먼저 조율할 수 있습니다.

### 아키텍처 변경 제안 (RFC)

새로운 계약 버전, 트랜스포트 변경, 스키마 브레이킹 체인지 등 중요한 설계 결정은 [RFC 템플릿](.github/ISSUE_TEMPLATE/rfc.md)으로 이슈를 열어주세요. 이 프로젝트에서 RFC는 GitHub Discussions를 대신합니다 — 설계 논의를 이슈에서 진행하면 검색하기 쉽고 PR에서 링크할 수 있습니다.

채택된 RFC는 [`docs/adr/`](docs/adr/) 하위에 번호가 붙은 아키텍처 결정 기록(ADR)으로 기록됩니다.

### 코드 기여

1. 레포를 포크하거나 (쓰기 권한이 있다면) 피처 브랜치를 만듭니다.
2. `main`에서 브랜치를 만들 때 [docs/git-workflow.ko.md](docs/git-workflow.ko.md)의 접두어를 따릅니다:
   - `feat/...` 새 기능
   - `fix/...` 버그 수정
   - `docs/...` 문서만
   - `chore/...` 빌드, 설정, 툴링
3. 변경사항을 만들고 새 기능에는 테스트를 포함합니다.
4. 로컬에서 `pnpm typecheck`, `pnpm test`, `pnpm build`가 모두 통과하는지 확인합니다.
5. PR 템플릿을 사용해 `main` 대상으로 PR을 열어주세요.

**스택 PR:** 여러 단계로 나뉜 작업은 단계별로 PR을 하나씩 열고, 각 PR의 base를 이전 단계 브랜치로 설정합니다(`main`이 아님). PR 설명의 *스택 위치* 섹션에 순서를 명확히 기술합니다.

---

## Pull Request 요구사항

- 모든 PR은 이슈를 참조해야 합니다: 완전한 구현은 `closes #N`, 부분 작업 또는 RFC 논의는 `refs #N`.
- PR 제목은 Conventional Commits 형식을 따릅니다: `feat(scope): ...`, `fix(scope): ...`, `docs: ...`, `chore: ...`, `refactor(scope): ...`
- 적절한 라벨을 추가합니다: `bug` / `enhancement` / `documentation` / `architecture` 중 하나, 그리고 해당하면 `role:?` (A/B/C)와 `stage:N`.
- 기본 머지 전략은 Squash and merge입니다; 머지 전 커밋 이력을 깔끔하게 유지합니다.
- `main`에 직접 push하거나 공유 브랜치에 force-push하지 않습니다.

---

## 커밋 메시지

이 프로젝트는 [Conventional Commits](https://www.conventionalcommits.org/)를 사용합니다:

```
feat: GenUI 서비스 결과 블록 추가
fix(pretotype): gov.kr 인증센터 URL 수정
docs: GitHub 플로우 문서화
chore: 빌드 메타데이터 업데이트
```

커밋 본문에는 **왜** 변경했는지, **어떻게** 검증했는지를 설명합니다. `Closes #N`으로 이슈를 참조합니다.

**귀속 정책:** 커밋 메시지, PR 설명, 이슈 코멘트에 AI 귀속 표시(`Co-Authored-By: Claude ...`, `🤖 Generated with [Claude Code]` 등)를 추가하지 않습니다. AI 도구 사용은 괜찮습니다; 귀속은 사람 기여자에게만 유지합니다.

---

## 코드 스타일

- 전체 TypeScript strict 모드를 사용합니다. `any`는 사용하지 않습니다; 불가피한 경우 주석으로 이유를 설명합니다.
- 내보내는 함수와 타입 모두 명시적 타입 시그니처가 필요합니다.
- 커밋 전 `pnpm typecheck`를 실행합니다.
- 레포에 `.editorconfig`가 포함되어 있습니다 — 에디터에서 이를 준수하도록 설정하세요.

---

## 테스트

- 해당 패키지에 테스트를 추가합니다 (Vitest, 소스 파일 옆에 위치).
- `pnpm test`로 모노레포 전체 테스트 스위트를 실행합니다.
- 새로운 MCP 도구에는 `packages/core`에 픽스처 기반 테스트가 필요합니다.

---

## 라벨 참조

| 라벨 | 의미 |
|------|------|
| `bug` | 예상대로 작동하지 않는 문제 |
| `enhancement` | 새 기능 또는 개선 |
| `documentation` | 문서만 변경 |
| `architecture` | ADR 또는 설계에 영향을 주는 변경 |
| `role:A` / `role:B` / `role:C` | 담당 역할 (A=core/schema, B=data/API, C=renderer/demo) |
| `stage:1` … `stage:5` | 프로젝트의 단계별 전달 계획에 매핑 |
| `good first issue` | 새 기여자에게 적합한 진입점 |
| `help wanted` | 추가적인 주의 또는 외부 도움 환영 |

---

## 모노레포 구조

| 경로 | 설명 |
|------|------|
| `packages/schema` | Zod 도메인 스키마 + JSON Schema 내보내기 |
| `packages/core` | 트랜스포트 중립 도구 서비스, 픽스처, SQLite 저장소 |
| `packages/mcp-server` | stdio MCP 서버 진입점 |
| `packages/pretotype-server` | June 4 데모용 throwaway 프리토타입 MCP 서버 (실제 게이트웨이와 분리) |
| `packages/browser-assist` | Playwright 경계 (실험적, 격리됨) |
| `apps/demo-ui` | Vite React 데모 — GenUI 렌더러 + 정부24 스타일 UI |

---

## 아키텍처 결정 기록

중요한 설계 선택은 [`docs/adr/`](docs/adr/) 하위에 번호가 붙은 파일(`0001-...`, `0002-...`)로 기록됩니다. 새로운 ADR은 RFC 이슈를 통해 도입되고 `docs/...` PR로 머지됩니다.

---

## 범위 외

정부24 로그인 자동화, 본인 인증, 자동 양식 제출, 예약 크롤링, 호스팅된 HTTP/SSE 게이트웨이 모드는 명시적으로 범위 밖입니다. 이 영역을 다루는 PR은 머지되지 않습니다. 전체 목록은 [README.ko.md](README.ko.md)를 참고하세요.

---

## 행동 강령

이 프로젝트는 [Contributor Covenant 행동 강령](CODE_OF_CONDUCT.md)을 따릅니다. 참여 전에 읽어주세요.

---

## 보안 리포트

보안 문제는 공개 이슈로 열지 마세요. 비공개 공개 프로세스는 [SECURITY.md](SECURITY.md)를 참고하세요.
