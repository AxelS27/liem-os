"""
generate_dummy.py — Significance Test Task
Generates deterministic experiment data with two groups for testing.
SEED=42, 100 rows.
"""

import os
import numpy as np
import pandas as pd

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SEED       = 42
N_ROWS     = 100
OUTPUT_DIR  = os.path.join(os.path.dirname(__file__), "dummy_data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "experiment_sample.csv")
# ───────────────────────────────────────────────────────────────────────────────


def generate(seed=SEED, n_rows=N_ROWS, output_file=None):
    output_file = output_file or OUTPUT_FILE
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    rng = np.random.default_rng(seed)
    half = n_rows // 2

    # Group labels — balanced A/B split
    group = ["A"] * half + ["B"] * (n_rows - half)

    # Continuous outcome: group B has higher mean (designed to be significant)
    score_A = rng.normal(loc=65.0, scale=10.0, size=half)
    score_B = rng.normal(loc=75.0, scale=10.0, size=n_rows - half)
    score = np.concatenate([score_A, score_B]).round(2)
    score = np.clip(score, 0, 100)

    # Binary categorical outcome: pass/fail — group B passes more often
    pass_prob_A = 0.45
    pass_prob_B = 0.70
    outcome_A = rng.choice(["pass", "fail"], size=half,
                            p=[pass_prob_A, 1 - pass_prob_A])
    outcome_B = rng.choice(["pass", "fail"], size=n_rows - half,
                            p=[pass_prob_B, 1 - pass_prob_B])
    outcome = np.concatenate([outcome_A, outcome_B])

    # Shuffle rows deterministically
    idx = rng.permutation(n_rows)
    df = pd.DataFrame({
        "group":   np.array(group)[idx],
        "score":   score[idx],
        "outcome": outcome[idx],
    })

    df.to_csv(output_file, index=False)
    print(f"✓ Dummy data saved → {output_file} ({n_rows} rows)")
    print(f"  Group counts: {df['group'].value_counts().to_dict()}")
    print(f"  Score mean A: {df[df['group']=='A']['score'].mean():.2f}, "
          f"B: {df[df['group']=='B']['score'].mean():.2f}")
    print(f"  Pass rate A: {(df[df['group']=='A']['outcome']=='pass').mean():.2%}, "
          f"B: {(df[df['group']=='B']['outcome']=='pass').mean():.2%}")
    return df


if __name__ == "__main__":
    generate()
