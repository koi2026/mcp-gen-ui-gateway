# Git Workflow

**[한국어 →](git-workflow.ko.md)**

This repository follows GitHub Flow. `main` is always in a deployable state; all changes go through a feature branch and PR review before merging.

---

## Branch Naming

Prefix branch names with the type of change:

| Prefix | Use |
|--------|-----|
| `feat/...` | New feature |
| `fix/...` | Bug fix |
| `docs/...` | Documentation only |
| `chore/...` | Build, config, or tooling |

Examples:

```
feat/gov24-genui-renderer
fix/mobile-guide-overflow
docs/readme-i18n
chore/license-metadata
```

---

## Commits

Follow **atomic commits** — one logical change per commit.

- Keep changes small (5–50 lines is a good target).
- The subject line alone should convey intent.
- Separate subject from body with a blank line.
- The body explains **why** the change was made, **how** it was verified, and references related issues.
- Use `Closes #N` in the body to auto-close issues on merge to `main`.

This project uses [**Conventional Commits**](https://www.conventionalcommits.org/):

```
feat(scope): add service result GenUI block
fix(pretotype): correct gov.kr authentication center URL
docs: document GitHub flow
chore: update build metadata
refactor(core): extract Matrix scorer into separate module
```

**Body example:**

```
feat: add service result GenUI block

Render Government24-style service result cards from GenUI response data.
Verified with demo-ui typecheck, test, build, and mobile Playwright check.

Closes #42
```

---

## Typical Command Flow

```bash
# Create a branch from main
git switch -c feat/example-work

# Stage and commit atomically
git add <changed-files>
git commit -m "feat: describe one change"

# Push and open a PR
git push origin feat/example-work
```

To incorporate upstream changes while working on a branch:

```bash
git fetch origin
git rebase origin/main        # or git merge origin/main
```

---

## Pull Requests

- Keep PRs small and review-friendly — one concern per PR.
- Describe only what is actually in the diff.
- Stop for a separate discussion if a PR introduces a **breaking change**.
- Even documentation-only changes follow the full branch → commit → push → PR flow.
- PR description: explain **what** changed, **how** you verified it, and any **remaining risks**.
- Group review feedback using GitHub's review feature rather than individual line comments.

**Required in every PR:**
- Issue reference: `closes #N` (complete implementation) or `refs #N` (partial/RFC)
- Conventional Commits title (`feat(scope): ...`, `fix(scope): ...`, etc.)
- Labels: one of `bug` / `enhancement` / `documentation` / `architecture`, plus `role:?` and `stage:N` where applicable

**Merge strategies:**

| Strategy | When to use |
|----------|------------|
| **Squash and merge** *(default)* | Collapses commits into one clean entry on `main` |
| Rebase and merge | When each commit independently tells a meaningful story |
| Merge commit | Only when preserving feature-branch history is explicitly required |

---

## Local Hygiene

- Delete generated/temporary screenshots after verification; do not commit them.
- Do not commit Playwright output, build artifacts, or local-only config.
