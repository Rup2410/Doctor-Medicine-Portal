# Doctor Medicine Information Portal

A full-stack, production-quality web application designed exclusively for doctors to manage medicine-related information received from Medical Representatives (MRs).

---

## 🌟 Key Features

1. **Secure Doctor Authentication**: JWT-based login and registration with BCrypt password hashing.
2. **Automated Document Upload & Storage**: Supports PDF, scanned PDF, JPG, JPEG, and PNG document uploads with server-side unique filename generation.
3. **OCR & AI Extraction Layer**:
   - Extract raw text from PDF & scanned images.
   - Microservice AI extraction converts text into structured JSON fields:
     - Pharmaceutical Company Name
     - Medicine Name
     - Chemical Composition
     - Clinical Indications / Usage Details
     - Medical Representative (MR) Name & Contact Phone Number
4. **Doctor Verification & Confirmation Workflow**:
   - Extracted data is presented to the doctor for mandatory verification.
   - Doctor can modify, add, or delete extracted medicine entries before saving.
   - Optional manual entry fallback mode if extraction fails.
5. **Medicine Catalog & Search**:
   - Search by medicine name, pharma company, or MR name (case-insensitive partial matching).
   - Filter medicines by company or custom date ranges (Today, 7 Days, 30 Days, This Year).
6. **Company Directory & MR Directory**: View pharma manufacturers, total medicine counts, and MR contact phone numbers.
7. **Secure Document Viewing**: Uploaded brochures are protected and served strictly via authenticated endpoints (`/api/documents/{id}/file`).

---

## 🏗️ Architecture & Technology Stack

```
                          ┌─────────────────────────────┐
                          │   React 18 + Vite Frontend   │
                          │   (Tailwind CSS + Lucide)   │
                          └──────────────┬──────────────┘
                                         │ HTTP / REST APIs (JWT)
                                         ▼
                          ┌─────────────────────────────┐
                          │  Spring Boot 3.x Backend    │
                          │  (Spring Security + JPA)    │
                          └──────┬──────────────┬───────┘
                                 │              │
                    SQL Queries  │              │ HTTP REST Call
                                 ▼              ▼
                  ┌────────────────────┐   ┌───────────────────────────┐
                  │   MySQL Database   │   │  FastAPI Python AI/OCR    │
                  │(doctor_medicine_..)│   │ PyMuPDF / OCR / Gemini AI │
                  └────────────────────┘   └───────────────────────────┘
```

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Axios, Lucide Icons.
- **Backend**: Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, JWT (`jjwt`), BCrypt.
- **Database**: MySQL 8.0 (`doctor_medicine_portal`).
- **AI Microservice**: Python 3.10, FastAPI, PyMuPDF (`pypdf`), PIL, Google Gemini API SDK (`google-genai` with rule-based fallback).

---

## 📁 Folder Structure

```text
Doctor-Medicine-Portal/
├── frontend/             # React + Vite + Tailwind CSS UI
├── backend/              # Java Spring Boot 3.2 REST API
├── database/             # MySQL schema.sql & sample-data.sql
├── uploads/              # Local protected file storage
├── ai-service/           # FastAPI Python OCR & Structured Extraction microservice
├── docker-compose.yml    # Container deployment manifest
├── .env.example          # Environment variables template
└── README.md             # Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Java 17+ & Maven
- Node.js 18+ & npm
- Python 3.10+
- MySQL Server 8.0+ (or Docker)

---

### Step 1: Database Setup

1. Start MySQL Server.
2. Run the SQL scripts in order:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/sample-data.sql
   ```

---

### Step 2: Start Python AI & OCR Microservice

```bash
cd ai-service
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Health Check*: `http://localhost:8000/health`

---

### Step 3: Start Spring Boot Backend

```bash
cd backend
mvn clean spring-boot:run
```
*Backend API Base*: `http://localhost:8080/api`

---

### Step 4: Start React Vite Frontend

```bash
cd frontend
npm install
npm run dev
```
*Portal Web UI*: `http://localhost:5173`

---

## 🐳 Docker Deployment

To launch the entire stack using Docker Compose:

```bash
docker-compose up --build
```

Access services:
- **Frontend App**: `http://localhost:5173`
- **Spring Boot Backend**: `http://localhost:8080`
- **FastAPI AI Microservice**: `http://localhost:8000`
- **MySQL DB**: `localhost:3306`

---

## 🔐 Sample Login Credentials

| Role | Email | Password |
|---|---|---|
| **Doctor** | `doctor@example.com` | `password123` |
| **Doctor (Alternative)** | `elena.rostova@hospital.org` | `password123` |

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/register` — Register a new doctor account.
- `POST /api/auth/login` — Login doctor and obtain JWT token.

### Medicines
- `GET /api/medicines` — Search and filter medicines with pagination (`search`, `companyId`, `fromDate`, `toDate`, `page`, `size`).
- `GET /api/medicines/{id}` — Get detailed medicine record, composition, and linked documents.
- `GET /api/medicines/company/{companyId}` — Get all medicines belonging to a specific company.
- `POST /api/medicines/verify-and-save` — Save doctor-verified medicine information.

### Companies
- `GET /api/companies` — List all pharmaceutical companies and MR counts.
- `GET /api/companies/{id}` — Get company details and representative MR contacts.

### Documents
- `POST /api/documents/upload` — Upload PDF/Image brochure for OCR & AI extraction.
- `GET /api/documents` — List doctor's uploaded document archive.
- `GET /api/documents/{id}/file` — Securely stream original document file (requires JWT token).

### Dashboard
- `GET /api/dashboard/statistics` — Get aggregate stats (total medicines, companies, documents).
- `GET /api/dashboard/recent` — Get recently added medicines with date range filter.
