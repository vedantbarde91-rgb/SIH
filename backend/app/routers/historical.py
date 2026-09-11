import json
import os
from typing import Optional
from fastapi import APIRouter, Query

router = APIRouter(prefix="/historical-landslides", tags=["Historical Disasters"])

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "ner_historical_landslides.geojson")

def load_geojson() -> dict:
    if not os.path.exists(DATA_PATH):
        return {"type": "FeatureCollection", "features": [], "metadata": {"count": 0}}
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("")
def get_historical_landslides(
    state: Optional[str] = Query(None, description="Filter by state (e.g. Assam, Meghalaya, Sikkim)"),
    district: Optional[str] = Query(None, description="Filter by district (e.g. Dima Hasao, East Khasi Hills, Gangtok)"),
    min_fatalities: Optional[int] = Query(None, ge=0, description="Filter by minimum fatalities"),
    limit: Optional[int] = Query(100, ge=1, le=500, description="Maximum number of records to return")
):
    """
    Returns authentic historical landslide events from NASA Global Landslide Catalog (GLC)
    and Geological Survey of India (GSI) filtered to the North Eastern Region.
    Formatted as GeoJSON FeatureCollection for seamless React-Leaflet integration.
    """
    raw_data = load_geojson()
    features = raw_data.get("features", [])

    state_val = state if isinstance(state, str) else None
    district_val = district if isinstance(district, str) else None
    min_fat_val = min_fatalities if isinstance(min_fatalities, int) else None
    limit_val = limit if isinstance(limit, int) else 100

    filtered_features = []
    for feat in features:
        props = feat.get("properties", {})
        if state_val and state_val.lower() != "all" and props.get("state", "").lower() != state_val.lower():
            continue
        if district_val and district_val.lower() != "all" and props.get("district", "").lower() != district_val.lower():
            continue
        if min_fat_val is not None and props.get("fatalities", 0) < min_fat_val:
            continue
        filtered_features.append(feat)

    limited = filtered_features[:limit_val]

    return {
        "type": "FeatureCollection",
        "metadata": {
            "source": raw_data.get("metadata", {}).get("source", "NASA GLC & GSI Records"),
            "region": "North Eastern Region (NER), India",
            "total_matches": len(filtered_features),
            "returned_count": len(limited)
        },
        "features": limited
    }
