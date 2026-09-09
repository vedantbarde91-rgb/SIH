import json
import os
from typing import Dict, Any, List
from fastapi import APIRouter
from app.routers.villages import load_villages

router = APIRouter(prefix="/analytics", tags=["Analytics & Telemetry"])

@router.get("/district-summary")
def get_district_summary() -> Dict[str, Any]:
    villages = load_villages()
    total = len(villages)
    if total == 0:
        return {}

    band_counts = {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}
    total_rainfall = 0.0
    total_soil_moisture = 0.0
    critical_villages = []

    for v in villages:
        band = v.get("risk_band", "Low")
        band_counts[band] = band_counts.get(band, 0) + 1
        total_rainfall += v.get("rainfall_72h_mm", 0)
        total_soil_moisture += v.get("soil_moisture_pct", 0)
        if band in ["Critical", "High"]:
            critical_villages.append({
                "id": v["id"],
                "name": v["name"],
                "subdivision": v["subdivision"],
                "risk_score": v["risk_score"],
                "risk_band": band,
                "rainfall_72h_mm": v["rainfall_72h_mm"]
            })

    # Sort critical villages descending by risk score
    critical_villages.sort(key=lambda x: x["risk_score"], reverse=True)

    # Calculate overall corridor threat index
    avg_risk = sum(v.get("risk_score", 0) for v in villages) / total

    return {
        "district": "Dima Hasao",
        "state": "Assam",
        "total_monitored_settlements": total,
        "average_risk_score": round(avg_risk, 1),
        "alert_level": "ORANGE ALERT" if avg_risk >= 50 else "YELLOW WATCH",
        "risk_band_distribution": band_counts,
        "avg_72h_rainfall_mm": round(total_rainfall / total, 1),
        "avg_soil_moisture_pct": round(total_soil_moisture / total, 1),
        "critical_priority_sites": critical_villages[:5],
        "active_corridor_warnings": [
            "NH-27 km 64-78 (Harangajao-Jatinga section) under saturated slope alert",
            "Lumding-Badarpur Hill Section railway line active track subsidence watch"
        ]
    }

@router.get("/corridor-time-series")
def get_corridor_time_series() -> List[Dict[str, Any]]:
    """
    Aggregates average 12-month rainfall and soil moisture for critical slope zones.
    Used for Recharts multi-line analytics.
    """
    villages = load_villages()
    if not villages:
        return []

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    series_data = []

    for idx, m in enumerate(months):
        r_vals = []
        sm_vals = []
        risk_vals = []
        for v in villages:
            history = v.get("monthly_history", [])
            if idx < len(history):
                r_vals.append(history[idx].get("rainfall_mm", 0))
                sm_vals.append(history[idx].get("soil_moisture_pct", 0))
                risk_vals.append(history[idx].get("risk_score", 0))

        series_data.append({
            "month": m,
            "avg_rainfall_mm": round(sum(r_vals) / len(r_vals), 1) if r_vals else 0,
            "avg_soil_moisture_pct": round(sum(sm_vals) / len(sm_vals), 1) if sm_vals else 0,
            "avg_risk_score": round(sum(risk_vals) / len(risk_vals), 1) if risk_vals else 0,
            "critical_threshold_rainfall": 200,
            "danger_threshold_moisture": 80
        })

    return series_data
