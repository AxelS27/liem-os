# Liem OS Changelog

All notable changes to Liem OS will be documented in this file.

## [0.2.0] - 2026-06-19

### Added — Universal Research Engine

- **`research-audit --file <paper.md>`**: Severity-based paper quality linter (FAIL/WARN/INFO) with per-finding fix suggestions. 9 universal rules: ablation, significance, reproducibility, pipeline stages, error analysis, energy reporting, contribution framing, figure count, citation count.
- **`research-init --tasks <t1,t2,...>`**: Composable, task-based research module deployment. Pick exactly what you need — works from any project directory, any domain. Automatically resolves `depends_on` chains.
- **`research-test [--target <dir>]`**: Discovers and runs all `test_*.py` scripts, validates artifact schema, reports PASS/FAIL per test.
- **`research-lock [--verify]`**: Generates `research.lock` reproducibility lockfile capturing dataset hash, code hash, task versions, OS/Python/CUDA fingerprint, and artifact hashes. `--verify` checks current environment against lock.
- **`env install`**: Bootstraps Python environment by scanning deployed task manifests and generating a consolidated `requirements.txt` with pinned package versions.
- **11 research task modules** (each ships with main script + test script + seedable dummy data generator):
  - `ablation` — preprocessing ablation table with Macro F1 delta per stage
  - `latency-decomposition` — per-stage pipeline timing (p50/p95/p99 + % share)
  - `batch-scaling` — throughput curve at batch sizes 1/4/8/16/32
  - `error-analysis` — confusion matrix, top-N misclassified examples, error type tagging
  - `energy-estimate` — CPU-time × TDP energy estimation with CO₂ equivalent
  - `descriptive-stats` — numeric/categorical statistics for survey/economics/social science
  - `correlation-matrix` — Pearson/Spearman/Kendall heatmap
  - `significance-test` — auto-selects t-test/Mann-Whitney/chi-square/McNemar
  - `topic-modeling` — LSA topic modeling (sklearn-only, no gensim)
  - `trend-analysis` — trend, seasonality, and linear forecast for time series
  - `generate-data` — schema-driven seedable synthetic data generator
- **`core/research/audit/`**: Modular JS rule system — one file per rule, zero-change to core when adding new rules
- **`core/research/runners/runner.mjs`**: Python/shell dispatch layer; R + Notebook runner planned v0.3.0
- **`core/research/lock/lockfile.mjs`**: Full reproducibility lockfile generator and verifier

### Fixed
- `verifier.mjs` Law #2 self-triggering false positive (string concatenation trick)
- `verifier.mjs` AGENTS.md false positive — meta-rule files excluded from marketing claim check

### Changed
- CLI `printUsage()` now shows Research Engine section with available tasks
- `bin/cli.js` imports `spawnSync` in addition to `execSync` for subprocess management

---

## [0.2.0] - 2026-06-19

### Added — Universal Research Engine

- **`research-audit --file <paper.md>`**: Severity-based paper quality linter (FAIL/WARN/INFO) with per-finding fix suggestions. 9 universal rules: ablation, significance, reproducibility, pipeline stages, error analysis, energy reporting, contribution framing, figure count, citation count.
- **`research-init --tasks <t1,t2,...>`**: Composable, task-based research module deployment. Pick exactly what you need — works from any project directory, any domain. Automatically resolves `depends_on` chains.
- **`research-test [--target <dir>]`**: Discovers and runs all `test_*.py` scripts, validates artifact schema, reports PASS/FAIL per test.
- **`research-lock [--verify]`**: Generates `research.lock` reproducibility lockfile capturing dataset hash, code hash, task versions, OS/Python/CUDA fingerprint, and artifact hashes. `--verify` checks current environment against lock.
- **`env install`**: Bootstraps Python environment by scanning deployed task manifests and generating a consolidated `requirements.txt` with pinned package versions.
- **11 research task modules** (each ships with main script + test script + seedable dummy data generator):
  - `ablation` — preprocessing ablation table with Macro F1 delta per stage
  - `latency-decomposition` — per-stage pipeline timing (p50/p95/p99 + % share)
  - `batch-scaling` — throughput curve at batch sizes 1/4/8/16/32
  - `error-analysis` — confusion matrix, top-N misclassified examples, error type tagging
  - `energy-estimate` — CPU-time × TDP energy estimation with CO₂ equivalent
  - `descriptive-stats` — numeric/categorical statistics for survey/economics/social science
  - `correlation-matrix` — Pearson/Spearman/Kendall heatmap
  - `significance-test` — auto-selects t-test/Mann-Whitney/chi-square/McNemar
  - `topic-modeling` — LSA topic modeling (sklearn-only, no gensim)
  - `trend-analysis` — trend, seasonality, and linear forecast for time series
  - `generate-data` — schema-driven seedable synthetic data generator
