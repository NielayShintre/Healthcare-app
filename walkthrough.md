# MediLens Backend Walkthrough

The MediLens backend is now ready. It is a stateless FastAPI application designed to process medical lab reports and provide AI-powered health literacy insights while strictly adhering to privacy and safety guardrails.

## Key Accomplishments

### 1. Robust Core Infrastructure
- **FastAPI Framework**: High-performance, asynchronous backend.
- **Stateless Architecture**: No patient data is stored on the server; all data lives in the user's browser (IndexedDB), processed in-flight.
- **Comprehensive Models**: Pydantic models for Patients, Reports, Markers, and Chat messages ensure strict data validation.

### 2. Clinical Intelligence
- **Reference Range Engine**: Evaluates markers against age- and sex-adjusted ranges (ICMR/WHO).
- **Safety Pre-Classifier**: Automatically detects emergency signals in user messages (e.g., "chest pain") and critical lab values (e.g., Potassium < 2.5).
- **PHI Anonymizer**: Strips PII (Name, exact DOB) before any data is sent to the LLM.

### 3. Report Processing Pipeline
- **PDF Extraction**: Integrated PyMuPDF for reliable text extraction from lab reports.
- **Injection Sanitization**: Strips prompt injection patterns to ensure LLM safety.
- **Multi-lab Standardization**: Core logic for unit normalization and range comparison.

### 4. Demo Readiness
- **Synthetic Data Endpoint**: `GET /api/demo/synthetic-report` returns a pre-populated report for demoing the dashboard without an upload.
- **Mock Responses**: The chat and upload endpoints fall back to high-quality synthetic data if an OpenRouter API key is not provided, allowing for immediate testing.

---

## Technical Details

### Project Structure
```
backend/
├── main.py                # Entry point & routing
├── requirements.txt       # Dependencies
├── api/                   # API layer (Routes & Middleware)
├── services/              # Business logic (Parser, Anonymizer, LLM, Safety)
├── models/                # Data validation
├── prompts/               # Structured LLM instructions (Markdown)
└── data/                  # Reference data (Ranges, Critical thresholds)
```

### How to Run
1. Run the unified startup script from the project root:
   ```bash
   ./run.sh
   ```
   This will:
   - Install all Python and Node.js dependencies.
   - Start the Backend (FastAPI) on `http://localhost:8000`.
   - Start the Frontend (Vite) on `http://localhost:3000`.

2. Individual services can still be started using their respective scripts if needed:
   - Backend: `./run_backend.sh`
   - Frontend: `cd frontend && npm run dev`

## Testing
Unit tests have been implemented for safety-critical components:
- `backend/tests/unit/test_phi_anonymizer.py`
- `backend/tests/unit/test_safety_classifier.py`

Run tests with:
```bash
pytest backend/tests/
```
