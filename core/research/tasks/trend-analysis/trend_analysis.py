"""
trend_analysis.py — Liem OS Research Task: Trend Analysis
Detects trends, seasonality, and generates linear forecasts for time series data.

CONFIG — edit these variables before running:
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import stats as scipy_stats

# ─── CONFIG ────────────────────────────────────────────────────────────────────
INPUT_DATA      = os.path.join(os.path.dirname(__file__), "dummy_data", "timeseries_sample.csv")
OUTPUT_DIR      = os.path.join(os.path.dirname(__file__), "output")
DATE_COLUMN     = "date"     # column with dates
VALUE_COLUMN    = "value"    # column with numeric values
FREQ            = "M"        # "D" | "W" | "M" | "Q" | "Y"
FORECAST_PERIODS = 12        # number of periods to forecast ahead
# ───────────────────────────────────────────────────────────────────────────────


def compute_moving_averages(values, n):
    """Return rolling mean of length n; pads with NaN for early positions."""
    result = np.full(len(values), np.nan)
    for i in range(n - 1, len(values)):
        result[i] = np.mean(values[i - n + 1: i + 1])
    return result


def compute_linear_trend(x, y):
    """Fit linear regression to (x, y), return slope, intercept, r_squared."""
    slope, intercept, r, p, se = scipy_stats.linregress(x, y)
    return float(slope), float(intercept), float(r ** 2), float(p)


def detect_seasonality(df, date_col, value_col, freq):
    """
    Compute monthly averages for FREQ='M'. Returns has_seasonality bool,
    peak_period string, and monthly_means dict.
    """
    if freq != "M":
        return {"has_seasonality": False, "peak_period": None, "note": f"Seasonality only computed for FREQ='M', got '{freq}'"}

    df_temp = df.copy()
    df_temp["_month"] = pd.to_datetime(df_temp[date_col]).dt.month
    monthly = df_temp.groupby("_month")[value_col].mean()
    overall_mean = df_temp[value_col].mean()
    overall_std  = df_temp[value_col].std()

    # Seasonality exists if at least one month deviates > 0.5σ from mean
    has_seasonality = bool(((monthly - overall_mean).abs() > 0.5 * overall_std).any())
    peak_month_num = int(monthly.idxmax())

    month_names = {
        1: "January", 2: "February", 3: "March", 4: "April",
        5: "May", 6: "June", 7: "July", 8: "August",
        9: "September", 10: "October", 11: "November", 12: "December",
    }

    return {
        "has_seasonality": has_seasonality,
        "peak_period":     month_names.get(peak_month_num, str(peak_month_num)),
        "monthly_means":   {month_names[m]: round(float(v), 4) for m, v in monthly.items()},
    }


def generate_forecast(last_x, slope, intercept, n_periods, last_date, freq):
    """Linear extrapolation for n_periods beyond last_x."""
    freq_map = {"D": "D", "W": "W", "M": "MS", "Q": "QS", "Y": "YS"}
    pd_freq = freq_map.get(freq, "MS")

    try:
        future_dates = pd.date_range(
            start=pd.to_datetime(last_date) + pd.tseries.frequencies.to_offset(pd_freq),
            periods=n_periods,
            freq=pd_freq,
        )
        forecast = []
        for i, fdate in enumerate(future_dates):
            future_x = last_x + i + 1
            pred_val = slope * future_x + intercept
            forecast.append({
                "period": fdate.strftime("%Y-%m-%d"),
                "value":  round(float(pred_val), 4),
            })
    except Exception:
        # Fallback: numeric periods
        forecast = [
            {"period": str(last_x + i + 1), "value": round(float(slope * (last_x + i + 1) + intercept), 4)}
            for i in range(n_periods)
        ]
    return forecast


def plot_trend(df, date_col, value_col, ma7, ma30, slope, intercept,
               forecast, output_path):
    """Multi-panel trend plot: raw + MAs, trend line, forecast."""
    dates = pd.to_datetime(df[date_col])
    values = df[value_col].values
    x = np.arange(len(values))

    fig, axes = plt.subplots(3, 1, figsize=(12, 10), sharex=False)

    # ── Panel 1: Raw data + moving averages ────────────────────────────────────
    ax = axes[0]
    ax.plot(dates, values, color="#4C72B0", linewidth=1.2, label="Observed", alpha=0.9)
    if not np.all(np.isnan(ma7)):
        ax.plot(dates, ma7, color="#DD8452", linewidth=1.5, linestyle="--", label="MA-7")
    if not np.all(np.isnan(ma30)):
        ax.plot(dates, ma30, color="#55A868", linewidth=1.5, linestyle="-.", label="MA-30")
    ax.set_title("Observed Values + Moving Averages", fontsize=10, fontweight="bold")
    ax.set_ylabel(value_col)
    ax.legend(fontsize=8)
    ax.grid(True, alpha=0.3)

    # ── Panel 2: Linear trend ──────────────────────────────────────────────────
    ax = axes[1]
    trend_line = slope * x + intercept
    ax.scatter(dates, values, s=15, color="#4C72B0", alpha=0.6, label="Observed")
    ax.plot(dates, trend_line, color="crimson", linewidth=2, label="Linear trend")
    direction = "↑ Upward" if slope > 0 else "↓ Downward"
    ax.set_title(f"Linear Trend ({direction}, slope={slope:.4f})", fontsize=10, fontweight="bold")
    ax.set_ylabel(value_col)
    ax.legend(fontsize=8)
    ax.grid(True, alpha=0.3)

    # ── Panel 3: Forecast ──────────────────────────────────────────────────────
    ax = axes[2]
    ax.plot(dates, values, color="#4C72B0", linewidth=1.2, label="Historical")
    if forecast:
        try:
            f_dates = pd.to_datetime([f["period"] for f in forecast])
            f_vals = [f["value"] for f in forecast]
            ax.plot(f_dates, f_vals, color="darkorange", linewidth=2,
                    linestyle="--", marker="o", markersize=4, label="Forecast")
        except Exception:
            pass
    ax.set_title(f"Forecast ({len(forecast)} periods ahead)", fontsize=10, fontweight="bold")
    ax.set_ylabel(value_col)
    ax.legend(fontsize=8)
    ax.grid(True, alpha=0.3)

    plt.suptitle("Trend Analysis Report", fontsize=13, fontweight="bold", y=1.01)
    plt.tight_layout()
    plt.savefig(output_path, dpi=120, bbox_inches="tight")
    plt.close()


def run(input_data=None, output_dir=None, date_column=None, value_column=None,
        freq=None, forecast_periods=None):
    """Main entry point. Accepts overrides for testing."""
    input_data      = input_data      or INPUT_DATA
    output_dir      = output_dir      or OUTPUT_DIR
    date_column     = date_column     or DATE_COLUMN
    value_column    = value_column    or VALUE_COLUMN
    freq            = freq            or FREQ
    forecast_periods = forecast_periods if forecast_periods is not None else FORECAST_PERIODS

    os.makedirs(output_dir, exist_ok=True)

    print("📂 Loading data from:", input_data)
    df = pd.read_csv(input_data)
    df[date_column] = pd.to_datetime(df[date_column])
    df = df.sort_values(date_column).reset_index(drop=True)
    print(f"  ✓ Loaded {len(df)} rows, date range: {df[date_column].min().date()} → {df[date_column].max().date()}")

    values = df[value_column].values
    x = np.arange(len(values))

    # ── Moving averages ────────────────────────────────────────────────────────
    ma7  = compute_moving_averages(values, 7)  if len(values) >= 7  else np.full(len(values), np.nan)
    ma30 = compute_moving_averages(values, 30) if len(values) >= 30 else np.full(len(values), np.nan)
    print(f"  ✓ Moving averages computed (MA-7, MA-30)")

    # ── Linear trend ───────────────────────────────────────────────────────────
    slope, intercept, r_sq, p_val = compute_linear_trend(x, values)
    direction = "upward" if slope > 0 else ("flat" if abs(slope) < 1e-8 else "downward")
    print(f"  ✓ Linear trend: slope={slope:.4f}, R²={r_sq:.4f}, direction={direction}")

    # ── Seasonality ────────────────────────────────────────────────────────────
    seasonality = detect_seasonality(df, date_column, value_column, freq)
    print(f"  ✓ Seasonality: {seasonality['has_seasonality']}, peak={seasonality.get('peak_period')}")

    # ── Forecast ───────────────────────────────────────────────────────────────
    last_date = df[date_column].max()
    forecast = generate_forecast(len(values) - 1, slope, intercept,
                                 forecast_periods, last_date, freq)
    print(f"  ✓ Forecast generated for {forecast_periods} period(s)")

    report = {
        "trend": {
            "slope":     round(slope, 6),
            "intercept": round(intercept, 6),
            "r_squared": round(r_sq, 4),
            "p_value":   round(p_val, 6),
            "direction": direction,
        },
        "seasonality": seasonality,
        "forecast":    forecast,
        "moving_averages": {
            "ma7_available":  not np.all(np.isnan(ma7)),
            "ma30_available": not np.all(np.isnan(ma30)),
        },
        "meta": {
            "input_file":      os.path.basename(input_data),
            "n_rows":          int(len(df)),
            "date_column":     date_column,
            "value_column":    value_column,
            "freq":            freq,
            "date_range_start": str(df[date_column].min().date()),
            "date_range_end":   str(df[date_column].max().date()),
        },
    }

    report_path = os.path.join(output_dir, "report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"  ✓ Saved report → {report_path}")

    plot_path = os.path.join(output_dir, "plot.png")
    plot_trend(df, date_column, value_column, ma7, ma30, slope, intercept, forecast, plot_path)
    print(f"  ✓ Saved plot  → {plot_path}")

    print("✓ trend_analysis complete.")
    return report


if __name__ == "__main__":
    run()
