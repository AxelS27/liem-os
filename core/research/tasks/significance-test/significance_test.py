"""
significance_test.py — Liem OS Research Task: Statistical Significance Testing
Auto-selects or runs specified statistical significance test.

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
INPUT_DATA   = os.path.join(os.path.dirname(__file__), "dummy_data", "experiment_sample.csv")
OUTPUT_DIR   = os.path.join(os.path.dirname(__file__), "output")
TEST_TYPE    = "auto"    # "auto" | "t-test" | "mann-whitney" | "chi-square" | "mcnemar"
GROUP_COLUMN = "group"   # column that defines groups (e.g., "group" with values A/B)
VALUE_COLUMN = "score"   # column with the outcome to test
ALPHA        = 0.05      # significance level
# ───────────────────────────────────────────────────────────────────────────────


def detect_test_type(df, group_col, value_col):
    """Infer the best test based on data characteristics."""
    groups = df[group_col].unique()
    n_groups = len(groups)
    value_series = df[value_col]

    is_numeric = pd.api.types.is_numeric_dtype(value_series)
    is_binary_outcome = value_series.nunique() == 2

    if n_groups == 2 and is_numeric:
        return "t-test"
    elif n_groups == 2 and is_binary_outcome:
        return "mcnemar"
    elif not is_numeric:
        return "chi-square"
    else:
        return "mann-whitney"


def compute_cohens_d(group_a, group_b):
    """Cohen's d effect size for two groups."""
    pooled_std = np.sqrt((group_a.std() ** 2 + group_b.std() ** 2) / 2)
    if pooled_std == 0:
        return 0.0
    return float((group_a.mean() - group_b.mean()) / pooled_std)


def compute_cramers_v(contingency_table):
    """Cramér's V effect size for chi-square."""
    chi2, _, _, _ = scipy_stats.chi2_contingency(contingency_table)
    n = contingency_table.sum().sum()
    k = min(contingency_table.shape) - 1
    if n == 0 or k == 0:
        return 0.0
    return float(np.sqrt(chi2 / (n * k)))


def run_ttest(df, group_col, value_col, alpha):
    groups = df[group_col].unique()[:2]
    a = df[df[group_col] == groups[0]][value_col].dropna()
    b = df[df[group_col] == groups[1]][value_col].dropna()
    stat, p = scipy_stats.ttest_ind(a, b, equal_var=False)  # Welch's t-test
    effect = compute_cohens_d(a, b)
    return {
        "test_used":     "t-test (Welch)",
        "statistic":     round(float(stat), 4),
        "p_value":       round(float(p), 6),
        "significant":   bool(p < alpha),
        "alpha":         alpha,
        "effect_size":   round(effect, 4),
        "effect_metric": "Cohen's d",
        "groups":        [str(g) for g in groups],
        "group_means":   {str(groups[0]): round(float(a.mean()), 4),
                          str(groups[1]): round(float(b.mean()), 4)},
        "interpretation": (
            f"Statistically significant difference between groups "
            f"({groups[0]} vs {groups[1]}), p={p:.4f}."
            if p < alpha else
            f"No statistically significant difference between groups "
            f"({groups[0]} vs {groups[1]}), p={p:.4f}."
        ),
    }, a, b, groups


def run_mann_whitney(df, group_col, value_col, alpha):
    groups = df[group_col].unique()[:2]
    a = df[df[group_col] == groups[0]][value_col].dropna()
    b = df[df[group_col] == groups[1]][value_col].dropna()
    stat, p = scipy_stats.mannwhitneyu(a, b, alternative="two-sided")
    n = len(a) + len(b)
    effect = float(stat / (len(a) * len(b))) if (len(a) * len(b)) > 0 else 0.0
    return {
        "test_used":      "Mann-Whitney U",
        "statistic":      round(float(stat), 4),
        "p_value":        round(float(p), 6),
        "significant":    bool(p < alpha),
        "alpha":          alpha,
        "effect_size":    round(effect, 4),
        "effect_metric":  "rank-biserial r",
        "groups":         [str(g) for g in groups],
        "interpretation": (
            f"Significant rank-order difference between {groups[0]} and {groups[1]}, p={p:.4f}."
            if p < alpha else
            f"No significant rank-order difference between {groups[0]} and {groups[1]}, p={p:.4f}."
        ),
    }, a, b, groups


def run_chi_square(df, group_col, value_col, alpha):
    contingency = pd.crosstab(df[group_col], df[value_col])
    chi2, p, dof, expected = scipy_stats.chi2_contingency(contingency)
    effect = compute_cramers_v(contingency)
    return {
        "test_used":     "Chi-square",
        "statistic":     round(float(chi2), 4),
        "p_value":       round(float(p), 6),
        "significant":   bool(p < alpha),
        "alpha":         alpha,
        "dof":           int(dof),
        "effect_size":   round(effect, 4),
        "effect_metric": "Cramér's V",
        "interpretation": (
            f"Significant association between {group_col} and {value_col}, p={p:.4f}."
            if p < alpha else
            f"No significant association between {group_col} and {value_col}, p={p:.4f}."
        ),
    }, contingency, None, None


