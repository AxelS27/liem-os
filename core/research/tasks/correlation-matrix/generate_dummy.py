"""
generate_dummy.py — Correlation Matrix Task
Generates deterministic economics data with built-in correlations for testing.
SEED=42, 200 rows.
"""

import os
import numpy as np
import pandas as pd

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SEED       = 42
N_ROWS     = 200
OUTPUT_DIR  = os.path.join(os.path.dirname(__file__), "dummy_data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "economics_sample.csv")
# ───────────────────────────────────────────────────────────────────────────────


def generate(seed=SEED, n_rows=N_ROWS, output_file=None):
    output_file = output_file or OUTPUT_FILE
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    rng = np.random.default_rng(seed)

    # GDP: base economic series (standardised growth rates)
    gdp = rng.normal(loc=2.5, scale=1.2, size=n_rows)

    # Consumption: strongly positively correlated with GDP (~0.75)
    consumption = 0.75 * gdp + rng.normal(0, 0.7, n_rows)

    # Investment: moderately positively correlated with GDP (~0.55)
    investment = 0.55 * gdp + rng.normal(0, 1.0, n_rows)

    # Unemployment: negatively correlated with GDP (~-0.60)
    unemployment = -0.60 * gdp + rng.normal(5.0, 1.0, n_rows)
    unemployment = np.clip(unemployment, 1.0, 15.0)

    # Inflation: weakly correlated with unemployment (~0.25), noisy
    inflation = 0.25 * unemployment + rng.normal(2.5, 1.5, n_rows)
    inflation = np.clip(inflation, -2.0, 15.0)

    df = pd.DataFrame({
        "gdp":          gdp.round(4),
        "consumption":  consumption.round(4),
        "investment":   investment.round(4),
        "unemployment": unemployment.round(4),
        "inflation":    inflation.round(4),
    })

    df.to_csv(output_file, index=False)
    print(f"✓ Dummy data saved → {output_file} ({n_rows} rows)")
    print(f"  Columns: {list(df.columns)}")
    print(f"  GDP range: {df['gdp'].min():.2f} – {df['gdp'].max():.2f}")
    print(f"  Unemployment range: {df['unemployment'].min():.2f} – {df['unemployment'].max():.2f}")
    return df


if __name__ == "__main__":
    generate()
