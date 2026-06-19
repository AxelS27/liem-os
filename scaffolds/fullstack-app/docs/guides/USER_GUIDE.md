# User Guide - Commands, Agents, and Skills

This page is for **you**, the human driving the template. Every other doc in this repo is
written for the AI; this one is the cheat sheet for what you can type, who does the work,
and what runs automatically. Everything here works in Claude Code; other tools fall back
to the manual flows in `INIT.md` and `CONTINUE.md`.

## The short version: just talk to Axel

You don't have to memorize anything below. `/axel <what you want>` - or simply addressing
it ("axel, buat frontend dulu") - hands your instruction to the repo's chief of staff: it
reads PROGRESS, translates your intent to the right workflow, delegates to the right
agents, and holds the gates. The commands and agents below are what Axel uses under the
hood, listed so you know what's happening and can call them directly when you want
precision.

```
/axel buat frontend dulu        → UI-first slices with mock data, reviewer-gated
/axel lanjutin                  → next item from PROGRESS.md
/axel siap rilis ga?            → ship-check audit
/axel udahan, save dulu         → handoff doc sync
```

Axel is also the project's support desk - questions get answers (from the docs and the
actual repo state), not unrequested work:

```
/axel progres sampai mana?       → status summary from PROGRESS.md + recent commits
/axel kenapa pakai Supabase?     → the ADR behind the decision
/axel cara nambah bahasa gimana? → the relevant doc, explained
/axel ada masalah ga di repo?    → runs the cheap checks, reports honestly
```

## Commands - what you type

These are slash commands. Type them in chat, optionally with context after them.

| Command         | What it does                                                                                                                                    | When you use it                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `/research`     | Perform evidence-based product/market research & compile a structured report                                                                    | Before planning/building, to search for facts and validate market demand     |
| `/planning`     | Interactive Q&A (interview) to define product scope/design, then auto-triggers `/init-product` upon approval                                    | When starting a new project from scratch and you want help defining it       |
| `/init-product` | Turns your product brief into filled docs (PRD, FEATURES, UI_UX, domain docs, PROGRESS checklist), then **stops for your review** - no code yet | Once, at the start of a new product. Describe the product first, then run it |
| `/new-feature`  | Builds one feature end to end: schema → API → UI, delegated through the sector agents, with the gates included                                  | Every time you want the next feature built                                   |
| `/ship-check`   | Full launch audit: verify, build, design review, the launch-readiness checklist - ends in a **GO / NO-GO** verdict                              | Before deploying or calling the product launch-ready                         |
| `/handoff`      | Syncs PROGRESS, DECISIONS, and UI_UX with what happened this session, runs `docs:check`                                                         | Before closing a chat, so the next chat picks up exactly where you left off  |
| `/update`       | Updates the template docs (excluding project docs) and ecosystem config files/tools from the template upstream                                  | When you want to pull the latest template updates and sync package tools     |

You do not have to use commands - normal conversation works and routes to the same agents.
The commands just guarantee the full flow runs instead of a shortcut.

## Agents - who does the work

You can mention them by name ("use web-builder to...") but normally you don't have to:
the main assistant delegates to them automatically based on what you ask.

| Agent              | Owns                                                    | What it guarantees                                                                                                            |
| ------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `web-builder`      | `apps/web`, `packages/ui` - screens, styling, copy      | Reads DESIGN_DNA + UI_UX before working; builds on the starter foundation; runs the design double-check before reporting done |
| `api-builder`      | `apps/server`, `packages/types` - endpoints, contracts  | Follows the notes reference pattern: Zod contract first, thin routes, envelopes, tests                                        |
| `db-engineer`      | `supabase/` - schema, migrations, RLS, types            | Every change is a migration, RLS on every table, types regenerated, DATABASE.md catalog updated                               |
| `design-reviewer`  | Nothing - audit only                                    | Independent PASS/FAIL verdict on UI changes against the design rules, with file:line for every failure                        |
| `security-officer` | `docs/engineering/SECURITY.md`, codebase security audit | Independent PASS/FAIL verdict on security checklist (RLS policies, API Zod validation, secret isolation, webhook signatures)  |

The rule that protects you: **UI work does not count as done until `design-reviewer` says
PASS.** If the assistant reports UI work finished without a reviewer verdict, ask for it.

## Skills - playbooks that load themselves

You rarely invoke these directly; they trigger automatically when the work matches. Listed
so you know they exist:

| Skill                                   | Loads when                                          | Carries                                                                                  |
| --------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `shadcn-ui`                             | Building or restyling UI, adding shadcn components  | The customization discipline: palette first, retune every component, never ship defaults |
| `ui-audit`                              | A thorough multi-axis UI quality check is requested | The audit checklist beyond the standard double-check                                     |
| The four commands above are also skills | Typed as `/command` or when the request matches     | The workflow steps                                                                       |

Skills live in `.claude/skills/` with byte-identical mirrors in `.agents/skills/` for
other tools; `pnpm docs:check` fails if the copies drift.

## Hooks - what runs without you asking

| Hook              | Fires when                                                                 | Effect                                                                                                                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SessionStart`    | Every new chat                                                             | Injects the project state (AGENTS.md pointer + PROGRESS summary) so you never paste a kickoff prompt                                                                                                                                                                               |
| `PreCompact`      | The conversation is about to be summarized                                 | Preserves the rules and pending gates so long sessions don't "forget" the design system. When the compaction is **automatic** (context nearly exhausted), it also orders an immediate `/handoff` doc sync before any work resumes - so a dying session saves its state to the docs |
| UI rules reminder | A file in `apps/web/src` or `packages/ui/src` is edited (once per session) | Pushes the critical UI rules into context mechanically                                                                                                                                                                                                                             |

Wired in `.claude/settings.json`; scripts in `scripts/hooks/`.

## MCP Tools & Real-Time Context

This template is pre-configured to recommend and utilize **Context7**, a real-time documentation retrieval MCP server developed by Upstash.

- **Why use it:** AI assistants rely on static training data. Context7 fetches live, version-accurate documentation for libraries (e.g., Next.js, Supabase, Hono, React) during the chat to prevent outdated code and hallucinations.
- **How to configure it:** Follow the instructions in [CONTEXT7.md](./CONTEXT7.md) (or run `npx ctx7 setup` in your terminal).
- **How to trigger it:** Add `use context7` to your prompt when asking about external libraries or APIs.

## A typical product, start to finish

```
1. Copy the template, pnpm install, fill .env
2. Describe your product in chat  →  /init-product
3. Review the filled docs, correct anything wrong
4. /new-feature  (repeat per feature; PROGRESS.md tracks the map)
5. /ship-check   →  fix blockers until GO
6. /handoff at the end of every session
```

## What is enforced vs. what is on you

Enforced by machines (cannot be skipped): lint blocks generic-AI styling patterns,
`pnpm run verify` gates lint/typecheck/tests, `pnpm docs:check` gates the doc system and
skill mirrors, CI runs all of it.

On you: reviewing what `/init-product` wrote before building, judging the design taste
the reviewer can't (does it _feel_ right for this product), and deciding GO on a
ship-check that has unverified items only you can confirm (hosting, env vars, payment
keys).
