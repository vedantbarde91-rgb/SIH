import json
import os

REPORTS_FILE = os.path.join(os.path.dirname(__file__), "app", "data", "citizen_reports.json")

seed_reports = [
    {
        "id": "REP-2026-DH-01",
        "hazard_type": "crack",
        "description": "Widening longitudinal tension crack observed across asphalt near km 43 on NH-27 Harangajao cutting. Approximately 3.5 inches wide and expanding rapidly after 190mm continuous rain.",
        "lat": 25.1180,
        "lon": 92.8685,
        "location_name": "Harangajao Pass Cutting (NH-27)",
        "district": "Dima Hasao",
        "state": "Assam",
        "phone_number": "+91 94350 21890",
        "photo_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80",
        "status": "reviewed",
        "created_at": "2026-09-09T08:30:00Z",
        "officer_notes": "SDRF Haflong quick-response crew dispatched with piezometer inspection team."
    },
    {
        "id": "REP-2026-DH-02",
        "hazard_type": "rockfall",
        "description": "Large boulders and Barail sandstone debris dislodged from upper hill slope near Ditokcherra railway spur. Track ballast covered, single line blocked.",
        "lat": 25.0845,
        "lon": 92.9515,
        "location_name": "Ditokcherra Railway Cutting",
        "district": "Dima Hasao",
        "state": "Assam",
        "phone_number": "+91 98540 88210",
        "photo_url": "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80",
        "status": "pending",
        "created_at": "2026-09-10T04:15:00Z",
        "officer_notes": None
    },
    {
        "id": "REP-2026-DH-03",
        "hazard_type": "slope_movement",
        "description": "Active mud slurry creep bowed down tea-garden retaining fence near Lower Haflong Basti. Water seeping from cut-slope face.",
        "lat": 25.1765,
        "lon": 93.0180,
        "location_name": "Lower Haflong Settlement",
        "district": "Dima Hasao",
        "state": "Assam",
        "phone_number": "+91 87621 34912",
        "photo_url": "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80",
        "status": "actioned",
        "created_at": "2026-09-08T14:20:00Z",
        "officer_notes": "Earthmover cleared catch-drain; 12 families relocated to Haflong relief center."
    },
    {
        "id": "REP-2026-EKH-01",
        "hazard_type": "rockfall",
        "description": "Limestone blocks weighing over 15 tonnes fell onto the Shillong–Dawki arterial corridor near Cherrapunji rim. Guardrails smashed.",
        "lat": 25.2750,
        "lon": 91.7320,
        "location_name": "Cherrapunji (Sohra) Rim Escarpment",
        "district": "East Khasi Hills",
        "state": "Meghalaya",
        "phone_number": "+91 94361 09843",
        "photo_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80",
        "status": "reviewed",
        "created_at": "2026-09-09T11:45:00Z",
        "officer_notes": "Meghalaya PWD deploying rock-breakers and high-tensile drapery netting."
    },
    {
        "id": "REP-2026-EKH-02",
        "hazard_type": "crack",
        "description": "Enormous crescent tension crack running 40 meters along Mawkdok Dympep valley viewpoint parking shoulder. Subgrade sagging 12 inches.",
        "lat": 25.3412,
        "lon": 91.7580,
        "location_name": "Mawkdok Dympep Valley Viewpoint",
        "district": "East Khasi Hills",
        "state": "Meghalaya",
        "phone_number": "+91 98620 44512",
        "photo_url": "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80",
        "status": "pending",
        "created_at": "2026-09-10T06:00:00Z",
        "officer_notes": None
    },
    {
        "id": "REP-2026-EKH-03",
        "hazard_type": "blocked_road",
        "description": "Pynursla Ridge descent road cut off by deep shale landslide slurry after 240mm downpour. Over 40 vegetable supply trucks stranded.",
        "lat": 25.3090,
        "lon": 91.8950,
        "location_name": "Pynursla Ridge km 52",
        "district": "East Khasi Hills",
        "state": "Meghalaya",
        "phone_number": "+91 97740 33219",
        "photo_url": "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80",
        "status": "actioned",
        "created_at": "2026-09-08T16:10:00Z",
        "officer_notes": "BRO deployed front-end loaders; single-lane convoy traffic restored."
    },
    {
        "id": "REP-2026-GTK-01",
        "hazard_type": "slope_movement",
        "description": "Active debris avalanche along 9th Mile JN Road leading to Tsomgo Lake. Thick schist mud slurry descending across both lanes.",
        "lat": 27.3580,
        "lon": 88.6650,
        "location_name": "9th Mile JN Road (Tsomgo Axis)",
        "district": "Gangtok",
        "state": "Sikkim",
        "phone_number": "+91 94340 76543",
        "photo_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80",
        "status": "reviewed",
        "created_at": "2026-09-09T09:20:00Z",
        "officer_notes": "Project Swastik BRO unit mobilized; vehicular passes temporarily suspended."
    },
    {
        "id": "REP-2026-GTK-02",
        "hazard_type": "blocked_road",
        "description": "NH-10 near Ranipool river confluence blocked by massive talus cone. Silt-laden flood water overflowing onto national highway.",
        "lat": 27.2910,
        "lon": 88.5870,
        "location_name": "Ranipool Catchment Corridor",
        "district": "Gangtok",
        "state": "Sikkim",
        "phone_number": "+91 98320 11984",
        "photo_url": "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80",
        "status": "pending",
        "created_at": "2026-09-10T05:40:00Z",
        "officer_notes": None
    },
    {
        "id": "REP-2026-GTK-03",
        "hazard_type": "crack",
        "description": "Progressive shear cracks on Martam agricultural terraced slope. Terraces dropping by 0.5 meters towards valley floor.",
        "lat": 27.2480,
        "lon": 88.5420,
        "location_name": "Martam Slope Agricultural Zone",
        "district": "Gangtok",
        "state": "Sikkim",
        "phone_number": "+91 89721 66542",
        "photo_url": "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80",
        "status": "actioned",
        "created_at": "2026-09-07T12:00:00Z",
        "officer_notes": "Sikkim Disaster Management Authority geo-technical engineer surveyed site; sub-surface drainage channels opened."
    }
]

existing_reports = []
if os.path.exists(REPORTS_FILE):
    try:
        with open(REPORTS_FILE, "r", encoding="utf-8") as f:
            existing_reports = json.load(f)
    except Exception as e:
        print("Error reading existing reports:", e)

# Preserve existing user-submitted reports that don't clash
existing_ids = {r["id"] for r in seed_reports}
combined = seed_reports + [r for r in existing_reports if r.get("id") not in existing_ids]

with open(REPORTS_FILE, "w", encoding="utf-8") as f:
    json.dump(combined, f, indent=2)

print(f"Successfully seeded {len(combined)} citizen reports across Dima Hasao, East Khasi Hills, and Gangtok.")
