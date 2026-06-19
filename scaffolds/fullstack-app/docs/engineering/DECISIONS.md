# Decisions (ADR)

> Append-only. Log only **major** technical/product decisions. Newest at the bottom.
> Format below. Never delete an entry - mark it `Superseded` instead.

---

### Template

```
## ADR-NNN: <Title>
- Decision:   <what was chosen>
- Reason:     <why>
- Rejected:   <alternatives considered and why not>
- Status:     Accepted | Superseded by ADR-XXX | Deprecated
- Date:       YYYY-MM-DD
```

---

## ADR-001: Monorepo with pnpm + Turborepo

- Decision: Single repo, pnpm workspaces, Turborepo for task orchestration.
- Reason: Shared types/utils/ui across web + server without publishing packages; one install, cached builds.
- Rejected: Polyrepo (sync overhead); npm/yarn workspaces (slower, weaker hoisting); Nx (heavier than needed).
- Status: Accepted
- Date: 2026-01-01

## ADR-002: AGENTS.md as single AI source of truth

- Decision: `AGENTS.md` holds all agent rules; `CLAUDE.md` redirects to it.
- Reason: Avoids duplicated/conflicting instructions across tools; one file to maintain.
- Rejected: Separate per-tool instruction files (drift risk).
- Status: Accepted
- Date: 2026-01-01

## ADR-003: Frontend - Next.js (App Router) + React + Tailwind + shadcn/ui

- Decision: Next.js App Router on React for `apps/web`; Tailwind CSS for styling; shadcn/ui as the component layer (lives in `packages/ui`).
- Reason: RSC/SSR out of the box, huge ecosystem; Tailwind + shadcn give an ownable, copy-in design system with no runtime lock-in.
- Rejected: Vite SPA (no SSR/routing batteries); component libs like MUI/Chakra (heavier, less ownable than shadcn).
- Status: Accepted
- Date: 2026-05-29

## ADR-004: Backend - Hono on Node.js + Zod

- Decision: Hono for `apps/server`; Zod for all input validation.
- Reason: Tiny, fast, Web-standard API; runs on Node now and ports to edge/serverless later. Zod gives runtime validation + inferred types from one schema.
- Rejected: Express (dated, no types, heavier); Fastify (fine, but heavier than needed and less edge-portable).
- Status: Accepted
- Date: 2026-05-29

## ADR-005: Supabase as the data platform (Postgres + Auth + Storage)

- Decision: Supabase for database (PostgreSQL), authentication, and file storage.
- Reason: One managed platform covers DB + auth + storage with RLS; standard Postgres underneath (no proprietary query lock-in); generous local/dev story.
- Rejected: Raw Postgres + roll-your-own auth (slow); Firebase (NoSQL, vendor lock-in); separate auth provider (more moving parts).
- Status: Accepted
- Date: 2026-05-29

## ADR-006: Shared contracts as Zod schemas in packages/types

- Decision: Request/response contracts are Zod schemas in `packages/types`; TS types are inferred from them. Server validates with the schema; client infers types from the same schema.
- Reason: Single source of truth for shape + validation; frontend and backend physically cannot drift.
- Rejected: Hand-written TS interfaces (no runtime check, drift); OpenAPI codegen (heavier toolchain for this size).
- Status: Accepted
- Date: 2026-05-29

## ADR-007: Deployment - Vercel, Docker optional

- Decision: Vercel is the default deploy target (web certainly; server where it fits). Docker provided only when a target needs it.
- Reason: Zero-config Next.js deploys, preview envs, edge network. Docker kept optional to avoid forcing container ops on every project.
- Rejected: Mandatory Docker/k8s for all projects (overkill for most).
- Status: Accepted
- Date: 2026-05-29

## ADR-008: Large AI models via Hugging Face (conditional)

- Decision: When a project involves large AI models, serve them through Hugging Face (Inference API or Inference Endpoints), called from `apps/server`. Models are never bundled into the app or run in the browser.
- Reason: Offloads GPU/serving ops; keeps large weights out of the Node process and the client bundle; swappable model hosting.
- Rejected: Self-hosted GPU inference (ops burden); shipping models client-side (size, security).
- Status: Accepted (applies only to AI-model projects)
- Date: 2026-05-29

