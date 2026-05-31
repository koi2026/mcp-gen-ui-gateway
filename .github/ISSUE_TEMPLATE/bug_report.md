---
name: Bug report
about: Report something that is not working as expected
title: 'bug: '
labels: bug
assignees: ''
---

## Describe the bug

A clear and concise description of what is not working.

## Affected area

<!-- Check all that apply. Keep this scoped to the current main gateway unless the issue is explicitly about a separate demo branch. -->

- [ ] MCP server (`packages/mcp-server`) — stdio tool registration or protocol behavior
- [ ] Core service (`packages/core`) — benefit search, recommendation, checklist, application guide, snapshot/change log
- [ ] Schema (`packages/schema`) — Zod contracts or exported JSON Schema
- [ ] Browser assist (`packages/browser-assist`) — optional handoff/source-assist boundary
- [ ] Demo UI (`apps/demo-ui`) — frontend rendering or Gov24-style UI
- [ ] Docs / CI / repository workflow
- [ ] Other / unknown

## Steps to reproduce

1. Run `...`
2. Call MCP tool `...` (for example `searchBenefits`, `getBenefitDetail`, `buildChecklist`, `getApplicationGuide`, or `getChangeLog`)
3. See error

## Expected behavior

What you expected to happen.

## Actual behavior

What actually happened. Include error messages or stack traces if available.

```text
paste output here
```

## Environment

- OS:
- Node version (`node -v`):
- pnpm version (`pnpm -v`):
- MCP transport: stdio / not applicable
- MCP client (if applicable): Claude Desktop / other

## Additional context

Any other context, screenshots, links, or logs.
