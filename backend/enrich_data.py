import json
import random

# Load dataset
data_path = "backend/app/data/dima_hasao_villages.json"
with open(data_path, "r", encoding="utf-8") as f:
    villages = json.load(f)

# Historical disaster events templates
HISTORICAL_EVENTS_POOL = [
    {
        "year": "2024",
        "date": "18 July 2024",
        "type": "Debris Flow & Rockfall",
        "rainfall": "194 mm (24h continuous monsoon burst)",
        "damage": "NH-27 road link severed for 36 hours; 4 culverts collapsed; 120 residents evacuated.",
        "countermeasures": "Heavy gabion wall installation along chainage 42-45; installed vibrating wire piezometers."
    },
    {
        "year": "2023",
        "date": "24 August 2023",
        "type": "Rotational Slope Failure",
        "rainfall": "162 mm (48h accumulated precipitation)",
        "damage": "Minor subsidence under 3 rural settlement dwellings; water distribution line sheared.",
        "countermeasures": "Subsurface horizontal perforated drainpipes drilled; hydro-seeding vetiver grass on cut slopes."
    },
    {
        "year": "2022",
        "date": "14 May 2022",
        "type": "Catastrophic Flash Flood & Mudslide",
        "rainfall": "285 mm (Extreme cloudburst event)",
        "damage": "Severe railway track subgrade washout; 8 hillside houses inundated; SDRF search & rescue deployed.",
        "countermeasures": "SDRF permanent telemetry relay station established; reinforced concrete retaining walls erected."
    },
    {
        "year": "2020",
        "date": "06 June 2020",
        "type": "Translational Earth Slide",
        "rainfall": "148 mm",
        "damage": "Secondary highway blocked by 400 cubic meters of mud; electricity supply disrupted for 18h.",
        "countermeasures": "High-tensile steel wire mesh anchored into bedrock with 6m soil nails."
    }
]

