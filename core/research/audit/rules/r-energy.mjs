// r-energy.mjs — Liem OS Research Audit Rule
// Checks for energy / environmental impact reporting.

/**
 * @param {string} content
 * @param {string} filePath
 * @returns {{ id, severity, message, suggestion } | null}
 */
export function check(content, filePath) {
  const patterns = [
    /\benergy\b/i,
    /\bCO2\b/i,
    /\bcarbon\b/i,
    /\bwatt/i,
    /power consumption/i,
    /green AI/i,
    /sustainable/i,
  ];

  const found = patterns.some(re => re.test(content));

  if (found) return null;

  return {
    id: 'R-ENERGY',
    severity: 'INFO',
    message: 'No energy or environmental impact reporting found. Major venues (NeurIPS, ICLR) increasingly encourage energy / CO₂ disclosures.',
    suggestion: 'npx liem-os research-init --tasks energy-estimate',
  };
}
