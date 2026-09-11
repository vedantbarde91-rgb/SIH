import math
import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/elevation", tags=["Terrain & Geomorphology"])

TIMEOUT = 6.0

@router.get("/{lat}/{lon}")
async def get_elevation_and_slope(lat: float, lon: float):
    """
    Fetches physical surface elevation and computes topographic slope angle (degrees)
    using the Open-Meteo Elevation API across a 5-point cardinal grid.
    
    Grid:
    - Center: (lat, lon)
    - North: (lat + 0.001, lon)
    - South: (lat - 0.001, lon)
    - East:  (lat, lon + 0.001)
    - West:  (lat, lon - 0.001)
    
    Formula:
    g_x = (E_east - E_west) / (2 * dx)
    g_y = (E_north - E_south) / (2 * dy)
    slope_angle = arctan(sqrt(g_x^2 + g_y^2)) * (180 / pi)
    """
    step = 0.001  # ~111.3 meters
    lats = [lat, lat + step, lat - step, lat, lat]
    lons = [lon, lon, lon, lon + step, lon - step]

    lat_str = ",".join(f"{x:.6f}" for x in lats)
    lon_str = ",".join(f"{x:.6f}" for x in lons)
    url = f"https://api.open-meteo.com/v1/elevation?latitude={lat_str}&longitude={lon_str}"

    elevations = None
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                elevations = data.get("elevation", [])
    except Exception as e:
        print(f"Open-Meteo Elevation error: {e}")

    # Fallback if API fails or returns incomplete data
    if not elevations or len(elevations) < 5 or None in elevations:
        # Default fallback reasonable for NER hill corridor
        return {
            "source": "Terrain Fallback",
            "latitude": lat,
            "longitude": lon,
            "elevation_m": 650.0,
            "slope_deg": 32.5,
            "slope_category": "Steep (30°-45°)",
            "grid_elevations": {
                "center": 650.0,
                "north": 670.0,
                "south": 630.0,
                "east": 645.0,
                "west": 655.0
            }
        }

    e_center, e_north, e_south, e_east, e_west = elevations[0], elevations[1], elevations[2], elevations[3], elevations[4]

    # Geodesic distances in meters
    # 1 deg latitude ≈ 111,320 meters
    dy = step * 111320.0
    # 1 deg longitude ≈ 111,320 * cos(lat) meters
    dx = step * 111320.0 * math.cos(math.radians(lat))

    # Avoid zero division
    dx = max(dx, 1.0)
    dy = max(dy, 1.0)

    # Partial derivatives
    gx = (e_east - e_west) / (2.0 * dx)
    gy = (e_north - e_south) / (2.0 * dy)

    # Gradient magnitude and slope in degrees
    grad_magnitude = math.sqrt(gx * gx + gy * gy)
    slope_radians = math.atan(grad_magnitude)
    slope_deg = round(math.degrees(slope_radians), 1)

    # Classification
    if slope_deg < 15:
        category = "Gentle (< 15°)"
    elif slope_deg < 30:
        category = "Moderate (15°-30°)"
    elif slope_deg < 45:
        category = "Steep (30°-45°)"
    else:
        category = "Very Steep / Precipitous (> 45°)"

    return {
        "source": "Open-Meteo Elevation Grid",
        "latitude": lat,
        "longitude": lon,
        "elevation_m": round(e_center, 1),
        "slope_deg": slope_deg,
        "slope_category": category,
        "gradient": round(grad_magnitude, 4),
        "grid_elevations": {
            "center": round(e_center, 1),
            "north": round(e_north, 1),
            "south": round(e_south, 1),
            "east": round(e_east, 1),
            "west": round(e_west, 1)
        }
    }
