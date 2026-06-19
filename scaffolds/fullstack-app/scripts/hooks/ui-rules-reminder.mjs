/*
 * PostToolUse hook: when a file under apps/web/src or packages/ui/src is edited,
 * inject the critical UI rules into the model's context. This is the mechanical
 * backstop for the design system - the rules arrive by themselves instead of
 * relying on the model remembering to open docs/engineering/DESIGN_DNA.md.
 *
 * Fires once per session (marker file keyed by session_id) so it reminds
 * without flooding the context.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;

let payload;
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

const filePath = String(payload?.tool_input?.file_path ?? '').replaceAll('\\', '/');
const isUiFile =
  /(apps\/web\/src|packages\/ui\/src)\//.test(filePath) && /\.(tsx|ts|css|json)$/.test(filePath);
if (!isUiFile) process.exit(0);

const sessionId = String(payload?.session_id ?? 'unknown').replace(/[^a-zA-Z0-9-]/g, '');
const marker = join(tmpdir(), `liem-ui-reminder-${sessionId}`);
if (existsSync(marker)) process.exit(0);
writeFileSync(marker, '1');

const reminder = [
  'UI work detected. Critical design rules (full set: docs/engineering/DESIGN_DNA.md):',
  '- Build on the starter foundation; never regenerate apps/web from scratch.',
  '- Tokens only (globals.css); background stays white; no raw palette classes or hex.',
  '- Rendered copy lives in src/i18n/locales/en.json via getDictionary (ADR-010).',
  '- Open bands by default; hero never card-wrapped; one focal point per viewport.',
  '- 4px spacing grid; max 3 font weights; animate transform/opacity only.',
  '- Every interactive element: hover + focus-visible ring + active state.',
  'Before calling this work done: run the DESIGN_DNA double-check (Part A greps +',
  'Part B reading), then have the design-reviewer agent audit the changes.',
].join('\n');

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: reminder,
    },
  }),
);
