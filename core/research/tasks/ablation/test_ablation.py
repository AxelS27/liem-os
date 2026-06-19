"""
test_ablation.py — Ablation Study
====================================
Integration test: generates dummy data → runs ablation_study.py →
validates all required output artifacts.

Run from the ablation/ directory:
    python test_ablation.py
"""

import json
import os
import subprocess
import sys


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

PASS_MARK = "✓ PASS"
FAIL_MARK = "✗ FAIL"

_failures: list = []


def check(condition: bool, message: str):
    if not condition:
        _failures.append(message)
        print(f"  {FAIL_MARK}: {message}")
    else:
        print(f"  {PASS_MARK}: {message}")


def run_script(script_name: str, extra_env: dict | None = None) -> subprocess.CompletedProcess:
    env = os.environ.copy()
    if extra_env:
        env.update(extra_env)
    result = subprocess.run(
        [sys.executable, script_name],
        capture_output=True,
        text=True,
        env=env,
    )
    return result


# ---------------------------------------------------------------------------
# Test body
# ---------------------------------------------------------------------------

def test_ablation():
    print("\n=== Ablation Study — Integration Test ===\n")

    # ── Step 1: generate dummy data ─────────────────────────────────────────
    print("→ Generating dummy data …")
    res = run_script("generate_dummy.py")
    check(res.returncode == 0, f"generate_dummy.py exited with code {res.returncode}")
    if res.returncode != 0:
        print("  stderr:", res.stderr[:500])
        return

    check(os.path.exists(os.path.join("dummy_data", "sample.csv")),
          "dummy_data/sample.csv exists")
    check(os.path.exists(os.path.join("dummy_data", "slang_dict.csv")),
          "dummy_data/slang_dict.csv exists")

    # ── Step 2: run main script ──────────────────────────────────────────────
    print("\n→ Running ablation_study.py …")
    res = run_script("ablation_study.py")
    if res.returncode != 0:
        print("  stdout:", res.stdout[:800])
        print("  stderr:", res.stderr[:800])
    check(res.returncode == 0, f"ablation_study.py exited with code {res.returncode}")

    # ── Step 3: assert outputs exist ─────────────────────────────────────────
    print("\n→ Checking output artifacts …")
    report_path = os.path.join("output", "report.json")
    plot_path   = os.path.join("output", "plot.png")
    model_path  = os.path.join("output", "model.pkl")

    check(os.path.exists(report_path), "output/report.json exists")
    check(os.path.exists(plot_path),   "output/plot.png exists")
    check(os.path.exists(model_path),  "output/model.pkl exists")

    # ── Step 4: validate report.json structure ────────────────────────────────
    print("\n→ Validating report.json …")
    if os.path.exists(report_path):
        with open(report_path, encoding="utf-8") as f:
            report = json.load(f)

        check("configs" in report,
              "report.json has 'configs' key")

        if "configs" in report:
            configs = report["configs"]
            check(len(configs) >= 2,
                  f"configs has >= 2 entries (got {len(configs)})")
            for cfg in configs:
                check("name" in cfg and "macro_f1" in cfg,
                      f"config entry '{cfg.get('name', '?')}' has name + macro_f1")
                if "macro_f1" in cfg:
                    check(0.0 <= cfg["macro_f1"] <= 1.0,
                          f"macro_f1 in [0,1] for '{cfg.get('name', '?')}' "
                          f"(got {cfg['macro_f1']})")

    # ── Final verdict ─────────────────────────────────────────────────────────
    print()
    if _failures:
        print(f"{FAIL_MARK} — {len(_failures)} check(s) failed:")
        for msg in _failures:
            print(f"  • {msg}")
        sys.exit(1)
    else:
        print(f"{PASS_MARK} — All checks passed.")


if __name__ == "__main__":
    test_ablation()
