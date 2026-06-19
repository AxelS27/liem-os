"""
generate_dummy.py — Energy Estimate
======================================
Generates seeded fake text data and a pre-trained TF-IDF + LR model.
Outputs:
  dummy_data/sample.csv  — 100 rows with 'text' and 'label' columns
  dummy_data/model.pkl   — Trained scikit-learn Pipeline
"""

# =============================================================================
# CONFIG
# =============================================================================
SEED    = 42    # Random seed — deterministic output
N_ROWS  = 100   # Number of text samples to generate
OUT_DIR = "dummy_data"
# =============================================================================

import os
import pickle
import random

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

random.seed(SEED)
np.random.seed(SEED)

VOCAB_GREEN = [
    "solar", "wind", "renewable", "sustainable", "eco", "green", "clean",
    "efficient", "recycle", "carbon-neutral", "organic", "biodegradable",
    "conservation", "nature", "environment", "hydro", "tidal", "geothermal",
    "biomass", "zero-emission",
]

VOCAB_FOSSIL = [
    "coal", "oil", "gas", "diesel", "petrol", "carbon", "emission", "smog",
    "pollute", "exhaust", "fuel", "pipeline", "refinery", "combustion",
    "drilling", "flaring", "soot", "greenhouse", "methane", "benzene",
]


def random_sentence(vocab: list, length_range=(5, 14)) -> str:
    n = random.randint(*length_range)
    return " ".join(random.choices(vocab, k=n))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # ── sample.csv ───────────────────────────────────────────────────────────
    rows = []
    for _ in range(N_ROWS // 2):
        rows.append({"text": random_sentence(VOCAB_GREEN),  "label": "green"})
    for _ in range(N_ROWS // 2):
        rows.append({"text": random_sentence(VOCAB_FOSSIL), "label": "fossil"})

    df = pd.DataFrame(rows).sample(frac=1, random_state=SEED).reset_index(drop=True)
    sample_path = os.path.join(OUT_DIR, "sample.csv")
    df.to_csv(sample_path, index=False)
    print(f"✓ sample.csv saved → {sample_path}  ({len(df)} rows)")

    # ── model.pkl ────────────────────────────────────────────────────────────
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=1000, ngram_range=(1, 2))),
        ("clf",   LogisticRegression(max_iter=300, random_state=SEED)),
    ])
    pipe.fit(df["text"].tolist(), df["label"].tolist())

    model_path = os.path.join(OUT_DIR, "model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(pipe, f)
    print(f"✓ model.pkl saved → {model_path}")


if __name__ == "__main__":
    main()
