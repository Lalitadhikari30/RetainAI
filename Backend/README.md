# RetainAI — Backend Services

This directory contains the Spring Boot 3.3.x and Python ML microservice backend for the **RetainAI** enterprise HR attrition analytics platform.

---

## 🏛️ System Architecture

```
┌──────────────────────────────────────────────┐
│       Frontend (React + Vite + TS)           │
│           http://localhost:3000              │
└──────────────────────┬───────────────────────┘
                       │ REST (JWT Bearer Token)
                       ▼
┌──────────────────────────────────────────────┐
│         Backend (Spring Boot 3.3.x)          │
│           http://localhost:8080              │
│                                              │
│  • Spring Security (JWT, Role Enforcement)   │
│  • Spring AI (Vertex AI Gemini, @Tool,       │
│    Structured Output Deserialization)        │
│  • Spring Data JPA + Flyway Migrations       │
│  • Cost Calculation & Orchestration Engine   │
└──────────────┬───────────────────────────────┘
               │
       ┌───────┴────────────────┐
       │ HTTP /predict          │ JPA / SQL
       ▼                        ▼
┌─────────────────────┐  ┌─────────────────────┐
│  Python ML Service  │  │ PostgreSQL          │
│  (FastAPI + XGBoost)│  │ (Neon / Local)      │
│   Port 8000         │  └─────────────────────┘
└─────────────────────┘
```

---

## 🔑 Default User Credentials (Seed Data)

The system is automatically seeded via Flyway (`V2__seed_data.sql`) with two primary roles:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **HR Admin** | `admin@retainai.com` | `admin123` | Organization-wide visibility, CSV upload, ML trigger |
| **People Manager** | `alex.chen@retainai.com` | `manager123` | Role-scoped to direct reports only, Copilot assistant |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Java 17 JDK** or newer
- **Apache Maven 3.8+**
- **Python 3.10+** (for ML service)
- **Node.js 18+** (for frontend)

---

### 2. Environment Variables

Create an `.env` or set environment variables in your terminal:

```bash
# Database (PostgreSQL / Neon)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/retainai
# or Neon:
# NEON_DB_URL=jdbc:postgresql://ep-example.neon.tech/retainai?sslmode=require
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Gemini LLM (Spring AI)
GEMINI_API_KEY=your_google_ai_gemini_key

# JWT Signing Secret (256-bit key)
JWT_SECRET=super-secret-retainai-key-min-256-bits-length-must-be-provided

# ML Service URL
RETAINAI_ML_URL=http://localhost:8000
```

---

### 3. Running the Python ML Microservice

```bash
cd ml-service

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Unix/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Train XGBoost models
python train_model.py

# Start FastAPI server on port 8000
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Health check: `http://localhost:8000/health`

---

### 4. Running the Spring Boot Backend

```bash
cd Backend

# Run with PostgreSQL datasource
mvn spring-boot:run
```

The server starts at `http://localhost:8080`. Flyway automatically creates all tables and seeds mock data upon connection.

---

### 5. Running the Frontend

In the `Frontend` directory:
```bash
cd Frontend
npm install
npm run dev
```

To point the frontend to the real backend, create `Frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🧪 Testing

### Backend Unit Tests
```bash
cd Backend
mvn test
```

### ML Service Tests
```bash
cd ml-service
pytest test_app.py
```

---

## 📡 Key API Endpoints

### Authentication
- `POST /api/auth/login` (and `/api/v1/auth/login`) — Login with email/password, returns JWT

### Employees (Role-Scoped)
- `GET /api/employees` — List employees with filtering (`department`, `riskBand`, `search`, `sortBy`)
- `GET /api/employees/{id}` — Full 63-field employee profile matching frontend `Employee` interface
- `GET /api/employees/{id}/prediction` — Latest model score & feature importances

### Manager Copilot (Spring AI + Function Calling)
- `POST /api/copilot/chat` — AI inquiry with automated `@Tool` calls for risk data lookup
- `GET /api/copilot/messages` — Initial message thread

### CSV Upload & AI Schema Mapping
- `POST /api/upload/csv` — Multipart CSV ingestion with Spring AI column mapping
- `POST /api/upload/{batchId}/confirm` — Executes ML scoring and AI explanations pipeline
- `GET /api/upload/history` — History of ingestion batches

### Analytics & Retention Interventions
- `GET /api/analytics/overview` — Aggregated executive retention metrics & exposure
- `POST /api/employees/{id}/interventions` — Log manager retention action
- `GET /api/employees/{id}/interventions` — List logged interventions
