"""
generate_data.py — Liem OS Research Task: Schema-Driven Synthetic Data Generator
Generates deterministic synthetic datasets from a column schema definition.

CONFIG — edit these variables before running:
"""

import os
import json
import string
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# ─── CONFIG ────────────────────────────────────────────────────────────────────
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
SEED       = 42
N_ROWS     = 200

# Schema: list of column definitions. Supported types:
#   "id"          — sequential integer IDs
#   "text"        — random word sequences (built-in vocab, no file needed)
#   "categorical" — random choice from values list
#   "numeric"     — uniform float between min and max
#   "integer"     — uniform int between min and max
#   "date"        — random dates between start and end (YYYY-MM-DD)
SCHEMA = [
    {"name": "id",         "type": "id"},
    {"name": "text",       "type": "text",       "vocab_size": 50, "min_words": 3, "max_words": 15},
    {"name": "label",      "type": "categorical", "values": ["positive", "negative", "neutral"]},
    {"name": "score",      "type": "numeric",    "min": 0.0, "max": 1.0},
    {"name": "count",      "type": "integer",    "min": 1, "max": 100},
    {"name": "date",       "type": "date",       "start": "2020-01-01", "end": "2024-12-31"},
]
# ───────────────────────────────────────────────────────────────────────────────

# Built-in 100-word vocabulary (no external file needed)
VOCAB = [
    "ability", "access", "account", "action", "activity", "advance", "agent",
    "allow", "amount", "analysis", "apply", "approach", "area", "assess",
    "assume", "available", "average", "balance", "base", "basis", "benefit",
    "build", "capacity", "cause", "challenge", "change", "clear", "collect",
    "complete", "complex", "concept", "condition", "consider", "control",
    "create", "current", "data", "decision", "define", "deliver", "demand",
    "design", "detail", "develop", "difference", "direct", "effect", "effort",
    "enable", "ensure", "establish", "evaluate", "evidence", "example",
    "expect", "experience", "explain", "factor", "feature", "field", "find",
    "focus", "form", "framework", "function", "general", "generate", "given",
    "global", "growth", "guide", "identify", "impact", "improve", "include",
    "indicate", "influence", "inform", "input", "issue", "learn", "level",
    "limit", "manage", "measure", "method", "model", "monitor", "network",
    "note", "objective", "outcome", "output", "pattern", "perform", "policy",
    "process", "provide", "quality", "range", "reduce", "report",
]


def generate_id_column(n_rows):
    return list(range(1, n_rows + 1))


def generate_text_column(n_rows, vocab_size, min_words, max_words, rng):
    vocab = VOCAB[:min(vocab_size, len(VOCAB))]
    texts = []
    for _ in range(n_rows):
        n_words = rng.randint(min_words, max_words + 1)
        words = [rng.choice(vocab) for _ in range(n_words)]
        texts.append(" ".join(words))
    return texts


def generate_categorical_column(n_rows, values, rng):
    return [rng.choice(values) for _ in range(n_rows)]


def generate_numeric_column(n_rows, min_val, max_val, rng):
    return [round(rng.uniform(min_val, max_val), 6) for _ in range(n_rows)]


def generate_integer_column(n_rows, min_val, max_val, rng):
    return [rng.randint(min_val, max_val + 1) for _ in range(n_rows)]


def generate_date_column(n_rows, start_str, end_str, rng):
    start = datetime.strptime(start_str, "%Y-%m-%d")
    end   = datetime.strptime(end_str,   "%Y-%m-%d")
    delta_days = (end - start).days
    dates = []
    for _ in range(n_rows):
        offset = rng.randint(0, delta_days + 1)
        dates.append((start + timedelta(days=offset)).strftime("%Y-%m-%d"))
    return dates


