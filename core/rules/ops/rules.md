# Operations & Handoff Rules

These rules govern all environment setups, deployments, script automations, and session handoffs in Liem OS.

## 1. Automation & Scripting
- **Cross-Platform**: When writing scripts, provide both Bash (`.sh`) and PowerShell (`.ps1`) variants, or use standard Node.js scripts for cross-platform execution.
- **Fail-Fast**: Ensure all scripts validate preconditions (such as checking required CLI tools, dependencies, or env vars) before executing actions.
- **Clean Execution**: Log step-by-step progress. Never swallow errors silently; output clear debugging info on failure.

## 2. Secrets & Security
- Never write credentials, API keys, or database passwords in source code, scripts, or documentation.
- Use `.env.example` templates and keep actual `.env` files added to `.gitignore`.
- Run security checkers (like `skillspector` if available) on custom rules/scripts before run.

## 3. End-of-Session Handoff
- When completing a major phase or ending a coding session, output a **Handoff Log** summarizing:
  - **Accomplished**: Bulleted list of completed work.
  - **Blockers & Decisions**: Open questions, pending approvals, or architectural decisions.
  - **Next Steps**: Exact tasks for the next session.
