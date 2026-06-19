# CANONICAL OPERATIONS & HANDOFF RULES — Liem OS

These rules govern all environment variables strategy, container builds, CI/CD pipeline structures, parallel Git worktrees, and end-of-session handoffs.

---

## 1. Environment Strategy & Variable Hygiene

To secure credentials and make environment management repeatable across developers:

- **Example Templating**: Every project must include a `.env.example` file documenting all required environment variables with no values.
- **Git Protection**: Never commit actual `.env`, `.env.local`, `.env.production`, or `.env.staging` files to source control.
- **Deployment Platform Configuration**: Secrets for hosting platforms (e.g. Vercel, Railway, Supabase) must be set using the platform's Environment Variables UI or CLI, never in local config files.

---

## 2. Docker & Containerization Standards

When writing Dockerfiles, enforce these production-grade criteria:

- **Multi-Stage Builds**: Always use multi-stage builds to separate build dependencies from the final runtime container, keeping production images minimal.
- **Explicit Version Tagging**: Never use the `latest` tag for base images. Always specify the exact semantic tag (e.g. `node:20.12-alpine`, `rust:1.80-slim`).
- **Non-Root Execution**: Configure a non-root user (e.g. `USER node` or `USER appuser`) to run the container process for safety.
- **Layer Caching**: Order commands (e.g., copying lockfiles and installing packages before copying the rest of the source) to maximize Docker layer cache hits.

---

## 3. Parallel Git Worktrees Swarm

When launching parallel subtasks using the worktree system:

- **Isolate Branches**: Always create worktrees on isolated feature branches. Do not share active branch directories.
- **Directory Path Structure**: Store active worktrees in a dedicated directory (e.g. `core/worktrees/<branch_name>`) and ensure this directory is added to your root `.gitignore`.
- **Automatic Cleanup**: Always execute the `liem_os__worktree_cleanup` command to remove temporary worktree paths once the branch is merged or deleted, preventing directory pollution.

---

## 4. End-of-Session Handoff Protocols

To guarantee seamless continuation across different agent sessions:

- **Session Handoff Log**: At the end of every task or session, output a clear, structured Handoff Log summarizing:
  - **Accomplishments**: Bulleted list of implemented features and passing tests.
  - **Blockers & Active Context**: State metrics, open questions, and pending decisions.
  - **Direct Next Steps**: Step-by-step TODO list for the next session.
