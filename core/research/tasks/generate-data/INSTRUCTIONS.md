# Research Task: Synthetic Data Generator

## 1. Scientific Objective
Reproducibility and privacy-preservation require researchers to share seedable, high-fidelity synthetic datasets that share statistical properties with the original sensitive datasets. This task generates clean, reproducible data based on a YAML schema definition.

---

## 2. Agent Guidelines & Requirements
When executing this task, you MUST dynamically write the data generation code:

1. **Schema-Driven Construction**:
   - Parse a schema configuration defining columns, data types, and parameters.
   - Support types:
     - `id`: Sequential integers.
     - `text`: Sequences of words chosen randomly from a built-in vocabulary.
     - `categorical`: Random selections from a provided list of values.
     - `numeric`: Float values drawn uniformly from a `min` to `max` range.
     - `integer`: Integer values drawn uniformly from a `min` to `max` range.
     - `date`: Random date strings in YYYY-MM-DD format between `start` and `end`.
   
2. **Reproducibility**:
   - Ensure the generation uses a strict, seedable random state (e.g. `SEED = 42`).
   
3. **Data Profiling**:
   - Compute descriptive stats for the generated columns (ranges, averages, value frequencies) to verify the data properties.

4. **Output**:
   - Save the dataset as `synthetic_data.csv`.
   - Save the schema profiling stats to `report.json`.

---

## 3. Output Schema (`report.json`)
The output `report.json` must match `report.schema.yaml` exactly. Example format:
```json
{
  "seed": 42,
  "n_rows": 200,
  "columns": [
    { "name": "id", "type": "id", "stats": { "min": 1, "max": 200 } },
    { "name": "score", "type": "numeric", "stats": { "min": 0.0, "max": 1.0, "mean": 0.4920 } }
  ]
}
```