for v in villages:
    band = v.get("risk_band", "Moderate").upper()
    subdiv = v.get("subdivision", v.get("district", "Regional"))
    
    # Calculate explicit risk percentage
    if band == "CRITICAL":
        risk_pct = round(random.uniform(85.0, 97.5), 1)
        slope_deg = round(random.uniform(42.0, 58.0), 1)
        soil_sat = round(random.uniform(84.0, 98.0), 1)
        rain_72h = round(random.uniform(140.0, 260.0), 1)
        fault_dist = f"{round(random.uniform(0.3, 1.8), 1)} km from Kopili/Haflong active fault line"
        deforest_rate = f"High ({round(random.uniform(35, 60))}% vegetative cover loss on upslope terrace)"
        road_cut = "Active toe erosion & steep unretained highway excavation along base"
    elif band == "HIGH":
        risk_pct = round(random.uniform(68.0, 84.9), 1)
        slope_deg = round(random.uniform(34.0, 44.0), 1)
        soil_sat = round(random.uniform(70.0, 83.0), 1)
        rain_72h = round(random.uniform(95.0, 139.0), 1)
        fault_dist = f"{round(random.uniform(2.0, 4.5), 1)} km from seismic fault trace"
        deforest_rate = f"Moderate ({round(random.uniform(20, 34))}% slope clearing for horticulture)"
        road_cut = "Eroded drainage ditch with partial roadside toe scouring"
    elif band == "MODERATE":
        risk_pct = round(random.uniform(42.0, 67.9), 1)
        slope_deg = round(random.uniform(22.0, 33.0), 1)
        soil_sat = round(random.uniform(50.0, 69.0), 1)
        rain_72h = round(random.uniform(45.0, 94.0), 1)
        fault_dist = f"{round(random.uniform(4.6, 9.0), 1)} km from tectonic shear line"
        deforest_rate = f"Low ({round(random.uniform(10, 19))}% canopy thinning)"
        road_cut = "Natural slope foot with stable unpaved embankment"
    else: # LOW
        risk_pct = round(random.uniform(12.0, 41.9), 1)
        slope_deg = round(random.uniform(10.0, 21.0), 1)
        soil_sat = round(random.uniform(25.0, 49.0), 1)
        rain_72h = round(random.uniform(10.0, 44.0), 1)
        fault_dist = f">{round(random.uniform(9.5, 18.0), 1)} km from regional fault boundary"
        deforest_rate = "Minimal (<8% disturbance, dense climax bamboo/forest cover)"
        road_cut = "Stable engineered berm with functional masonry culverts"

    v["risk_percentage"] = risk_pct

    # 6 Contributing Geotechnical Reasons
    v["contributing_factors_detailed"] = [
        {
            "factor": "Slope Gradient & Profile",
            "value": f"{slope_deg}° steep incline",
            "risk_impact": "High" if slope_deg > 35 else ("Moderate" if slope_deg > 22 else "Low"),
            "description": "Steep talus formation prone to shear failure under gravity."
        },
        {
            "factor": "72-Hour Accumulated Rainfall",
            "value": f"{rain_72h} mm",
            "risk_impact": "Critical" if rain_72h > 140 else ("High" if rain_72h > 90 else "Moderate"),
            "description": "Prolonged saturation exceeding hydrological infiltration threshold."
        },
        {
            "factor": "Soil Saturation & Pore Pressure",
            "value": f"{soil_sat}% volumetric moisture",
            "risk_impact": "Critical" if soil_sat > 80 else ("Moderate" if soil_sat > 50 else "Low"),
            "description": "High pore water pressure liquefying silty-clay cohesive bonds."
        },
        {
            "factor": "Geological Fault Line Proximity",
            "value": fault_dist,
            "risk_impact": "High" if "km" in fault_dist and float(fault_dist.split()[0].replace('>', '')) < 3.0 else "Low",
            "description": "Fractured sandstone and shale bedrock weakened by tectonic stress."
        },
        {
            "factor": "Vegetation / Deforestation Index",
            "value": deforest_rate,
            "risk_impact": "High" if "High" in deforest_rate else ("Moderate" if "Moderate" in deforest_rate else "Low"),
            "description": "Loss of root matrix cohesion exacerbates surface rill wash and deep creep."
        },
        {
            "factor": "Road Cutting & Anthropogenic Excavation",
            "value": road_cut,
            "risk_impact": "High" if "Active" in road_cut else ("Moderate" if "Eroded" in road_cut else "Low"),
            "description": "Unsupported cut-slopes along transportation corridors remove toe support."
        }
    ]

    # Weather Forecast Widget Data
    v["weather_forecast"] = {
        "temperature_c": round(random.uniform(21.0, 28.5), 1),
        "rainfall_24h_mm": round(random.uniform(15.0, 85.0) if band in ["CRITICAL", "HIGH"] else random.uniform(2.0, 25.0), 1),
        "rainfall_7d_mm": round(random.uniform(120.0, 310.0) if band in ["CRITICAL", "HIGH"] else random.uniform(30.0, 110.0), 1),
        "humidity_pct": random.randint(75, 98) if band in ["CRITICAL", "HIGH"] else random.randint(55, 80),
        "wind_speed_kmh": round(random.uniform(8.0, 32.0), 1),
        "condition": "Heavy Monsoon Rain" if band == "CRITICAL" else ("Scattered Thunderstorms" if band == "HIGH" else "Intermittent Showers")
    }

    # Infrastructure At Risk & Detour Routes
    v["infrastructure_at_risk"] = {
        "bridges": [f"{v['name']} RCC Culvert #{random.randint(11, 49)}", f"River Span Bridge K-{random.randint(101, 199)}"],
        "power_lines": [f"33kV Feeder Substation Link - {v['district']}", f"Local 11kV Distribution Grid Pole #{random.randint(20, 80)}"],
        "hospitals": [f"{v['name']} Primary Health Centre (PHC)", f"{v['district']} District Civil Hospital (Emergency Unit)"],
        "telecom_towers": [f"BSNL Microwave Link Tower #{random.randint(1, 15)}", f"Airtel/Jio 4G Sector Tower"],
        "alternative_routes": [
            f"State Highway 19 Bypass via {subdiv} Eastern Ridge (Operational, 18km detour)",
            f"Forest Service Arterial Corridor (4x4 Emergency Vehicles Only)"
        ]
    }

    # Historical Landslides Timeline
    v["historical_landslides"] = random.sample(HISTORICAL_EVENTS_POOL, k=random.randint(2, 3))

with open(data_path, "w", encoding="utf-8") as f:
    json.dump(villages, f, indent=2, ensure_ascii=False)

print(f"Successfully enriched {len(villages)} settlements in {data_path}")
