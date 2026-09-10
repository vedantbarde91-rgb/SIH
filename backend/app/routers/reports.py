import json
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from app.schemas.report import ReportCreate, ReportResponse, ReportStatusUpdate

router = APIRouter(prefix="/reports", tags=["Citizen Field Reports"])

REPORTS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "citizen_reports.json")

INITIAL_REPORTS = [
    {
        "id": "REP-2026-001",
        "hazard_type": "crack",
        "description": "Widening longitudinal tension crack observed across the asphalt near km 71 on Jatinga Hill road. Approximately 4 inches wide and expanding after overnight downpour.",
        "lat": 25.1325,
        "lon": 93.0422,
        "location_name": "Jatinga-Haflong Bypass (NH-27)",
        "phone_number": "+91 94350 21890",
        "photo_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80",
        "status": "reviewed",
        "created_at": "2026-09-08T18:42:00Z",
        "officer_notes": "SDRF team dispatched for inspection. Traffic redirected to alternate spur."
    },
    {
        "id": "REP-2026-002",
        "hazard_type": "rockfall",
        "description": "Large boulders tumbled from upper cutting near Ditokcherra railway station cutting. Blocking drainage ditch and partial single track.",
        "lat": 25.0845,
        "lon": 92.9515,
        "location_name": "Ditokcherra Rail Section",
        "phone_number": "+91 98540 88210",
        "photo_url": "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80",
        "status": "pending",
        "created_at": "2026-09-09T05:15:00Z",
        "officer_notes": None
    },
    {
        "id": "REP-2026-003",
        "hazard_type": "slope_movement",
        "description": "Continuous mud slurry flow creeping down tea-garden slope near Harangajao market border. Retaining bamboo fence bowed outward.",
        "lat": 25.1180,
        "lon": 92.8685,
        "location_name": "Harangajao Lower Basti",
        "phone_number": "+91 87621 34912",
        "photo_url": "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80",
        "status": "actioned",
        "created_at": "2026-09-07T14:30:00Z",
        "officer_notes": "Earthmover cleared ditch; 14 families temporarily sheltered in Harangajao High School."
    }
]

def load_reports() -> List[dict]:
    if not os.path.exists(REPORTS_FILE):
        save_reports(INITIAL_REPORTS)
        return INITIAL_REPORTS
    try:
        with open(REPORTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return INITIAL_REPORTS

def save_reports(reports: List[dict]):
    os.makedirs(os.path.dirname(REPORTS_FILE), exist_ok=True)
    with open(REPORTS_FILE, "w", encoding="utf-8") as f:
        json.dump(reports, f, indent=2)

@router.get("", response_model=List[ReportResponse])
def get_all_reports(
    status: Optional[str] = None,
    district: Optional[str] = None,
    user_id: Optional[str] = None
):
    reports = load_reports()
    results = []
    for r in reports:
        if status and r.get("status", "").lower() != status.lower():
            continue
        if district and district.upper() != "ALL" and r.get("district", "Dima Hasao").lower() != district.lower():
            continue
        if user_id and r.get("user_id") != user_id and r.get("phone_number") != user_id:
            continue
        results.append(r)
    return results

@router.post("", response_model=ReportResponse, status_code=201)
def create_report(report_data: ReportCreate):
    reports = load_reports()
    new_id = f"REP-{datetime.now().year}-{str(uuid.uuid4())[:6].upper()}"
    new_entry = {
        "id": new_id,
        "hazard_type": report_data.hazard_type,
        "description": report_data.description,
        "lat": report_data.lat,
        "lon": report_data.lon,
        "location_name": report_data.location_name or "Dima Hasao Corridor",
        "district": report_data.district or "Dima Hasao",
        "phone_number": report_data.phone_number,
        "user_id": report_data.user_id,
        "photo_url": report_data.photo_url or "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "officer_notes": None
    }
    # Prepend new reports so newest appear first
    reports.insert(0, new_entry)
    save_reports(reports)
    return new_entry

@router.patch("/{report_id}/status", response_model=ReportResponse)
def update_report_status(report_id: str, update: ReportStatusUpdate):
    reports = load_reports()
    for r in reports:
        if r["id"] == report_id:
            r["status"] = update.status.lower()
            if update.officer_notes is not None:
                r["officer_notes"] = update.officer_notes
            save_reports(reports)
            return r
    raise HTTPException(status_code=404, detail=f"Report {report_id} not found")
