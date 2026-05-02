import json
import os

ranges = [
  {"marker": "Hemoglobin", "sex": "male", "age_min": 18, "age_max": 120, "unit": "g/dL", "lower": 13.0, "upper": 17.5, "source": "ICMR", "source_year": 2023},
  {"marker": "Hemoglobin", "sex": "female", "age_min": 18, "age_max": 120, "unit": "g/dL", "lower": 12.0, "upper": 15.5, "source": "ICMR", "source_year": 2023},
  {"marker": "WBC", "sex": "male", "age_min": 18, "age_max": 120, "unit": "10^3/μL", "lower": 4.5, "upper": 11.0, "source": "ICMR", "source_year": 2023},
  {"marker": "WBC", "sex": "female", "age_min": 18, "age_max": 120, "unit": "10^3/μL", "lower": 4.5, "upper": 11.0, "source": "ICMR", "source_year": 2023},
  {"marker": "Platelets", "sex": "male", "age_min": 18, "age_max": 120, "unit": "10^3/μL", "lower": 150, "upper": 400, "source": "ICMR", "source_year": 2023},
  {"marker": "Platelets", "sex": "female", "age_min": 18, "age_max": 120, "unit": "10^3/μL", "lower": 150, "upper": 400, "source": "ICMR", "source_year": 2023},
  {"marker": "Fasting Glucose", "sex": "male", "age_min": 18, "age_max": 120, "unit": "mg/dL", "lower": 70, "upper": 100, "source": "ICMR", "source_year": 2023},
  {"marker": "Fasting Glucose", "sex": "female", "age_min": 18, "age_max": 120, "unit": "mg/dL", "lower": 70, "upper": 100, "source": "ICMR", "source_year": 2023},
  {"marker": "HbA1c", "sex": "male", "age_min": 18, "age_max": 120, "unit": "%", "lower": 4.0, "upper": 5.7, "source": "ICMR", "source_year": 2023},
  {"marker": "HbA1c", "sex": "female", "age_min": 18, "age_max": 120, "unit": "%", "lower": 4.0, "upper": 5.7, "source": "ICMR", "source_year": 2023},
  {"marker": "Creatinine", "sex": "male", "age_min": 18, "age_max": 120, "unit": "mg/dL", "lower": 0.74, "upper": 1.35, "source": "ICMR", "source_year": 2023},
  {"marker": "Creatinine", "sex": "female", "age_min": 18, "age_max": 120, "unit": "mg/dL", "lower": 0.59, "upper": 1.04, "source": "ICMR", "source_year": 2023},
  {"marker": "Total Cholesterol", "sex": "male", "age_min": 18, "age_max": 120, "unit": "mg/dL", "lower": 0, "upper": 200, "source": "WHO", "source_year": 2022},
  {"marker": "Total Cholesterol", "sex": "female", "age_min": 18, "age_max": 120, "unit": "mg/dL", "lower": 0, "upper": 200, "source": "WHO", "source_year": 2022}
]

file_path = "backend/data/reference_ranges.json"
with open(file_path, "w") as f:
    json.dump(ranges, f, indent=2)

print(f"Successfully wrote {len(ranges)} ranges to {file_path}")
