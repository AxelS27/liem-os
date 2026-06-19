# Research Task: Ablation Study

## 1. Scientific Objective
An ablation study systematically removes components of a machine learning model or preprocessing pipeline to determine their individual contribution to overall performance. This is critical for defending the inclusion of specific steps (e.g., text cleaning, feature groups) in scientific publications.

---

## 2. Agent Guidelines & Requirements
When executing this task, you MUST dynamically write the research code from scratch:

1. **Auto-Data Analysis**: 
   - Load the target dataset.
   - Detect the label/target column (e.g., matching `"label"`, `"target"`, `"class"`, or the last column).
   - Detect task type: binary classification, multiclass classification, or regression.
   - Auto-detect column types (e.g., text features vs tabular numeric/categorical features).

2. **Experiment Design & Baseline Model**:
   - Split data into train and test sets (recommend 80/20 stratified split).
   - Choose a suitable baseline model:
     - For text data: `TfidfVectorizer` + `LogisticRegression` (classification) or `Ridge` (regression).
     - For tabular data: `RandomForestClassifier` or `RandomForestRegressor` with appropriate preprocessing.
   - Evaluate and compare at least two model families to establish the strongest baseline.

3. **Ablation Strategy**:
   - **Text Preprocessing Ablation**: If a text column is present, define a list of sequential cleaning stages (e.g., `Raw`, `Lowercase`, `Punctuation-Stripped`, `Stopword-Filtered`, `Full-Pipeline`). Train and evaluate a model for each config.
   - **Feature/Column Ablation**: If multiple tabular columns are present, perform feature ablation by training models leaving out one feature or feature group at a time.
   - For all configs, compute the primary metric (e.g., Macro F1 for classification, R² or RMSE for regression) and compute the delta relative to the baseline.

4. **Output Generation**:
   - Save the best-performing model pipeline as `model.pkl`.
   - Plot a bar chart comparing performance across all configs as `plot.png`.
   - Write a structured `report.json` matching the validation schema.

---

## 3. Output Schema (`report.json`)
The output `report.json` must match `report.schema.yaml` exactly. Example format:
```json
{
  "configs": [
    { "name": "Raw", "macro_f1": 0.7250, "delta": 0.0000 },
    { "name": "+Clean", "macro_f1": 0.7510, "delta": 0.0260 },
    { "name": "+Stopwords", "macro_f1": 0.7830, "delta": 0.0580 },
    { "name": "Full", "macro_f1": 0.7830, "delta": 0.0580 }
  ]
}
```
