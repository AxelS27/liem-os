"""
topic_modeling.py — Liem OS Research Task: Topic Modeling (LSA/TF-IDF)
Extracts latent topics from text data using TF-IDF + TruncatedSVD (sklearn only).

CONFIG — edit these variables before running:
"""

import os
import re
import json
import string
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import Normalizer
from sklearn.pipeline import make_pipeline

# ─── CONFIG ────────────────────────────────────────────────────────────────────
INPUT_DATA   = os.path.join(os.path.dirname(__file__), "dummy_data", "text_corpus.csv")
OUTPUT_DIR   = os.path.join(os.path.dirname(__file__), "output")
TEXT_COLUMN  = "text"   # column name containing the text to analyze
N_TOPICS     = 5        # number of topics to extract
N_TOP_WORDS  = 10       # number of top words per topic
MAX_FEATURES = 1000     # max vocabulary size for TF-IDF
# ───────────────────────────────────────────────────────────────────────────────

# Common English stopwords (no NLTK needed)
STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "is", "are", "was", "were", "be", "been", "being", "have", "has",
    "had", "do", "does", "did", "will", "would", "could", "should", "may",
    "might", "shall", "can", "this", "that", "these", "those", "it", "its",
    "they", "them", "their", "we", "our", "you", "your", "he", "she", "his",
    "her", "with", "from", "by", "as", "not", "if", "so", "about", "which",
    "there", "then", "than", "also", "into", "more", "some", "other", "up",
    "out", "all", "my", "me", "who", "what", "how", "when", "where", "after",
    "before", "between", "each", "any", "i", "s", "t", "re", "ll", "ve",
}


def clean_text(text):
    """Lowercase, remove punctuation/digits, remove stopwords."""
    text = str(text).lower()
    text = re.sub(r"[^a-z\s]", " ", text)
    tokens = text.split()
    tokens = [t for t in tokens if t not in STOPWORDS and len(t) > 2]
    return " ".join(tokens)


def coherence_proxy(topic_vector, feature_names, tfidf_matrix):
    """
    Proxy coherence: mean pairwise cosine similarity of top-word document
    distributions. Returns float in [0, 1].
    """
    top_idx = np.argsort(np.abs(topic_vector))[-N_TOP_WORDS:]
    if len(top_idx) < 2:
        return 0.0
    # Use column norms from tfidf_matrix as a stand-in for co-occurrence
    col_sums = np.asarray(tfidf_matrix[:, top_idx].sum(axis=0)).flatten()
    total = col_sums.sum()
    if total == 0:
        return 0.0
    return float(round(col_sums.max() / total, 4))


def plot_topic_heatmap(components, feature_names, n_topics, n_top_words, output_path):
    """Topic-word weight heatmap."""
    top_words_per_topic = []
    top_weights_per_topic = []
    for topic_vec in components:
        top_idx = np.argsort(np.abs(topic_vec))[-n_top_words:][::-1]
        top_words_per_topic.append([feature_names[i] for i in top_idx])
        top_weights_per_topic.append([abs(topic_vec[i]) for i in top_idx])

    # Build matrix: topics × words (union of all top words)
    all_words = []
    seen = set()
    for words in top_words_per_topic:
        for w in words:
            if w not in seen:
                all_words.append(w)
                seen.add(w)
    all_words = all_words[:n_top_words * 2]  # cap display

    word_idx = {w: i for i, w in enumerate(all_words)}
    heat_matrix = np.zeros((n_topics, len(all_words)))
    for t_idx, (words, weights) in enumerate(zip(top_words_per_topic, top_weights_per_topic)):
        for w, wt in zip(words, weights):
            if w in word_idx:
                heat_matrix[t_idx, word_idx[w]] = wt

    fig, ax = plt.subplots(figsize=(max(10, len(all_words) * 0.7), max(4, n_topics * 0.9)))
    im = ax.imshow(heat_matrix, cmap="YlOrRd", aspect="auto")

    ax.set_xticks(range(len(all_words)))
    ax.set_xticklabels(all_words, rotation=45, ha="right", fontsize=8)
    ax.set_yticks(range(n_topics))
    ax.set_yticklabels([f"Topic {i}" for i in range(n_topics)], fontsize=9)

    plt.colorbar(im, ax=ax, label="Weight", fraction=0.03)
    ax.set_title("Topic-Word Weight Heatmap (LSA)", fontsize=12, fontweight="bold")
    plt.tight_layout()
    plt.savefig(output_path, dpi=120, bbox_inches="tight")
    plt.close()


