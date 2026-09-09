import json
import os
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.village import VillageBase, VillageDetail, MonthlyHistory, RiskPredictionInput, RiskPredictionOutput
from app.ml.predictor import predictor

router = APIRouter(prefix="/villages", tags=["Villages & Risk"])

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "dima_hasao_villages.json")

def load_villages() -> List[dict]:
    if not os.path.exists(DATA_PATH):
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("", response_model=List[VillageBase])
def get_villages(
    state: Optional[str] = Query(None, description="Filter by state (e.g. Assam, Meghalaya)"),
    district: Optional[str] = Query(None, description="Filter by district (e.g. Dima Hasao, East Khasi Hills, Ri-Bhoi, Kamrup)"),
    band: Optional[str] = Query(None, description="Filter by risk band: Low, Moderate, High, Critical"),
    min_risk: Optional[int] = Query(None, ge=0, le=100, description="Minimum risk score"),
    search: Optional[str] = Query(None, description="Search by name, subdivision, or district")
):
    villages = load_villages()
    filtered = []
    for v in villages:
        if state and state.lower() != "all" and v.get("state", "").lower() != state.lower():
            continue
        if district and district.lower() != "all" and v.get("district", "").lower() != district.lower():
            continue
        if band and band.lower() != "all" and v.get("risk_band", "").lower() != band.lower():
            continue
        if min_risk is not None and v.get("risk_score", 0) < min_risk:
            continue
        if search:
            q = search.lower()
            if (
                q not in v.get("name", "").lower()
                and q not in v.get("subdivision", "").lower()
                and q not in v.get("district", "").lower()
            ):
                continue
        # Base representation strips monthly_history for payload efficiency
        base_v = {k: val for k, val in v.items() if k != "monthly_history"}
        filtered.append(base_v)
    return filtered

@router.get("/{village_id}", response_model=VillageDetail)
def get_village(village_id: str):
    villages = load_villages()
    for v in villages:
        if v["id"].upper() == village_id.upper():
            return v
    raise HTTPException(status_code=404, detail=f"Village with ID {village_id} not found")

@router.get("/{village_id}/history", response_model=List[MonthlyHistory])
def get_village_history(village_id: str):
    villages = load_villages()
    for v in villages:
        if v["id"].upper() == village_id.upper():
            return v.get("monthly_history", [])
    raise HTTPException(status_code=404, detail=f"Village with ID {village_id} not found")

@router.post("/predict-risk", response_model=RiskPredictionOutput)
def predict_risk(input_data: RiskPredictionInput):
    """
    Inference endpoint for real-time or hypothetical landslide risk computation.
    Compatible with current geotechnical heuristic model or future trained ML model.
    """
    result = predictor.predict(
        slope_deg=input_data.slope_deg,
        rainfall_72h_mm=input_data.rainfall_72h_mm,
        soil_moisture_pct=input_data.soil_moisture_pct,
        lithology_factor=input_data.lithology_factor,
        land_use_cut_slope=input_data.land_use_cut_slope
    )
    return result
