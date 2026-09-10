from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ReportCreate(BaseModel):
    hazard_type: str = Field(..., description="crack | slope_movement | blocked_road | rockfall")
    description: str = Field(..., description="Free-text citizen observation note")
    lat: float = Field(..., description="Latitude captured via browser GPS or pin")
    lon: float = Field(..., description="Longitude captured via browser GPS or pin")
    location_name: Optional[str] = Field(default="Dima Hasao Corridor", description="Reported settlement or road stretch")
    district: Optional[str] = Field(default="Dima Hasao", description="District name for geofenced routing")
    phone_number: Optional[str] = Field(default=None, description="Optional citizen phone number")
    user_id: Optional[str] = Field(default=None, description="Unique citizen ID or mobile for ownership isolation")
    photo_url: Optional[str] = Field(default=None, description="Uploaded photo URL or base64 data")

class ReportStatusUpdate(BaseModel):
    status: str = Field(..., description="pending | reviewed | actioned")
    officer_notes: Optional[str] = None

class ReportResponse(ReportCreate):
    id: str
    status: str = "pending"
    created_at: str
    officer_notes: Optional[str] = None
