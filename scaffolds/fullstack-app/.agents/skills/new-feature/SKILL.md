---
name: new-feature
description: Build one product feature slice end to end through the sector agents - scope from the docs, database to API to UI, gates included. Use when the user asks to build a feature on an initialized product, or types /new-feature.
---

# Build a feature slice

Orchestrate one feature through the sector agents. The main thread plans, delegates,
reviews reports, and keeps the docs current - it does not write the sector code itself.

If `docs/product/PRD.md` is still the blank template, stop and point the user to
`/init-product` first.

## Steps

1. **Scope.** Read `docs/engineering/PROGRESS.md` and `docs/product/FEATURES.md`. Confirm
   which feature this is and what the slice covers. If it is not in FEATURES.md, ask
   before inventing scope.
2. **Plan the slice** across sectors: data (tables/RLS), contracts + endpoints, UI. Mark
   the items as in-progress in `docs/engineering/PROGRESS.md`.
3. **Delegate in dependency order**, passing each agent a self-contained brief (they do
   not see this conversation):
   - `db-engineer` - schema, migrations, RLS, regenerated types (skip if no data change).
   - `api-builder` - Zod contracts in `packages/types`, routes, services, tests.
   - `web-builder` - screens and components on the starter foundation, copy in `en.json`.
4. **Gate.** After any UI change, run `design-reviewer` and require PASS. Then run
   `pnpm run verify` at the root.
5. **Sync.** Mark the items done in `docs/engineering/PROGRESS.md`, note how the feature
   connects to others, and append to `docs/engineering/DECISIONS.md` if a real
   architectural choice was made.

## Done means

Verify is green, the design-reviewer verdict is PASS (if UI changed), PROGRESS.md
reflects reality, and the report to the user lists what shipped per sector.
