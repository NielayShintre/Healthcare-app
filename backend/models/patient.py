from pydantic import BaseModel, field_validator
from typing import List, Optional, Union

class PatientContext(BaseModel):
    age: Optional[Union[str, int, float]] = "0"
    sex: Optional[str] = "unknown"
    weight: Optional[Union[str, int, float]] = ""
    height: Optional[Union[str, int, float]] = ""
    conditions: List[str] = []
    medications: Optional[str] = ""
    allergies: Optional[str] = ""

    @field_validator('age', 'weight', 'height', mode='before')
    @classmethod
    def coerce_to_str(cls, v):
        if v is None:
            return ""
        return str(v)

    def to_xml(self) -> str:
        cond_str = ", ".join(self.conditions)
        return f"""
<patient_context>
  <age>{self.age}</age>
  <sex>{self.sex}</sex>
  <weight>{self.weight}</weight>
  <height>{self.height}</height>
  <conditions>{cond_str}</conditions>
  <medications>{self.medications}</medications>
  <allergies>{self.allergies}</allergies>
</patient_context>
"""
