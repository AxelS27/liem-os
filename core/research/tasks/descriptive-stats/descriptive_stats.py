"""
descriptive_stats.py — Liem OS Research Task: Descriptive Statistics
Computes descriptive stats for survey/social-science/economics tabular data.

CONFIG — edit these variables before running:
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import stats

# ─── CONFIG ────────────────────────────────────────────────────────────────────
INPUT_DATA          = os.path.join(os.path.dirname(__file__), "dummy_data", "survey_sample.csv")
OUTPUT_DIR          = os.path.join(os.path.dirname(__file__), "output")
NUMERIC_COLUMNS     = "auto"   # list of col names, or "auto" to detect
CATEGORICAL_COLUMNS = "auto"   # list of col names, or "auto" to detect
GROUP_BY            = None     # e.g. "region" for grouped breakdown, or None
# ───────────────────────────────────────────────────────────────────────────────


def detect_columns(df):
    """Auto-detect numeric and categorical columns."""
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
    return numeric_cols, categorical_cols


def compute_numeric_stats(series):
    """Return dict of stats for a numeric column."""
    clean = series.dropna()
    return {
        "mean":     round(float(clean.mean()), 4),
        "median":   round(float(clean.median()), 4),
        "std":      round(float(clean.std()), 4),
        "min":      round(float(clean.min()), 4),
        "max":      round(float(clean.max()), 4),
        "q25":      round(float(clean.quantile(0.25)), 4),
        "q75":      round(float(clean.quantile(0.75)), 4),
        "skewness": round(float(stats.skew(clean)), 4),
        "n":        int(clean.count()),
        "missing":  int(series.isna().sum()),
    }


def compute_categorical_stats(series):
    """Return dict of stats for a categorical column."""
    clean = series.dropna()
    counts = clean.value_counts().to_dict()
    counts = {str(k): int(v) for k, v in counts.items()}
    return {
        "counts":       counts,
        "mode":         str(clean.mode().iloc[0]) if len(clean) > 0 else None,
        "unique_count": int(clean.nunique()),
        "n":            int(clean.count()),
        "missing":      int(series.isna().sum()),
    }


def compute_grouped_stats(df, numeric_cols, group_col):
    """Group-by breakdown for numeric columns."""
    grouped = {}
    for group_val, group_df in df.groupby(group_col):
        group_key = str(group_val)
        grouped[group_key] = {}
        for col in numeric_cols:
            if col != group_col:
                grouped[group_key][col] = compute_numeric_stats(group_df[col])
    return grouped


def plot_distributions(df, numeric_cols, categorical_cols, output_path):
    """Save distribution plots (histograms + bar charts)."""
    n_plots = len(numeric_cols) + len(categorical_cols)
    if n_plots == 0:
        return
    cols_per_row = 3
    n_rows = max(1, (n_plots + cols_per_row - 1) // cols_per_row)
    fig, axes = plt.subplots(n_rows, cols_per_row,
                             figsize=(5 * cols_per_row, 4 * n_rows))
    axes = np.array(axes).flatten()

    idx = 0
    for col in numeric_cols:
        ax = axes[idx]
        clean = df[col].dropna()
        ax.hist(clean, bins=20, color="#4C72B0", edgecolor="white", alpha=0.85)
        ax.set_title(f"{col} (numeric)", fontsize=10, fontweight="bold")
        ax.set_xlabel(col)
        ax.set_ylabel("Frequency")
        ax.axvline(clean.mean(), color="crimson", linestyle="--", linewidth=1.2, label="mean")
        ax.legend(fontsize=8)
        idx += 1

    for col in categorical_cols:
        ax = axes[idx]
        counts = df[col].value_counts()
        ax.bar(counts.index.astype(str), counts.values, color="#55A868", edgecolor="white", alpha=0.85)
        ax.set_title(f"{col} (categorical)", fontsize=10, fontweight="bold")
        ax.set_xlabel(col)
        ax.set_ylabel("Count")
        plt.setp(ax.get_xticklabels(), rotation=30, ha="right", fontsize=8)
        idx += 1

    for i in range(idx, len(axes)):
        axes[i].set_visible(False)

    plt.suptitle("Descriptive Statistics — Distributions", fontsize=13, fontweight="bold", y=1.01)
    plt.tight_layout()
    plt.savefig(output_path, dpi=120, bbox_inches="tight")
    plt.close()


def run(input_data=None, output_dir=None, numeric_columns=None,
        categorical_columns=None, group_by=None):
    """Main entry point. Accepts overrides for testing."""
    input_data          = input_data          or INPUT_DATA
    output_dir          = output_dir          or OUTPUT_DIR
    numeric_columns     = numeric_columns     or NUMERIC_COLUMNS
    categorical_columns = categorical_columns or CATEGORICAL_COLUMNS
    group_by            = group_by            if group_by is not None else GROUP_BY

    os.makedirs(output_dir, exist_ok=True)

    print("📂 Loading data from:", input_data)
    df = pd.read_csv(input_data)
    print(f"  ✓ Loaded {len(df)} rows × {len(df.columns)} columns")

    # ── Column detection ───────────────────────────────────────────────────────
    if numeric_columns == "auto" or numeric_columns is None:
        numeric_cols, cat_cols = detect_columns(df)
    else:
        numeric_cols = list(numeric_columns)
        _, auto_cat = detect_columns(df)
        cat_cols = list(categorical_columns) if categorical_columns != "auto" else auto_cat

    if group_by and group_by in numeric_cols:
        numeric_cols = [c for c in numeric_cols if c != group_by]

    print(f"  ✓ Numeric columns  : {numeric_cols}")
    print(f"  ✓ Categorical cols : {cat_cols}")

    # ── Compute stats ──────────────────────────────────────────────────────────
    report = {"numeric": {}, "categorical": {}, "grouped": {}}

    for col in numeric_cols:
        report["numeric"][col] = compute_numeric_stats(df[col])
        print(f"  ✓ Stats computed for numeric column: {col}")

    for col in cat_cols:
        report["categorical"][col] = compute_categorical_stats(df[col])
        print(f"  ✓ Stats computed for categorical column: {col}")

    if group_by and group_by in df.columns:
        report["grouped"] = compute_grouped_stats(df, numeric_cols, group_by)
        print(f"  ✓ Group-by breakdown for: {group_by}")

    report["meta"] = {
        "input_file":       os.path.basename(input_data),
        "n_rows":           int(len(df)),
        "n_numeric_cols":   len(numeric_cols),
        "n_categorical_cols": len(cat_cols),
        "group_by":         group_by,
    }

    # ── Save report.json ───────────────────────────────────────────────────────
    report_path = os.path.join(output_dir, "report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"  ✓ Saved report → {report_path}")

    # ── Save plot.png ──────────────────────────────────────────────────────────
    plot_path = os.path.join(output_dir, "plot.png")
    plot_distributions(df, numeric_cols, cat_cols, plot_path)
    print(f"  ✓ Saved plot  → {plot_path}")

    print("✓ descriptive_stats complete.")
    return report


if __name__ == "__main__":
    run()
