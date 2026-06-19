# DECISIONS.md — Liem OS ADR Log

This is the locked append-only Architecture Decision Record (ADR) log for Liem OS.

## Decision Log

| # | Decision | Rationale | Status | Date |
|---|---|---|---|---|
| 1 | 3-layer architecture (A core / B templates / C UI) | User wants "super overpower" but layered so we build depth before breadth | APPROVED | 2026-06-19 |
| 2 | Build Layer A first, others in phases | Avoids Ruflo's breadth-without-depth trap | APPROVED | 2026-06-19 |
| 3 | Tight & deep (not broad from day one) | Liem Monorepo stays sharp this way; explicit rejection of ECC bloat | APPROVED | 2026-06-19 |
| 4 | Approach C: hybrid domain spine + skill power-ups | Only option where each source system contributes its genuine strength | APPROVED | 2026-06-19 |
| 5 | Cover all 5 domains in v1 (coding + research + writing + business + ops) | User will use all of them; "tight" means tight *within* each domain | APPROVED | 2026-06-19 |
| 6 | Single `coder` agent + language rule packs (not per-language agents) | Consistent with tight & deep; depth lives in rules, not agent count | APPROVED | 2026-06-19 |
| 7 | Iron Laws generalized ("output renders input" not "UI renders data") | Lets one law set serve every domain | APPROVED | 2026-06-19 |
| 8 | Keep the anti-fabrication clause | Credibility safeguard; the anti-Ruflo insurance | APPROVED | 2026-06-19 |
| 9 | Tooling is RECOMMENDED, not hard-gated | Fixes Liem Monorepo's onboarding brick + security hole | APPROVED | 2026-06-19 |
| 10 | `axel` as the router name | Carried over from Liem Monorepo; user approved | APPROVED | 2026-06-19 |
| 11 | Liem OS is standalone — ECC is dev environment only (zero code dependency) | Fork/strip creates maintenance hostage; standalone means we own every line. We study ECC (and all sources) for patterns, not code. ECC is the workshop (like VS Code), Liem OS is the product. | APPROVED | 2026-06-19 |
| 12 | MCP Server Integration (`liem-os-mcp`) | Exposes scaffolding, routing, and checking tools directly to editor hosts, eliminating platform-specific API limitations. | APPROVED | 2026-06-19 |
| 13 | Consolidated Auditor | Merges Code, Design, and Security reviewers into a single parallel checker (`auditor.md`) to bypass context-switching latency. | APPROVED | 2026-06-19 |
| 14 | Deterministic Routing for Axel | Reduces "thinking" tokens and routing latency to satisfy Iron Law #4 (feedback within 100ms). | APPROVED | 2026-06-19 |
| 15 | Graceful Hook Degradation | Ensures system rules remain active in editor environments (Cursor, Gemini) that lack native lifecycle execution events by actively injecting context metrics into tool output. | APPROVED | 2026-06-19 |
| 16 | Anti-Deadlock Review Limits | Prevents infinite agent loops by having the MCP server (`liem_os__verify`) statefully track and cap auto-remediation at 2 attempts using a local state file, resetting automatically when the target file's mtime changes or a new session starts. | APPROVED | 2026-06-19 |
| 17 | Platform-Specific Wrappers Compiler | Compiles AGENTS.md dynamically, injecting model-specific formatting (XML tags for Claude, strict markdown for Cursor) to optimize parsing by different LLMs. | APPROVED | 2026-06-19 |
| 18 | Memory Staging and Consolidation | Prevents memory pollution, stale patterns, and hallucinated learning by staging instinct extractions in `scratch/` and requiring user validation to promote to `approved/`. | APPROVED | 2026-06-19 |
| 19 | Rust & `uv` Tooling Priority | Minimizes tool execution latency and environment setup friction by using Rust for performance-critical helper tools and `uv` to manage Python packages. | APPROVED | 2026-06-19 |
| 20 | Agent Council and 12-Agent Expansion | Establishes the Agent Council consensus debate system and expands the roster to 12 specialized agents to support deep, multi-perspective architectural debates. | APPROVED | 2026-06-19 |