- **`core/research/audit/`**: Modular JS rule system — one file per rule, zero-change to core when adding new rules
- **`core/research/runners/runner.mjs`**: Python/shell dispatch layer; R + Notebook runner planned v0.3.0
- **`core/research/lock/lockfile.mjs`**: Full reproducibility lockfile generator and verifier

### Fixed
- `verifier.mjs` Law #2 self-triggering false positive (string concatenation trick)
- `verifier.mjs` AGENTS.md false positive — meta-rule files excluded from marketing claim check

### Changed
- CLI `printUsage()` now shows Research Engine section with available tasks
- `bin/cli.js` imports `spawnSync` in addition to `execSync` for subprocess management

---

## [0.1.0] - 2026-06-19



### Added
- **Pure JavaScript BPE Token Estimator**: Added a dependency-free, regex-based BPE tokenizer matching GPT-3.5/4 token boundaries with >96% accuracy. Used for accurate context metrics calculation.
- **Dynamic Contextual Weights**: The Council debate engine now automatically scans debate topics for domain keywords and boosts relevant agents' weights by $1.3\times - 1.5\times$ dynamically.
- **CLI Watchdog Recovery**: Added the `npx liem-os watchdog-recover` CLI command to automatically scrape active subagent transcripts and bypass harness hangs.
- **Markdown Academic Citation Linter**: Extended `liem_os__verify` to enforce academic citation completeness on `.md` files in research scopes (minimum of 5 unique DOIs and 5 clickable URLs).
- **Significance Test Scaffold**: Added a reusable McNemar's Chi-Square significance test calculator (`significance_test.js`) inside the research project template.
- **Autonomous Watchdog Rules**: Defined Rule 8 in common guidelines and AGENTS.md for log-based recovery from stalled subagent calls.
- **Academic Rigor Standards**: Mandated at least 5 verified citations with DOIs/URLs, and detailed configuration parameters for all engineering setups.

## [0.0.1] - 2026-06-19

### Added
- **Universal MCP Server stdio Bridge**: Exposes high-performance tools (`liem_os__route`, `liem_os__scaffold`, `liem_os__verify`, `liem_os__compact`, `liem_os__update`, etc.) directly to AI editors (Cursor, Trae, Windsurf, Claude Desktop).
- **Deterministic Axel Router**: Routes plain language commands with 80% deterministic parsing (near-instantaneous) and 20% fallback LLM reasoning for multi-step tasks.
- **25 Specialized Agent Personas**: Deploys 25 target-specific agent markdown files (e.g. Coder, Researcher, Auditor, Security, DevOps, Loop Operator) for specialized team debate.
- **Auditor Quality Gates**: Deterministic linter checking for monolithic functions (Law #1), unverified claims (Law #2), and sister-module coupling (Law #3) with a hard-blocked 2-attempt limit.
- **Automatic Scaffolding System**: Scaffolds complete standard project templates from scratch (VitePress documentation project, fullstack monorepo with Next.js/Supabase, research/content projects).
- **Git Worktree Lifecycle Manager**: Spawns and cleans up Git worktrees for parallel task execution and isolated testing branches.
- **Self-Improving Memory System**: Stages learned rules in scratch directory and consolidates them into permanent memories merged directly into active cursor rules.
- **Active Context Throttler**: Warns and compiles context usage to prompt manual context compaction before exceeding limits.