## ADR-009: Enforcement layer - strict TS base + ESLint flat config with import boundaries

- Decision: `packages/config` ships a strict TypeScript base and a flat ESLint config that bans importing apps and restricts feature imports to their public index. CI runs lint + typecheck + test.
- Reason: Architecture rules that aren't enforced drift over long AI sessions; making them executable (lint/type errors + CI) keeps agents on the rails.
- Rejected: Docs-only conventions (honor-system, drifts); heavier boundary tooling like Nx tags (more than needed here).
- Status: Accepted
- Date: 2026-05-29

## ADR-010: Internationalization via centralized locale dictionaries

- Decision: All user-facing text lives in per-language JSON dictionaries under `apps/web/src/i18n/locales` (`en.json`, `id.json`, ...). English is the default and source of truth. The active locale lives in the URL (`app/[lang]/...`); server components read text via `getDictionary(locale)`, typed from `en.json`.
- Reason: Centralizes copy so adding a language is a one-file change; URL-based locale is shareable and SEO-friendly; typing from the default catches missing or renamed keys at compile time. No runtime i18n dependency needed at this scope.
- Rejected: Hardcoded strings in components (drift, blocks a second language); a full i18n library such as next-intl or react-intl (more than needed now; adopt later if pluralization/formatting demands it).
- Status: Accepted
- Date: 2026-05-29

## ADR-011: Hugging Face handoff folder for custom models

- Decision: Root `huggingface/` is the optional handoff workspace for model cards, Hugging Face Space files, and upload-ready custom model artifacts. Model weights/checkpoints live under `huggingface/models/` or `huggingface/artifacts/`, which are ignored by normal GitHub pushes.
- Reason: Custom model work needs a clear place that is separate from `apps/web`, `apps/server`, and TypeScript packages, while still making Hugging Face uploads easy from the project folder.
- Rejected: `apps/model` (implies a deployable app inside the pnpm workspace); `packages/model` (packages are shared TypeScript code); committing model files to the main GitHub repo (large and inappropriate without a Hugging Face/Git LFS flow).
- Status: Accepted
- Date: 2026-05-29

## ADR-012: Payments via Midtrans

- Decision: When a project takes payments, integrate Midtrans (Snap) from `apps/server`. The server creates the transaction with the Midtrans **server key** and returns a Snap token; the browser opens Snap with the public **client key**. Payment status is confirmed by a server **webhook (HTTP notification)** that is verified by signature hash, not the Bearer token.
- Reason: Midtrans is a standard Indonesian gateway (cards, bank transfer, e-wallets, QRIS) with a hosted Snap UI, so no card data touches our servers. Server-side token creation keeps the secret key off the client; the signature check makes the callback trustworthy and the source of truth for order status.
- Rejected: Stripe (weak local payment-method coverage for Indonesia); client-side-only charging (exposes the secret key, no reliable confirmation); building our own gateway (PCI scope, not worth it).
- Status: Accepted (applies only to projects that take payments)
- Date: 2026-05-29

## ADR-013: Auth surface - Supabase email/password + OAuth (Google, GitHub) + password reset + avatars in Storage

- Decision: Build the standard auth surface on Supabase Auth (see ADR-005): email/password with email **password reset**, plus **OAuth** sign-in with **Google and GitHub**. Profile pictures upload to a Supabase **Storage** bucket (e.g. `avatars`) under a per-user path with RLS; the resulting public URL is stored on the user's profile row.
- Reason: These are baseline expectations for a real product and Supabase covers all of them natively, so no extra auth service or storage provider is needed. Providers, secrets, and redirect URLs are configured in the Supabase dashboard; the app just calls the Supabase SDK.
- Rejected: A separate auth provider such as Auth0/Clerk (more moving parts; ADR-005 already chose Supabase); storing avatars as base64 in Postgres or on a third-party CDN (Storage already exists and supports RLS).
- Status: Accepted
- Date: 2026-05-29

## ADR-014: Frontend pre-wired - shadcn/ui configured, token-mapped Tailwind, lint-enforced design tells

