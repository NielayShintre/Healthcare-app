from datetime import date
from ..models.patient import PatientContext

class PHIAnonymizer:
    @staticmethod
    def age_to_bracket(birth_date_str: str) -> str:
        try:
            birth_date = date.fromisoformat(birth_date_str)
            today = date.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            
            # Create brackets of 10 years
            lower = (age // 10) * 10
            upper = lower + 10
            return f"{lower}-{upper}"
        except Exception:
            return "Unknown"

    def anonymize_context(self, profile: dict) -> PatientContext:
        # Profile contains: full_name, dob, biological_sex, unit_preference, conditions, medications, allergies
        # We strip name and exact DOB
        return PatientContext(
            age_bracket=self.age_to_bracket(profile.get("dob", "")),
            biological_sex=profile.get("biological_sex", "Other"),
            unit_preference=profile.get("unit_preference", "Metric"),
            known_conditions=profile.get("conditions", []),
            current_medications=profile.get("medications", ""),
            known_allergies=profile.get("allergies", "")
        )
