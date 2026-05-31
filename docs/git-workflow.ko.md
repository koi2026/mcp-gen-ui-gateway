# Git 워크플로우

**[English →](git-workflow.md)**

이 저장소는 GitHub Flow를 기본으로 사용합니다. `main`은 항상 배포 가능한 상태로 유지하고, 모든 변경은 기능 단위 브랜치에서 작업한 뒤 PR review를 거쳐 병합합니다.

---

## 브랜치 명명

브랜치 이름 앞에 변경 유형을 붙입니다:

| 접두어 | 사용 시점 |
|--------|----------|
| `feat/...` | 새 기능 |
| `fix/...` | 버그 수정 |
| `docs/...` | 문서만 변경 |
| `chore/...` | 빌드, 설정, 툴링 |

예시:

```
feat/gov24-genui-renderer
fix/mobile-guide-overflow
docs/readme-i18n
chore/license-metadata
```

---

## 커밋

**Atomic commit**을 원칙으로 합니다 — 하나의 논리적 변경 = 하나의 커밋.

- 가능하면 5–50줄 수준의 작은 변경으로 유지합니다.
- 제목 한 줄만 보고 변경 의도를 이해할 수 있어야 합니다.
- 제목과 본문 사이에는 빈 줄을 둡니다.
- 본문에는 **왜** 바꿨는지, **어떻게** 확인했는지, 관련 이슈를 적습니다.
- 머지 시 이슈를 자동 close하려면 본문에 `Closes #N` 형식을 사용합니다.

이 프로젝트는 [**Conventional Commits**](https://www.conventionalcommits.org/)를 사용합니다:

```
feat(scope): GenUI 서비스 결과 블록 추가
fix(pretotype): gov.kr 인증센터 URL 수정
docs: GitHub 플로우 문서화
chore: 빌드 메타데이터 업데이트
refactor(core): Matrix 채점기를 별도 모듈로 분리
```

**본문 예시:**

```
feat: GenUI 서비스 결과 블록 추가

GenUI 응답 데이터를 정부24 스타일 서비스 결과 카드로 렌더링합니다.
demo-ui typecheck, test, build, 모바일 Playwright 오버플로우 검사로 확인.

Closes #42
```

---

## 일반 명령 흐름

```bash
# main에서 브랜치 생성
git switch -c feat/example-work

# 변경사항 stage 및 atomic commit
git add <변경된-파일>
git commit -m "feat: 변경 내용 설명"

# push 후 PR 열기
git push origin feat/example-work
```

작업 브랜치에 upstream 변경사항 반영:

```bash
git fetch origin
git rebase origin/main        # 또는 git merge origin/main
```

---

## Pull Request

- PR은 리뷰하기 쉬운 작은 크기로 유지합니다 — PR 하나에 한 가지 관심사.
- 실제 diff에 있는 내용만 설명합니다.
- **브레이킹 체인지**가 있으면 PR을 멈추고 별도로 논의합니다.
- README만 바꾸더라도 별도 브랜치에서 `add → commit → push → PR` 흐름을 따릅니다.
- PR description: **무엇**이 변경됐는지, **어떻게** 확인했는지, **남은 리스크**를 기술합니다.
- feedback은 GitHub review 기능으로 묶어서 남기는 것을 권장합니다.

**모든 PR에 필수:**
- 이슈 참조: `closes #N` (완전한 구현) 또는 `refs #N` (부분/RFC)
- Conventional Commits 제목 (`feat(scope): ...`, `fix(scope): ...` 등)
- 라벨: `bug` / `enhancement` / `documentation` / `architecture` 중 하나, 그리고 `role:?`, `stage:N`

**병합 전략:**

| 전략 | 사용 시점 |
|------|----------|
| **Squash and merge** *(기본)* | 여러 커밋을 하나로 합쳐 `main`에 깔끔하게 반영 |
| Rebase and merge | 각 커밋이 독립적으로 의미 있는 경우 |
| Merge commit | 피처 브랜치 이력 보존이 명시적으로 필요한 경우에만 |

---

## 로컬 위생

- 생성된 임시 스크린샷은 확인 후 삭제합니다; 커밋하지 않습니다.
- Playwright 출력, 빌드 아티팩트, 로컬 전용 설정은 커밋하지 않습니다.
