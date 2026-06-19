import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Execute git command safely
function gitExec(args, cwd) {
  try {
    return execSync(`git ${args.join(" ")}`, { cwd, encoding: "utf8" }).trim();
  } catch (e) {
    throw new Error(`Git error: ${e.stderr || e.message}`);
  }
}

// Check if a branch exists
export function branchExists(branchName, cwd) {
  try {
    gitExec(["rev-parse", "--verify", branchName], cwd);
    return true;
  } catch (e) {
    return false;
  }
}

// Create git worktree
export function createWorktree(branchName, targetPath, cwd) {
  const absoluteTarget = path.resolve(targetPath);

  if (fs.existsSync(absoluteTarget)) {
    throw new Error(`Directory already exists at: ${absoluteTarget}`);
  }

  // Create parent dir if not exists
  const parentDir = path.dirname(absoluteTarget);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  const exists = branchExists(branchName, cwd);
  const args = ["worktree", "add"];

  if (!exists) {
    // Create new branch
    args.push("-b", branchName, absoluteTarget);
  } else {
    // Checkout existing branch
    args.push(absoluteTarget, branchName);
  }

  console.log(`Executing: git ${args.join(" ")}`);
  return gitExec(args, cwd);
}

// Remove git worktree
export function removeWorktree(targetPath, cwd) {
  const absoluteTarget = path.resolve(targetPath);

  if (!fs.existsSync(absoluteTarget)) {
    throw new Error(`Worktree directory not found at: ${absoluteTarget}`);
  }

  const args = ["worktree", "remove", absoluteTarget, "--force"];
  console.log(`Executing: git ${args.join(" ")}`);
  const output = gitExec(args, cwd);

  // Prune any stale worktrees just in case
  gitExec(["worktree", "prune"], cwd);

  return output;
}

// List active worktrees
export function listWorktrees(cwd) {
  const output = gitExec(["worktree", "list"], cwd);
  const lines = output.split("\n");

  return lines.map((line) => {
    const parts = line.split(/\s+/);
    return {
      path: parts[0],
      commit: parts[1] || "",
      branch: parts[2] ? parts[2].replace(/[\[\]]/g, "") : ""
    };
  });
}
