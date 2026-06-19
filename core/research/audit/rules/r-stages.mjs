// r-stages.mjs — Liem OS Research Audit Rule
// Checks for pipeline stage latency/time breakdown.

/**
 * Returns true if the content mentions at least two pipeline stage keywords
 * AND also contains at least one latency / time measurement value.
 *
 * @param {string} content
 * @param {string} filePath
 * @returns {{ id, severity, message, suggestion } | null}
 */
export function check(content, filePath) {
  const stagePatterns = [
    /preprocessing/i,
    /feature extract/i,
    /inference/i,
    /tokenization/i,
    /vectorization/i,
    /Stage\s+1/i,
    /Stage\s+2/i,
  ];

  const latencyPatterns = [
    /\d+\s*ms/i,
    /\d+\s*seconds?/i,
    /\d+\s*s\b/,
    /latency/i,
    /throughput/i,
    /elapsed/i,
    /wall.?time/i,
  ];

  const stageHits = stagePatterns.filter(re => re.test(content));
  const hasLatency = latencyPatterns.some(re => re.test(content));

  if (stageHits.length >= 2 && hasLatency) return null;

  return {
    id: 'R-STAGES',
    severity: 'WARN',
    message: `Pipeline stage latency breakdown not detected (found ${stageHits.length} stage keyword(s), latency values: ${hasLatency}). Readers need per-stage timing to understand where bottlenecks lie.`,
    suggestion: 'npx liem-os research-init --tasks latency-decomposition',
  };
}
