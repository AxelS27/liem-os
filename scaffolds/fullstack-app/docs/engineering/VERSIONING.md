# Versioning and Changelog Guidelines

This document establishes the versioning system and changelog rules for the monorepo template and all products built from it. The goal is to provide a clean, easy-to-read history of updates for developers and stakeholders without cluttering it with low-level implementation details.

---

## 1. Simplified Semantic Versioning

Both the template and inheriting products use Semantic Versioning (SemVer) format: **`MAJOR.MINOR.PATCH`** (e.g., `1.2.4`).

### 🚀 Major (`MAJOR.0.0`)

Triggered by core structural, breaking, or massive architectural shifts.

- **For the Template:**
  - Major framework or runtime upgrades (e.g., Next.js major upgrades, Node version bumps, Turborepo major releases).
  - Major directory re-organizations or package splits that alter the monorepo boundary.
  - Breaking changes to the core DB schema or API contracts that require manual database migration.
- **For Inheriting Products:**
  - Full product rebrands or core flow overrides (e.g., rebuilding the checkout flow, changing the primary auth model).
  - Breaking data migrations that require system downtime or customer coordination.

### ✨ Minor (`X.MINOR.0`)

Triggered by new features, additions, or backward-compatible enhancements.

- **For the Template:**
  - Adding a new shared package in `packages/*` or helper tools.
  - Adding non-breaking database models or new seed scripts.
  - Introducing new UI components, layouts, or starter routes.
- **For Inheriting Products:**
  - Shipping a new product module or feature slice (e.g., adding email notifications, product analytics, a new admin panel page).
  - Introducing a new integration or payment flow.

### 🛠️ Patch (`X.Y.PATCH`)

Triggered by minor fixes, adjustments, or maintenance.

- **For both Template & Products:**
  - Bug fixes, linting cleanups, or dependency security bumps.
  - Minor styling/CSS tweaks and copy adjustments.
  - Documentation updates, typo fixes, and code comment refactoring.

---

## 2. Changelog Structure Rules

The central history of updates is recorded in `CHANGELOG.md` in the repository root. Every version release must append an entry at the top of the file following these rules:

1. **Title:** Use format `## [Version] - YYYY-MM-DD` (e.g., `## [1.0.0] - 2026-06-15`).
2. **Simplified, Scan-friendly Bullet Points:** Do not list files changed or function names. Focus on the value and functional impact.
3. **Categorization:** Group changes under these three exact headings:
   - `### 🚀 Major Updates`
   - `### ✨ Minor Updates`
   - `### 🛠️ Patch Log`
4. **Clean & Concise:** Limit bullet points to one line where possible. Keep it readable for developers and product leads alike.

### Changelog Example:

```markdown
## [1.1.0] - 2026-07-20

### 🚀 Major Updates

- Upgraded Next.js from v15 to v16 to support React 19 concurrent features.

### ✨ Minor Updates

- Added a new `@repo/analytics` package for standardized client/server tracking.
- Added support for dark mode preference detection in the global CSS.

### 🛠️ Patch Log

- Fixed an alignment bug on the mobile navigation bar.
- Updated the database schema documentation for the profiles table.
```

---

## 3. Weekly Release Cycle & Batching Cadence

To avoid developer overhead and maintain a readable history, **do not update the changelog or increment versions on every single commit or git push.** Instead, batch updates according to weekly iterations or completed milestones:

### Weekly Cadence Model:

- **Weekly Minor Bumps (`0.x.0`):** At the end of each weekly iteration (sprint), compile all new features, tools, and enhancements completed during the week and release them as a new minor version (e.g., Week 1 = `v0.1.0`, Week 2 = `v0.2.0`).
- **Daily / Mid-Week Patches (`0.x.y`):** Increment the patch number for intermediate builds, critical hotfixes, or daily validation deployments that must go live before the weekly cycle is complete (e.g., `v0.1.1`, `v0.1.2`).
- **Batch Update triggers:** Updates to `CHANGELOG.md` and version increments in `package.json` should only occur during:
  1. A weekly cycle wrap-up or sprint demo.
  2. The final validation stage of a major feature slice (`/ship-check`).
  3. The end-of-session handoff (`/handoff`) that completes a planned milestone.

---

## 4. Versioning Workflow for Inheriting Products

When starting a new product from this template, the team must adopt this versioning system:

1. **Initialize Product Version:**
   - In the newly cloned repository, update the root `package.json` version field to your starting version (usually `0.1.0` or `1.0.0`).
   - Clean out the template's changelog in `CHANGELOG.md` and start with a fresh entry for your product initialization.

2. **Develop and Release Cycle:**
   - Develop features on dedicated branches without changing the version or changelog.
   - At the end of the week or milestone, compile the completed tasks into a single changelog block, determine the new version (Major, Minor, or Patch), and update both the root `package.json` and `CHANGELOG.md` in a single release commit.
   - Update workspace package versions in `apps/*/package.json` and `packages/*/package.json` to keep them aligned, or let them stay at `0.0.0` if using the root version as the single source of truth for the entire deployable project.
