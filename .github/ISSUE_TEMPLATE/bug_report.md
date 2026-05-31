---
name: Bug report
about: Report something that is not working as expected
title: 'bug: '
labels: bug
assignees: ''
---

## Describe the bug

A clear and concise description of what the bug is.

## Affected area

<!-- Check all that apply -->
- [ ] MCP server (`packages/mcp-server`) — tool registration, MCP protocol
- [ ] Core logic (`packages/core`) — Matrix scoring, context inference
- [ ] Schema (`packages/schema`) — Zod types, contract validation
- [ ] Browser assist (`packages/browser-assist`) — handoff, source extraction
- [ ] Pretotype server (`packages/pretotype-server`) — demo fixture/server
- [ ] Demo UI (`apps/demo-ui`) — frontend rendering
- [ ] Other / Unknown

## Steps to reproduce

1. Run `...`
2. Call MCP tool `...` (e.g. `searchBenefits`, `getBenefitDetail`, `inferContext`)
3. See error

## Expected behavior

What you expected to happen.

## Actual behavior

What actually happened. Include error messages or stack traces if available.

```
paste output here
```

## Environment

- OS:
- Node version (`node -v`):
- pnpm version (`pnpm -v`):
- Transport: `stdio` / `HTTP`
- MCP client (if applicable): Claude Desktop / other

## Additional context

Any other context, screenshots, or logs.
