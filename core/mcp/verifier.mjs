import * as fs from "fs";
import * as path from "path";

/**
 * Runs audits on a specific file content.
 * @param {string} content - The code or text content of the file.
 * @param {string} filePath - Absolute path to the file.
 * @returns {Array<string>} List of audit failure messages.
 */
export function runAudit(content, filePath) {
  const failures = [];
  const normalizedPath = path.resolve(filePath);

  // Check Law #1 (Monolithic functions - quick heuristic check)
  const functions = content.match(/function\s+\w+\s*\(|const\s+\w+\s*=\s*(async\s*)?\([^)]*\)\s*=>/g) || [];
  if (functions.length > 10 && content.length > 15000) {
    failures.push("Law #1 Violation: File might be too large/monolithic (functions > 10 & bytes > 15KB).");
  }

  // Check Law #2 (Hallucinated claims/comments)
  // NOTE: strings are split to prevent this file from triggering its own rule.
  // Skip rule/meta-doc files that intentionally reference forbidden patterns as negative examples.
  const RULE_FILE_NAMES = ["AGENTS.md", "CLAUDE.md", "GEMINI.md", "RULES.md", "SOUL.md", "CONTRIBUTING.md", "SECURITY.md"];
  const basename = path.basename(normalizedPath);
  const isRuleFile = RULE_FILE_NAMES.includes(basename);
  if (!isRuleFile) {
    const forbiddenClaims = ["120K" + "+ users", "120,000" + " users"];
    if (forbiddenClaims.some(claim => content.includes(claim))) {
      failures.push("Law #2 Violation: Unverified marketing claim detected ('120K" + "+ users').");
    }
  }

  // Check Law #3 (Direct cross-import coupling between sibling directories in Liem OS)
  if (normalizedPath.includes("core/agents") && /import.*from.*(axel|auditor|coder|researcher|writer|strategist|operator)\.md/.test(content)) {
    failures.push("Law #3 Violation: Direct coupling between agent personas.");
  }

  // Check hardcoded credentials
  if (/(password|secret|api_key|token|private_key)\s*=\s*['"`][a-zA-Z0-9_\-]{8,}['"`]/i.test(content)) {
    failures.push("Security Check: Potential hardcoded secret or credential detected.");
  }

  // Check Academic & Research Markdown Rigor
  const ext = path.extname(normalizedPath).toLowerCase();
  if (ext === ".md") {
    const isResearch = normalizedPath.toLowerCase().includes("research") || 
                       normalizedPath.toLowerCase().includes("academic") || 
                       normalizedPath.toLowerCase().includes("synthesis") || 
                       normalizedPath.toLowerCase().includes("outline");
    if (isResearch) {
      const doiMatches = content.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi) || [];
      const urlMatches = content.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi) || [];
      
      const uniqueDois = [...new Set(doiMatches)];
      const uniqueUrls = [...new Set(urlMatches.map(u => u.toLowerCase()))];

      if (uniqueDois.length < 5 || uniqueUrls.length < 5) {
        failures.push(`Academic Rigor Violation: Research documentation must contain at least 5 verified journal/paper citations with clickable URLs and official DOIs. Found ${uniqueDois.length} unique DOIs and ${uniqueUrls.length} unique URLs.`);
      }
    }
  }

  return failures;
}
