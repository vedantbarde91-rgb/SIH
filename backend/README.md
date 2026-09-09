# NER Landslide Early Warning System — Risk Engine Backend

FastAPI service serving geotechnical data, risk scores, time-series telemetry, crowdsourced hazard reports, and ML prediction interfaces for the **Dima Hasao Pilot District, Assam**.

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Development Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Open Interactive API Documentation
Navigate to [http://localhost:8000/docs](http://localhost:8000/docs) to view and test all endpoints with Swagger UI.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/villages` | All 25 pilot settlements with risk scores & factors |
| `GET` | `/api/villages/{id}` | Detailed parameters and 12-month monthly history |
| `GET` | `/api/villages/{id}/history` | 12-month rainfall & soil moisture time series |
| `POST` | `/api/villages/predict-risk` | ML predictor inference endpoint |
| `GET` | `/api/analytics/district-summary` | High/Critical counts, district threat index |
| `GET` | `/api/analytics/corridor-time-series` | Aggregate 12-month trend for Recharts |
| `GET` | `/api/reports` | Crowdsourced citizen landslide reports |
| `POST` | `/api/reports` | Submit citizen report (cracks, rockfalls, etc.) |
| `PATCH` | `/api/reports/{id}/status` | Update report status (`pending`/`reviewed`/`actioned`) |