def compute_column_stats(series, col_type):
    """Return basic stats dict based on column type."""
    if col_type in ("numeric", "integer"):
        return {
            "min":  round(float(series.min()), 4),
            "max":  round(float(series.max()), 4),
            "mean": round(float(series.mean()), 4),
            "std":  round(float(series.std()), 4),
        }
    elif col_type == "categorical":
        vc = series.value_counts().head(10).to_dict()
        return {"value_counts": {str(k): int(v) for k, v in vc.items()}}
    elif col_type == "text":
        lengths = series.str.split().apply(len)
        return {
            "avg_word_count": round(float(lengths.mean()), 2),
            "min_word_count": int(lengths.min()),
            "max_word_count": int(lengths.max()),
        }
    elif col_type == "date":
        return {
            "min_date": str(series.min()),
            "max_date": str(series.max()),
        }
    elif col_type == "id":
        return {"min": int(series.min()), "max": int(series.max())}
    return {}


def print_schema_table(schema, columns_report):
    """Print a summary table of the generated schema."""
    print(f"\n{'Column':<20} {'Type':<14} {'Sample Stats'}")
    print("─" * 60)
    for col_def in schema:
        name  = col_def["name"]
        ctype = col_def["type"]
        stats = columns_report.get(name, {}).get("stats", {})
        stats_str = ", ".join(f"{k}={v}" for k, v in list(stats.items())[:2])
        print(f"  {name:<18} {ctype:<14} {stats_str}")
    print()


def run(output_dir=None, seed=None, n_rows=None, schema=None):
    """Main entry point. Accepts overrides for testing."""
    output_dir = output_dir or OUTPUT_DIR
    seed       = seed       if seed    is not None else SEED
    n_rows     = n_rows     if n_rows  is not None else N_ROWS
    schema     = schema     or SCHEMA

    os.makedirs(output_dir, exist_ok=True)

    print(f"🎲 Generating synthetic data (SEED={seed}, N_ROWS={n_rows})...")
    rng = random.Random(seed)
    np.random.seed(seed)

    data = {}
    columns_report = {}

    for col_def in schema:
        name  = col_def["name"]
        ctype = col_def["type"]
        print(f"  ⚙ Generating column: {name} ({ctype})")

        if ctype == "id":
            col_data = generate_id_column(n_rows)
        elif ctype == "text":
            col_data = generate_text_column(
                n_rows,
                col_def.get("vocab_size", 50),
                col_def.get("min_words", 3),
                col_def.get("max_words", 15),
                rng,
            )
        elif ctype == "categorical":
            col_data = generate_categorical_column(n_rows, col_def["values"], rng)
        elif ctype == "numeric":
            col_data = generate_numeric_column(n_rows, col_def["min"], col_def["max"], rng)
        elif ctype == "integer":
            col_data = generate_integer_column(n_rows, col_def["min"], col_def["max"], rng)
        elif ctype == "date":
            col_data = generate_date_column(n_rows, col_def["start"], col_def["end"], rng)
        else:
            raise ValueError(f"Unknown column type: '{ctype}' for column '{name}'")

        data[name] = col_data
        columns_report[name] = {"type": ctype}

    df = pd.DataFrame(data)

    # Compute stats per column
    for col_def in schema:
        name  = col_def["name"]
        ctype = col_def["type"]
        columns_report[name]["stats"] = compute_column_stats(df[name], ctype)

    print_schema_table(schema, columns_report)

    # ── Save CSV ───────────────────────────────────────────────────────────────
    csv_path = os.path.join(output_dir, "synthetic_data.csv")
    df.to_csv(csv_path, index=False)
    print(f"  ✓ Saved synthetic data → {csv_path}")

    # ── Save report.json ───────────────────────────────────────────────────────
    report = {
        "seed":    seed,
        "n_rows":  n_rows,
        "columns": [
            {"name": col_def["name"], "type": col_def["type"],
             "stats": columns_report[col_def["name"]]["stats"]}
            for col_def in schema
        ],
        "meta": {
            "output_file": "synthetic_data.csv",
            "n_columns":   len(schema),
        },
    }

    report_path = os.path.join(output_dir, "report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"  ✓ Saved report → {report_path}")

    print("✓ generate_data complete.")
    return report, df


if __name__ == "__main__":
    run()
