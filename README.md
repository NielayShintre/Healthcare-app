# MediLens AI

MediLens AI is an intelligent health assistant platform designed to parse and analyze medical lab reports and provide conversational insights using a Large Language Model.

## Architecture

The project is split into a modern React frontend and a FastAPI Python backend. 

### Backend
The backend has recently been refactored to follow the **Single Responsibility Principle (SRP)** and a clear **Service-Oriented Architecture**:

- **`api/routes/`**: Thin HTTP presentation layer. Defines FastAPI endpoints and delegates all business logic to services.
- **`services/`**: Contains the core business logic of the application:
  - `ChatService`: Manages conversational context formatting and safety checks.
  - `ReportService`: Orchestrates document uploading, mapping, and saving.
  - `DocumentExtractor`: Strictly handles extracting text streams from uploaded files (e.g., PDFs).
  - `ParserService`: Strictly handles passing raw text to the LLM and extracting structured JSON data.
  - `LLMClient`: A reusable client for interfacing with OpenRouter/Google AI.
- **`prompts/`**: Externalized markdown files containing the system prompts used by the LLM.
  - `chat_system.md`: Extremely simple language prompt for user interactions.
  - `parser_system.md`: Lab report extraction prompt.
- **`utils/`**: Helper functions, such as `prompt_loader.py` for reading the externalized prompts.
- **`models/`**: Pydantic schemas for data validation.

### Frontend
Built with React, Vite, and TailwindCSS. It provides:
- A Dashboard to view overall health status.
- A Reports upload screen with visual markers for High/Low results.
- A Chat interface formatted with Markdown for interacting with the AI about your health.

## Running the Application

A convenience script `run.sh` is provided in the project root to start both the frontend and backend servers.

```bash
sh run.sh
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## Configuration
Before running, ensure you have set up the `.env` file in the `backend/` directory with the necessary API keys (OpenRouter / Google AI Studio).