- Decision: Ship `apps/web` with shadcn/ui already wired instead of leaving each product to `shadcn init`. `components.json` points components into `packages/ui`; `apps/web/tailwind.config.ts` maps the `globals.css` tokens to Tailwind (`darkMode: 'class'`) and defines the house type scale; `packages/ui` ships `cn()` and one retuned reference `Button`. ESLint (`packages/config/eslint/next`) blocks the most common generic-AI class tells (viewport-height section fillers, raw palette classes, hex in `className`). A `.claude/skills/shadcn-ui` skill drives the customization workflow and the FRONTEND.md render-and-review pass.
- Reason: The repeated failure was AI-built UIs reading as "generic shadcn default." Root cause: the template made every product re-init shadcn, and defaults (neutral theme, untouched components) entered at that step. Wiring the deterministic parts once removes the default path; lint makes the worst tells unshippable; the skill turns the passive FRONTEND.md checklist into an executed procedure. Tailwind config lives in `apps/web` (not a shared preset) because there is a single frontend consumer (Anti-Overengineering).
- Rejected: Docs-only guidance (the FRONTEND.md rules were already being ignored); a shared `packages/config` Tailwind preset (premature abstraction for one consumer); hardcoding a single brand palette into the template (creates a uniform "template look" across products - the skill forces a per-product palette instead).
- Status: Accepted
- Date: 2026-05-31

## ADR-015: Product-specific UI/UX brief in docs/product/UI_UX.md

- Decision: Add `docs/product/UI_UX.md` as the product-specific design source of truth. `docs/engineering/FRONTEND.md` remains the universal frontend rulebook; `docs/product/UI_UX.md` captures the user's design direction, selected references, visual system, navigation model, page UX map, copy tone, and product-specific UI non-goals. `docs/engineering/PROGRESS.md` must synthesize both files into implementation tasks.
- Reason: The template needs to support different products without polluting universal frontend rules with one project's taste. A separate UI/UX brief keeps each product's design direction explicit and reusable across long agent sessions while still making `FRONTEND.md` the higher-priority guardrail.
- Rejected: Putting product design direction in `FRONTEND.md` (would make the template mutate per product); putting it only in `PROGRESS.md` (turns the checklist into a design spec); relying only on chat context (lost across sessions).
- Status: Accepted
- Date: 2026-05-31

## ADR-016: Domain docs for backend, database, and payments

- Decision: Add focused domain docs: `docs/engineering/BACKEND.md`, `docs/engineering/DATABASE.md`, and `docs/engineering/PAYMENTS.md`. Keep `docs/engineering/ARCHITECTURE.md` as the boundary overview and `docs/engineering/API.md` as the contract reference. Agents read domain docs only when the task touches that domain, and `docs/engineering/PROGRESS.md` synthesizes applicable domain tasks into the active checklist.
- Reason: The template needs more depth than a single architecture doc can hold, especially for backend validation, Supabase/RLS, and payment/marketplace money flow. Splitting these concerns keeps context small during normal work while making the important rules discoverable when needed.
- Rejected: One giant architecture/spec doc (too much to read every turn); putting backend/database/payment rules only in AGENTS.md (too long for daily workflow); making every domain doc mandatory for every task (wastes context and encourages stale reading).
- Status: Accepted
- Date: 2026-05-31

## ADR-017: Stack refresh - Tailwind v4 (CSS-first), Next 16, Zod 4, TypeScript 6, ESLint 10, Vitest 4, pnpm 11, Node 24

