# CANONICAL CODING RULES — Liem OS

These rules govern all software implementation, scripting, type definitions, and codebase structuring in Liem OS.

---

## 1. Programming Languages & Execution Priorities

To ensure maximum performance, clean developer ergonomics, and safety:

### Rust (Priority One)
- Prioritize **Rust** for all performance-critical background binaries, custom CLI helpers, optimization engines, and heavy computations.
- Follow strict cargo idioms: zero compiler warnings allowed, run `cargo clippy` and `cargo fmt` before staging changes.

### TypeScript / Node.js
- Use **TypeScript** as the default language for web applications, MCP servers, and full-stack integrations.
- Always use strict type checking (`"strict": true` in `tsconfig.json`).
- Manage packages using **pnpm** exclusively. Do not run `npm install` or generate `package-lock.json` files.

### Python
- Use Python for data extraction, machine learning scripts, or quick statistics utilities.
- **ALWAYS** manage Python dependencies and execute scripts using **`uv`**:
  ```bash
  uv run python <script.py>
  ```
- Declare dependencies inside standard `pyproject.toml` configurations.

### Third-Party Library Documentation Lookups
- When coding with external frameworks (e.g. Next.js, Hono, Supabase, Tailwind), you **MUST** query the **Context7 MCP** server first:
  `resolve-library-id` -> `query-docs`
- Use the retrieved documentation to get up-to-date API shapes, avoiding hallucinations and deprecated functions.

---

## 2. Code Quality & Codebase Architecture

To prevent architectural drift, all files must follow these structural standards:

### File Constraints
- **Single Responsibility**: Every file must serve one clear purpose, stateable in 5 words or fewer.
- **Line Limits**:
  - Keep functions under **50 lines** of logic.
  - Keep individual files under **400 lines** (absolute max of 800 lines). If a file exceeds 400 lines, plan a modular split.
- **Standard JSDoc Header**: Every source code file must start with this header:
  ```javascript
  /**
   * @file [relative/path/to/file.ts]
   * @purpose [One sentence stating the single job of this file]
   * @exports [list what this exports]
   */
  ```

### React Component Anatomy (The 6-Block Rule)
When writing frontend components, organize files into these distinct sections:
- **Block 1**: External library imports (React, Lucide icons, packages).
- **Block 2**: Internal framework/context imports (shared hooks, state, types).
- **Block 3**: UI primitives and common component imports.
- **Block 4**: Local constants, styles, and static helpers.
- **Block 5**: Main component definition + local states + derived states (wrapped in `useMemo`).
- **Block 6**: Interaction handlers (wrapped in `useCallback`) + rendering markup (JSX/TSX).

---

## 3. Test-Driven Development (TDD) Protocols

All development must be verified using unit and integration tests.

### The RED-GREEN-BLUE Lifecycle
1. **RED**: Write a failing unit or integration test before implementing the feature.
2. **GREEN**: Write the minimal code required to make the test pass.
3. **BLUE**: Refactor the code for clean styling, formatting, and performance while ensuring tests continue to pass.

### Coverage Gates
- Codebase changes must achieve a minimum of **80% code coverage** across unit, integration, and E2E flows.
- Run tests in parallel to satisfy Iron Law #4 (visible feedback within 500ms).
- Mock external network requests, database connections, and third-party APIs using dedicated mock fixtures.
