# Coding Rules

These rules govern all software development and scripting in Liem OS.

## 1. Programming Languages & Tools
- **Rust First**: Prioritize Rust for all performance-critical background tools, data processors, or latency-sensitive CLI commands.
- **Node.js / TypeScript**: Standard language for APIs, MCP servers, and full-stack web applications.
- **Python**: Used for data science, AI scripts, or integrations. **ALWAYS** manage Python environments and execute scripts via **`uv`**.
- **External Documentation**: Always query the **Context7 MCP** server when using third-party libraries (e.g., Hono, Next.js, Supabase) to get up-to-date syntax.

## 2. Code Quality & Formatting
- **Immutability**: Avoid mutating existing objects or arguments. Return new copies with changes applied.
- **Function Size**: Functions must be short and focused (<50 lines). Files should typically be 200–400 lines (max 800).
- **Coupling**: Keep code decoupled. Do not allow direct cross-imports between sibling feature folders; go through shared layers.

## 3. Testing Requirements
- **Test-Driven Development (TDD)**: Write failing tests first, implement minimal code, and refactor.
- **Coverage**: Maintain a minimum test coverage of **80%** across unit and integration tests.
- **Parallel Checks**: Run tests and linting in parallel where possible to ensure instant verification feedback.