- Decision: Track current majors across the toolchain. Tailwind v4 replaces `tailwind.config.ts` with CSS-first config: `globals.css` now holds `@import 'tailwindcss'`, a `@source` for `packages/ui`, `:root` tokens as full color values, a `@theme inline` utility mapping, and the house type scale in `@theme`. Next 16 (Turbopack dev/build), Zod 4, TypeScript 6 (`baseUrl` removed, explicit `rootDir` for emit), ESLint 10, Vitest 4 (Vite is now an explicit devDependency), pnpm 11 (`packageManager` field; build-script approvals via `allowBuilds` in `pnpm-workspace.yaml`), Node 24 LTS (`.nvmrc`, `engines`). Because pnpm 11 ships a built-in `pnpm verify` command, the repo's verify script must be invoked as `pnpm run verify`.
- Reason: A starter template that pins last-generation majors bakes outdated patterns into every product built from it; the v3-style token wiring in particular would have taught agents a config-file pattern Tailwind has abandoned. Refreshing once at the template level is cheaper than migrating every spawned product later.
- Rejected: Staying on Tailwind v3 / Next 15 (teaches dead patterns); partial bumps (mixed-generation toolchain causes peer conflicts, e.g. Vitest 4 requires Vite 6+).
- Status: Accepted. Supersedes the `tailwind.config.ts` mechanics described in ADR-014 (the rest of ADR-014 - pre-wired shadcn, lint-enforced tells, the skill - stands).
- Date: 2026-06-11

## ADR-018: Sector subagents + UI rules hook on top of the docs

- Decision: Add four Claude Code subagents in `.claude/agents/`: `web-builder`, `api-builder`, and `db-engineer` author their sectors (each loads its sector docs into a fresh context before working and runs its sector gates before reporting), and `design-reviewer` is a read-only gate that runs the DESIGN_DNA double-check and returns PASS/FAIL - UI work is not done until it passes. A `PostToolUse` hook (`scripts/hooks/ui-rules-reminder.mjs`, wired in `.claude/settings.json`) injects the critical UI rules once per session when a file under `apps/web/src` or `packages/ui/src` is edited. The docs stay the law; agents and hooks are the delivery and enforcement layer.
- Reason: Rule compliance through docs alone is pull-based and decays over long sessions - models stop opening DESIGN_DNA.md and ship rule-violating UI. Subagents fix the decay (rules live in a fresh system prompt every invocation) and the hook fixes the bypass path (inline edits by the main thread get the rules pushed into context mechanically). This works here specifically because the template is documentation-first: a fresh-context agent loses nothing, since briefs and state live in `docs/`, not in the chat. One owner per sector avoids two agents fighting over the same files (no separate "ui/ux agent" - design rules are the web-builder's input and the design-reviewer's checklist).
- Rejected: Replacing docs with agent prompts (loses the cross-tool source of truth; Codex/Cursor don't read `.claude/agents/`); a large agent roster ecc-style (dilutes triggering, most roles are theater without enforcement); a router/CEO orchestration layer forge-rules-style (manual simulation of what Claude Code already does natively); writer-agents without the reviewer gate (agents drift too - the gate is what makes violations un-shippable).
- Status: Accepted
- Date: 2026-06-11

## ADR-019: Command layer and session hooks - the workflow surface

- Decision: Add four pointer-based commands as skills (`/init-product`, `/new-feature`, `/ship-check`, `/handoff`) and two session hooks (`SessionStart` injects AGENTS.md pointer + PROGRESS.md state into every new session; `PreCompact` carries the rules and pending gates through compaction). Commands execute the existing docs and checklists - they never duplicate spec content. Session state lives exclusively in the repo docs (PROGRESS, DECISIONS, UI_UX); `/handoff` syncs the docs at session end and `SessionStart` reads them back, replacing the manual CONTINUE.md kickoff paste.
- Reason: The template's workflows (init, feature slice, launch audit, session handoff) existed as prose guides that users had to find and paste. Wrapping each in one command makes the workflow surface discoverable and consistent, and the two hooks close the remaining context gaps: fresh sessions start oriented automatically, and compaction - the main trigger for rule decay mid-session - no longer drops the laws or the pending gates.
- Rejected: Separate session-state files ecc-style (`~/.claude/session-data/`) - state outside the repo splits the source of truth that PROGRESS.md already owns; importing ecc's command catalog wholesale (60+ commands for stacks this repo doesn't use dilutes triggering); checkpoint/quality-gate commands (git and `pnpm run verify` already cover them); forge-rules' router and intent classifier (manual reimplementation of native agent routing).
- Status: Accepted
- Date: 2026-06-11

## ADR-020: Axel - a single conversational entry point

