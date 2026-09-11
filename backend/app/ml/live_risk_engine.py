import math
import os
import json
from typing import Dict, Any, Optional
import httpx

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "ner_historical_landslides.geojson")

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance in kilometers between two points."""
    r = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c

def find_nearest_historical_landslide(lat: float, lon: float) -> Dict[str, Any]:
    """Find the nearest recorded historical landslide in NER and its distance in km."""
    if not os.path.exists(DATA_PATH):
        return {"distance_km": 999.0, "event": None}
    
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    min_dist = float("inf")
    nearest_event = None

    for feat in data.get("features", []):
        coords = feat.get("geometry", {}).get("coordinates", [])
        if len(coords) >= 2:
            feat_lon, feat_lat = coords[0], coords[1]
            dist = haversine_km(lat, lon, feat_lat, feat_lon)
            if dist < min_dist:
                min_dist = dist
                nearest_event = feat.get("properties", {})

    return {
        "distance_km": round(min_dist, 2) if min_dist != float("inf") else 999.0,
        "event": nearest_event
    }

class LiveRiskScoringEngine:
    """
    Computes dynamic real-time landslide risk index (0-100) combining:
    1. Live soil moisture saturation (Open-Meteo)
    2. 72-hour Antecedent rainfall accumulation (Open-Meteo)
    3. Topographic slope gradient (Open-Meteo Elevation Grid)
    4. Proximity to historical landslide collapse corridors (GLC/GSI records)
    """

    def compute_risk(
        self,
        lat: float,
        lon: float,
        slope_deg: float,
        rainfall_72h_mm: float,
        soil_moisture_pct: float,
        precipitation_2h_mm: float = 0.0,
        river_discharge_m3s: Optional[float] = None,
        lithology_factor: float = 1.15,
        cut_slope_present: bool = False
    ) -> Dict[str, Any]:
        # 1. Proximity to historical slide
        hist = find_nearest_historical_landslide(lat, lon)
        dist_km = hist["distance_km"]
        nearest_event = hist["event"]

        # Proximity normalization: < 3km = 100%, 3-10km = scaled, > 25km = 0%
        if dist_km <= 3.0:
            proximity_norm = 100.0
        elif dist_km <= 25.0:
            proximity_norm = max(0.0, (25.0 - dist_km) / (25.0 - 3.0) * 100.0)
        else:
            proximity_norm = 0.0

        # 2. Slope angle normalization (15° to 50°)
        slope_norm = min(max((slope_deg - 15.0) / (50.0 - 15.0), 0.0), 1.0) * 100.0

        # 3. Antecedent rainfall normalization (0 to 250mm)
        rain_norm = min(max(rainfall_72h_mm / 250.0, 0.0), 1.0) * 100.0

        # 4. Soil moisture normalization (20% to 85%)
        moisture_norm = min(max((soil_moisture_pct - 20.0) / (85.0 - 20.0), 0.0), 1.0) * 100.0

        # Composite multi-criteria weighted formula:
        # 30% Slope, 35% 72h Rainfall, 20% Soil Moisture, 15% Historical Hazard Proximity
        raw_score = (
            (0.30 * slope_norm) +
            (0.35 * rain_norm) +
            (0.20 * moisture_norm) +
            (0.15 * proximity_norm)
        )

        # Apply regional rock lithology multiplier (weathered Disang shale / Daling phyllite)
        raw_score *= lithology_factor

        # Anthropogenic road cut / deforestation penalty
        if cut_slope_present:
            raw_score += 7.5

        final_score = int(round(min(max(raw_score, 0), 100)))

        # Risk band determination
        if final_score <= 25:
            band = "Low"
            action = "Routine corridor monitoring; standard slope drainage maintenance."
        elif final_score <= 50:
            band = "Moderate"
            action = "Issue advisory for highway crews; monitor culverts and check for tension cracks."
        elif final_score <= 75:
            band = "High"
            action = "Pre-position heavy earth-moving equipment; restrict non-essential heavy freight on cut slopes."
        else:
            band = "Critical"
            action = "TRIGGER CIVIL DEFENSE: Evacuate vulnerable toe settlements and shut down hill corridor traffic."

        # Flash flood condition check:
        # Triggered if 2-hour cloudburst > 50mm OR river discharge spikes > 35 m3/s
        flash_flood_warning = False
        flood_reasons = []
        if precipitation_2h_mm >= 50.0:
            flash_flood_warning = True
            flood_reasons.append(f"Intense 2h rainfall ({precipitation_2h_mm} mm) exceeding flash threshold")
        if river_discharge_m3s is not None and river_discharge_m3s >= 35.0:
            flash_flood_warning = True
            flood_reasons.append(f"River discharge spike ({river_discharge_m3s} m³/s) indicating imminent river overflow")

        return {
            "live_risk_score": final_score,
            "risk_band": band,
            "suggested_action": action,
            "flash_flood_warning": flash_flood_warning,
            "flash_flood_reasons": flood_reasons,
            "factor_weights": {
                "slope_contribution": round(0.30 * slope_norm, 1),
                "rainfall_contribution": round(0.35 * rain_norm, 1),
                "soil_moisture_contribution": round(0.20 * moisture_norm, 1),
                "historical_proximity_contribution": round(0.15 * proximity_norm, 1),
                "lithology_multiplier": lithology_factor
            },
            "telemetry_inputs": {
                "slope_deg": slope_deg,
                "rainfall_72h_mm": rainfall_72h_mm,
                "soil_moisture_pct": soil_moisture_pct,
                "precipitation_2h_mm": precipitation_2h_mm,
                "river_discharge_m3s": river_discharge_m3s
            },
            "nearest_historical_hazard": {
                "distance_km": dist_km,
                "title": nearest_event.get("event_title") if nearest_event else None,
                "date": nearest_event.get("date") if nearest_event else None,
                "fatalities": nearest_event.get("fatalities") if nearest_event else 0,
                "category": nearest_event.get("landslide_category") if nearest_event else None
            }
        }

live_risk_engine = LiveRiskScoringEngine()
