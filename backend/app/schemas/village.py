from typing import List, Optional
from pydantic import BaseModel, Field

class MonthlyHistory(BaseModel):
    month: str
    rainfall_mm: float
    soil_moisture_pct: float
    risk_score: int

class VillageBase(BaseModel):
    id: str
    name: str
    subdivision: str
    district: str
    state: str
    lat: float
    lon: float
    elevation_m: int
    slope_deg: float
    rainfall_72h_mm: float
    soil_moisture_pct: float
    risk_score: int = Field(..., ge=0, le=100)
    risk_band: str
    contributing_factors: List[str]
    suggested_action: str

class VillageDetail(VillageBase):
    monthly_history: List[MonthlyHistory]

class RiskPredictionInput(BaseModel):
    slope_deg: float = Field(..., description="Slope gradient in degrees")
    rainfall_72h_mm: float = Field(..., description="72-hour antecedent rainfall in mm")
    soil_moisture_pct: float = Field(..., description="Soil moisture saturation percentage (0-100)")
    lithology_factor: float = Field(default=1.2, description="Rock/soil cohesion factor (Disang shale default 1.2)")
    land_use_cut_slope: bool = Field(default=False, description="Presence of artificial cut slopes or deforestation")

class RiskPredictionOutput(BaseModel):
    predicted_risk_score: int = Field(..., ge=0, le=100)
    predicted_risk_band: str
    factor_breakdown: dict
    confidence: float
