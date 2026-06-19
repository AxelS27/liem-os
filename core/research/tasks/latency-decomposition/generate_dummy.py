"""
generate_dummy.py — Latency Decomposition
==========================================
Generates seeded fake text data and a pre-trained TF-IDF + LR model.
Outputs:
  dummy_data/sample.csv  — 100 rows with 'text' and 'label' columns
  dummy_data/model.pkl   — Trained scikit-learn Pipeline
"""

# =============================================================================
# CONFIG
# =============================================================================
SEED   = 42    # Random seed — deterministic output
N_ROWS = 100   # Number of text samples to generate
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

WORDS_POS = [
    "good", "great", "excellent", "wonderful", "positive", "happy",
    "nice", "kind", "warm", "safe", "helpful", "brilliant", "brave",
    "honest", "smart", "gentle", "peaceful", "joyful", "calm", "bright",
]

WORDS_NEG = [
    "bad", "hate", "terrible", "awful", "ugly", "dangerous", "violent",
    "angry", "evil", "cruel", "toxic", "wrong", "harmful", "stupid",
    "dirty", "corrupt", "lazy", "coward", "rude", "hostile",
]

FILLERS = ["the", "a", "is", "are", "very", "so", "quite", "just", "really", "this"]


def random_sentence(vocab: list, length_range=(5, 15)) -> str:
    n = random.randint(*length_range)
    tokens = []
    for _ in range(n):
        if random.random() < 0.25:
            tokens.append(random.choice(FILLERS))
        else:
            tokens.append(random.choice(vocab))
    return " ".join(tokens)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # ── sample.csv ───────────────────────────────────────────────────────────
    rows = []
    for _ in range(N_ROWS // 2):
        rows.append({"text": random_sentence(WORDS_POS), "label": "positive"})
    for _ in range(N_ROWS // 2):
        rows.append({"text": random_sentence(WORDS_NEG), "label": "negative"})

    df = pd.DataFrame(rows).sample(frac=1, random_state=SEED).reset_index(drop=True)
    sample_path = os.path.join(OUT_DIR, "sample.csv")
    df.to_csv(sample_path, index=False)
    print(f"✓ sample.csv saved → {sample_path}  ({len(df)} rows)")

    # ── model.pkl ────────────────────────────────────────────────────────────
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=2000, ngram_range=(1, 2))),
        ("clf",   LogisticRegression(max_iter=300, random_state=SEED)),
    ])
    pipe.fit(df["text"].tolist(), df["label"].tolist())

    model_path = os.path.join(OUT_DIR, "model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(pipe, f)
    print(f"✓ model.pkl saved → {model_path}")


if __name__ == "__main__":
    main()