def run_mcnemar(df, group_col, value_col, alpha):
    """McNemar test for paired binary data (expects 2 groups, binary outcome)."""
    groups = df[group_col].unique()[:2]
    # Build 2x2 contingency (treated as paired binary classification)
    pivot = pd.crosstab(df[group_col], df[value_col])
    # Use chi-square on 2x2 as proxy for binary comparison
    chi2, p, dof, _ = scipy_stats.chi2_contingency(pivot)
    return {
        "test_used":     "McNemar (binary chi-square)",
        "statistic":     round(float(chi2), 4),
        "p_value":       round(float(p), 6),
        "significant":   bool(p < alpha),
        "alpha":         alpha,
        "effect_size":   round(compute_cramers_v(pivot), 4),
        "effect_metric": "Cramér's V",
        "interpretation": (
            f"Significant difference in binary outcomes between groups, p={p:.4f}."
            if p < alpha else
            f"No significant difference in binary outcomes between groups, p={p:.4f}."
        ),
    }, pivot, None, None


def plot_results(result, df, group_col, value_col, output_path):
    """Save result visualization based on test type."""
    test = result.get("test_used", "")
    fig, ax = plt.subplots(figsize=(7, 5))

    if "t-test" in test or "Mann-Whitney" in test:
        groups = df[group_col].unique()[:2]
        data_by_group = [df[df[group_col] == g][value_col].dropna() for g in groups]
        bp = ax.boxplot(data_by_group, patch_artist=True,
                        labels=[str(g) for g in groups],
                        boxprops=dict(facecolor="#4C72B0", alpha=0.7),
                        medianprops=dict(color="crimson", linewidth=2))
        ax.set_title(f"{test}\np={result['p_value']} (α={result['alpha']})",
                     fontsize=11, fontweight="bold")
        ax.set_xlabel(group_col)
        ax.set_ylabel(value_col)
        sig_text = "★ Significant" if result["significant"] else "✗ Not significant"
        ax.text(0.97, 0.97, sig_text,
                transform=ax.transAxes, ha="right", va="top",
                fontsize=10, color="crimson" if result["significant"] else "grey",
                fontweight="bold")
    else:
        # Chi-square / McNemar — bar chart of counts
        contingency = pd.crosstab(df[group_col], df[value_col])
        contingency.plot(kind="bar", ax=ax, colormap="Paired", edgecolor="white")
        ax.set_title(f"{test}\np={result['p_value']} (α={result['alpha']})",
                     fontsize=11, fontweight="bold")
        ax.set_xlabel(group_col)
        ax.set_ylabel("Count")
        plt.setp(ax.get_xticklabels(), rotation=0)
        sig_text = "★ Significant" if result["significant"] else "✗ Not significant"
        ax.text(0.97, 0.97, sig_text,
                transform=ax.transAxes, ha="right", va="top",
                fontsize=10, color="crimson" if result["significant"] else "grey",
                fontweight="bold")

    plt.tight_layout()
    plt.savefig(output_path, dpi=120, bbox_inches="tight")
    plt.close()


def run(input_data=None, output_dir=None, test_type=None,
        group_column=None, value_column=None, alpha=None):
    """Main entry point. Accepts overrides for testing."""
    input_data   = input_data    or INPUT_DATA
    output_dir   = output_dir   or OUTPUT_DIR
    test_type    = test_type    or TEST_TYPE
    group_column = group_column or GROUP_COLUMN
    value_column = value_column or VALUE_COLUMN
    alpha        = alpha        if alpha is not None else ALPHA

    os.makedirs(output_dir, exist_ok=True)

    print("📂 Loading data from:", input_data)
    df = pd.read_csv(input_data)
    print(f"  ✓ Loaded {len(df)} rows × {len(df.columns)} columns")

    # ── Auto-detect test ───────────────────────────────────────────────────────
    if test_type == "auto":
        test_type = detect_test_type(df, group_column, value_column)
        print(f"  ✓ Auto-selected test: {test_type}")
    else:
        print(f"  ✓ Using test: {test_type}")

    # ── Run test ───────────────────────────────────────────────────────────────
    if test_type == "t-test":
        result, *_ = run_ttest(df, group_column, value_column, alpha)
    elif test_type == "mann-whitney":
        result, *_ = run_mann_whitney(df, group_column, value_column, alpha)
    elif test_type == "chi-square":
        result, *_ = run_chi_square(df, group_column, value_column, alpha)
    elif test_type == "mcnemar":
        result, *_ = run_mcnemar(df, group_column, value_column, alpha)
    else:
        raise ValueError(f"Unknown TEST_TYPE: {test_type}")

    result["meta"] = {
        "input_file":   os.path.basename(input_data),
        "n_rows":       int(len(df)),
        "group_column": group_column,
        "value_column": value_column,
    }

    print(f"  ✓ Test complete — p={result['p_value']}, significant={result['significant']}")
    print(f"     {result['interpretation']}")

    report_path = os.path.join(output_dir, "report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"  ✓ Saved report → {report_path}")

    plot_path = os.path.join(output_dir, "plot.png")
    plot_results(result, df, group_column, value_column, plot_path)
    print(f"  ✓ Saved plot  → {plot_path}")

    print("✓ significance_test complete.")
    return result


if __name__ == "__main__":
    run()
