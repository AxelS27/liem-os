"""
test_latency_decomposition.py — Latency Decomposition
======================================================
Integration test: generates dummy data → runs latency_decomposition.py →
validates all required output artifacts.

Run from the latency-decomposition/ directory:
    python test_latency_decomposition.py
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


def run_script(script_name: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, script_name],
        capture_output=True,
        text=True,
    )


# ---------------------------------------------------------------------------
# Test body
# ---------------------------------------------------------------------------

def test_latency_decomposition():
    print("\n=== Latency Decomposition — Integration Test ===\n")

    # ── Step 1: generate dummy data + model ─────────────────────────────────
    print("→ Generating dummy data and model …")
    res = run_script("generate_dummy.py")
    check(res.returncode == 0, f"generate_dummy.py exited with code {res.returncode}")
    if res.returncode != 0:
        print("  stderr:", res.stderr[:500])
        return

    check(os.path.exists(os.path.join("dummy_data", "sample.csv")),
          "dummy_data/sample.csv exists")
    check(os.path.exists(os.path.join("dummy_data", "model.pkl")),
          "dummy_data/model.pkl exists")

    # ── Step 2: run main script ──────────────────────────────────────────────
    print("\n→ Running latency_decomposition.py …")
    res = run_script("latency_decomposition.py")
    if res.returncode != 0:
        print("  stdout:", res.stdout[:800])
        print("  stderr:", res.stderr[:800])
    check(res.returncode == 0, f"latency_decomposition.py exited with code {res.returncode}")

    # ── Step 3: assert outputs exist ─────────────────────────────────────────
    print("\n→ Checking output artifacts …")
    report_path = os.path.join("output", "report.json")
    plot_path   = os.path.join("output", "plot.png")

    check(os.path.exists(report_path), "output/report.json exists")
    check(os.path.exists(plot_path),   "output/plot.png exists")

    # ── Step 4: validate report.json structure ────────────────────────────────
    print("\n→ Validating report.json …")
    if os.path.exists(report_path):
        with open(report_path, encoding="utf-8") as f:
            report = json.load(f)

        check("stages" in report,
              "report.json has 'stages' key")

        if "stages" in report:
            stages = report["stages"]
            check(len(stages) >= 1,
                  f"stages list has >= 1 entry (got {len(stages)})")
            for s in stages:
                for field in ("name", "p50", "p95", "p99", "pct_share"):
                    check(field in s,
                          f"stage '{s.get('name', '?')}' has field '{field}'")
                if "p50" in s and "p95" in s and "p99" in s:
                    check(0 <= s["p50"] <= s["p95"] <= s["p99"],
                          f"p50 <= p95 <= p99 for stage '{s.get('name', '?')}'")
                if "pct_share" in s:
                    check(0.0 <= s["pct_share"] <= 100.0,
                          f"pct_share in [0,100] for stage '{s.get('name', '?')}' "
                          f"(got {s['pct_share']})")

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
    test_latency_decomposition()
