// r-reproducibility.mjs — Liem OS Research Audit Rule
// Checks for data/code availability statements (reproducibility signals).

/**
 * @param {string} content
 * @param {string} filePath
 * @returns {{ id, severity, message, suggestion } | null}
 */
export function check(content, filePath) {
  const patterns = [
    /code available/i,
    /data available/i,
    /github\.com/i,
    /doi\.org/i,
    /zenodo/i,
    /reproducib/i,
    /open source/i,
    /available at/i,
  ];

  const found = patterns.some(re => re.test(content));

  if (found) return null;

  return {
    id: 'R-REPRODUCIBILITY',
    severity: 'FAIL',
    message: 'No reproducibility statement found. The paper must include a data/code availability statement or a public link (GitHub, Zenodo, DOI).',
    suggestion: 'Add a data/code availability statement to your paper',
  };
}
