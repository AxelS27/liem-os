/**
 * @file significance_test.js
 * @purpose Reusable McNemar's Chi-Square significance test calculator for comparing classifier models.
 *          Part of the Liem OS Academic Research Scaffold.
 */

/**
 * Calculates McNemar's Chi-Square significance test.
 * 
 * Contingency Table:
 *                     Model B (Correct)   Model B (Incorrect)
 * Model A (Correct)           a                   b (disagreements)
 * Model A (Incorrect)         c (disagreements)   d
 * 
 * @param {number} b - Number of items Model A got correct but Model B got incorrect.
 * @param {number} c - Number of items Model A got incorrect but Model B got correct.
 * @returns {Object} The significance test results.
 */
export function calculateMcNemar(b, c) {
  if (typeof b !== "number" || typeof c !== "number" || b < 0 || c < 0) {
    throw new Error("Parameters b and c must be non-negative numbers.");
  }

  const sumDisagreements = b + c;
  if (sumDisagreements === 0) {
    return {
      chiSquare: 0,
      pValue: 1.0,
      significant: false,
      alpha: 0.05,
      criticalValue: 3.841,
      message: "No disagreements between the two models. Performance is statistically identical."
    };
  }

  // Chi-Square with Yates' continuity correction
  const chiSquare = Math.pow(Math.abs(b - c) - 1, 2) / sumDisagreements;
  
  // Critical value for df=1 at alpha=0.05 is 3.841
  const criticalValue = 3.841;
  const significant = chiSquare > criticalValue;

  return {
    chiSquare,
    significant,
    criticalValue,
    alpha: 0.05,
    message: significant 
      ? `Statistically significant difference detected (Chi-Square = ${chiSquare.toFixed(4)} > ${criticalValue}).`
      : `No statistically significant difference detected (Chi-Square = ${chiSquare.toFixed(4)} <= ${criticalValue}).`
  };
}

// CLI runner if executed directly
if (process.argv[1] && (process.argv[1].endsWith("significance_test.js") || process.argv[1].endsWith("significance_test.mjs"))) {
  const args = process.argv.slice(2);
  const b = parseInt(args[0], 10);
  const c = parseInt(args[1], 10);

  if (isNaN(b) || isNaN(c)) {
    console.log("Usage: node significance_test.js <b> <c>");
    console.log("  b: Model A Correct, Model B Incorrect");
    console.log("  c: Model A Incorrect, Model B Correct");
    process.exit(1);
  }

  try {
    const res = calculateMcNemar(b, c);
    console.log("=== McNemar's Significance Test ===");
    console.log(`Disagreements (b): ${b}`);
    console.log(`Disagreements (c): ${c}`);
    console.log(`Chi-Square: ${res.chiSquare.toFixed(4)}`);
    console.log(`Significant: ${res.significant ? "YES" : "NO"} (alpha = ${res.alpha})`);
    console.log(`Verdict: ${res.message}`);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}
