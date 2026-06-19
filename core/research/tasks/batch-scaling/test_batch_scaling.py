"""
test_batch_scaling.py — Batch Scaling
======================================
Integration test: generates dummy data → runs batch_scaling.py →
validates all required output artifacts.

Run from the batch-scaling/ directory:
    python test_batch_scaling.py
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

EXPECTED_BATCH_SIZES = [1, 4, 8, 16, 32]   # must match CONFIG in batch_scaling.py


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

def test_batch_scaling():
    print("\n=== Batch Scaling — Integration Test ===\n")

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
    print("\n→ Running batch_scaling.py …")
    res = run_script("batch_scaling.py")
    if res.returncode != 0:
        print("  stdout:", res.stdout[:800])
        print("  stderr:", res.stderr[:800])
    check(res.returncode == 0, f"batch_scaling.py exited with code {res.returncode}")

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

        check("batch_results" in report,
              "report.json has 'batch_results' key")

        if "batch_results" in report:
            results = report["batch_results"]
            check(len(results) == 5,
                  f"batch_results has exactly 5 entries (got {len(results)})")

            reported_sizes = [r.get("batch_size") for r in results]
            check(reported_sizes == EXPECTED_BATCH_SIZES,
                  f"batch sizes are {EXPECTED_BATCH_SIZES} (got {reported_sizes})")

            for r in results:
                bs = r.get("batch_size", "?")
                for field in ("batch_size", "median_latency_ms", "throughput_per_sec"):
                    check(field in r,
                          f"batch_size={bs} entry has field '{field}'")
                if "median_latency_ms" in r:
                    check(r["median_latency_ms"] > 0,
                          f"median_latency_ms > 0 for batch_size={bs}")
                if "throughput_per_sec" in r:
                    check(r["throughput_per_sec"] > 0,
                          f"throughput_per_sec > 0 for batch_size={bs}")

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
    test_batch_scaling()
