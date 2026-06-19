// r-ablation.mjs — Liem OS Research Audit Rule
// Checks for presence of ablation study or controlled comparison content.

/**
 * @param {string} content
 * @param {string} filePath
 * @returns {{ id, severity, message, suggestion } | null}
 */
export function check(content, filePath) {
  const patterns = [
    /\|\s*Config\s*\|/i,
    /\|\s*Condition\s*\|/i,
    /\|\s*Ablation\s*\|/i,
    /ablation study/i,
    /controlled comparison/i,
    /without\s+\w+/i,  // e.g. "without preprocessing"
  ];

  const found = patterns.some(re => re.test(content));

  if (found) return null;

  return {
    id: 'R-ABLATION',
    severity: 'WARN',
    message: 'No ablation study or controlled comparison detected. Reviewers expect evidence that each design choice contributes meaningfully.',
    suggestion: 'npx liem-os research-init --tasks ablation',
  };
}
