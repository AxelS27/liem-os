import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIEM_OS_DIR = path.resolve(__dirname, "../..");
const AGENTS_DIR = path.join(LIEM_OS_DIR, "core/agents");

// Default council configurations
const DEFAULT_MEMBERS = ["strategist", "architect", "security", "coder", "auditor"];

/**
 * Loads the persona prompt for a given agent name.
 */
export function getAgentPersona(agentName) {
  const filePath = path.join(AGENTS_DIR, `${agentName.toLowerCase()}.md`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf8");
  }
  return null;
}

/**
 * Prepares the council agenda, compiling the prompts for all participating members.
 */
export function prepareCouncil(topic, members = DEFAULT_MEMBERS, mode = "debate") {
  const activeMembers = members.filter(m => {
    const persona = getAgentPersona(m);
    return persona !== null;
  });

  if (activeMembers.length === 0) {
    throw new Error("No valid agents found for the council.");
  }

  const agenda = {
    topic,
    mode,
    members: activeMembers.map(m => {
      const persona = getAgentPersona(m);
      return {
        name: m,
        roleDescription: extractRoleDescription(persona),
        prompt: `Act as the ${m.toUpperCase()} Agent of Liem OS.\n\n${persona}\n\nCOUNCIL DEBATE TOPIC:\n"${topic}"\n\nProvide your independent perspective, analysis, and recommendations on this topic. Highlight any potential risks, scalability issues, or security flaws according to your core directives. Keep your response structured and under 150 words. Output in markdown.`
      };
    })
  };

  return agenda;
}

/**
 * Formats the response instructions telling the parent agent how to summon the subagents.
 */
export const AGENT_WEIGHTS = {
  "consensus-coordinator": 1.8,
  "security": 1.8,
  "architect": 1.7,
  "ceo": 2.0,
  "auditor": 1.6,
  "coder": 1.5,
  "planner": 1.5,
  "database-reviewer": 1.6,
  "api-architect": 1.6,
  "performance-optimizer": 1.5,
  "build-resolver": 1.4,
  "deep-researcher": 1.5,
  "researcher": 1.4,
  "devops": 1.4,
  "loop-operator": 1.5,
  "operator": 1.4,
  "strategist": 1.6,
  "tester": 1.4,
  "axel": 1.7,
  "browser": 1.2,
  "designer": 1.3,
  "ux": 1.3,
  "writer": 1.2,
  "a11y": 1.2,
  "growth-agent": 1.2
};

/**
 * Calculates weighted consensus based on agent votes.
 * @param {Array<{agent: string, vote: 'GO'|'NO-GO'|'ABSTAIN', confidence?: number}>} votes
 * @returns {{consensusScore: number, verdict: 'GO'|'NO-GO'|'ABSTAIN', totalGoWeight: number, totalNoGoWeight: number, totalAbstainWeight: number, details: Array<any>}}
 */
export function calculateWeightedConsensus(votes) {
  if (!Array.isArray(votes) || votes.length === 0) {
    return {
      consensusScore: 0,
      verdict: "ABSTAIN",
      totalGoWeight: 0,
      totalNoGoWeight: 0,
      totalAbstainWeight: 0,
      details: []
    };
  }

  let totalGoWeight = 0;
  let totalNoGoWeight = 0;
  let totalAbstainWeight = 0;
  const details = [];

  for (const v of votes) {
    const agentName = v.agent.toLowerCase();
    const weight = AGENT_WEIGHTS[agentName] || 1.0;
    const confidence = typeof v.confidence === 'number' ? Math.max(0, Math.min(1, v.confidence)) : 1.0;
    const weightedVal = weight * confidence;

    let voteVal = 0;
    if (v.vote === "GO") {
      totalGoWeight += weightedVal;
      voteVal = 1;
    } else if (v.vote === "NO-GO") {
      totalNoGoWeight += weightedVal;
      voteVal = -1;
    } else {
      totalAbstainWeight += weightedVal;
    }

    details.push({
      agent: v.agent,
      vote: v.vote,
      weight,
      confidence,
      weightedValue: weightedVal,
      contribution: voteVal * weightedVal
    });
  }

  const activeWeight = totalGoWeight + totalNoGoWeight;
  let consensusScore = 0;
  let verdict = "ABSTAIN";

  if (activeWeight > 0) {
    consensusScore = (totalGoWeight - totalNoGoWeight) / activeWeight;
    
    const goRatio = totalGoWeight / activeWeight;
    if (goRatio >= 0.6) {
      verdict = "GO";
    } else if (goRatio <= 0.4) {
      verdict = "NO-GO";
    } else {
      verdict = "ABSTAIN";
    }
  }

  return {
    consensusScore,
    verdict,
    totalGoWeight,
    totalNoGoWeight,
    totalAbstainWeight,
    details
  };
}

