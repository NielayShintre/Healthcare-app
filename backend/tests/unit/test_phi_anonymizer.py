import pytest
from backend.services.phi_anonymizer import PHIAnonymizer

def test_age_to_bracket():
    # Mocking today to be 2024-05-02 for stability if needed, 
    # but let's just test general ranges
    anonymizer = PHIAnonymizer()
    bracket = anonymizer.age_to_bracket("1990-01-01")
    assert "-" in bracket
    
    bracket = anonymizer.age_to_bracket("wrong-date")
    assert bracket == "Unknown"

def test_anonymize_context():
    anonymizer = PHIAnonymizer()
    profile = {
        "full_name": "John Doe",
        "dob": "1985-06-15",
        "biological_sex": "Male",
        "unit_preference": "Metric",
        "conditions": ["Diabetes"],
        "medications": "Metformin",
        "allergies": "Pollen"
    }
    context = anonymizer.anonymize_context(profile)
    
    assert context.biological_sex == "Male"
    assert "Diabetes" in context.known_conditions
    assert context.current_medications == "Metformin"
    # Name should not be in context
    assert not hasattr(context, "full_name")
