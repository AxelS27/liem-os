# Research Task: Descriptive Statistics

## 1. Scientific Objective
Descriptive statistics summarize the central tendency, dispersion, and shape of a dataset's distribution. In research papers (especially in social science, economics, and medicine), this is the standard "Table 1" that details the demographics or characteristics of the study cohort.

---

## 2. Agent Guidelines & Requirements
When executing this task, you MUST dynamically write the analysis code:

1. **Column type detection**:
   - Auto-detect numeric vs categorical columns in the dataset.
   - For numeric columns, compute: mean, median, standard deviation, min, max, 25th percentile (q25), 75th percentile (q75), and skewness.
   - For categorical columns, compute: mode, number of unique values, and top value counts (frequencies and percentages).
   
2. **Group-By breakdown (Optional)**:
   - If a grouping column is specified in the config, compute descriptive statistics broken down by each group.

3. **Plots**:
   - Save distribution plots (e.g. histograms/KDEs for numeric features, horizontal bar charts for categorical feature counts) in `plot.png`.

4. **Output**:
   - Save the statistics to `report.json` according to the schema.

---

## 3. Output Schema (`report.json`)
The output `report.json` must match `report.schema.yaml`. Example structure:
```json
{
  "numeric": {
    "age": {
      "mean": 34.52,
      "median": 32.0,
      "std": 12.4,
      "min": 18.0,
      "max": 75.0,
      "q25": 25.0,
      "q75": 43.0,
      "skewness": 0.42
    }
  },
  "categorical": {
    "education": {
      "mode": "Bachelor",
      "unique_count": 4,
      "counts": {
        "Bachelor": 85,
        "Master": 35,
        "HighSchool": 30
      }
    }
  }
}
```
