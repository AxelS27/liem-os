"""
Latency Decomposition — Liem OS Research Engine
================================================
Times each pipeline stage independently and reports p50/p95/p99 latency
in milliseconds plus each stage's percentage share of the total pipeline time.
"""

# =============================================================================
# CONFIG
# =============================================================================
import os

INPUT_DATA = os.path.join("dummy_data", "sample.csv")   # Path to input CSV
MODEL_PATH = os.path.join("dummy_data", "model.pkl")    # Pre-trained model (optional)
OUTPUT_DIR = "output"                                    # Directory for outputs
N_SAMPLES  = 200                                         # Rows to benchmark
N_REPEATS  = 50                                          # Timing repetitions per stage
SEED       = 42                                          # Reproducibility seed
TEXT_COLUMN = "text"                                     # CSV column for raw text
LABEL_COLUMN = "label"                                   # CSV column for labels
# =============================================================================

import json
import pickle
import re
import time
import warnings

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

warnings.filterwarnings("ignore")


# ---------------------------------------------------------------------------
# Pipeline stages
# ---------------------------------------------------------------------------

def stage1_preprocess(texts):
    """Lowercase, strip punctuation and extra whitespace."""
    return [re.sub(r"\s+", " ", re.sub(r"[^a-z0-9\s]", " ", t.lower())).strip()
            for t in texts]


def stage2_feature_extract(texts, vectorizer):
    """Transform cleaned texts into TF-IDF feature matrix."""
    return vectorizer.transform(texts)


def stage3_inference(X, clf):
    """Run classifier prediction on feature matrix."""
    return clf.predict(X)


# ---------------------------------------------------------------------------
# Timing helper
# ---------------------------------------------------------------------------

def time_stage(fn, *args, n_repeats: int = N_REPEATS):
    """Run fn(*args) n_repeats times; return sorted latency list in ms."""
    latencies = []
    for _ in range(n_repeats):
        t0 = time.perf_counter()
        fn(*args)
        latencies.append((time.perf_counter() - t0) * 1_000)
    return sorted(latencies)


def percentile(data, p):
    return float(np.percentile(data, p))


# ---------------------------------------------------------------------------
# Model loader / trainer
# ---------------------------------------------------------------------------

def load_or_train(input_csv: str, model_pkl: str, seed: int):
    if os.path.exists(model_pkl):
        print(f"✓ Loading model from {model_pkl}")
        with open(model_pkl, "rb") as f:
            return pickle.load(f)

    print("✓ No model found — training quick TF-IDF + LR …")
    df = pd.read_csv(input_csv)
    texts  = df[TEXT_COLUMN].astype(str).tolist()
    labels = df[LABEL_COLUMN].astype(str).tolist()
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=3000)),
        ("clf",   LogisticRegression(max_iter=500, random_state=seed)),
    ])
    pipe.fit(texts, labels)
    return pipe


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("✓ Loading data …")
    df = pd.read_csv(INPUT_DATA)
    texts = df[TEXT_COLUMN].astype(str).head(N_SAMPLES).tolist()

    pipe = load_or_train(INPUT_DATA, MODEL_PATH, SEED)

    vectorizer = pipe.named_steps["tfidf"]
    clf        = pipe.named_steps["clf"]

    # ── Stage 1: preprocess ─────────────────────────────────────────────────
    print(f"✓ Timing stage1_preprocess  ({N_REPEATS} reps) …")
    lat1 = time_stage(stage1_preprocess, texts, n_repeats=N_REPEATS)
    clean_texts = stage1_preprocess(texts)

    # ── Stage 2: feature extraction ─────────────────────────────────────────
    print(f"✓ Timing stage2_feature_extract ({N_REPEATS} reps) …")
    lat2 = time_stage(stage2_feature_extract, clean_texts, vectorizer, n_repeats=N_REPEATS)
    X    = stage2_feature_extract(clean_texts, vectorizer)

    # ── Stage 3: inference ──────────────────────────────────────────────────
    print(f"✓ Timing stage3_inference ({N_REPEATS} reps) …")
    lat3 = time_stage(stage3_inference, X, clf, n_repeats=N_REPEATS)

    # ── Aggregate ───────────────────────────────────────────────────────────
    stage_data = [
        ("stage1_preprocess",     lat1),
        ("stage2_feature_extract", lat2),
        ("stage3_inference",      lat3),
    ]

    medians = [percentile(d, 50) for _, d in stage_data]
    total   = sum(medians) or 1.0  # avoid div-by-zero

    stages_out = []
    for (name, data), med in zip(stage_data, medians):
        p50 = percentile(data, 50)
        p95 = percentile(data, 95)
        p99 = percentile(data, 99)
        pct = round(med / total * 100, 2)
        stages_out.append({
            "name":      name,
            "p50":       round(p50, 4),
            "p95":       round(p95, 4),
            "p99":       round(p99, 4),
            "pct_share": pct,
        })
        print(f"  {name:28s} p50={p50:.3f}ms  p95={p95:.3f}ms  p99={p99:.3f}ms  ({pct:.1f}%)")

    # ── report.json ──────────────────────────────────────────────────────────
    report_path = os.path.join(OUTPUT_DIR, "report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump({"stages": stages_out}, f, indent=2)
    print(f"✓ report.json saved → {report_path}")

    # ── plot.png (stacked bar) ───────────────────────────────────────────────
    names     = [s["name"]    for s in stages_out]
    p50_vals  = [s["p50"]     for s in stages_out]
    p95_vals  = [s["p95"]     for s in stages_out]
    p99_vals  = [s["p99"]     for s in stages_out]

    x = np.arange(len(names))
    w = 0.25
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.bar(x - w,  p50_vals, w, label="p50", color="#4C72B0")
    ax.bar(x,      p95_vals, w, label="p95", color="#DD8452")
    ax.bar(x + w,  p99_vals, w, label="p99", color="#55A868")
    ax.set_xticks(x)
    ax.set_xticklabels(names, rotation=15, ha="right")
    ax.set_ylabel("Latency (ms)")
    ax.set_title("Latency Decomposition — p50 / p95 / p99 per Stage")
    ax.legend()
    plt.tight_layout()
    plot_path = os.path.join(OUTPUT_DIR, "plot.png")
    plt.savefig(plot_path, dpi=150)
    plt.close()
    print(f"✓ plot.png saved → {plot_path}")


if __name__ == "__main__":
    main()
