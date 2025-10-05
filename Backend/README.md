# Backend form service

This small FastAPI service provides per-form SQLite databases and simple CRUD endpoints. It's intended to be run locally for development.

Prerequisites:
- Python 3.9+
- pip

Install dependencies:

1. From the repository root (or inside this Backend folder):

   python -m pip install -r Backend/requirements.txt

Run the server (development):

   python -m uvicorn Backend.api:app --reload --host 127.0.0.1 --port 8000

Endpoints overview:
- POST /forms - create a new form (creates a sqlite file under Backend/data/)
- POST /forms/{form_name}/tables - create a table for a form
- POST /forms/{form_name}/tables/{table}/rows - insert a row into a table
- GET  /forms/{form_name}/tables/{table}/rows - list rows from a table
- GET  /forms - list created form sqlite files

Notes:
- The service uses sqlite files placed under `Backend/data/` (created automatically).
- This is a simple development service; for production you should use proper DB migrations, auth, and backups.