def run(input_data=None, output_dir=None, text_column=None,
        n_topics=None, n_top_words=None, max_features=None):
    """Main entry point. Accepts overrides for testing."""
    input_data   = input_data   or INPUT_DATA
    output_dir   = output_dir   or OUTPUT_DIR
    text_column  = text_column  or TEXT_COLUMN
    n_topics     = n_topics     if n_topics     is not None else N_TOPICS
    n_top_words  = n_top_words  if n_top_words  is not None else N_TOP_WORDS
    max_features = max_features if max_features is not None else MAX_FEATURES

    os.makedirs(output_dir, exist_ok=True)

    print("📂 Loading data from:", input_data)
    df = pd.read_csv(input_data)
    print(f"  ✓ Loaded {len(df)} rows")

    # ── Text cleaning ──────────────────────────────────────────────────────────
    print("  🔤 Cleaning text...")
    df["_clean_text"] = df[text_column].apply(clean_text)
    corpus = df["_clean_text"].tolist()

    # ── TF-IDF vectorization ───────────────────────────────────────────────────
    vectorizer = TfidfVectorizer(
        max_features=max_features,
        min_df=2,
        max_df=0.95,
        sublinear_tf=True,
    )
    tfidf_matrix = vectorizer.fit_transform(corpus)
    feature_names = vectorizer.get_feature_names_out()
    print(f"  ✓ TF-IDF: {tfidf_matrix.shape[0]} docs × {tfidf_matrix.shape[1]} terms")

    # ── LSA (TruncatedSVD) ─────────────────────────────────────────────────────
    actual_n_topics = min(n_topics, tfidf_matrix.shape[1] - 1, tfidf_matrix.shape[0] - 1)
    svd = TruncatedSVD(n_components=actual_n_topics, random_state=42)
    normalizer = Normalizer(copy=False)
    lsa_pipeline = make_pipeline(svd, normalizer)
    doc_topics = lsa_pipeline.fit_transform(tfidf_matrix)
    components = svd.components_

    print(f"  ✓ LSA complete: {actual_n_topics} topics extracted")

    # ── Build topic list ───────────────────────────────────────────────────────
    topics_report = []
    for t_idx, topic_vec in enumerate(components):
        top_idx = np.argsort(np.abs(topic_vec))[-n_top_words:][::-1]
        top_words = [str(feature_names[i]) for i in top_idx]
        cp = coherence_proxy(topic_vec, feature_names, tfidf_matrix)
        topics_report.append({
            "topic_id":       t_idx,
            "top_words":      top_words,
            "coherence_proxy": cp,
        })

    # ── Topic assignments ──────────────────────────────────────────────────────
    dominant_topics = np.argmax(np.abs(doc_topics), axis=1)
    df_out = df[[text_column]].copy()
    df_out["dominant_topic"] = dominant_topics
    df_out["topic_confidence"] = np.max(np.abs(doc_topics), axis=1).round(4)

    assignments_path = os.path.join(output_dir, "topic_assignments.csv")
    df_out.to_csv(assignments_path, index=False)
    print(f"  ✓ Saved assignments → {assignments_path}")

    # ── Report ─────────────────────────────────────────────────────────────────
    report = {
        "n_topics":       actual_n_topics,
        "n_top_words":    n_top_words,
        "max_features":   max_features,
        "vocabulary_size": int(tfidf_matrix.shape[1]),
        "topics":         topics_report,
        "meta": {
            "input_file":  os.path.basename(input_data),
            "n_documents": int(len(df)),
            "text_column": text_column,
        },
    }

    report_path = os.path.join(output_dir, "report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"  ✓ Saved report → {report_path}")

    plot_path = os.path.join(output_dir, "plot.png")
    plot_topic_heatmap(components, feature_names, actual_n_topics, n_top_words, plot_path)
    print(f"  ✓ Saved heatmap → {plot_path}")

    print("✓ topic_modeling complete.")
    return report


if __name__ == "__main__":
    run()
