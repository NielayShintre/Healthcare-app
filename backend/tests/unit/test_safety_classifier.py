from backend.services.safety_classifier import SafetyClassifier
from backend.models.marker import Marker, MarkerStatus, SeverityTier

def test_classify_message():
    classifier = SafetyClassifier()
    
    res = classifier.classify_message("I have chest pain and slurred speech")
    assert res["is_emergency"] == True
    assert res["trigger_type"] == "text"
    
    res = classifier.classify_message("How do I read my CBC?")
    assert res["is_emergency"] == False

def test_classify_report():
    classifier = SafetyClassifier()
    
    markers = [
        Marker(
            name="Potassium",
            value=2.0,
            unit="mmol/L",
            status=MarkerStatus.CRITICAL_LOW,
            severity=SeverityTier.CRITICAL
        )
    ]
    res = classifier.classify_report(markers)
    assert res["is_emergency"] == True
    assert res["trigger_type"] == "lab_value"
