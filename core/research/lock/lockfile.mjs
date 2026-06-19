/**
 * @file lockfile.mjs
 * @purpose Generate and verify research.lock reproducibility lockfiles.
 *          Captures: dataset hash, script hashes, environment fingerprint,
 *          artifact hashes, seed, task versions.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as os from "os";
import { execSync } from "child_process";

const LOCK_VERSION = "1";
const LOCK_FILENAME = "research.lock";

/**
 * Generate a SHA-256 hash of a file's contents.
 * @param {string} filePath
 * @returns {string} hex hash, or "unavailable" if file missing
 */
function hashFile(filePath) {
  if (!fs.existsSync(filePath)) return "unavailable";
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
}

/**
 * Get current Python version string.
 */
function getPythonVersion() {
  for (const cmd of ["python3", "python"]) {
    try {
      const out = execSync(`${cmd} --version 2>&1`, { encoding: "utf8" }).trim();
      const match = out.match(/Python (\d+\.\d+\.\d+)/);
      if (match) return match[1];
    } catch { /* try next */ }
  }
  return "unknown";
}

/**
 * Get installed package versions for a list of package names.
 * @param {string[]} packageNames
 */
function getInstalledPackages(packageNames) {
  const result = {};
  for (const cmd of ["python3", "python"]) {
    try {
      for (const pkg of packageNames) {
        try {
          const ver = execSync(
            `${cmd} -c "import importlib.metadata; print(importlib.metadata.version('${pkg}'))"`,
            { encoding: "utf8", stdio: "pipe" }
          ).trim();
          result[pkg] = ver;
        } catch {
          result[pkg] = "not_installed";
        }
      }
      break;
    } catch { /* try next python cmd */ }
  }
  return result;
}

/**
 * Get git commit hash if in a git repo.
 */
function getGitCommit(cwd) {
  try {
    return execSync("git rev-parse --short HEAD", { cwd, encoding: "utf8" }).trim();
  } catch {
    return "not_a_git_repo";
  }
}

/**
 * Collect hashes of all scripts in a target directory.
 * @param {string} dir
 * @returns {object} {filename: hash}
 */
function hashScriptsInDir(dir) {
  const result = {};
  if (!fs.existsSync(dir)) return result;
  for (const file of fs.readdirSync(dir)) {
    if (file.endsWith(".py") || file.endsWith(".mjs") || file.endsWith(".js")) {
      result[file] = hashFile(path.join(dir, file));
    }
  }
  return result;
}

/**
 * Collect artifact hashes from the artifacts directory.
 * @param {string} artifactsDir
 */
function collectArtifacts(artifactsDir) {
  const artifacts = [];
  if (!fs.existsSync(artifactsDir)) return artifacts;
  for (const file of fs.readdirSync(artifactsDir)) {
    const filePath = path.join(artifactsDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      artifacts.push({
        path: path.relative(process.cwd(), filePath),
        sha256: hashFile(filePath),
        size_bytes: stat.size,
      });
    }
  }
  return artifacts;
}

/**
 * Read deployed task manifests to extract task versions.
 * @param {string} workDir
 */
function collectTaskVersions(workDir) {
  const versions = {};
  const entries = fs.existsSync(workDir) ? fs.readdirSync(workDir, { withFileTypes: true }) : [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(workDir, entry.name, "task.manifest.yaml");
    if (!fs.existsSync(manifestPath)) continue;
    const content = fs.readFileSync(manifestPath, "utf8");
    const verMatch = content.match(/^version:\s*"([^"]+)"/m);
    if (verMatch) versions[entry.name] = verMatch[1];
  }
  return versions;
}

/**
 * Generate a research.lock file in the target directory.
 * @param {object} opts
 * @param {string} opts.cwd       - Project working directory
 * @param {string} [opts.dataPath] - Path to primary dataset file
 * @param {number} [opts.seed]    - Random seed used
 * @param {string[]} [opts.packages] - Package names to fingerprint
 * @param {string} [opts.artifactsDir] - artifacts/ directory path
 */
export function generateLock({
  cwd = process.cwd(),
  dataPath = null,
  seed = 42,
  packages = ["scikit-learn", "pandas", "numpy", "matplotlib", "scipy"],
  artifactsDir = null,
} = {}) {
  const absArtifactsDir = artifactsDir
    ? path.resolve(cwd, artifactsDir)
    : path.join(cwd, "artifacts");

  const lock = {
    version: LOCK_VERSION,
    timestamp: new Date().toISOString(),
    seed,

    tasks: collectTaskVersions(cwd),

    dataset: dataPath && fs.existsSync(path.resolve(cwd, dataPath)) ? {
      path: dataPath,
      sha256: hashFile(path.resolve(cwd, dataPath)),
      rows: (() => {
        try {
          const content = fs.readFileSync(path.resolve(cwd, dataPath), "utf8");
          return content.split("\n").filter(l => l.trim()).length - 1; // minus header
        } catch { return "unknown"; }
      })(),
    } : null,

    code: {
      git_commit: getGitCommit(cwd),
      scripts_hash: hashScriptsInDir(cwd),
    },

    environment: {
      os: {
        name: os.platform(),         // win32, linux, darwin
        version: os.release(),
        arch: os.arch(),
      },
      python: getPythonVersion(),
      cuda: (() => {
        try {
          const out = execSync("nvcc --version 2>&1", { encoding: "utf8" });
          const m = out.match(/release (\d+\.\d+)/);
          return m ? m[1] : "not_detected";
        } catch { return null; }
      })(),
      packages: getInstalledPackages(packages),
    },

    artifacts: collectArtifacts(absArtifactsDir),
  };

  const lockPath = path.join(cwd, LOCK_FILENAME);
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2), "utf8");
  return { lockPath, lock };
}

/**
 * Verify an existing research.lock against the current environment.
 * Returns a list of discrepancy warnings.
 * @param {string} cwd
 */
export function verifyLock(cwd = process.cwd()) {
  const lockPath = path.join(cwd, LOCK_FILENAME);
  if (!fs.existsSync(lockPath)) {
    return { ok: false, errors: ["research.lock not found. Run: npx liem-os research-lock"] };
  }

  let lock;
  try {
    lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  } catch {
    return { ok: false, errors: ["research.lock is corrupted."] };
  }

  const warnings = [];
  const currentPython = getPythonVersion();
  if (lock.environment?.python && lock.environment.python !== currentPython) {
    warnings.push(`Python version differs: locked=${lock.environment.python}, current=${currentPython}`);
  }

  const currentOs = os.platform();
  if (lock.environment?.os?.name && lock.environment.os.name !== currentOs) {
    warnings.push(`OS differs: locked=${lock.environment.os.name}, current=${currentOs}`);
  }

  if (lock.environment?.packages) {
    const currentPkgs = getInstalledPackages(Object.keys(lock.environment.packages));
    for (const [pkg, lockedVer] of Object.entries(lock.environment.packages)) {
      const cur = currentPkgs[pkg];
      if (cur && cur !== lockedVer) {
        warnings.push(`Package ${pkg} differs: locked=${lockedVer}, current=${cur}`);
      }
    }
  }

  if (lock.dataset?.path) {
    const absData = path.resolve(cwd, lock.dataset.path);
    const currentHash = hashFile(absData);
    if (currentHash !== lock.dataset.sha256) {
      warnings.push(`Dataset hash differs: ${lock.dataset.path} has changed since lock was generated`);
    }
  }

  return {
    ok: warnings.length === 0,
    warnings,
    lock,
  };
}
