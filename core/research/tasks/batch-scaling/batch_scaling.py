"""
Batch Scaling Benchmark — Liem OS Research Engine
==================================================
Measures prediction throughput (samples/sec) and median latency (ms) for
a TF-IDF + LogisticRegression pipeline across increasing batch sizes.
"""

# =============================================================================
# CONFIG
# =============================================================================
import os

INPUT_DATA   = os.path.join("dummy_data", "sample.csv")  # Path to input CSV
MODEL_PATH   = os.path.join("dummy_data", "model.pkl")   # Pre-trained model (optional)
OUTPUT_DIR   = "output"                                   # Directory for outputs
BATCH_SIZES  = [1, 4, 8, 16, 32]                         # Batch sizes to benchmark
N_REPEATS    = 30                                         # Timing repetitions per batch size
SEED         = 42                                         # Reproducibility seed
TEXT_COLUMN  = "text"                                     # CSV column for raw text
LABEL_COLUMN = "label"                                    # CSV column for labels
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
# Model loader / trainer
# ---------------------------------------------------------------------------

def load_or_train(input_csv: str, model_pkl: str, seed: int) -> Pipeline:
    """Load a serialised pipeline or train a quick baseline."""
    if os.path.exists(model_pkl):
        print(f"✓ Loading model from {model_pkl}")
        with open(model_pkl, "rb") as f:
            return pickle.load(f)

    print("✓ No model found — training quick TF-IDF + LR …")
    df     = pd.read_csv(input_csv)
    texts  = df[TEXT_COLUMN].astype(str).tolist()
    labels = df[LABEL_COLUMN].astype(str).tolist()
    pipe   = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=3000)),
        ("clf",   LogisticRegression(max_iter=500, random_state=seed)),
    ])
    pipe.fit(texts, labels)
    return pipe


# ---------------------------------------------------------------------------
# Timing helper
# ---------------------------------------------------------------------------

def bench_batch(pipe: Pipeline, batch: list, n_repeats: int) -> list:
    """Return sorted list of prediction wall-clock times in ms."""
    latencies = []
    for _ in range(n_repeats):
        t0 = time.perf_counter()
        pipe.predict(batch)
        latencies.append((time.perf_counter() - t0) * 1_000)
    return sorted(latencies)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("✓ Loading data …")
    df    = pd.read_csv(INPUT_DATA)
    texts = df[TEXT_COLUMN].astype(str).tolist()
    pipe  = load_or_train(INPUT_DATA, MODEL_PATH, SEED)

    # Ensure we have enough data for the largest batch
    pool = (texts * (max(BATCH_SIZES) // len(texts) + 2))[:max(BATCH_SIZES) * 10]

    batch_results = []
    print(f"✓ Benchmarking {len(BATCH_SIZES)} batch sizes × {N_REPEATS} reps each …")

    for bs in BATCH_SIZES:
        batch = pool[:bs]
        lats  = bench_batch(pipe, batch, N_REPEATS)
        med_ms    = float(np.median(lats))
        med_sec   = med_ms / 1_000
        throughput = bs / med_sec if med_sec > 0 else 0.0
        batch_results.append({
            "batch_size":         bs,
            "median_latency_ms":  round(med_ms, 4),
            "throughput_per_sec": round(throughput, 2),
        })
        print(f"  batch={bs:2d}  median={med_ms:.3f} ms  throughput={throughput:.1f} samples/sec")

    # ── report.json ──────────────────────────────────────────────────────────
    report_path = os.path.join(OUTPUT_DIR, "report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump({"batch_results": batch_results}, f, indent=2)
    print(f"✓ report.json saved → {report_path}")

    # ── Dual-axis plot ───────────────────────────────────────────────────────
    sizes       = [r["batch_size"]         for r in batch_results]
    lats        = [r["median_latency_ms"]  for r in batch_results]
    throughputs = [r["throughput_per_sec"] for r in batch_results]

    fig, ax1 = plt.subplots(figsize=(9, 5))
    color1 = "#4C72B0"
    ax1.set_xlabel("Batch Size")
    ax1.set_ylabel("Median Latency (ms)", color=color1)
    ax1.plot(sizes, lats, marker="o", color=color1, linewidth=2, label="Latency (ms)")
    ax1.tick_params(axis="y", labelcolor=color1)

    ax2 = ax1.twinx()
    color2 = "#DD8452"
    ax2.set_ylabel("Throughput (samples/sec)", color=color2)
    ax2.plot(sizes, throughputs, marker="s", color=color2, linewidth=2, linestyle="--", label="Throughput")
    ax2.tick_params(axis="y", labelcolor=color2)

    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, loc="upper left")
    ax1.set_title("Batch Scaling — Latency & Throughput vs Batch Size")
    plt.xticks(sizes)
    plt.tight_layout()
    plot_path = os.path.join(OUTPUT_DIR, "plot.png")
    plt.savefig(plot_path, dpi=150)
    plt.close()
    print(f"✓ plot.png saved → {plot_path}")


if __name__ == "__main__":
    main()
