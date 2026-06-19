# Research Task: Correlation Matrix

## 1. Scientific Objective
A correlation matrix reveals linear or monotonic relationships between multiple variables in a dataset. This is essential in economics, psychology, and policy research for identifying collinearity, verifying hypothesis directions, and selecting features for modeling.

---

## 2. Agent Guidelines & Requirements
When executing this task, you MUST dynamically write the correlation code:

1. **Auto-Numeric Selection**:
   - Filter the dataset to include all numeric columns.
   - Support three correlation methods: Pearson (for linear relations), Spearman (for rank relations), and Kendall (for small datasets/non-normal distributions).
   
2. **Correlation Calculation**:
   - Compute the correlation matrix.
   - Filter for "strong correlations" using a configurable threshold (default `|r| >= 0.3`).
   - Describe each strong correlation pair (e.g. positive vs negative relation).

3. **Visualization**:
   - Generate a heatmap visualization using matplotlib (with proper color scaling and text labels) and save it as `plot.png`. Do not require Seaborn.

4. **Output**:
   - Save the correlation dictionary and strong pairs list to `report.json`.

---

## 3. Output Schema (`report.json`)
The output `report.json` must match `report.schema.yaml` exactly. Example format:
```json
{
  "method": "pearson",
  "matrix": {
    "gdp": { "gdp": 1.0, "investment": 0.82, "unemployment": -0.65 },
    "investment": { "gdp": 0.82, "investment": 1.0, "unemployment": -0.42 }
  },
  "strong_correlations": [
    { "col_a": "gdp", "col_b": "investment", "r": 0.82, "interpretation": "Strong positive relationship" }
  ]
}
```
