// audit.mjs — Liem OS Research Audit Orchestrator
// Dynamically loads all rule modules from ./rules/ and runs each against provided content.
// Returns an array of { id, severity, message, suggestion } objects.
// Severity levels: 'FAIL' | 'WARN' | 'INFO'

import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Run all research audit rules against the given content.
 *
 * @param {string} content  - Full text content of the research document
 * @param {string} filePath - Absolute or relative path to the source file (used by rules for context)
 * @returns {Promise<Array<{id: string, severity: 'FAIL'|'WARN'|'INFO', message: string, suggestion: string}>>}
 */
export async function runResearchAudit(content, filePath) {
  const rulesDir = path.join(__dirname, 'rules');
  const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.mjs'));

  const results = [];

  for (const file of ruleFiles) {
    // Build a file:// URL so dynamic import works on Windows paths
    const rulePath = path.join(rulesDir, file);
    const ruleUrl = new URL(`file:///${rulePath.replace(/\\/g, '/')}`).href;

    const rule = await import(ruleUrl);

    if (typeof rule.check !== 'function') {
      // Skip malformed rule modules silently
      continue;
    }

    const result = rule.check(content, filePath);
    if (result !== null && result !== undefined) {
      results.push(result);
    }
  }

  return results;
}
