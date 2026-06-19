/*
 * SessionStart hook: inject the project's standing context at the start of every
 * session, so a fresh chat starts oriented without the user pasting the CONTINUE.md
 * kickoff prompt. State lives in the docs (PROGRESS.md), never in chat history.
 */
import { existsSync, readFileSync } from 'node:fs';

function progressSummary() {
  const path = 'docs/engineering/PROGRESS.md';
  if (!existsSync(path)) return 'PROGRESS.md is missing.';
  const content = readFileSync(path, 'utf8');
  // Same placeholder convention as scripts/check-docs.mjs: unfilled <tokens>.
  if ((content.match(/<[^>\n]+>/g) ?? []).length > 0) {
    return 'docs/engineering/PROGRESS.md is still the blank template - no product initialized yet (run /init-product to start one).';
  }
  const done = (content.match(/\[x\]/gi) ?? []).length;
  const open = (content.match(/\[ \]/g) ?? []).length;
  return `docs/engineering/PROGRESS.md: ${done} done, ${open} open - read it before building product features.`;
}

const lines = [
  'Project context (injected at session start):',
  '- AGENTS.md is the law of this repo: read it before working. It routes sector work to the subagents (web-builder, api-builder, db-engineer) and gates UI work behind design-reviewer.',
  `- ${progressSummary()}`,
  '- Open docs/ files on demand per the table in AGENTS.md; do not read everything up front.',
  '- Commands: /init-product (set up a new product), /new-feature (build a feature slice), /ship-check (launch readiness), /handoff (end-of-session doc sync).',
  '- MCP Setup: Configure the Context7 MCP server to enable live, version-accurate documentation retrieval for AI assistants (see docs/guides/CONTEXT7.md).',
];

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: lines.join('\n'),
    },
  }),
);
