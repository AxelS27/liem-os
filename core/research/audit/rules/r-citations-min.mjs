// r-citations-min.mjs — Liem OS Research Audit Rule
// Checks that the paper contains at least 5 citations.

const RECOMMENDED_MIN = 5;

/**
 * Count unique citations using several heuristics:
 *  1. Bracketed numbers: [1], [2], [3] …
 *  2. Numbered reference list lines: ^1. Author …
 *  3. DOI patterns: doi.org/…
 *
 * @param {string} content
 * @returns {number}
 */
function countCitations(content) {
  const seen = new Set();

  // [N] style inline citations
  const bracketRefs = content.matchAll(/\[(\d+)\]/g);
  for (const m of bracketRefs) {
    seen.add(`bracket-${m[1]}`);
  }

  // Numbered reference list entries: lines starting with "N."
  const listRefs = content.matchAll(/^(\d+)\.\s+\S/gm);
  for (const m of listRefs) {
    seen.add(`list-${m[1]}`);
  }

  // DOI patterns (each unique DOI = one citation)
  const doiRefs = content.matchAll(/doi\.org\/[\w./\-]+/gi);
  for (const m of doiRefs) {
    seen.add(`doi-${m[0]}`);
  }

  return seen.size;
}

/**
 * @param {string} content
 * @param {string} filePath
 * @returns {{ id, severity, message, suggestion } | null}
 */
export function check(content, filePath) {
  const count = countCitations(content);

  if (count >= RECOMMENDED_MIN) return null;

  return {
    id: 'R-CITATIONS-MIN',
    severity: 'WARN',
    message: `Only ${count} citation(s) detected; at least ${RECOMMENDED_MIN} peer-reviewed citations are expected.`,
    suggestion: 'Add at least 5 peer-reviewed citations',
  };
}
