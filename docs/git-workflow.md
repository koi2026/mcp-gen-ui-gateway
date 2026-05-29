# Git Workflow

이 저장소는 GitHub flow를 기본으로 사용한다. `main`은 항상 실행 가능한 상태로 유지하고, 모든 변경은 기능 단위 브랜치에서 작업한 뒤 PR review를 거쳐 병합한다.

## Branch

브랜치 이름은 변경 목적을 앞에 붙인다.

- `feat/...`: 새 기능
- `fix/...`: 버그 수정
- `docs/...`: 문서 수정
- `chore/...`: 관리 작업, 설정, 빌드 보조 작업

예시:

```text
feat/gov24-genui-renderer
fix/mobile-guide-overflow
docs/git-workflow
chore/license-metadata
```

## Commit

커밋은 atomic commit을 원칙으로 한다.

- 한 커밋은 한 가지 일만 담는다.
- 가능하면 5-50줄 수준의 작은 변경으로 유지한다.
- 제목 한 줄만 보고 변경 의도를 이해할 수 있어야 한다.
- 제목과 본문 사이에는 빈 줄을 둔다.
- 본문에는 왜 바꿨는지, 어떻게 확인했는지, 관련 이슈를 적는다.
- 관련 이슈를 닫아야 하면 본문에 `Closes #123` 형식을 사용한다.

Conventional Commits를 사용한다.

```text
feat: add service result GenUI block
fix: prevent life guide overflow on mobile
docs: document GitHub flow
chore: update build metadata
```

본문 예시:

```text
feat: add service result GenUI block

Render Government24-style service result cards from generated UI data.
Verified with demo-ui typecheck, test, build, and mobile Playwright overflow check.
```

## Command Flow

일반 작업 흐름:

```bash
git switch -c feat/example-work
git add <changed-files>
git commit -m "feat: describe one change"
git push origin feat/example-work
```

이미 작업 브랜치가 있으면 `git switch <branch>`로 전환한 뒤 이어서 작업한다. `main` 변경사항이 필요하면 작업 브랜치에 최신 `main`을 반영한 뒤 충돌 여부를 확인한다.

## Pull Request

PR은 review하기 쉬운 작은 크기로 유지한다.

- 실제 diff에 있는 내용만 설명한다.
- breaking change가 있으면 PR을 멈추고 별도 논의한다.
- README만 바꾸더라도 별도 브랜치에서 `add -> commit -> push -> PR` 흐름을 따른다.
- PR description에는 변경 내용, 확인 방법, 남은 리스크를 적는다.
- feedback은 GitHub review 기능으로 묶어서 남기는 것을 권장한다.

병합 전략:

- `Squash and merge`: 기본 권장. 여러 커밋을 하나로 합쳐 main에 반영한다.
- `Rebase and merge`: 작은 커밋 각각이 의미 있을 때 사용한다.
- `Create a merge commit`: feature 단위 분기 흔적을 보존해야 할 때만 사용한다.

## Local Hygiene

- 생성된 임시 스크린샷은 확인 후 삭제한다.
- Playwright, build output, local artifact 등 PR과 무관한 파일은 commit하지 않는다.
- AI 도움을 받을 때는 실제 변경에 없는 내용을 PR/commit 설명에 쓰지 않는다.
