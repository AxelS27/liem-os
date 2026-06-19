# Research Task: Topic Modeling

## 1. Scientific Objective
Topic modeling extracts latent themes (topics) from a text corpus. In linguistics, policy analysis, and social science, this provides a quantitative method to categorize massive text datasets, analyze content distributions, and track thematic trends.

---

## 2. Agent Guidelines & Requirements
When executing this task, you MUST dynamically write the topic modeling code:

1. **Text Preprocessing**:
   - Clean the text: lowercase, remove punctuation/digits.
   - Filter out stopwords using a robust built-in set of common stopwords (English, or auto-selected based on text detection).
   
2. **Topic Extraction (LSA)**:
   - Perform TF-IDF vectorization to convert documents to a term-document matrix.
   - Run TruncatedSVD (Latent Semantic Analysis) to extract `N_TOPICS = 5` topics.
   - Extract the top `N_TOP_WORDS = 10` for each topic.
   - Compute a coherence proxy (e.g. word co-occurrence or pairwise cosine similarity of top-word document vectors).

3. **Output Generation**:
   - Save a topic-word weight heatmap as `plot.png`.
   - Save a document-topic assignment table as `topic_assignments.csv` (contains original text, dominant topic ID, and confidence).
   - Save the LSA summary and top words to `report.json`.

---

## 3. Output Schema (`report.json`)
The output `report.json` must match `report.schema.yaml` exactly. Example format:
```json
{
  "n_topics": 3,
  "n_top_words": 5,
  "max_features": 1000,
  "vocabulary_size": 284,
  "topics": [
    { "topic_id": 0, "top_words": ["gdp", "growth", "economy", "market", "policy"], "coherence_proxy": 0.4210 },
    { "topic_id": 1, "top_words": ["school", "education", "student", "class", "learn"], "coherence_proxy": 0.3850 }
  ]
}
```
