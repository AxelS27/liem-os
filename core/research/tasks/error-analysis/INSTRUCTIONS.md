# Research Task: Error Analysis

## 1. Scientific Objective
Error analysis is a critical section of any machine learning paper. Rather than reporting a single aggregate score (like F1 or RMSE), error analysis digs into the specific failure modes of the model, categorizing errors and identifying where the model struggles (e.g. boundary cases, outliers, or specific data shapes).

---

## 2. Agent Guidelines & Requirements
When executing this task, you MUST dynamically write the analysis code from scratch:

1. **Auto-Problem Type & Model Evaluation**:
   - Load the dataset and target column.
   - Detect the problem type: classification or regression.
   - Load or train a baseline model, and get predictions on a test split (stratified if classification).

2. **Classification Analysis**:
   - Compute the Confusion Matrix and save it as a plot (`confusion_matrix.png`).
   - Extract the misclassified samples (true label != predicted label).
   - Tag each error dynamically with a heuristic error type:
     - **For text features**: `short_text` (length < 20 chars), `long_text` (length > 150 chars), `has_special_chars`, or `other`.
     - **For tabular features**: `extreme_feature` (if any input feature is >2 standard deviations from the mean), `near_boundary` (if model predicted probability is between 0.4 and 0.6), `missing_values`, or `other`.
   - Export the top misclassified samples (up to `TOP_N_ERRORS = 20`) to `misclassified.csv`.

3. **Regression Analysis**:
   - Compute residuals: `residual = true_value - predicted_value`.
   - Save a residual plot showing predicted value vs residual as `plot.png` (or `residuals.png`).
   - Identify the top high-residual outliers (top absolute error samples).
   - Compare the feature means/distributions of these high-residual samples against low-residual samples to identify why they failed (e.g., extreme values).
   - Export the top high-error samples to `misclassified.csv` (containing true value, predicted value, and residual).

4. **Output Generation**:
   - Save `report.json` with aggregate metrics, confusion matrix arrays, and details of top errors.
   - Save the corresponding plots (`confusion_matrix.png` or `residuals.png`).
   - Save `misclassified.csv`.

---

## 3. Output Schema (`report.json`)
The output `report.json` must match `report.schema.yaml` exactly. Example format:
```json
{
  "accuracy": 0.8500,
  "macro_f1": 0.8420,
  "confusion_matrix": [[45, 5], [10, 40]],
  "error_types": {
    "short_text": 3,
    "long_text": 2,
    "near_boundary": 8,
    "other": 2
  },
  "top_errors": [
    { "text": "sample err", "true_label": "positive", "pred_label": "negative", "error_type": "short_text" }
  ]
}
```
For regression, adapt the report keys accordingly or schema-comply.
