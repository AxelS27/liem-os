// r-error-analysis.mjs — Liem OS Research Audit Rule
// Checks for error analysis / failure mode discussion.

/**
 * @param {string} content
 * @param {string} filePath
 * @returns {{ id, severity, message, suggestion } | null}
 */
export function check(content, filePath) {
  const patterns = [
    /confusion matrix/i,
    /error analysis/i,
    /misclassif/i,
    /false positive/i,
    /false negative/i,
    /failure mode/i,
    /limitations/i,
  ];

  const found = patterns.some(re => re.test(content));

  if (found) return null;

  return {
    id: 'R-ERROR-ANALYSIS',
    severity: 'WARN',
    message: 'No error analysis or failure mode discussion detected. Reviewers expect the paper to characterise where and why the model fails.',
    suggestion: 'npx liem-os research-init --tasks error-analysis',
  };
}
