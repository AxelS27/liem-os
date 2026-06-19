# CANONICAL COMMON RULES — Liem OS

These rules apply globally across all directories, tasks, coding languages, and agent scopes within the Liem OS workspace.

---

## 1. System Design & Architectural Priorities

Liem OS mandates a decoupled, high-performance architecture. Do not compromise on the following standards under any circumstances:

1. **Strict Immutability**:
   - Variables, objects, arrays, and arguments must never be mutated in-place.
   - Always return new copies of data structures (e.g. using object/array spreads, maps, or filters) when modifying state.
2. **Modular Decoupling**:
   - Sibling modules (directories under the same domain boundary) must never import directly from each other.
   - Cross-cutting concerns must navigate through the shared layer or communicate via decoupled message/event patterns.
3. **Decoupled Configuration**:
   - Environment variables must be parsed and validated at system startup using schemas (e.g. Zod).
   - Never reference `process.env` directly inside business logic; always inject validated config objects.

---

## 2. Workspace Hygiene & Git Standards

A clean workspace prevents merge conflicts and local configuration desynchronization.

### File and Directory Hygiene
- [ ] **No Dead Assets**: Remove temporary scratch scripts (`.js`, `.py`, `.sh`) from the project root when their objective is completed. Move persistent helper scripts to the `scripts/` directory.
- [ ] **Lockfile Preservation**: Respect lockfiles (`pnpm-lock.yaml`, `cargo.lock`). Never delete lockfiles to bypass install errors.
- [ ] **Gitignored States**: State files (e.g. `.liem_os_state.json`, `.liem_os_config.json`) must remain ignored and never be added to Git staging.

### Conventional Git Commits
All commits must follow the conventional commit standard:
`git commit -m "<type>: <description>"`

- **Allowed Types**:
  - `feat`: Implementation of new functional capabilities.
  - `fix`: Patches resolving bugs, compiler failures, or logic checks.
  - `refactor`: Restructuring code files without altering external features.
  - `docs`: Documentation revisions, diagrams, or placeholder adjustments.
  - `test`: Test suite additions, integrations, or coverage changes.
  - `chore`: Version changes, lockfile updates, or CI pipeline modifications.
- **Constraints**:
  - Summarize the commit in a single, short line.
  - Avoid AI references, signature trailers, or co-author details.

---

## 3. Communication & Link Standards

To maintain traceability across code reviews, planning phases, and audits:

- **Markdown File Links**:
  - When referencing files in responses or markdown files, always provide clickable paths using standard Markdown `[basename](file:///path/to/file)` format.
  - **Do NOT** wrap link text inside backticks (e.g. use `[rules.md](file:///path/to/rules.md)`, not `[`rules.md`](file:///path/to/rules.md)`).
- **Strict Verification Citations**:
  - All claims of code verification or bug resolutions must explicitly cite the files, line ranges, or test command outputs.
- **Clarity Over Hyperbole**:
  - Keep sentences short, value-dense, and factual.
  - Ban generic AI filler terms ("groundbreaking", "seamless", "delve", "unlock").
