# PRD — Liem OS

Liem OS is a standalone, lightweight, and ultra-high-performance AI engineering workspace and MCP runtime bridge. It combines the rigorous engineering discipline of Liem Monorepo with the cross-harness parity of ECC, the crisp boundaries of Forge, and the persistent memory concepts of Ruflo.

## Summary
Liem OS provides a 3-layer platform (Layer A: Core & MCP, Layer B: Templates, Layer C: UI Dashboard) designed to super-charge developer-agent interactions. It enforces the 5 relaxed Iron Laws, manages token optimization and verification statefully, and supports isolated parallel task execution.

## Core Features
1. **Universal MCP Server Runtime** (`liem-os-mcp`): Exposes tools for routing (`liem_os__route`), scaffolding (`liem_os__scaffold`), audits/verification (`liem_os__verify`), token metrics tracking (`liem_os__compact`), and rule compiling (`liem_os__update`).
2. **Deterministic Quality Auditor**: Runs parallel checks (Code, UI, Security) and statefully caps auto-remediation at 2 attempts to prevent deadlock loops.
3. **Memory & Self-Learning**: Stages newly extracted instincts in `core/memory/scratch/` and requires user confirmation to promote them to `core/memory/approved/` permanent compiled rules.
4. **Multi-Agent Git Worktrees**: Allows spawns of isolated workspaces on dedicated branches via `liem_os__worktree_create` to prevent workspace pollution.
5. **Starter Scaffolding**: Deploys pre-configured fullstack monorepos, research outline workspaces, documentation hubs, and copywriting briefs.

## Out of Scope (Non-Goals)
- **ECC Bloat**: Rejecting the 261-skill sprawl; keeping the command surface tight and composable.
- **Unverified Benchmarks**: Rejects Ruflo's breadth-without-depth and fake statistics.
