from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.villages import router as villages_router
from app.routers.analytics import router as analytics_router
from app.routers.reports import router as reports_router

app = FastAPI(
    title="NER Landslide Early Warning System (LEWS) API",
    description="""
    ## Smart India Hackathon Prototype: AI-Based Early Warning & Landslide Risk Monitoring Engine
    
    ### Scope: Dima Hasao Pilot Corridor (Assam, North Eastern Region)
    - **Villages & Geotechnical Telemetry**: 25 monitored settlements with real-time risk scores, slope angles, antecedent rainfall, and soil moisture saturation.
    - **Dissemination Engine**: Suggested civil defense and mitigation actions.
    - **Crowdsourced Hazard Reports**: Citizen field submissions (geotagged cracks, rockfalls, mudflows).
    - **ML Interface**: Drop-in compatible predictor for scikit-learn / XGBoost landslide susceptibility models.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api namespace
app.include_router(villages_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(reports_router, prefix="/api")

@app.get("/", tags=["System"])
def root():
    return {
        "service": "NER Landslide Early Warning Risk Engine",
        "status": "operational",
        "district": "Dima Hasao, Assam",
        "interactive_docs": "/docs",
        "api_endpoints": {
            "villages": "/api/villages",
            "district_summary": "/api/analytics/district-summary",
            "corridor_trends": "/api/analytics/corridor-time-series",
            "citizen_reports": "/api/reports",
            "predict_risk": "/api/villages/predict-risk"
        }
    }

@app.get("/api/health", tags=["System"])
def health():
    return {"status": "healthy", "service": "risk-engine-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
