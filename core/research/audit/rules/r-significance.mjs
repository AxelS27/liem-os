// r-significance.mjs — Liem OS Research Audit Rule
// Checks for statistical significance reporting.

/**
 * @param {string} content
 * @param {string} filePath
 * @returns {{ id, severity, message, suggestion } | null}
 */
export function check(content, filePath) {
  const patterns = [
    /p-value/i,
    /p\s*=/,
    /p\s*</,
    /McNemar/i,
    /chi-square/i,
    /Mann-Whitney/i,
    /t-test/i,
    /Wilcoxon/i,
    /ANOVA/i,
    /statistically significant/i,
  ];

  const found = patterns.some(re => re.test(content));

  if (found) return null;

  return {
    id: 'R-SIGNIFICANCE',
    severity: 'FAIL',
    message: 'No statistical significance testing detected. Claims of improvement must be backed by hypothesis tests (t-test, McNemar, ANOVA, etc.).',
    suggestion: 'npx liem-os research-init --tasks significance-test',
  };
}
