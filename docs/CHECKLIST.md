# checklists.md — Liem OS Verification checklists

This document lists checklists used by developer agents and the Auditor engine to verify Liem OS quality.

## Developer Agent Self-Checklist
Before marking any task as complete, verify:
- [ ] Preconditions: The code complies with the 5 relaxed Iron Laws.
- [ ] Function size: All functions are small and focused (<50 lines).
- [ ] Formatting: Code is cleanly formatted (e.g. via Biome).
- [ ] Tests: Unit/integration tests have been written with >= 80% coverage.
- [ ] Secrets: No keys, passwords, or tokens are hardcoded.

## Auditor Gate Checklist (Parallel Pass)
When running the `liem_os__verify` MCP tool, the Auditor engine verifies:
1. **Code Quality**: Correct syntax, formatting, type safety, and decoupled imports.
2. **UI Design**: Accent/focus rings, responsive margins, white background layouts.
3. **Security**: CSRF, XSS escaping, parameterization, and secret isolation.

## Git Commits
- [ ] Format: `<type>: <description>`
- [ ] Allowed Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`.
- [ ] Imperative tone, short single line, no AI co-author tag lines.

## Scaffolded Project Checklists
For scaffolded fullstack monorepos, use the following detailed checklists:
- [Code Review Checklist](../scaffolds/fullstack-app/docs/checklists/code-review.md)
- [Launch Readiness Checklist](../scaffolds/fullstack-app/docs/checklists/launch-readiness.md)
- [New Product Checklist](../scaffolds/fullstack-app/docs/checklists/new-product.md)
