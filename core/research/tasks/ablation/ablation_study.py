"""
Ablation Study — Liem OS Research Engine
=========================================
Removes one preprocessing step at a time and measures impact on Macro F1.
"""

# =============================================================================
# CONFIG
# =============================================================================
import os

INPUT_DATA   = os.path.join("dummy_data", "sample.csv")   # Path to input CSV
SLANG_DICT   = os.path.join("dummy_data", "slang_dict.csv")  # Slang lookup CSV
OUTPUT_DIR   = "output"                                    # Directory for outputs
SEED         = 42                                          # Random seed for reproducibility
LABEL_COLUMN = "label"                                     # CSV column for class labels
TEXT_COLUMN  = "text"                                      # CSV column for raw text
TEST_SIZE    = 0.2                                         # Fraction held out for evaluation
MAX_ITER     = 1000                                        # LogisticRegression max iterations
# =============================================================================

import re
import json
import pickle
import sys
import warnings

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Preprocessing stage functions
# ---------------------------------------------------------------------------

def _load_slang_dict(path: str) -> dict:
    """Load slang → normal word mapping from CSV."""
    if os.path.exists(path):
        df = pd.read_csv(path)
        return dict(zip(df["slang"].astype(str), df["normal"].astype(str)))
    return {}


def clean_text(text: str) -> str:
    """Stage 1 — Lowercase and strip punctuation/extra whitespace."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_slang(text: str, slang_map: dict) -> str:
    """Stage 2 — Replace slang tokens with canonical forms."""
    tokens = text.split()
    tokens = [slang_map.get(tok, tok) for tok in tokens]
    return " ".join(tokens)


def remove_elongation(text: str) -> str:
    """Stage 3 — Collapse repeated characters (e.g. 'bangettt' → 'banget')."""
    return re.sub(r"(.)\1{2,}", r"\1", text)


def split_clitic(text: str) -> str:
    """Stage 4 — Detach common Indonesian clitics (-nya, -ku, -mu, -kah, -lah)."""
    return re.sub(r"(nya|ku|mu|kah|lah)$", r" \1", text, flags=re.MULTILINE)


def full_pipeline(text: str, slang_map: dict) -> str:
    """Apply all stages in sequence."""
    text = clean_text(text)
    text = normalize_slang(text, slang_map)
    text = remove_elongation(text)
    text = split_clitic(text)
    return text


# ---------------------------------------------------------------------------
# Evaluation helper
# ---------------------------------------------------------------------------

def evaluate_config(name: str, texts_train, texts_test, y_train, y_test) -> float:
    """Train TF-IDF + LR pipeline and return Macro F1 on test set."""
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
        ("clf",   LogisticRegression(max_iter=MAX_ITER, random_state=SEED)),
    ])
    pipe.fit(texts_train, y_train)
    preds = pipe.predict(texts_test)
    f1 = f1_score(y_test, preds, average="macro", zero_division=0)
    return f1, pipe


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("✓ Loading data …")
    df = pd.read_csv(INPUT_DATA)
    texts = df[TEXT_COLUMN].astype(str).tolist()
    labels = df[LABEL_COLUMN].astype(str).tolist()
    slang_map = _load_slang_dict(SLANG_DICT)

    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        texts, labels, test_size=TEST_SIZE, random_state=SEED, stratify=labels
    )

    # Build preprocessed variants for each split
    def apply_stages(tokens, stages):
        """Apply a list of stage functions to each token in a list of texts."""
        out = []
        for t in tokens:
            for fn in stages:
                t = fn(t)
            out.append(t)
        return out

    configs = [
        ("Raw",      [],                                          ),
        ("+Clean",   [clean_text],                               ),
        ("+Slang",   [clean_text, lambda t: normalize_slang(t, slang_map)]),
        ("+Deelong", [clean_text, lambda t: normalize_slang(t, slang_map), remove_elongation]),
        ("+Clitic",  [clean_text, lambda t: normalize_slang(t, slang_map), remove_elongation, split_clitic]),
        ("Full",     [lambda t: full_pipeline(t, slang_map)],    ),
    ]

    results = []
    best_f1 = -1.0
    best_pipe = None

    print("✓ Running ablation …")
    for cfg_name, stage_fns in configs:
        tr = apply_stages(X_train_raw, stage_fns)
        te = apply_stages(X_test_raw,  stage_fns)
        f1, pipe = evaluate_config(cfg_name, tr, te, y_train, y_test)
        results.append({"name": cfg_name, "macro_f1": round(float(f1), 4)})
        print(f"  {cfg_name:12s} → Macro F1 = {f1:.4f}")
        if f1 > best_f1:
            best_f1, best_pipe = f1, pipe

    # Compute deltas relative to Raw baseline
    baseline = results[0]["macro_f1"]
    for r in results:
        r["delta"] = round(r["macro_f1"] - baseline, 4)

    # ── report.json ──────────────────────────────────────────────────────────
    report = {"configs": results}
    report_path = os.path.join(OUTPUT_DIR, "report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"✓ report.json saved → {report_path}")

    # ── plot.png ─────────────────────────────────────────────────────────────
    names  = [r["name"]    for r in results]
    f1vals = [r["macro_f1"] for r in results]
    fig, ax = plt.subplots(figsize=(9, 5))
    bars = ax.bar(names, f1vals, color="#4C72B0", edgecolor="white", linewidth=0.8)
    ax.bar_label(bars, fmt="%.3f", padding=3, fontsize=9)
    ax.set_ylim(0, 1.05)
    ax.set_xlabel("Ablation Config")
    ax.set_ylabel("Macro F1")
    ax.set_title("Ablation Study — Macro F1 per Pipeline Config")
    ax.axhline(baseline, color="gray", linestyle="--", linewidth=0.8, label="Raw baseline")
    ax.legend()
    plt.tight_layout()
    plot_path = os.path.join(OUTPUT_DIR, "plot.png")
    plt.savefig(plot_path, dpi=150)
    plt.close()
    print(f"✓ plot.png saved → {plot_path}")

    # ── model.pkl ────────────────────────────────────────────────────────────
    model_path = os.path.join(OUTPUT_DIR, "model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(best_pipe, f)
    print(f"✓ model.pkl saved → {model_path}  (best F1 = {best_f1:.4f})")


if __name__ == "__main__":
    main()
