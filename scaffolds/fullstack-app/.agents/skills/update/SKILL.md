---
name: update
description: Update the template docs (excluding project progress and project-specific docs) and update configuration files/tools from the template upstream. Use when the user wants to fetch and apply the latest template updates, or types /update.
---

# Upstream Template Updates

This command fetches the latest updates from the official `liem-monorepo` template repository (`https://github.com/AxelS27/liem-monorepo.git`), applies updates to core documentation and configuration/tool settings, and runs verification checks. It avoids overriding project-specific files.

## Steps

1. **Verify or Setup Upstream Remote**:
   - Check if `upstream` exists in `git remote -v`.
   - If not, add the default template repository URL: `git remote add upstream https://github.com/AxelS27/liem-monorepo.git`.

2. **Fetch Updates**:
   - Run `git fetch upstream`.

3. **Selectively Update Template Documentation**:
   - Extract files from the upstream branch (e.g. `upstream/main`) that are standard template guides and architecture docs.
   - Do **NOT** update project-specific files such as:
     - `docs/engineering/PROGRESS.md`
     - `docs/engineering/DECISIONS.md`
     - `docs/product/PRD.md`
     - `docs/product/FEATURES.md`
     - `docs/product/UI_UX.md`
     - `.env` and other secret files.
   - Update standard files:
     - `AGENTS.md`
     - `docs/engineering/ARCHITECTURE.md`
     - `docs/engineering/BACKEND.md`
     - `docs/engineering/DATABASE.md`
     - `docs/engineering/FRONTEND.md`
     - `docs/engineering/PAYMENTS.md`
     - `docs/engineering/QUALITY.md`
     - `docs/engineering/SECURITY.md`
     - `docs/engineering/VERSIONING.md`
     - `docs/guides/*`
     - `.claude/settings.json`
     - `.claude/agents/*`
     - `.claude/skills/*`

4. **Selectively Update Tools & Configurations**:
   - Compare and merge/checkout boilerplate configs:
     - `turbo.json`
     - `biome.json`
     - `eslint.config.mjs`
     - `.gitignore` (be careful not to overwrite custom ignore rules)
     - `.github/workflows/ci.yml`
     - `.husky/`
     - `scripts/`
   - For `package.json` at the root and inside subdirectories, merge dependency updates or configuration blocks from the template if applicable, while keeping project packages intact.

5. **Re-Install & Verify**:
   - Run `pnpm install` to update node_modules.
   - Run `pnpm run verify` and `pnpm docs:check` to ensure the codebase remains completely green.

6. **Git Commit**:
   - Stage the changes: `git add .`
   - Commit changes: `git commit -m "update template tools and docs from upstream"`
   - **Do NOT push**. Notify the user that the update is complete, show them the list of updated files, and wait for their explicit permission to run `git push`.
