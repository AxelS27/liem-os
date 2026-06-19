"""
correlation_matrix.py — Liem OS Research Task: Correlation Matrix
Computes and visualizes Pearson/Spearman/Kendall correlation matrices.

CONFIG — edit these variables before running:
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import stats as scipy_stats

# ─── CONFIG ────────────────────────────────────────────────────────────────────
INPUT_DATA               = os.path.join(os.path.dirname(__file__), "dummy_data", "economics_sample.csv")
OUTPUT_DIR               = os.path.join(os.path.dirname(__file__), "output")
METHOD                   = "pearson"   # "pearson" | "spearman" | "kendall"
MIN_CORRELATION_THRESHOLD = 0.3        # abs(r) >= this value → "strong correlation"
# ───────────────────────────────────────────────────────────────────────────────


def compute_correlation_matrix(df, method):
    """Return pandas correlation DataFrame using scipy for full matrix."""
    numeric_df = df.select_dtypes(include=[np.number])
    return numeric_df.corr(method=method), list(numeric_df.columns)


def interpret_r(r, method):
    """Return plain-language interpretation of correlation strength."""
    abs_r = abs(r)
    direction = "positive" if r > 0 else "negative"
    if abs_r >= 0.7:
        strength = "strong"
    elif abs_r >= 0.4:
        strength = "moderate"
    elif abs_r >= 0.2:
        strength = "weak"
    else:
        strength = "negligible"
    return f"{strength} {direction} {method} correlation"


def find_strong_correlations(corr_matrix, columns, threshold, method):
    """Extract pairs with abs(r) >= threshold (excluding self-correlations)."""
    strong = []
    for i, col_a in enumerate(columns):
        for j, col_b in enumerate(columns):
            if j <= i:
                continue
            r = corr_matrix.loc[col_a, col_b]
            if abs(r) >= threshold:
                strong.append({
                    "col_a":          col_a,
                    "col_b":          col_b,
                    "r":              round(float(r), 4),
                    "interpretation": interpret_r(r, method),
                })
    strong.sort(key=lambda x: abs(x["r"]), reverse=True)
    return strong


def plot_heatmap(corr_matrix, columns, method, output_path):
    """Draw correlation heatmap with matplotlib (no seaborn)."""
    data = corr_matrix.values
    n = len(columns)

    fig, ax = plt.subplots(figsize=(max(6, n * 1.2), max(5, n * 1.1)))
    im = ax.imshow(data, vmin=-1, vmax=1, cmap="RdYlGn", aspect="auto")

    ax.set_xticks(range(n))
    ax.set_yticks(range(n))
    ax.set_xticklabels(columns, rotation=45, ha="right", fontsize=9)
    ax.set_yticklabels(columns, fontsize=9)

    for i in range(n):
        for j in range(n):
            val = data[i, j]
            color = "black" if abs(val) < 0.7 else "white"
            ax.text(j, i, f"{val:.2f}", ha="center", va="center",
                    fontsize=8, color=color, fontweight="bold")

    cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label(f"{method.capitalize()} r", fontsize=9)

    ax.set_title(f"Correlation Matrix ({method.capitalize()})",
                 fontsize=13, fontweight="bold", pad=12)
    plt.tight_layout()
    plt.savefig(output_path, dpi=120, bbox_inches="tight")
    plt.close()


def run(input_data=None, output_dir=None, method=None, threshold=None):
    """Main entry point. Accepts overrides for testing."""
    input_data = input_data or INPUT_DATA
    output_dir = output_dir or OUTPUT_DIR
    method     = method     or METHOD
    threshold  = threshold  if threshold is not None else MIN_CORRELATION_THRESHOLD

    assert method in ("pearson", "spearman", "kendall"), \
        f"METHOD must be 'pearson', 'spearman', or 'kendall'. Got: {method}"

    os.makedirs(output_dir, exist_ok=True)

    print("📂 Loading data from:", input_data)
    df = pd.read_csv(input_data)
    print(f"  ✓ Loaded {len(df)} rows × {len(df.columns)} columns")

    corr_matrix, columns = compute_correlation_matrix(df, method)
    print(f"  ✓ Correlation matrix computed ({method}) for {len(columns)} columns")

    strong_corrs = find_strong_correlations(corr_matrix, columns, threshold, method)
    print(f"  ✓ Found {len(strong_corrs)} strong correlation(s) (|r| ≥ {threshold})")

    # Full matrix as nested dict
    matrix_dict = {}
    for col_a in columns:
        matrix_dict[col_a] = {}
        for col_b in columns:
            matrix_dict[col_a][col_b] = round(float(corr_matrix.loc[col_a, col_b]), 4)

    report = {
        "method":             method,
        "threshold":          threshold,
        "columns":            columns,
        "matrix":             matrix_dict,
        "strong_correlations": strong_corrs,
        "meta": {
            "input_file": os.path.basename(input_data),
            "n_rows":     int(len(df)),
            "n_columns":  len(columns),
        },
    }

    report_path = os.path.join(output_dir, "report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"  ✓ Saved report → {report_path}")

    plot_path = os.path.join(output_dir, "plot.png")
    plot_heatmap(corr_matrix, columns, method, plot_path)
    print(f"  ✓ Saved heatmap → {plot_path}")

    print("✓ correlation_matrix complete.")
    return report


if __name__ == "__main__":
    run()