/**
 * Formats the response instructions telling the parent agent how to summon the subagents.
 */
export function formatSummonsInstructions(agenda) {
  let instructions = `### 🏛️ Liem OS Agent Council Summoned\n`;
  instructions += `**Topic under debate:** "${agenda.topic}"\n`;
  instructions += `**Debate Mode:** ${agenda.mode.toUpperCase()}\n`;
  instructions += `**Council Members Summoned:** ${agenda.members.map(m => `\`${m.name}\``).join(", ")}\n\n`;
  instructions += `> [!IMPORTANT]\n`;
  instructions += `> To execute the debate, call the \`invoke_subagent\` tool in parallel for each member listed below. Pass the respective prompt as the task. Once all subagents report back, compile their feedback and present the synthesized consensus report.\n`;
  instructions += `> If this is an academic or research topic, the final consensus report MUST be formatted according to the 5-Section Academic Publication outline (1. Background (Problem Statement, Research Gap, Related Work), 2. Literature Review, 3. Methodology, 4. Results & Discussion placeholder, 5. Conclusion placeholder) including LaTeX formulas and literature references.\n\n`;

  instructions += `#### 🗳️ Weighted Consensus Voting Scheme:\n`;
  instructions += `Each summoned member will cast a vote (\`GO\`, \`NO-GO\`, or \`ABSTAIN\`) with a confidence level between \`0.0\` and \`1.0\` based on their domain expertise. Consensus is computed using domain authority weights:\n`;
  agenda.members.forEach(m => {
    const weight = AGENT_WEIGHTS[m.name.toLowerCase()] || 1.0;
    instructions += `- \`${m.name}\` (Domain Weight: **${weight.toFixed(1)}**)\n`;
  });
  instructions += `Consensus Score is calculated as: \\( S_c = \\frac{\\sum_{i} V_i W_i C_i}{\\sum_{i} |V_i| W_i C_i} \\) where \\( V_i \\in \\{1, -1, 0\\} \\), \\( W_i \\) is the agent's weight, and \\( C_i \\) is the confidence score. A ratio of \\(\\ge 60\\%\\) weight for GO triggers a \`GO\` verdict, while \\(\\le 40\\%\\) triggers a \`NO-GO\` verdict. Else, it defaults to \`ABSTAIN\`.\n\n`;

  instructions += `#### Subagent Summoning Specifications:\n`;
  agenda.members.forEach((m, idx) => {
    instructions += `##### [Member ${idx + 1}] Agent: ${m.name.toUpperCase()}\n`;
    instructions += `- **Role:** ${m.roleDescription}\n`;
    instructions += `- **Summons Prompt:**\n`;
    instructions += `\`\`\`text\n${m.prompt}\n\`\`\`\n\n`;
  });

  return instructions;
}

// Helper to extract a single sentence description of the agent's role
function extractRoleDescription(personaMarkdown) {
  const line = personaMarkdown.split("\n").find(l => l.startsWith("**Role:**") || l.startsWith("Role:"));
  if (line) {
    return line.replace(/^\*\*Role:\*\*|Role:/i, "").trim();
  }
  return "Specialized analytical agent.";
}
