# Quality & Verification Checklists — [Project Name]

> [!NOTE]
> This is a placeholder checklists document. Define your own quality gates, testing targets, and release criteria.

---

## 1. Developer Self-Checklist (Before PR Submission)
- [ ] **Functional**: Does the implementation satisfy the user story acceptance criteria?
- [ ] **Formatting**: Is code formatted using style formatters (e.g. Biome, ESLint)?
- [ ] **Clean Code**: Are functions small (<50 lines) and files focused (<400 lines typical)?
- [ ] **Decoupled**: Do imports avoid direct cross-calls between sibling feature directories?
- [ ] **Secrets Check**: Ensure zero passwords, tokens, or API keys are committed in source files.

---

## 2. Test Verification Checklist
- [ ] **Unit Tests**: Coverage covers critical logic branches (target $\ge$ 80% coverage).
- [ ] **Integration Tests**: Database queries, schema migrations, and API endpoint hooks are verified.
- [ ] **E2E Tests**: Playwright scripts successfully verify happy user flow paths.
- [ ] **Failsafe**: Confirm error bounds, try/catches, and rate-limiting gates are fully verified.

---

## 3. Deployment & Release Checklist
- [ ] **Config**: Staging/production environment variables documented in `.env.example`.
- [ ] **CI/CD**: GitHub Actions quality jobs passed successfully (lint, test, build).
- [ ] **Audit Verdict**: Consolidate code, UI aesthetics, and security check approvals.
- [ ] **Rollback**: Verify rollback triggers and container reversion scripts are tested.