- Decision: Add `/axel`, a chief-of-staff skill that rides the main thread: it translates a plain-language instruction ("buat frontend dulu", "lanjutin", "siap rilis?") into the right workflow, delegates to the sector agents, and holds the gates. It is a skill rather than a subagent because subagents cannot spawn other subagents - an @axel subagent could never orchestrate; on the main thread it keeps full context and can delegate to everyone.
- Reason: Real usage showed the system's UX cost: four agents, five commands, and twenty docs require routing knowledge the user should not need. One name that knows the whole system removes that burden without weakening anything - Axel uses the same flows and the same gates, so casual phrasing does not lower the bar.
- Rejected: An @axel subagent (cannot delegate - mechanical dead end); making Axel bypass gates for speed (the gates are the product); replacing the explicit commands (power users and docs still need precise entry points).
- Status: Accepted
- Date: 2026-06-11

## ADR-021: Storefront lessons from the first product - soft CTA default, header placeholder controls, layout integrity rules

- Decision: Codify the first real product review (MarketplaceX) into the template. (1) The closing CTA band defaults to a soft contained surface (`bg-secondary` + border); near-black `bg-foreground` bands are opt-in via `docs/product/UI_UX.md` only (the Button `inverse` variants remain for that case). (2) Every header ships placeholder language and theme controls (`components/shared/header-controls.tsx`, Liem Center style: globe + label dropdown, sun/moon + label) - placeholders until real i18n routing or dark mode is wired, restyled per product, never removed. (3) New written rules with design-reviewer checks: auth controls are state-exclusive (never Sign in + Account together), labels never overflow their container, grids never end in an orphan empty slot, no invented stats strips. (4) The ecommerce playbook gains storefront hard rules: products above the fold, one dominant search, one-message promo panels, light category chips, a semantic deal accent, purposeful utility-bar clustering.
- Reason: The first product built from the template surfaced these as real failure modes, not theory: a jarring black band on a light page, duplicate auth/seller links, fake metrics, overflowing tile labels, an unbalanced category grid, and a storefront that sold the concept instead of products. Fixing them at the template level (starter code + rules + reviewer checks) prevents every future product from repeating them.
- Rejected: Fixing only the product repo (the template would keep teaching the mistakes); wiring real next-themes/i18n switching now (the controls are placeholders by design - ship one theme and one language first, per FRONTEND.md); banning dark CTA bands outright (some brands genuinely want one - opt-in keeps the option without making it a default).
- Status: Accepted
- Date: 2026-06-12

## ADR-022: Two-tier header - utility tier isolates locale-variable controls

- Decision: The foundation header becomes two tiers, Shopee/Tokopedia anatomy. A slim utility tier on top (`bg-secondary/30`, text-xs) holds the universal controls every product keeps: support/help link, the language and theme switchers, and the auth entry (Sign in moved up from the primary nav); per-product socials, seller, or download links also belong there. The main tier holds brand, primary routes, and the one CTA - nothing with a locale-dependent width. design-reviewer fails utility controls placed inline in the primary nav.
- Reason: Locale labels are variable-width ("Bahasa Indonesia" is roughly twice "English"), so any switcher sitting inline with the primary nav reflows every link beside it on language change. The utility tier contains that reflow in a strip users don't visually track, keeping the primary nav stable. It also gives every future product a permanent, predictable home for universal chrome instead of each build inventing one.
- Rejected: Fixed-width slots for the switchers in the main nav (wastes space in one locale, truncates in another); icon-only controls to dodge the width problem (hurts discoverability, contradicts the icon+label control style); keeping single-tier and accepting the reflow (visible jank on a core interaction).
- Status: Accepted
- Date: 2026-06-12

## ADR-023: Database querying via Drizzle ORM

- Decision: Use Drizzle ORM as the primary TypeScript SQL query builder and schema manager for Supabase PostgreSQL in `apps/server`.
- Reason: Provides full compile-time type safety and auto-complete for SQL queries without runtime overhead; schema is defined in TypeScript (`schema.ts`) and kept in sync with Supabase migrations.
- Rejected: Raw postgres query builder (no auto-completion or compile-time type checking); Prisma ORM (heavier, requires a custom engine, doesn't match clean edge-ready Node.js targets as cleanly as Drizzle).
- Status: Accepted
- Date: 2026-06-16
