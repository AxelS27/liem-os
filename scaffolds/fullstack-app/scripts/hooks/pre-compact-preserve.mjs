/*
 * PreCompact hook: when the conversation is about to be summarized, make sure the
 * things models tend to drop survive the compaction. Rule decay after compaction is
 * the main way long sessions start violating the design system.
 *
 * Auto-compaction means the context was nearly exhausted - exactly the moment work
 * would be lost if the session died. So on `trigger: "auto"` this hook escalates:
 * it orders an immediate /handoff doc sync before any other work resumes.
 */
let input = '';
for await (const chunk of process.stdin) input += chunk;

let trigger = 'manual';
try {
  trigger = JSON.parse(input)?.trigger === 'auto' ? 'auto' : 'manual';
} catch {
  // Keep the manual default if the payload is unreadable.
}

const preserve = [
  'Compaction notice - preserve these in the summary and re-apply them after:',
  '- AGENTS.md remains the law; re-read its UI Critical Rules before further apps/web work.',
  '- Sector work routes to subagents (web-builder, api-builder, db-engineer); UI changes are not done until design-reviewer returns PASS.',
  '- Carry over: which files were changed this session, pending gates (design-reviewer, pnpm run verify), and any docs/engineering/PROGRESS.md updates still owed.',
];

const autoEscalation = [
  '',
  'AUTO-COMPACTION: the context was nearly exhausted. The session may not survive much longer.',
  'MANDATORY FIRST ACTION after this compaction, before resuming any task:',
  'run the /handoff doc sync - update docs/engineering/PROGRESS.md (done / in progress /',
  'half-finished with enough detail to resume cold), append real decisions to',
  'docs/engineering/DECISIONS.md, then run pnpm docs:check. Only then continue working.',
  'If the work is mid-task, record the exact next step in PROGRESS.md so a fresh session',
  'can pick it up even if this one dies.',
];

const lines = trigger === 'auto' ? [...preserve, ...autoEscalation] : preserve;

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreCompact',
      additionalContext: lines.join('\n'),
    },
  }),
);
