# Research Task: Trend Analysis

## 1. Scientific Objective
Trend analysis profiles historical time series datasets to detect long-term direction (upward, downward, or flat), identify cyclical/seasonal fluctuations, and project future values. This is standard practice in finance, climatology, economics, and resource-allocation planning.

---

## 2. Agent Guidelines & Requirements
When executing this task, you MUST dynamically write the time series analysis code:

1. **Data Sorting & Moving Averages**:
   - Parse dates, sort by date, and reset index.
   - Compute moving averages (e.g. MA-7, MA-30) to smooth noise.
   
2. **Linear Trend Fitting**:
   - Fit a linear regression model (using time index as independent variable).
   - Report the trend slope, intercept, $R^2$ goodness of fit, p-value (significance of trend), and direction (upward, flat, downward).

3. **Seasonality Detection**:
   - Check for seasonal fluctuations. For example, if frequency is monthly (`FREQ = 'M'`), group by month of year and check if monthly averages deviate significantly from the overall mean (e.g. deviations > 0.5 standard deviations).
   - Identify peak season periods.

4. **Forecasting**:
   - Project future values (linear extrapolation) for a specified forecast horizon (`FORECAST_PERIODS = 12`).

5. **Output**:
   - Save a multi-panel plot (`plot.png`) illustrating Observed vs MAs, Linear Trend line, and Forecast.
   - Save the time series report to `report.json`.

---

## 3. Output Schema (`report.json`)
The output `report.json` must match `report.schema.yaml` exactly. Example format:
```json
{
  "trend": {
    "slope": 0.4500,
    "intercept": 10.1500,
    "r_squared": 0.7200,
    "p_value": 0.0001,
    "direction": "upward"
  },
  "seasonality": {
    "has_seasonality": true,
    "peak_period": "December",
    "monthly_means": { "January": 11.2, "December": 16.5 }
  },
  "forecast": [
    { "period": "2026-01-01", "value": 15.65 }
  ]
}
```
