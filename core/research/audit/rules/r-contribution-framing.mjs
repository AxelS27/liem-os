// r-contribution-framing.mjs — Liem OS Research Audit Rule
// Checks that the contribution section makes specific technical claims.

const CONTRIBUTION_SECTION_RE = /contribution[s]?\s*\n|^#+\s*contribution/im;

const TECHNICAL_TERMS = [
  /bottleneck/i,
  /leakage/i,
  /constrained/i,
  /\bpipeline\b/i,
  /trade-?off/i,
  /\bPareto\b/i,
  /deployment/i,
  /throughput/i,
];

const REQUIRED_TERM_COUNT = 2;

/**
 * @param {string} content
 * @param {string} filePath
 * @returns {{ id, severity, message, suggestion } | null}
 */
export function check(content, filePath) {
  const hasContributionSection = CONTRIBUTION_SECTION_RE.test(content);

  if (!hasContributionSection) {
    return {
      id: 'R-CONTRIBUTION-FRAMING',
      severity: 'WARN',
      message: 'No contribution section detected. A clearly labelled contributions section is expected by most venues.',
      suggestion: 'Rewrite contribution section with specific technical claims (bottleneck, trade-off, deployment constraints)',
    };
  }

  // Extract text around the contribution heading (up to 1000 chars)
  const match = content.match(
    /contribution[s]?\s*[\n:][^#]{0,1000}/i
  );
  const excerpt = match ? match[0] : content;

  const termHits = TECHNICAL_TERMS.filter(re => re.test(excerpt));

  if (termHits.length >= REQUIRED_TERM_COUNT) return null;

  return {
    id: 'R-CONTRIBUTION-FRAMING',
    severity: 'WARN',
    message: `Contribution section is too generic — only ${termHits.length} of ${REQUIRED_TERM_COUNT} required technical signal terms found (e.g. bottleneck, trade-off, deployment, throughput).`,
    suggestion: 'Rewrite contribution section with specific technical claims (bottleneck, trade-off, deployment constraints)',
  };
}
