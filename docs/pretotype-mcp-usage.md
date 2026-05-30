# Pretotype MCP Usage

The pretotype is intentionally simple: a JSON tool call carries the user's fixed staged prompt, and the MCP server selects one checked-in, self-contained HTML artifact by exact tag.

## Repository Shape

```text
apps/demo-ui/public/pretotype/embedded/
  newlywed.html
  freelancer.html
  postdoc.html

apps/demo-ui/public/pretotype/scenarios/
  scenario_newlywed.json
  scenario_freelancer.json
  scenario_postdoc.json

packages/mcp-server/src/
  compose-pretotype.ts
  compose-pretotype.test.ts
  index.ts
```

The scenario JSON files are the visible routing manifest. The embedded HTML files already contain their CSS, JS, and local images. There are no required sibling `assets/`, `shared.css`, or `toggle.js` files in the repo.

## Scenario Manifest

Each JSON file explains the staged prompt, exact tag, selected artifact, surface signature, official handoff domains, and pretotype boundaries.

```json
{
  "id": "freelancer",
  "tag": "[프리랜서]",
  "label": "프리랜서 5월 이사·종합소득세",
  "stagedPrompt": "[프리랜서] 대전 유성구로 이사 왔어요...",
  "routePolicy": "exact-tag-only",
  "artifact": {
    "mode": "self-contained-html",
    "html": "embedded/freelancer.html"
  },
  "assets": [
    {
      "id": "hero-slides",
      "kind": "image",
      "delivery": "inline-data-url",
      "format": "jpeg",
      "count": 3,
      "note": "HTML img src data URL로 포함"
    },
    {
      "id": "font-stack",
      "kind": "font",
      "delivery": "system-font-stack",
      "format": "css-font-family",
      "count": 0,
      "note": "외부 폰트 파일 없이 시스템 한글 폰트 스택 사용"
    }
  ],
  "surface": {
    "headline": "프리랜서 이사와 5월 세금 마감 동시 관리",
    "signature": "종합소득세 일정과 주소 변경 작업을 먼저 보여주는 GenUI Surface",
    "modules": [
      "deadline-timeline",
      "tax-action-panel"
    ]
  },
  "officialHandoffs": [
    {
      "label": "종합소득세 신고",
      "domain": "hometax.go.kr",
      "purpose": "5월 세금 신고 공식 이동"
    }
  ],
  "boundaries": [
    "세무 신고가 완료된 것으로 표현하지 않음",
    "자연어 의미 추론 없이 정확한 태그만 라우팅"
  ]
}
```

## Tool Contract

```json
{
  "utterance": "[프리랜서] 대전 유성구로 이사 왔어요..."
}
```

Supported tag routes:

- `[신혼부부]` -> `scenarios/scenario_newlywed.json` -> `embedded/newlywed.html`
- `[프리랜서]` -> `scenarios/scenario_freelancer.json` -> `embedded/freelancer.html`
- `[박사후연구원]` -> `scenarios/scenario_postdoc.json` -> `embedded/postdoc.html`

`compose_genui_artifact` returns:

```json
{
  "content": [
    {
      "type": "text",
      "text": "<!DOCTYPE html>..."
    }
  ]
}
```

Missing, unsupported, or ambiguous tags return a short disclosure and do not fabricate a scenario. For the pretotype, the LLM should not infer from the rest of the prompt: the tag is the route.

The returned HTML should not require sibling assets. Images, CSS, and runtime JS are inline; official portal URLs remain only as outbound handoff links.

## Run

```bash
pnpm --filter @mcp-gen-ui-gateway/mcp-server start
```

Host prompt rule: render returned HTML verbatim as an HTML Artifact. Do not summarize, rewrite, or rebuild it.

## Verify

```bash
pnpm --filter @mcp-gen-ui-gateway/mcp-server typecheck
pnpm --filter @mcp-gen-ui-gateway/mcp-server test
pnpm --filter @mcp-gen-ui-gateway/demo-ui build
```
