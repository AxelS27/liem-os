"""
generate_dummy.py — Error Analysis
====================================
Generates seeded fake text data with mixed-length examples to stress-test
the heuristic error tagger in error_analysis.py.
Outputs:
  dummy_data/sample.csv — 200 rows with 'text' and 'label' columns
"""

# =============================================================================
# CONFIG
# =============================================================================
SEED    = 42    # Random seed — deterministic output
N_ROWS  = 200   # Total samples (half per class)
OUT_DIR = "dummy_data"
# =============================================================================

import os
import random

import numpy as np
import pandas as pd

random.seed(SEED)
np.random.seed(SEED)

POSITIVE_WORDS = [
    "love", "peace", "harmony", "joy", "wonderful", "brilliant", "kind",
    "gentle", "generous", "helpful", "caring", "warm", "cheerful", "bliss",
    "gratitude", "hope", "faith", "trust", "smile", "laughter",
]

NEGATIVE_WORDS = [
    "hate", "anger", "violence", "terrible", "awful", "horrible", "cruel",
    "evil", "toxic", "dangerous", "harmful", "rude", "arrogant", "corrupt",
    "nasty", "vile", "malicious", "destructive", "aggressive", "hostile",
]

URL_TEMPLATES = ["http://example.com", "https://news.fake.org/story", "www.test.net"]
NUMBER_WORDS  = ["123", "456", "007", "2024", "999", "100", "42"]


def make_text(vocab: list, style: str) -> str:
    """Generate text in one of four styles to exercise error tagger heuristics."""
    if style == "short":          # <10 chars
        return random.choice(vocab)[:9]
    elif style == "long":         # >100 chars
        words = random.choices(vocab, k=25)
        return " ".join(words)
    elif style == "url":
        base = " ".join(random.choices(vocab, k=5))
        return base + " " + random.choice(URL_TEMPLATES)
    elif style == "number":
        base = " ".join(random.choices(vocab, k=4))
        return base + " " + random.choice(NUMBER_WORDS)
    else:                         # normal
        n = random.randint(5, 14)
        return " ".join(random.choices(vocab, k=n))


STYLES = ["short", "long", "url", "number", "normal", "normal", "normal"]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    rows = []
    for _ in range(N_ROWS // 2):
        style = random.choice(STYLES)
        rows.append({"text": make_text(POSITIVE_WORDS, style), "label": "positive"})
    for _ in range(N_ROWS // 2):
        style = random.choice(STYLES)
        rows.append({"text": make_text(NEGATIVE_WORDS, style), "label": "negative"})

    df = pd.DataFrame(rows).sample(frac=1, random_state=SEED).reset_index(drop=True)
    sample_path = os.path.join(OUT_DIR, "sample.csv")
    df.to_csv(sample_path, index=False)
    print(f"✓ sample.csv saved → {sample_path}  ({len(df)} rows)")


if __name__ == "__main__":
    main()
