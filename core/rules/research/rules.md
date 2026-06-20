# CANONICAL RESEARCH RULES — Liem OS

These rules govern all data gathering, technical research, documentation lookups, web search queries, and citation indexing in Liem OS.

---

## 1. Documentation-First & Context7 Protocols

To avoid obsolete API usage, deprecated methods, and package hallucinations:

- **Eager Library Query**: Whenever you integrate or troubleshoot third-party libraries (e.g. Next.js, Hono, Supabase, Tailwind, Prisma), you **MUST** run a documentation lookup first using the **Context7 MCP** server.
- **Lookup Method**:
  1. `resolve-library-id`: Search using the library name and the specific topic.
  2. `query-docs`: Query the resolved ID (e.g., `/npm/supabase`) using the full technical question.
- **Direct Application**: Code changes and API shapes must strictly conform to the fetched docs payload. Do not rely on training data for versions or syntax.

---

## 2. Microsoft MarkItDown Conversion Protocol

When research involves non-markdown formats (e.g. PDF briefs, Excel metrics sheets, Word specifications, HTML resources, or PowerPoint pitches):

- **Command Syntax**: You **MUST** convert the file to Markdown before reading it using `markitdown` managed by `uv`:
  ```bash
  uv run markitdown <input_file> > <output_file.md>
  ```
- **File Read**: Always use the `view_file` tool on the resulting `.md` file to analyze the converted content. Do not attempt to parse binary files or raw bytes directly.

---

## 3. Strict Citations & Anti-Fabrication Clause

To maintain complete credibility and traceability across all research documents and reports:

- **The Anti-Fabrication Rule**: You must never invent or estimate statistics, user metrics, customer testimonials, or performance benchmark figures. If a number or quote is not present in the source documents, you must omit it or clearly state that it is unavailable.
- **Verifiable Citations**: Every research report, technical comparison, or documentation reference must include a detailed source citation log linking to:
  - The exact URL or API documentation reference.
  - The relative file path and line number range of the source codebase.
- **Opinion Isolation**: Always separate factual evidence from logical deduction or hypothetical suggestions. Use headers like `## Verified Facts` vs `## Hypotheses/Suggestions`.

---

## 4. Deep Research & Investigation Protocol

When executing or troubleshooting research tasks (including ML modeling, statistical analysis, systems benchmarking, time-series, or data generation):
- **Deep Exploration Directive**: Never settle for basic or superficial mock-ups, static placeholders, or simple heuristics. You MUST explore the problem topic and case as deeply as possible.
- **ML & Modeling Depth**: If the task involves ML/modelling:
  - You MUST perform thorough hyperparameter tuning (e.g. grid search, random search, or Bayesian optimization).
  - You MUST evaluate and compare multiple model families (e.g., linear models, tree-based models, neural networks).
  - You MUST implement rigorous cross-validation and ensure no target leakage occurs.
  - You MUST perform a detailed error analysis, categorizing failures and describing limitations.
  - You MUST conduct significance testing (with p-values and effect sizes) to validate that model improvements are statistically sound.
- **General Research Rigor**: For statistical or time-series research, perform stationarity checks, test multiple hypothesis classes, and provide effect size metrics.
- **No Hardcoded Scaffolding**: Adapt your code dynamically to the shape, format, and structure of the dataset. Never hardcode domain logic or language-specific slang/clitics unless explicitly configured.


---

## 4. Deep Research & Investigation Protocol

When executing or troubleshooting research tasks (including ML modeling, statistical analysis, systems benchmarking, time-series, or data generation):
- **Deep Exploration Directive**: Never settle for basic or superficial mock-ups, static placeholders, or simple heuristics. You MUST explore the problem topic and case as deeply as possible.
- **ML & Modeling Depth**: If the task involves ML/modelling:
  - You MUST perform thorough hyperparameter tuning (e.g. grid search, random search, or Bayesian optimization).
  - You MUST evaluate and compare multiple model families (e.g., linear models, tree-based models, neural networks).
  - You MUST implement rigorous cross-validation and ensure no target leakage occurs.
  - You MUST perform a detailed error analysis, categorizing failures and describing limitations.
  - You MUST conduct significance testing (with p-values and effect sizes) to validate that model improvements are statistically sound.
- **General Research Rigor**: For statistical or time-series research, perform stationarity checks, test multiple hypothesis classes, and provide effect size metrics.
- **No Hardcoded Scaffolding**: Adapt your code dynamically to the shape, format, and structure of the dataset. Never hardcode domain logic or language-specific slang/clitics unless explicitly configured.

