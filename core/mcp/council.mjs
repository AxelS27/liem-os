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
export function formatSummonsInstructions(agenda) {
  let instructions = `### 🏛️ Liem OS Agent Council Summoned\n`;
  instructions += `**Topic under debate:** "${agenda.topic}"\n`;
  instructions += `**Debate Mode:** ${agenda.mode.toUpperCase()}\n`;
  instructions += `**Council Members Summoned:** ${agenda.members.map(m => `\`${m.name}\``).join(", ")}\n\n`;
  instructions += `> [!IMPORTANT]\n`;
  instructions += `> To execute the debate, call the \`invoke_subagent\` tool in parallel for each member listed below. Pass the respective prompt as the task. Once all subagents report back, compile their feedback and present the synthesized consensus report.\n\n`;

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
