"""
Error Analysis — Liem OS Research Engine
=========================================
Generates a confusion matrix, extracts top misclassified examples, and
tags each error with a heuristic error type (short_text, has_numbers,
has_url, long_text, other).
"""

# =============================================================================
# CONFIG
# =============================================================================
import os

INPUT_DATA    = os.path.join("dummy_data", "sample.csv")  # Path to input CSV
OUTPUT_DIR    = "output"                                   # Directory for outputs
LABEL_COLUMN  = "label"                                    # CSV column for class labels
TEXT_COLUMN   = "text"                                     # CSV column for raw text
TOP_N_ERRORS  = 20                                         # Max misclassified examples to export
TEST_SIZE     = 0.2                                        # Fraction held out for evaluation
SEED          = 42                                         # Reproducibility seed
MAX_ITER      = 1000                                       # LogisticRegression max iterations
# =============================================================================

import json
import re
import warnings

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    ConfusionMatrixDisplay,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

warnings.filterwarnings("ignore")


# ---------------------------------------------------------------------------
# Heuristic error tagger
# ---------------------------------------------------------------------------

def tag_error(text: str) -> str:
    """Assign a single heuristic label to a misclassified text."""
    if re.search(r"https?://\S+|www\.\S+", text):
        return "has_url"
    if re.search(r"\d", text):
        return "has_numbers"
    if len(text) < 10:
        return "short_text"
    if len(text) > 100:
        return "long_text"
    return "other"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("✓ Loading data …")
    df     = pd.read_csv(INPUT_DATA)
    texts  = df[TEXT_COLUMN].astype(str).tolist()
    labels = df[LABEL_COLUMN].astype(str).tolist()

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=TEST_SIZE, random_state=SEED, stratify=labels
    )

    print("✓ Training TF-IDF + LR …")
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
        ("clf",   LogisticRegression(max_iter=MAX_ITER, random_state=SEED)),
    ])
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)

    acc  = float(accuracy_score(y_test, y_pred))
    f1   = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
    print(f"  Accuracy  = {acc:.4f}")
    print(f"  Macro F1  = {f1:.4f}")

    # ── Confusion matrix plot ────────────────────────────────────────────────
    classes = sorted(set(labels))
    cm      = confusion_matrix(y_test, y_pred, labels=classes)
    fig, ax = plt.subplots(figsize=(7, 6))
    disp    = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=classes)
    disp.plot(ax=ax, colorbar=True, cmap="Blues")
    ax.set_title("Confusion Matrix")
    plt.tight_layout()
    cm_path = os.path.join(OUTPUT_DIR, "confusion_matrix.png")
    plt.savefig(cm_path, dpi=150)
    plt.close()
    print(f"✓ confusion_matrix.png saved → {cm_path}")

    # ── Misclassified examples ───────────────────────────────────────────────
    errors = [
        {"text": t, "true_label": str(yt), "pred_label": str(yp)}
        for t, yt, yp in zip(X_test, y_test, y_pred)
        if yt != yp
    ][:TOP_N_ERRORS]

    error_type_counts: dict = {"short_text": 0, "has_numbers": 0, "has_url": 0, "long_text": 0, "other": 0}
    for e in errors:
        et = tag_error(e["text"])
        e["error_type"] = et
        error_type_counts[et] += 1

    # Save misclassified.csv
    mis_path = os.path.join(OUTPUT_DIR, "misclassified.csv")
    pd.DataFrame(errors).to_csv(mis_path, index=False)
    print(f"✓ misclassified.csv saved → {mis_path}  ({len(errors)} rows)")

    # ── report.json ──────────────────────────────────────────────────────────
    report = {
        "accuracy":         round(acc, 4),
        "macro_f1":         round(f1, 4),
        "confusion_matrix": cm.tolist(),
        "error_types":      error_type_counts,
        "top_errors":       errors,
    }
    report_path = os.path.join(OUTPUT_DIR, "report.json")
    with open(report_path, "w", encoding="utf-8") as fp:
        json.dump(report, fp, indent=2)
    print(f"✓ report.json saved → {report_path}")


if __name__ == "__main__":
    main()
