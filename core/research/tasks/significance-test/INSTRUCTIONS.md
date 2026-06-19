# Research Task: Statistical Significance Testing

## 1. Scientific Objective
In scientific publishing, reporting a difference in performance or metrics is insufficient without proving it is statistically significant. This task automates the selection and execution of appropriate hypothesis tests (e.g. t-test, Mann-Whitney, Chi-square) and reports p-values and effect sizes to establish statistical confidence.

---

## 2. Agent Guidelines & Requirements
When executing this task, you MUST dynamically write the statistical testing code:

1. **Auto Test Selection**:
   - Inspect the columns designated as `GROUP_COLUMN` (group variables) and `VALUE_COLUMN` (outcome variables).
   - Dynamically select the best test if set to `"auto"`:
     - 2 groups + continuous outcome -> **Welch's t-test** (for normal distributions) or **Mann-Whitney U** (rank-based non-parametric).
     - Categorical predictor + categorical outcome -> **Chi-square contingency test**.
     - Paired binary groups -> **McNemar test**.
     - > 2 groups + continuous outcome -> **One-way ANOVA** or **Kruskal-Wallis**.

2. **Calculation Details**:
   - Compute test statistic and p-value using `scipy.stats`.
   - Calculate effect sizes: Cohen's d (for t-test), Rank-biserial r (for Mann-Whitney), or Cramér's V (for Chi-square).
   - Interpret the result against the significance level (default $\alpha = 0.05$).

3. **Plotting**:
   - Save a comparison plot (e.g. boxplot for continuous variables or group bar charts for counts) as `plot.png`, displaying the test name and p-value.

4. **Output**:
   - Save the results and statistical interpretations to `report.json`.

---

## 3. Output Schema (`report.json`)
The output `report.json` must match `report.schema.yaml` exactly. Example format:
```json
{
  "test_used": "t-test (Welch)",
  "statistic": -2.4501,
  "p_value": 0.0162,
  "significant": true,
  "alpha": 0.05,
  "effect_size": 0.4850,
  "effect_metric": "Cohen's d",
  "groups": ["A", "B"],
  "group_means": { "A": 12.5, "B": 15.2 },
  "interpretation": "Statistically significant difference between groups A and B (p=0.0162)."
}
```
