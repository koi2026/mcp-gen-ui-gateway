# [DRAFT] [Stage 3] npm publish: `pretotype-mcp-gen-ui-gateway`

> Local draft for a GitHub issue. Not yet filed. See [ADR-0002](adr/0002-pretotype-server-standalone-npm-package.md).
> Labels: `enhancement`, `role:C`, `stage:3`. Depends on: #3 (Stage 2 scenario data).

## 목적

pretotype를 **오픈소스로 누구나 `npx`로 설치·실행**할 수 있게 npm에 발행한다. 상시 켜두는 HTTP 커넥터가 아니라, Claude Desktop이 세션마다 stdio bin을 띄우는 모델.

```jsonc
// claude_desktop_config.json
{
  "mcpServers": {
    "pretotype-mcp-gen-ui-gateway": {
      "command": "npx",
      "args": ["-y", "pretotype-mcp-gen-ui-gateway"]
    }
  }
}
```

## 범위

- 발행 단위: 신규 self-contained 패키지 `packages/pretotype-server` → npm 이름 **비스코프 `pretotype-mcp-gen-ui-gateway`**.
- pretotype HTML/시나리오를 패키지 `assets/`로 소유, `import.meta.url` 기준 해소.
- `mcp-server`에서 pretotype 제거(격리). `core`/`schema` 의존 없음.

## 완료 기준

- [x] `pnpm --filter pretotype-mcp-gen-ui-gateway build` green
- [x] `... test` green (8/8), `... typecheck` green
- [x] `npm pack --dry-run` tarball = `dist/` + `assets/{embedded,scenarios}` + `README` + `package.json` (src/테스트 제외)
- [x] 임의 cwd에서 실행 시 3개 태그 → 실제 self-contained HTML, 미지원 태그 → 디스클로저(날조 없음)
- [ ] `npm login` 후 `npm publish` (비스코프 → `--access public` 불필요)
- [ ] 발행본으로 `npx pretotype-mcp-gen-ui-gateway`를 Claude Desktop에 연결 → 3 컨텍스트가 서로 다른 Surface를 아티팩트로 렌더 + CTA 외부 새 탭

## 이 브랜치에서 완료된 작업 (`refactor/pretotype-server-publish`)

- `packages/pretotype-server` 신설(package.json `files`/`bin`, tsconfig).
- `compose-pretotype.ts`·`pretotype-server.ts`·`pretotype-index.ts`·`pretotype-http.ts`(+테스트) 이전(git mv, 이력 보존).
- embedded HTML 3장 + scenario JSON 3장 → `assets/`로 이전.
- 경로 해소를 `findWorkspaceRoot()+apps/demo-ui/public` → `new URL("../assets", import.meta.url)`로 교체.
- `mcp-server`에서 pretotype 도구/bin/스크립트 제거, 루트 `pretotype:*` 스크립트를 새 패키지로.

## 남은 후속 (별도 작업 가능)

- [ ] `core`/`schema`/`mcp-server`/`browser-assist`에 `"private": true` (실수로 `pnpm -r publish` 시 미발행 스코프 패키지 발행 방지).
- [ ] 문서 명령/경로 갱신: `docs/pretotype-architecture.md`, `docs/claude-desktop-pretotype-connector.md`, `docs/pretotype-mcp-usage.md`, `README.md` (옛 `@mcp-gen-ui-gateway/mcp-server pretotype:*` / `apps/demo-ui/public/pretotype` 참조 → 새 패키지·npx).
- [ ] 페르소나 표기 정합: 이슈 #3의 "교수(professor)" → 브랜치/ADR-0001의 **postdoc(박사후연구원)**.

## 선행 조건

- #3 (Stage 2 scenario data). #3은 시나리오 콘텐츠 마일스톤으로 유지하고, 본 이슈가 배포를 담당한다.
