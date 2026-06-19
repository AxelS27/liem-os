---
name: ship-check
description: Run the launch-readiness audit before going live - code gates, build, design review, and the full checklist, ending in a GO/NO-GO verdict. Use when the user asks if the product is ready to ship/deploy/launch, or types /ship-check.
---

# Launch readiness audit

Audit, do not fix. Findings come back as a list; fixes happen after the user decides.

## Steps

1. **Mechanical gates first** (run them, report real output):
   - `pnpm run verify` (lint + typecheck + tests)
   - `pnpm build`
   - `pnpm docs:check` - in a real product, placeholder warnings are failures: the docs
     were never filled.
2. **Design gate.** Spawn `design-reviewer` for the final UI verdict.
3. **Checklist walk.** Open `docs/checklists/launch-readiness.md` and work through every
   section. Verify code-checkable items yourself (grep/read); list the rest -
   deployment config, env vars on the host, Supabase production settings, payment keys -
   as explicit questions for the user rather than assuming them done.
4. **Sweep for leftovers**: starter placeholder copy ("Liem" brand, "goes here" stubs),
   the notes reference feature still present, `console.log` in product code, secrets in
   the repo, `.env` committed.

## Verdict (always end with this)

```
SHIP CHECK: GO | NO-GO
Blockers:   (each with file:line or checklist item)
Warnings:   (won't block, should be tracked in PROGRESS.md)
Unverified: (items only the user/host can confirm)
```

Be strict: an unverified blocker is NO-GO, not "probably fine".
