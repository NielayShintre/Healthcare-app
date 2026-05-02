from pydantic import BaseModel
from typing import List, Optional

class PatientContext(BaseModel):
    age_bracket: str
    biological_sex: str
    unit_preference: str
    known_conditions: List[str] = []
    current_medications: str = ""
    known_allergies: str = ""

    def to_xml(self) -> str:
        conditions = ", ".join(self.known_conditions)
        return f"""
<patient_context>
  <age_bracket>{self.age_bracket}</age_bracket>
  <biological_sex>{self.biological_sex}</biological_sex>
  <unit_preference>{self.unit_preference}</unit_preference>
  <known_conditions>{conditions}</known_conditions>
  <current_medications>{self.current_medications}</current_medications>
  <known_allergies>{self.known_allergies}</known_allergies>
</patient_context>
"""
