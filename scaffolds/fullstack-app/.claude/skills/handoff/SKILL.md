---
name: handoff
description: End-of-session doc sync so the next chat starts fully oriented - update PROGRESS, DECISIONS, and UI_UX from what happened this session, then run docs:check. Use when the user is wrapping up, says "save session" / "sebelum tutup" / "update the docs", or types /handoff.
---

# End-of-session handoff

The next chat has no memory of this one. Project state lives in the repo docs, not in
chat history - this command makes the docs catch up to the session before it closes.

## Steps

1. **Reconstruct what happened**: `git status --short`, `git diff --stat`, recent
   commits, plus what was decided in conversation.
2. **Sync the docs** (only the ones that actually changed domain):
   - `docs/engineering/PROGRESS.md` - mark what is now done, what is in progress, and
     anything discovered that should become a task. Keep entries pointer-based.
   - `docs/engineering/DECISIONS.md` - append an ADR for any real technical or product
     decision made this session. Skip trivia.
   - `docs/product/UI_UX.md` - record any product design change or deviation agreed on.
   - The domain doc of whatever changed (API.md for endpoints, DATABASE.md for schema).
   - `CHANGELOG.md` & root `package.json` - if this handoff concludes a weekly sprint or completed milestone, compile the updates, increment the version in the root `package.json`, and append a scan-friendly entry to `CHANGELOG.md` matching `docs/engineering/VERSIONING.md`. Avoid per-commit/per-push changes.
3. **Run the gates**: `pnpm docs:check`, and `pnpm run verify` if code changed.
4. **Flag the un-finished honestly**: anything half-done goes into PROGRESS.md as
   in-progress with enough detail to resume cold - never leave it only in chat.

## Done means

Report a short handoff summary: docs updated, gates status, and the one-line "next
session should start with X". Do not write session state anywhere except the docs -
no separate session files.
