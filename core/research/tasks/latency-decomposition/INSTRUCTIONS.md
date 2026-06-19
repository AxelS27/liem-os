# Research Task: Latency Decomposition

## 1. Scientific Objective
Latency decomposition profiles the end-to-end execution of a machine learning pipeline, measuring how much time (in milliseconds) each stage (e.g., feature extraction, classification, post-processing) consumes. This is crucial for verifying deployment viability in latency-constrained systems (e.g., edge devices or real-time APIs).

---

## 2. Agent Guidelines & Requirements
When executing this task, you MUST dynamically write the profiling code from scratch:

1. **Pipeline Stage Inspection**:
   - Check if a pre-trained model `model.pkl` is available.
   - If no model is found, dynamically train a standard pipeline (e.g. TF-IDF/StandardScaler + LogisticRegression/RandomForest) on the input dataset to serve as the test target.
   - Inspect the model structure. If it is a scikit-learn `Pipeline`, extract the named steps (e.g., `tfidf`, `scaler`, `clf`).
   - If it is not a standard pipeline, identify the logical stages: Data Preprocessing, Feature Transformation, and Model Inference.

2. **Timing & Benchmarking**:
   - For each identified stage, measure its latency independently using high-precision timers (e.g., `time.perf_counter()`).
   - Run the timing routine over multiple repetitions (e.g., `N_REPEATS = 50` or more) on a sample dataset of size `N_SAMPLES = 200` to prevent cold-start skew.
   - Collect latency measurements in milliseconds (ms).

3. **Latency Aggregation**:
   - Compute percentiles: Median (p50), 95th percentile (p95), and 99th percentile (p99) for each stage.
   - Compute the percentage share (`pct_share`) of total median latency that each stage represents.

4. **Output Generation**:
   - Save the results as a stacked bar chart or individual bar chart in `plot.png`.
   - Save a structured `report.json` matching the schema.

---

## 3. Output Schema (`report.json`)
The output `report.json` must match `report.schema.yaml` exactly. Example format:
```json
{
  "stages": [
    { "name": "preprocess", "p50": 1.240, "p95": 2.150, "p99": 3.840, "pct_share": 35.5 },
    { "name": "vectorize", "p50": 1.890, "p95": 3.420, "p99": 5.120, "pct_share": 54.1 },
    { "name": "inference", "p50": 0.360, "p95": 0.650, "p99": 0.980, "pct_share": 10.4 }
  ]
}
```
