import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.villages import router as villages_router
from app.routers.analytics import router as analytics_router
from app.routers.reports import router as reports_router
from app.routers.weather import router as weather_router
from app.routers.terrain import router as terrain_router
from app.routers.historical import router as historical_router
from app.routers.chatbot import router as chatbot_router
from app.routers.bhuvan_proxy import router as bhuvan_router

app = FastAPI(
    title="NER Landslide Early Warning System (LEWS) API",
    description="""
    ## Smart India Hackathon Prototype: AI-Based Early Warning & Landslide Risk Monitoring Engine
    
    ### Scope: Dima Hasao, East Khasi Hills & Gangtok Pilot Corridors (North Eastern Region)
    - **Villages & Geotechnical Telemetry**: Monitored settlements with real-time risk scores, slope angles, antecedent rainfall, and soil moisture saturation.
    - **Open-Meteo Live APIs**: High-resolution live weather, 72h antecedent rainfall, soil moisture, and river discharge for flash flood detection.
    - **Open-Meteo Elevation Grid**: Live topographic slope gradient and elevation calculation.
    - **NASA GLC Historical Landslides**: Real GeoJSON catalog of recorded disaster events across NER.
    - **ISRO Bhuvan GIS Layers**: WMS integration for LULC, Landslide Hazard Zonation, and Flood Inundation.
    - **Crowdsourced Hazard Reports**: Citizen field submissions (geotagged cracks, rockfalls, mudflows).
    """,
    version="2.0.0",
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
app.include_router(weather_router, prefix="/api")
app.include_router(terrain_router, prefix="/api")
app.include_router(historical_router, prefix="/api")
app.include_router(chatbot_router, prefix="/api")
app.include_router(bhuvan_router, prefix="/api")

@app.get("/", tags=["System"])
def root():
    return {
        "service": "NER Landslide Early Warning Risk Engine",
        "status": "operational",
        "district": "Dima Hasao, Assam",
        "interactive_docs": "/docs",
        "api_endpoints": {
            "villages": "/api/villages",
            "village_live_risk": "/api/villages/{village_id}/live-risk",
            "weather": "/api/weather/{lat}/{lon}",
            "elevation": "/api/elevation/{lat}/{lon}",
            "historical_landslides": "/api/historical-landslides",
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
