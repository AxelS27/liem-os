// r-figure-min.mjs — Liem OS Research Audit Rule
// Checks that the paper contains at least 4 figures.

const RECOMMENDED_MIN = 4;

/**
 * Count figure references in the content using multiple detection patterns.
 *
 * @param {string} content
 * @returns {number}
 */
function countFigures(content) {
  // Collect unique figure numbers / identifiers to avoid double-counting
  const seen = new Set();

  // Markdown image syntax: ![...]
  const mdImages = content.match(/!\[/g) || [];
  mdImages.forEach((_, i) => seen.add(`md-img-${i}`));

  // "Figure N" / "Fig. N" / "figure N" patterns
  const captionMatches = content.matchAll(/\b(?:Figure|Fig\.?|figure)\s+(\d+)/gi);
  for (const m of captionMatches) {
    seen.add(`fig-${m[1]}`);
  }

  return seen.size;
}

/**
 * @param {string} content
 * @param {string} filePath
 * @returns {{ id, severity, message, suggestion } | null}
 */
export function check(content, filePath) {
  const count = countFigures(content);

  if (count >= RECOMMENDED_MIN) return null;

  return {
    id: 'R-FIGURE-MIN',
    severity: 'INFO',
    message: `Only ${count} figure(s) detected; ${RECOMMENDED_MIN}+ are recommended for conference papers.`,
    suggestion: 'Add figures (pipeline diagram, results comparison, statistical significance matrix, Pareto frontier)',
  };
}
