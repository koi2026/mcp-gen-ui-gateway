# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-28

### Added

- Local stdio MCP server with five core tools: `searchBenefits`, `getBenefitDetail`, `buildChecklist`, `getApplicationGuide`, `getChangeLog`
- Transport-neutral tool service layer with Zod domain schemas and JSON Schema export
- Fixture-backed public-service scenarios for offline development
- SQLite snapshot and change-log store
- Vite + React demo UI with Government24-style GenUI renderer
- Reusable Government24-style component layer (`gov24-components.tsx`)
- GenUI block types: summary sections, metric cards, service actions, data tables, source status, fallback visibility, tool traces
- Playwright browser-assist boundary (experimental, isolated from core)
- Role C frontend/DevOps documentation and contribution workflow

[Unreleased]: https://github.com/koi2026/mcp-gen-ui-gateway/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/koi2026/mcp-gen-ui-gateway/releases/tag/v0.1.0
