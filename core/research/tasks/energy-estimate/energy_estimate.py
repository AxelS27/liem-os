"""
Energy Estimate — Liem OS Research Engine
==========================================
Estimates inference energy consumption (Joules, Wh) and CO₂ equivalent
per sample using wall-clock CPU time × TDP proxy method.
"""

# =============================================================================
# CONFIG
# =============================================================================
import os

INPUT_DATA               = os.path.join("dummy_data", "sample.csv")  # Path to input CSV
MODEL_PATH               = os.path.join("dummy_data", "model.pkl")   # Pre-trained model (optional)
OUTPUT_DIR               = "output"                                   # Directory for outputs
CPU_TDP_WATTS            = 15.0    # Thermal Design Power of typical laptop CPU (watts)
GRID_CARBON_INTENSITY    = 0.233   # kg CO₂ per kWh (world average, IEA 2022)
N_SAMPLES_TO_BENCHMARK   = 100     # Number of samples to run for timing
SEED                     = 42      # Reproducibility seed
TEXT_COLUMN              = "text"  # CSV column for raw text
LABEL_COLUMN             = "label" # CSV column for labels
# =============================================================================

import json
import pickle
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
# Main
# ---------------------------------------------------------------------------

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("✓ Loading data …")
    df      = pd.read_csv(INPUT_DATA)
    texts   = df[TEXT_COLUMN].astype(str).tolist()
    n_avail = len(texts)
    # If we need more samples than available, tile the data
    pool    = (texts * (N_SAMPLES_TO_BENCHMARK // n_avail + 2))[:N_SAMPLES_TO_BENCHMARK]

    pipe = load_or_train(INPUT_DATA, MODEL_PATH, SEED)

    # ── Benchmark ─────────────────────────────────────────────────────────
    print(f"✓ Running {N_SAMPLES_TO_BENCHMARK} predictions for timing …")
    t_start = time.perf_counter()
    pipe.predict(pool)
    cpu_time_total = time.perf_counter() - t_start

    # ── Energy calculations ───────────────────────────────────────────────
    # Joules = watts × seconds (assuming 100% CPU utilisation during inference)
    energy_total_joules       = CPU_TDP_WATTS * cpu_time_total
    energy_per_sample_joules  = energy_total_joules / N_SAMPLES_TO_BENCHMARK
    energy_per_sample_wh      = energy_per_sample_joules / 3_600
    # CO₂ in grams  = (Wh / 1000) × kgCO2/kWh × 1000g/kg
    co2_per_sample_g          = energy_per_sample_wh * GRID_CARBON_INTENSITY * 1_000
    co2_per_million_samples_kg = co2_per_sample_g * 1_000_000 / 1_000
    throughput_per_sec        = N_SAMPLES_TO_BENCHMARK / cpu_time_total

    print(f"  CPU time total     : {cpu_time_total:.4f} s")
    print(f"  Energy / sample    : {energy_per_sample_joules:.6f} J  ({energy_per_sample_wh * 1e6:.4f} µWh)")
    print(f"  CO₂ / sample       : {co2_per_sample_g:.6f} g")
    print(f"  CO₂ / 1M samples   : {co2_per_million_samples_kg:.4f} kg")
    print(f"  Throughput         : {throughput_per_sec:.2f} samples/sec")

    # ── report.json ──────────────────────────────────────────────────────
    report = {
        "cpu_time_total_sec":         round(cpu_time_total, 6),
        "energy_per_sample_joules":   round(energy_per_sample_joules, 8),
        "energy_per_sample_wh":       round(energy_per_sample_wh, 12),
        "co2_per_sample_g":           round(co2_per_sample_g, 8),
        "co2_per_million_samples_kg": round(co2_per_million_samples_kg, 6),
        "throughput_per_sec":         round(throughput_per_sec, 4),
        "assumptions": {
            "cpu_tdp_watts":         CPU_TDP_WATTS,
            "grid_carbon_intensity": GRID_CARBON_INTENSITY,
            "n_samples_benchmarked": N_SAMPLES_TO_BENCHMARK,
        },
    }
    report_path = os.path.join(OUTPUT_DIR, "report.json")
    with open(report_path, "w", encoding="utf-8") as fp:
        json.dump(report, fp, indent=2)
    print(f"✓ report.json saved → {report_path}")

    # ── Comparison bar chart ─────────────────────────────────────────────
    labels_plot  = ["Energy/sample\n(µJ)", "CO₂/sample\n(µg)", "CO₂/1M samples\n(g)"]
    scale_joules = energy_per_sample_joules * 1e6
    scale_co2_ug = co2_per_sample_g * 1e6
    scale_co2_1m = co2_per_million_samples_kg * 1e3   # → grams
    values = [scale_joules, scale_co2_ug, scale_co2_1m]
    colors = ["#4C72B0", "#55A868", "#DD8452"]

    fig, axes = plt.subplots(1, 3, figsize=(11, 5))
    for ax, lbl, val, clr in zip(axes, labels_plot, values, colors):
        ax.bar([lbl], [val], color=clr, edgecolor="white")
        ax.bar_label(ax.containers[0], fmt="%.3f", padding=3)
        ax.set_title(lbl.replace("\n", " "))
        ax.set_ylim(0, val * 1.4 + 1e-12)

    fig.suptitle(
        f"Energy & CO₂ Estimates  |  TDP={CPU_TDP_WATTS}W  |  "
        f"Grid={GRID_CARBON_INTENSITY} kg CO₂/kWh",
        fontsize=11,
    )
    plt.tight_layout()
    plot_path = os.path.join(OUTPUT_DIR, "plot.png")
    plt.savefig(plot_path, dpi=150)
    plt.close()
    print(f"✓ plot.png saved → {plot_path}")


if __name__ == "__main__":
    main()
