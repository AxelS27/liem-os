# Research Task: Batch Scaling

## 1. Scientific Objective
Batch scaling analysis benchmarks how a machine learning model scales under varying batch sizes (e.g., 1, 4, 8, 16, 32, 64). In publication, this demonstrates how hardware resources are utilized and helps identify the optimal batch size for high-throughput serving systems.

---

## 2. Agent Guidelines & Requirements
When executing this task, you MUST dynamically write the benchmarking code from scratch:

1. **Model Loading**:
   - Check if a pre-trained model `model.pkl` is available. If not, train a baseline model (such as RandomForest or LogisticRegression) on the input dataset.
   - Ensure the model has a `.predict()` or `.predict_proba()` method.

2. **Benchmarking Routine**:
   - Define a set of batch sizes to evaluate: `[1, 4, 8, 16, 32, 64]`.
   - For each batch size:
     - Slice the input dataset into chunks matching the batch size.
     - Warm up the model by running a few initial batches.
     - Measure the execution time (in seconds) over multiple repetitions (`N_REPEATS = 30` or more).
     - Compute the median latency (in milliseconds) and the throughput (samples processed per second).
     - Throughput = `batch_size / (median_latency_seconds)`.

3. **Output Generation**:
   - Save the results as a dual-axis plot (`plot.png`) showing batch size on the x-axis, latency on the left y-axis, and throughput on the right y-axis.
   - Save a structured `report.json` matching the schema.

---

## 3. Output Schema (`report.json`)
The output `report.json` must match `report.schema.yaml` exactly. Example format:
```json
{
  "batch_results": [
    { "batch_size": 1, "median_latency_ms": 0.450, "throughput_per_sec": 2222.22 },
    { "batch_size": 4, "median_latency_ms": 1.250, "throughput_per_sec": 3200.00 },
    { "batch_size": 16, "median_latency_ms": 3.820, "throughput_per_sec": 4188.48 }
  ]
}
```
