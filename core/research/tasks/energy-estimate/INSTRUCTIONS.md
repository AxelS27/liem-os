# Research Task: Energy Estimate

## 1. Scientific Objective
Sustainable AI/Green AI is an increasingly important publication requirement. This task estimates the energy consumption (in Joules and Watt-hours) and the carbon dioxide equivalent ($CO_2e$) emissions for model inference. This helps researchers report the environmental impact of their models.

---

## 2. Agent Guidelines & Requirements
When executing this task, you MUST dynamically write the estimation code from scratch:

1. **Model & timing**:
   - Measure the total CPU/GPU computation time (seconds) to run prediction/inference over a sample dataset of size `N_SAMPLES_TO_BENCHMARK = 100`.
   
2. **Energy calculations**:
   - Use configurable hardware metrics (default CPU TDP: `CPU_TDP_WATTS = 15.0W`, World Average grid carbon intensity: `GRID_CARBON_INTENSITY = 0.233` kg CO2/kWh).
   - Compute:
     - `energy_per_sample_joules = (total_time_seconds / N_SAMPLES) * CPU_TDP_WATTS`
     - `energy_per_sample_wh = energy_per_sample_joules / 3600`
     - `co2_per_sample_g = energy_per_sample_wh * GRID_CARBON_INTENSITY * 1000`
   - Scale this to estimate the energy and carbon footprint for **1 million samples**.

3. **Output Generation**:
   - Save a comparison plot (`plot.png`) illustrating energy/carbon consumption under different TDP assumptions (e.g. laptop 15W, server CPU 125W, server GPU 300W).
   - Write `report.json` with all computed metrics and grid assumptions.

---

## 3. Output Schema (`report.json`)
The output `report.json` must match `report.schema.yaml` exactly. Example format:
```json
{
  "cpu_time_total_sec": 0.4520,
  "energy_per_sample_joules": 0.0678,
  "co2_per_sample_g": 0.000004,
  "co2_per_million_samples_kg": 0.0044,
  "throughput_per_sec": 221.23,
  "assumptions": {
    "cpu_tdp_watts": 15.0,
    "grid_carbon_intensity": 0.233
  }
}
```
