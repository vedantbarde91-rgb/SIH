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

# Initialize FastAPI with Swagger and ReDoc documentation disabled
app = FastAPI(
    title="NER Landslide Early Warning System (LEWS) API",
    description="AI-Based Early Warning & Landslide Risk Monitoring Engine for North Eastern Region",
    version="2.0.0",
    docs_url=None,       # Disables /docs (Swagger UI)
    redoc_url=None,      # Disables /redoc
    openapi_url=None     # Completely disables OpenAPI schema endpoint
)

# Allowed frontend origins (Netlify production + local development)
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://ner-earlywarningpredict.netlify.app",
]

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.netlify\.app",  # Permits all Netlify preview deploys
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
    # Pull dynamic port assigned by Render or default to 8000 for local run
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)