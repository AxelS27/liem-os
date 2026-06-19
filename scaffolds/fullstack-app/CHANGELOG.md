# Changelog

All notable changes to this monorepo template will be documented in this file. The versioning scheme follows Semantic Versioning (`MAJOR.MINOR.PATCH`).

---

## [1.0.0] - 2026-06-15

### 🚀 Major Updates

- **Stable Release:** Finalized the core boilerplate architecture and agent workflows, ensuring compatibility across all default packages.

### ✨ Minor Updates

- **Interactive API Documentation:** Integrated interactive API docs in the server routing stack (`f3fc6aa`).
- **Tailwind & ESLint Upgrades:** Configured Tailwind CSS class sorting utility and established a unified root ESLint config (`f3fc6aa`, `eb44403`).
- **Global UX Components:** Added helper UX components to standard layouts to streamline page creation (`f3fc6aa`).

### 🛠️ Patch Log

- Improved dark mode outline button and border contrast (`f49e595`).
- Formatted all code files and cleaned up config file imports (`eb44403`).
- Documented Phase 2 features in the engineering specifications (`5c71b7a`).

---

## [0.9.0] - 2026-06-05

### ✨ Minor Updates

- **Security Agent Integration:** Added the `security-officer` agent and dedicated security documentation (`docs/engineering/SECURITY.md`) to audit schema migrations, validation, and secret isolation (`6e12086`).
- **Polished UI Animations:** Added a technical ticker component, loading state animations, and smooth scroll behaviors to footer links (`bb9abf1`).
- **Stripe Option:** Added Stripe integration details to the Payments Guide (`6f7dfa8`).

### 🛠️ Patch Log

- Reordered header social links and adjusted theme/language switcher typography sizes (`b1a32c2`).
- Relaxed design reviewer triggers on minor text changes (`b1a32c2`).

---

## [0.8.0] - 2026-05-25

### ✨ Minor Updates

- **Founder Advisor Flow (Planning v3):** Refactored the planning playbook to a 7-phase interactive strategy flow including business model validation, market segment scoping, and competitor gating (`daaa1c3`, `4e23ddb`).
- **Dynamic Q&A Hook:** Reworked the planning CLI to ask one question at a time dynamically instead of asking everything at once (`f477db2`, `666ebb7`).
- **Context-Aware Research Integration:** Integrated direct research execution tools into the planning skill to perform competitor analysis before defining the PRD (`269ba17`, `931ba66`).

### 🛠️ Patch Log

- Added default option highlights and fallback template selections in planning playbooks (`ad96209`, `e4af40e`).
- Mandated reading source documentation during the planning phase (`66178cc`).

---

## [0.7.0] - 2026-05-10

### ✨ Minor Updates

- **Planning Skill:** Initialized the `planning` skill and linked it to the `/init-product` flow (`ad7d77e`).
- **AI Tooling Guardrails:** Added rules and validations enforcing Rust Token Killer (`rtk`) and MarkItDown usage by AI agents to optimize context window efficiency (`15fe758`).

### 🛠️ Patch Log

- Added design and tech capability verification gates to the planning flow (`f16ea50`).
- Added automatic RTK and MarkItDown capability checks to `/init-product` (`c8da611`).
- Cleaned up agent instruction files by removing obsolete overengineering sections (`c028524`).

---

## [0.6.0] - 2026-04-20

### ✨ Minor Updates

- **Two-Tier Header Layout:** Split the main website header into a top utility tier (holding language switcher, theme toggle, and socials) and a main navigation tier (`fac67fe`).
- **Axel Entry Point:** Introduced `axel` chief of staff agent to route plain-text user instructions to specific sector subagents (`e174876`, `fbe583c`).
- **Sector Subagents & Commands:** Wired background subagents (`web-builder`, `api-builder`, `db-engineer`, `design-reviewer`) and commands (`/init-product`, `/new-feature`, `/ship-check`, `/handoff`) (`ffa22cf`, `e293ac2`).
- **Comprehensive Guides:** Created a developer user guide detailing commands, agent interactions, and workflow hooks (`52b2800`, `da5773b`).

### 🛠️ Patch Log

- Added visual theme controls, header social links, and softened the closing call-to-action (`f9481d6`, `b14b23f`).
- Instructed document checks to ignore false-positive placeholder indicators in code block examples (`e80620d`).
- Escalated the pre-compact git hook to trigger automatic documentation handoffs (`083400a`).

---

## [0.5.0] - 2026-03-15

### 🚀 Major Updates

- **Monorepo Initialization:** Created the initial workspace structure utilizing pnpm workspaces and Turborepo caching to orchestrate server, client, and shared packages (`7c73587`).
- **Modern Toolchain:** Configured Next.js App Router, Hono server, and Supabase CLI integration (`7c73587`).

### ✨ Minor Updates

- **Tailwind 4 & Next 16 Upgrade:** Upgraded core packages to Tailwind v4, Next.js v16, and the latest TypeScript compiler (`a4f9726`).
- **Reference Notes Feature:** Implemented a full-stack reference feature for notes (Supabase database table, Hono server API, Next.js client UI) to serve as a development reference (`6469ce1`).

### 🛠️ Patch Log

- Moved static copy into the dictionary system to support multi-language routing (`899fadb`).
- Aligned documentation layouts and template commands with monorepo import boundaries (`bf9d036`).
