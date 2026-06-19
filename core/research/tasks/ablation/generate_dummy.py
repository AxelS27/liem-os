"""
generate_dummy.py — Ablation Study
====================================
Generates seeded fake data for the ablation_study task.
Outputs:
  dummy_data/sample.csv     — 200 rows with 'text' and 'label' columns
  dummy_data/slang_dict.csv — 20 slang-to-normal word mappings
"""

# =============================================================================
# CONFIG
# =============================================================================
SEED    = 42    # Random seed — change to get different but reproducible data
N_ROWS  = 200   # Total number of text samples to generate (half hate, half non-hate)
OUT_DIR = "dummy_data"
# =============================================================================

import os
import random

import numpy as np
import pandas as pd

random.seed(SEED)
np.random.seed(SEED)

# ---------------------------------------------------------------------------
# Vocabulary pools
# ---------------------------------------------------------------------------

HATE_TOKENS = [
    "anjing", "babi", "goblok", "tolol", "idiot", "bodoh", "bangsat",
    "kampret", "tai", "sialan", "keparat", "bajingan", "asu", "kurang ajar",
    "brengsek", "bangke", "pantek", "setan", "iblis", "mampus",
    "biadab", "gila", "dasar", "kontol", "jancuk", "taik", "gabut",
    "ngentot", "pepek", "celeng",
]

NON_HATE_TOKENS = [
    "bagus", "senang", "indah", "maaf", "tolong", "terima kasih",
    "semangat", "baik", "sopan", "ramah", "suka", "cinta", "rindu",
    "aman", "nyaman", "damai", "sehat", "sejuk", "tentram", "berkah",
    "positif", "harap", "doa", "bersyukur", "rajin", "pintar", "berani",
    "jujur", "amanah", "setia",
]

# Simple slang → normal dictionary (20 entries)
SLANG_MAP = {
    "gw":    "saya",
    "lu":    "kamu",
    "tdk":   "tidak",
    "udh":   "sudah",
    "blm":   "belum",
    "krn":   "karena",
    "emg":   "memang",
    "mau":   "mau",
    "bgt":   "banget",
    "aja":   "saja",
    "jg":    "juga",
    "lg":    "lagi",
    "yg":    "yang",
    "dgn":   "dengan",
    "utk":   "untuk",
    "gk":    "tidak",
    "kmrn":  "kemarin",
    "skrg":  "sekarang",
    "bs":    "bisa",
    "hrs":   "harus",
}


def make_sentence(tokens: list, n_words_range=(4, 12)) -> str:
    n = random.randint(*n_words_range)
    words = random.choices(tokens, k=n)
    # Randomly insert a slang word
    if random.random() < 0.4:
        slang = random.choice(list(SLANG_MAP.keys()))
        pos   = random.randint(0, len(words))
        words.insert(pos, slang)
    # Randomly add elongation
    if random.random() < 0.3 and words:
        idx = random.randint(0, len(words) - 1)
        words[idx] = words[idx] + random.choice(["yyy", "zzz", "aaa"])
    return " ".join(words)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # ── sample.csv ───────────────────────────────────────────────────────────
    rows = []
    for _ in range(N_ROWS // 2):
        rows.append({"text": make_sentence(HATE_TOKENS),    "label": "hate"})
    for _ in range(N_ROWS // 2):
        rows.append({"text": make_sentence(NON_HATE_TOKENS), "label": "non-hate"})

    df = pd.DataFrame(rows).sample(frac=1, random_state=SEED).reset_index(drop=True)
    sample_path = os.path.join(OUT_DIR, "sample.csv")
    df.to_csv(sample_path, index=False)
    print(f"✓ sample.csv saved → {sample_path}  ({len(df)} rows)")

    # ── slang_dict.csv ───────────────────────────────────────────────────────
    slang_df = pd.DataFrame(
        [{"slang": k, "normal": v} for k, v in SLANG_MAP.items()]
    )
    slang_path = os.path.join(OUT_DIR, "slang_dict.csv")
    slang_df.to_csv(slang_path, index=False)
    print(f"✓ slang_dict.csv saved → {slang_path}  ({len(slang_df)} mappings)")


if __name__ == "__main__":
    main()
