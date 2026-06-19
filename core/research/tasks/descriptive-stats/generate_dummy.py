"""
generate_dummy.py — Descriptive Stats Task
Generates deterministic survey data for testing.
SEED=42, 150 rows.
"""

import os
import numpy as np
import pandas as pd

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SEED      = 42
N_ROWS    = 150
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "dummy_data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "survey_sample.csv")
# ───────────────────────────────────────────────────────────────────────────────

REGIONS = ["North", "South", "East", "West", "Central"]


def generate(seed=SEED, n_rows=N_ROWS, output_file=None):
    output_file = output_file or OUTPUT_FILE
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    rng = np.random.default_rng(seed)

    # Age: realistic distribution skewed toward working age
    age = rng.integers(18, 66, size=n_rows).astype(int)

    # Income: log-normal to mimic real income distributions
    income_raw = rng.lognormal(mean=10.9, sigma=0.6, size=n_rows)
    income = np.clip(income_raw, 20000, 150000).round(0).astype(int)

    # Education: ordinal 1–5, slightly skewed toward middle
    education_probs = [0.08, 0.17, 0.35, 0.28, 0.12]
    education = rng.choice([1, 2, 3, 4, 5], size=n_rows, p=education_probs)

    # Satisfaction: Likert 1–5, correlated weakly with income
    income_norm = (income - income.min()) / (income.max() - income.min())
    sat_base = rng.integers(1, 6, size=n_rows)
    satisfaction = np.clip(sat_base + (income_norm * 1.5 - 0.75).round(0).astype(int), 1, 5).astype(int)

    # Region: categorical, unequal distribution
    region_probs = [0.22, 0.28, 0.18, 0.20, 0.12]
    region = rng.choice(REGIONS, size=n_rows, p=region_probs)

    df = pd.DataFrame({
        "age":          age,
        "income":       income,
        "education":    education,
        "satisfaction": satisfaction,
        "region":       region,
    })

    df.to_csv(output_file, index=False)
    print(f"✓ Dummy data saved → {output_file} ({n_rows} rows)")
    print(f"  Columns: {list(df.columns)}")
    print(f"  Age range: {df['age'].min()}–{df['age'].max()}")
    print(f"  Income range: {df['income'].min():,}–{df['income'].max():,}")
    print(f"  Regions: {df['region'].value_counts().to_dict()}")
    return df


if __name__ == "__main__":
    generate()
