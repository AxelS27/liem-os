# Liem OS Changelog

All notable changes to Liem OS will be documented in this file.

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

- **Initial Release**: Core MCP server stdio bridge, 25 specialized agent files, automated project template scaffolding, Axel routing engine, and basic auditor audit gates.
