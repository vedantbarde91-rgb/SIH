import json
import os

path = os.path.join(os.path.dirname(__file__), 'app', 'data', 'dima_hasao_villages.json')
with open(path, 'r', encoding='utf-8') as f:
    villages = json.load(f)

# The 3 NER Pilot Districts & exact nodes requested:
pilot_nodes = [
    # ==========================================
    # 1. DIMA HASAO (ASSAM)
    # ==========================================
    {
        'id': 'VIL-001',
        'name': 'Jatinga Ridge',
        'subdivision': 'Haflong',
        'district': 'Dima Hasao',
        'state': 'Assam',
        'lat': 25.1311,
        'lon': 93.0411,
        'elevation_m': 1020,
        'slope_deg': 44.2,
        'rainfall_72h_mm': 248.5,
        'soil_moisture_pct': 89.2,
        'risk_score': 88,
        'risk_percentage': 88.5,
        'risk_band': 'Critical',
        'contributing_factors': [
            'Severe pore-water pressure along Disang shale-sandstone boundary',
            'Sustained 72h precipitation exceeding 240mm threshold',
            'Structural weathering on steep 44° road cut slope along NH-27'
        ],
        'suggested_action': 'Evacuate downhill habitations; close Jatinga bypass to heavy commercial traffic; stage SDRF quick response unit.',
        'contributing_factors_detailed': [
            {'factor': 'Slope Gradient & Profile', 'value': '44.2° steep talus incline', 'risk_impact': 'High', 'description': 'Steep talus formation prone to shear failure under gravity along Disang shale.'},
            {'factor': '72-Hour Accumulated Rainfall', 'value': '248.5 mm', 'risk_impact': 'Critical', 'description': 'Prolonged saturation exceeding hydrological infiltration threshold of 180mm.'},
            {'factor': 'Soil Saturation & Pore Pressure', 'value': '89.2% volumetric moisture', 'risk_impact': 'Critical', 'description': 'High pore water pressure liquefying silty-clay cohesive bonds.'},
            {'factor': 'Geological Fault Line Proximity', 'value': '1.2 km from Kopili/Haflong active fault line', 'risk_impact': 'High', 'description': 'Fractured sandstone and Barail shale bedrock weakened by tectonic shear.'},
            {'factor': 'Vegetation / Deforestation Index', 'value': 'High (48% canopy thinning on upslope terrace)', 'risk_impact': 'High', 'description': 'Loss of deep bamboo root matrix cohesion exacerbates surface rill wash.'},
            {'factor': 'Road Cutting & Anthropogenic Excavation', 'value': 'Active toe erosion & steep unretained highway cut along NH-27', 'risk_impact': 'High', 'description': 'Unsupported cut-slopes along transportation corridor remove toe support.'}
        ],
        'weather_forecast': {
            'temperature_c': 23.4,
            'rainfall_24h_mm': 78.5,
            'rainfall_7d_mm': 265.0,
            'humidity_pct': 92,
            'wind_speed_kmh': 16.5,
            'condition': 'Heavy Monsoon Rain'
        },
        'infrastructure_at_risk': {
            'bridges': ['Jatinga Ridge RCC Culvert #22', 'NH-27 River Span Bridge K-120'],
            'power_lines': ['33kV Feeder Substation Link - Dima Hasao', 'Local 11kV Distribution Grid Pole #59'],
            'hospitals': ['Jatinga Ridge Primary Health Centre (PHC)', 'Haflong District Civil Hospital (12km)'],
            'telecom_towers': ['BSNL Microwave Link Tower #11', 'Airtel/Jio 4G Sector Tower'],
            'alternative_routes': ['State Highway 19 Bypass via Haflong Eastern Ridge (18km detour)', 'Forest Service Arterial Corridor (4x4 Emergency Vehicles Only)']
        },
        'historical_landslides': [
            {'year': '2024', 'date': '18 July 2024', 'type': 'Debris Flow & Rockfall', 'rainfall': '194 mm (24h burst)', 'damage': 'NH-27 severed for 36 hours; 4 culverts choked with mud slurry; 120 residents evacuated.', 'countermeasures': 'Heavy tiered gabion wall installation along chainage 42-45; installed vibrating wire piezometers.'},
            {'year': '2022', 'date': '14 May 2022', 'type': 'Catastrophic Flash Flood & Mudslide', 'rainfall': '285 mm (Extreme cloudburst)', 'damage': 'Lumding-Badarpur rail link severed; station submerged; 140 families sheltered in relief camps.', 'countermeasures': 'SDRF permanent telemetry relay station established; reinforced concrete retaining walls erected.'},
            {'year': '1950', 'date': '15 August 1950', 'type': 'Great Assam Earthquake Slope Collapse', 'rainfall': '180 mm (Monsoon co-seismic)', 'damage': 'M8.6 earthquake triggered massive mountain crest failures damming regional river spurs and destroying valley bridle tracks.', 'countermeasures': 'Regional geological re-alignment of hill highway network.'}
        ]
    },
    {
        'id': 'VIL-002',
        'name': 'Harangajao Pass',
        'subdivision': 'Harangajao',
        'district': 'Dima Hasao',
        'state': 'Assam',
        'lat': 25.1167,
        'lon': 92.8667,
        'elevation_m': 680,
        'slope_deg': 41.5,
        'rainfall_72h_mm': 262.0,
        'soil_moisture_pct': 93.4,
        'risk_score': 94,
        'risk_percentage': 94.2,
        'risk_band': 'Critical',
        'contributing_factors': [
            'Severe river toe erosion along Jatinga-Diyung river confluence',
            'Overburdened residual soil layer over highly weathered Barail shale',
            'Continuous 72h precipitation exceeding 250mm trigger threshold'
        ],
        'suggested_action': 'Sound community warning sirens; suspend heavy multi-axle freight along NH-27; deploy PWD hydraulic excavators.',
        'contributing_factors_detailed': [
            {'factor': 'Slope Gradient & Profile', 'value': '41.5° steep slope', 'risk_impact': 'High', 'description': 'Steep valley wall vulnerable to rotational slips.'},
            {'factor': '72-Hour Accumulated Rainfall', 'value': '262.0 mm', 'risk_impact': 'Critical', 'description': 'Continuous monsoon burst saturating sub-surface lithology.'},
            {'factor': 'Soil Saturation & Pore Pressure', 'value': '93.4% volumetric moisture', 'risk_impact': 'Critical', 'description': 'Excess pore water pressure causing fluidization of topsoil.'},
            {'factor': 'Geological Fault Line Proximity', 'value': '0.9 km from Harangajao tectonic fault line', 'risk_impact': 'Critical', 'description': 'High fracture density along active shear zone.'},
            {'factor': 'Vegetation / Deforestation Index', 'value': 'High (52% vegetation loss due to slash cultivation)', 'risk_impact': 'High', 'description': 'Stripped root layer fails to hold superficial soil.'},
            {'factor': 'Road Cutting & Anthropogenic Excavation', 'value': 'Steep unsupported road cutting for highway widening', 'risk_impact': 'High', 'description': 'Undermined toe stability along critical supply route.'}
        ],
        'weather_forecast': {
            'temperature_c': 24.1,
            'rainfall_24h_mm': 88.0,
            'rainfall_7d_mm': 285.0,
            'humidity_pct': 95,
            'wind_speed_kmh': 18.0,
            'condition': 'Heavy Monsoon Rain'
        },
        'infrastructure_at_risk': {
            'bridges': ['Harangajao River Bridge Span', 'NH-27 Box Culvert #44'],
            'power_lines': ['33kV Harangajao Feeder Transmission Line'],
            'hospitals': ['Harangajao Community Health Centre (CHC)'],
            'telecom_towers': ['Jio/Airtel 4G Cell Tower'],
            'alternative_routes': ['Umrangso-Lanka Secondary Arterial Link (Operational 32km detour)']
        },
        'historical_landslides': [
            {'year': '2024', 'date': '18 July 2024', 'type': 'Debris Flow & Rockfall', 'rainfall': '194 mm (24h burst)', 'damage': 'NH-27 cutoffs for 36 hours; 4 culverts collapsed.', 'countermeasures': 'Tiered gabion walls and roadside catch-drains.'},
            {'year': '2022', 'date': '14 May 2022', 'type': 'Catastrophic Lumding-Badarpur Corridor Washout', 'rainfall': '285 mm (Cloudburst)', 'damage': 'Railway subgrade washed away; highway bridges severed; Harangajao market flooded.', 'countermeasures': 'Assam SDMA early warning sirens installed.'},
            {'year': '1950', 'date': '15 August 1950', 'type': 'Great Assam Earthquake Slope Collapses', 'rainfall': '210 mm', 'damage': 'Massive hillside failures across Jatinga valley.', 'countermeasures': 'Geotechnical slope stabilization berms.'}
        ]
    },
    {
        'id': 'VIL-003',
        'name': 'Ditokcherra Gorge',
        'subdivision': 'Harangajao',
        'district': 'Dima Hasao',
        'state': 'Assam',
        'lat': 25.0845,
        'lon': 92.9515,
        'elevation_m': 450,
        'slope_deg': 46.0,
        'rainfall_72h_mm': 195.0,
        'soil_moisture_pct': 82.5,
        'risk_score': 82,
        'risk_percentage': 82.4,
        'risk_band': 'Critical',
        'contributing_factors': [
            'Near-vertical railway cutting through interbedded shale and sandstone',
            'Active boulder fall hazard directly onto broad gauge railway line',
            'Water seepage from perched aquifer in upper ridge'
        ],
        'suggested_action': 'Impose 15 km/h railway caution order; deploy track patrolmen with wireless sets; station rock-clearing machinery.',
        'contributing_factors_detailed': [
            {'factor': 'Slope Gradient & Profile', 'value': '46.0° near-vertical rock face', 'risk_impact': 'Critical', 'description': 'Steep rocky gorge with fractured overhangs.'},
            {'factor': '72-Hour Accumulated Rainfall', 'value': '195.0 mm', 'risk_impact': 'High', 'description': 'Water lubricating joint planes in sandstone layers.'},
            {'factor': 'Soil Saturation & Pore Pressure', 'value': '82.5% moisture', 'risk_impact': 'High', 'description': 'High hydrostatic pressure behind rock face.'},
            {'factor': 'Geological Fault Line Proximity', 'value': '1.8 km from Barail thrust fault', 'risk_impact': 'High', 'description': 'Highly shattered and folded rock formations.'},
            {'factor': 'Vegetation / Deforestation Index', 'value': 'Moderate (Sparse vegetation on rocky face)', 'risk_impact': 'Moderate', 'description': 'Minimal soil cover with isolated shrub growth.'},
            {'factor': 'Road Cutting & Anthropogenic Excavation', 'value': 'Vertical railway cut without catch netting', 'risk_impact': 'Critical', 'description': 'Railway track positioned directly at toe of slope.'}
        ],
        'weather_forecast': {
            'temperature_c': 25.0,
            'rainfall_24h_mm': 62.0,
            'rainfall_7d_mm': 210.0,
            'humidity_pct': 88,
            'wind_speed_kmh': 12.0,
            'condition': 'Heavy Monsoon Rain'
        },
        'infrastructure_at_risk': {
            'bridges': ['Ditokcherra Railway Girder Bridge #89'],
            'power_lines': ['Railway 25kV OHE Traction Power Grid'],
            'hospitals': ['Ditokcherra Railway Health Sub-Centre'],
            'telecom_towers': ['Railway Wireless Relay Mast'],
            'alternative_routes': ['Lumding-Badarpur Express Highway Spur']
        },
        'historical_landslides': [
            {'year': '2023', 'date': '24 August 2023', 'type': 'Rotational Slope Failure', 'rainfall': '162 mm', 'damage': 'Track ballast shifted; train traffic halted for 14 hours.', 'countermeasures': 'Horizontal perforated drainpipes drilled into bedrock.'},
            {'year': '2022', 'date': '14 May 2022', 'type': 'Lumding-Badarpur Railway Corridor Washout', 'rainfall': '285 mm', 'damage': 'Ditokcherra rail tracks hanging in mid-air after embankment wash.', 'countermeasures': 'Micro-piling and heavy RCC retaining breast walls.'},
            {'year': '1950', 'date': '15 August 1950', 'type': 'Great Assam Earthquake Rockfalls', 'rainfall': '160 mm', 'damage': 'Massive boulders crushed historic meter-gauge railway line.', 'countermeasures': 'Steel wire mesh draping.'}
        ]
    },
    {
        'id': 'VIL-013',
        'name': 'Lower Haflong',
        'subdivision': 'Haflong',
        'district': 'Dima Hasao',
        'state': 'Assam',
        'lat': 25.1780,
        'lon': 93.0150,
        'elevation_m': 720,
        'slope_deg': 36.8,
        'rainfall_72h_mm': 215.0,
        'soil_moisture_pct': 86.0,
        'risk_score': 84,
        'risk_percentage': 84.6,
        'risk_band': 'Critical',
        'contributing_factors': [
            'Urban slope loading with dense residential settlement on unconsolidated debris',
            'Inadequate stormwater drains discharging directly onto slope face',
            'Proximity to New Haflong railway station landslide slip plane'
        ],
        'suggested_action': 'Issue evacuation notices to 45 hillside families; redirect municipal stormwater; stage SDRF emergency rescue vehicles.',
        'contributing_factors_detailed': [
            {'factor': 'Slope Gradient & Profile', 'value': '36.8° urban hillside', 'risk_impact': 'High', 'description': 'Moderate to steep slope heavily built up with residential buildings.'},
            {'factor': '72-Hour Accumulated Rainfall', 'value': '215.0 mm', 'risk_impact': 'Critical', 'description': 'Severe urban waterlogging and infiltration.'},
            {'factor': 'Soil Saturation & Pore Pressure', 'value': '86.0% volumetric moisture', 'risk_impact': 'Critical', 'description': 'Saturation causing loss of shear strength in red silty soil.'},
            {'factor': 'Geological Fault Line Proximity', 'value': '2.1 km from Haflong fault trace', 'risk_impact': 'Moderate', 'description': 'Fractured Disang bedrock beneath weathered mantle.'},
            {'factor': 'Vegetation / Deforestation Index', 'value': 'High (60% urban clearing of original pine forest)', 'risk_impact': 'High', 'description': 'Roof runoff directly eroding soil surface.'},
            {'factor': 'Road Cutting & Anthropogenic Excavation', 'value': 'Terracing for house foundations without retaining walls', 'risk_impact': 'Critical', 'description': 'Unengineered civil excavation destabilizing hillside.'}
        ],
        'weather_forecast': {
            'temperature_c': 23.0,
            'rainfall_24h_mm': 65.0,
            'rainfall_7d_mm': 240.0,
            'humidity_pct': 90,
            'wind_speed_kmh': 14.0,
            'condition': 'Heavy Monsoon Rain'
        },
        'infrastructure_at_risk': {
            'bridges': ['Lower Haflong Municipal Road Bridge'],
            'power_lines': ['33kV City Grid Feeder Link'],
            'hospitals': ['Haflong District Civil Hospital (2km)'],
            'telecom_towers': ['BSNL Main Exchange Tower'],
            'alternative_routes': ['Upper Haflong Ridge Road (Operational)']
        },
        'historical_landslides': [
            {'year': '2022', 'date': '14 May 2022', 'type': 'Catastrophic Haflong Mudslide & Station Washout', 'rainfall': '285 mm', 'damage': 'New Haflong railway station buried under 4m mud; 8 houses destroyed; 3 casualties.', 'countermeasures': 'RCC stepped retaining walls and deep catch-water storm drains.'},
            {'year': '2024', 'date': '18 July 2024', 'type': 'Debris Flow & Subsidence', 'rainfall': '194 mm', 'damage': 'Haflong-Silchar road link disrupted; 18 houses evacuated.', 'countermeasures': 'Soil nailing and horizontal drainage installed.'},
            {'year': '1950', 'date': '15 August 1950', 'type': 'Great Assam Earthquake Slump', 'rainfall': '170 mm', 'damage': 'Major hill cracks opened across Haflong town ridge.', 'countermeasures': 'Geotechnical zoning regulations instituted.'}
        ]
    },

    # ==========================================
    # 2. EAST KHASI HILLS (MEGHALAYA)
    # ==========================================
    {
        'id': 'MEG-001',
        'name': 'Cherrapunji (Sohra) Rim',
        'subdivision': 'Sohra',
        'district': 'East Khasi Hills',
        'state': 'Meghalaya',
        'lat': 25.2700,
        'lon': 91.7300,
        'elevation_m': 1430,
        'slope_deg': 48.5,
        'rainfall_72h_mm': 420.0,
        'soil_moisture_pct': 96.0,
        'risk_score': 96,
        'risk_percentage': 96.5,
        'risk_band': 'Critical',
        'contributing_factors': [
            'World-record precipitation threshold (>2,000mm recorded in 72h extreme events)',
            'Vertical sandstone and limestone escarpment over deep canyon gorges',
            'Severe mechanical weathering and tension cracks along rim edge'
        ],
        'suggested_action': 'Close Sohra-Shella cliff road; evacuate rim settlements; activate Meghalaya SDMA emergency response team.',
        'contributing_factors_detailed': [
            {'factor': 'Slope Gradient & Profile', 'value': '48.5° precipitous cliff rim', 'risk_impact': 'Critical', 'description': 'Vertical escarpment dropping into deep river valleys.'},
            {'factor': '72-Hour Accumulated Rainfall', 'value': '420.0 mm (Extreme deluge)', 'risk_impact': 'Critical', 'description': 'Unrivalled rainfall intensity triggering instant hydrostatic thrust.'},
            {'factor': 'Soil Saturation & Pore Pressure', 'value': '96.0% saturated', 'risk_impact': 'Critical', 'description': 'Total liquefaction of superficial karst and sandy mantle.'},
            {'factor': 'Geological Fault Line Proximity', 'value': '1.5 km from Dauki fault system', 'risk_impact': 'High', 'description': 'Major boundary fault separating Shillong plateau from Bengal basin.'},
            {'factor': 'Vegetation / Deforestation Index', 'value': 'Moderate (High plateau grassland with exposed rocky rim)', 'risk_impact': 'Moderate', 'description': 'Shallow root depth unable to resist deep shear planes.'},
            {'factor': 'Road Cutting & Anthropogenic Excavation', 'value': 'Limestone quarry cuts and scenic highway excavations', 'risk_impact': 'High', 'description': 'Disturbed toe support along tourist and mining roads.'}
        ],
        'weather_forecast': {
            'temperature_c': 19.5,
            'rainfall_24h_mm': 180.0,
            'rainfall_7d_mm': 560.0,
            'humidity_pct': 98,
            'wind_speed_kmh': 24.0,
            'condition': 'Extreme Monsoon Deluge'
        },
        'infrastructure_at_risk': {
            'bridges': ['Sohra Gorge Bridge K-14', 'Mawsmai Falls Access Culvert'],
            'power_lines': ['132kV Cherra-Shillong High Voltage Line'],
            'hospitals': ['Sohra Community Health Centre (CHC)'],
            'telecom_towers': ['BSNL Radar & Microwave Relay Station'],
            'alternative_routes': ['Shillong Bypass Arterial Route (Operational)']
        },
        'historical_landslides': [
            {'year': '2022', 'date': '17 June 2022', 'type': 'Extreme World-Record Deluge (>2,000mm in 72h)', 'rainfall': '2080 mm (72h world-record)', 'damage': 'Shillong-Dawki highway severed; 35-tonne limestone boulders detached; Sohra cutoff for 8 days.', 'countermeasures': 'High-tensile steel rockfall drapery mesh anchored with 8m soil nails.'},
            {'year': '1897', 'date': '12 June 1897', 'type': 'Great Meghalaya Earthquake Massive Rockfalls', 'rainfall': '410 mm (Monsoon co-seismic)', 'damage': 'M8.1 Oldham fault earthquake shattered limestone cliffs; entire Sohra plateau face disintegrated; over 1,500 casualties region-wide.', 'countermeasures': 'Re-sited settlements away from vertical escarpment crests.'},
            {'year': '2020', 'date': '06 June 2020', 'type': 'NH-6 Sonapur/Umkiang Rockslide', 'rainfall': '220 mm', 'damage': 'Over 800 cubic meters of debris blocked highway portal.', 'countermeasures': 'Concrete protection gallery built.'}
        ]
    },
    {
        'id': 'MEG-002',
        'name': 'Mawkdok Dympep Valley',
        'subdivision': 'Sohra',
        'district': 'East Khasi Hills',
        'state': 'Meghalaya',
        'lat': 25.3500,
        'lon': 91.7600,
        'elevation_m': 1380,
        'slope_deg': 45.0,
        'rainfall_72h_mm': 310.0,
        'soil_moisture_pct': 91.0,
        'risk_score': 90,
        'risk_percentage': 90.2,
        'risk_band': 'Critical',
        'contributing_factors': [
            'Deep V-shaped canyon gorge approach with steep highway cut-slopes',
            'Jointed quartzite and phyllite rock mass with daylighting dip planes',
            'High-velocity canyon wind and continuous monsoon moisture condensation'
        ],
        'suggested_action': 'Deploy rockfall warning sentries at Mawkdok Bridge approach; enforce one-way convoy traffic; inspect cantilever retaining walls.',
        'contributing_factors_detailed': [
            {'factor': 'Slope Gradient & Profile', 'value': '45.0° canyon slope', 'risk_impact': 'High', 'description': 'Deep canyon walls with active rock tumbling chutes.'},
            {'factor': '72-Hour Accumulated Rainfall', 'value': '310.0 mm', 'risk_impact': 'Critical', 'description': 'Extreme precipitation saturating sub-surface joints.'},
            {'factor': 'Soil Saturation & Pore Pressure', 'value': '91.0% moisture', 'risk_impact': 'Critical', 'description': 'Hydrostatic pressure pushing jointed blocks outwards.'},
            {'factor': 'Geological Fault Line Proximity', 'value': '2.3 km from Dauki fault system', 'risk_impact': 'High', 'description': 'Sheared quartzite and conglomerate bedrock.'},
            {'factor': 'Vegetation / Deforestation Index', 'value': 'Moderate (Gorge shrubland)', 'risk_impact': 'Moderate', 'description': 'Exposed rock crags with shallow brush.'},
            {'factor': 'Road Cutting & Anthropogenic Excavation', 'value': 'Cantilever road cut for Shillong-Sohra tourist highway', 'risk_impact': 'High', 'description': 'Toe excavation destabilizing upper rock strata.'}
        ],
        'weather_forecast': {
            'temperature_c': 20.0,
            'rainfall_24h_mm': 120.0,
            'rainfall_7d_mm': 420.0,
            'humidity_pct': 96,
            'wind_speed_kmh': 26.0,
            'condition': 'Heavy Monsoon Rain'
        },
        'infrastructure_at_risk': {
            'bridges': ['Mawkdok Dympep Valley Suspension Bridge', 'Approach RCC Viaduct'],
            'power_lines': ['33kV Shillong-Cherra Interconnector'],
            'hospitals': ['Mawkdok Primary Health Clinic'],
            'telecom_towers': ['Airtel/Jio Valley Repeater Mast'],
            'alternative_routes': ['Laitlyngkot-Pynursla Alternative Spur (14km Detour)']
        },
        'historical_landslides': [
            {'year': '2022', 'date': '17 June 2022', 'type': 'Canyon Wall Rockfall & Shale Slides', 'rainfall': '380 mm', 'damage': 'Mawkdok bridge approach blocked by 500 tonnes of debris; tourist traffic halted for 6 days.', 'countermeasures': 'High-tensile rockfall barriers installed above road.'},
            {'year': '1897', 'date': '12 June 1897', 'type': 'Great Meghalaya Earthquake Rockfalls', 'rainfall': '390 mm', 'damage': 'Widespread canyon wall collapse across Mawkdok valley.', 'countermeasures': 'Engineering of cantilever bypasses.'},
            {'year': '2020', 'date': '10 July 2020', 'type': 'Debris Flow', 'rainfall': '240 mm', 'damage': 'Culvert blowout with partial pavement wash.', 'countermeasures': 'Reinforced concrete catch-drains.'}
        ]
    },
    {
        'id': 'MEG-003',
        'name': 'Pynursla Ridge',
        'subdivision': 'Pynursla',
        'district': 'East Khasi Hills',
        'state': 'Meghalaya',
        'lat': 25.3100,
        'lon': 91.9000,
        'elevation_m': 1250,
        'slope_deg': 39.5,
        'rainfall_72h_mm': 285.0,
        'soil_moisture_pct': 88.0,
        'risk_score': 86,
        'risk_percentage': 86.4,
        'risk_band': 'Critical',
        'contributing_factors': [
            'Shillong-Dawki highway (NH-206) cut along steep weathered slope',
            'High pore water pressure in residual red latosol clay',
            'Heavy international trade truck traffic inducing ground vibration'
        ],
        'suggested_action': 'Restrict heavy commercial trucks to single file; install vibrating wire inclinometers; clear clogged culverts.',
        'contributing_factors_detailed': [
            {'factor': 'Slope Gradient & Profile', 'value': '39.5° steep slope', 'risk_impact': 'High', 'description': 'Steep hillside corridor along strategic international highway.'},
            {'factor': '72-Hour Accumulated Rainfall', 'value': '285.0 mm', 'risk_impact': 'Critical', 'description': 'Monsoon saturation triggering rotational slumps.'},
            {'factor': 'Soil Saturation & Pore Pressure', 'value': '88.0% moisture', 'risk_impact': 'Critical', 'description': 'High water table destabilizing red clay mantle.'},
            {'factor': 'Geological Fault Line Proximity', 'value': '1.8 km from Dawki boundary fault', 'risk_impact': 'High', 'description': 'Tectonically sheared sandstone and shale.'},
            {'factor': 'Vegetation / Deforestation Index', 'value': 'High (Betel nut and broom grass cultivation)', 'risk_impact': 'High', 'description': 'Superficial root systems unable to stabilize slope.'},
            {'factor': 'Road Cutting & Anthropogenic Excavation', 'value': 'Active 2-lane to 4-lane highway expansion cut', 'risk_impact': 'High', 'description': 'Toe excavation without adequate retaining protection.'}
        ],
        'weather_forecast': {
            'temperature_c': 21.0,
            'rainfall_24h_mm': 95.0,
            'rainfall_7d_mm': 320.0,
            'humidity_pct': 92,
            'wind_speed_kmh': 18.0,
            'condition': 'Heavy Monsoon Rain'
        },
        'infrastructure_at_risk': {
            'bridges': ['Pynursla Town Culvert #12', 'Umngot River Approach Viaduct'],
            'power_lines': ['33kV International Border Grid Link'],
            'hospitals': ['Pynursla Community Health Centre'],
            'telecom_towers': ['BSNL Border Area Relay Tower'],
            'alternative_routes': ['Mawlynnong Secondary Arterial Link (Operational 22km detour)']
        },
        'historical_landslides': [
            {'year': '2022', 'date': '17 June 2022', 'type': 'Shillong-Dawki Highway Slumps', 'rainfall': '340 mm', 'damage': 'NH-206 road surface subsided by 1.2m; international trade to Bangladesh halted for 10 days.', 'countermeasures': 'Reinforced concrete retaining wall and subsurface horizontal drainage.'},
            {'year': '1897', 'date': '12 June 1897', 'type': 'Great Meghalaya Earthquake Rockfalls', 'rainfall': '350 mm', 'damage': 'Massive hillside failures severed trade tracks to Sylhet.', 'countermeasures': 'Berm construction.'},
            {'year': '2021', 'date': '14 July 2021', 'type': 'Translational Earth Slide', 'rainfall': '190 mm', 'damage': 'Roadway blocked for 48h; 2 houses damaged.', 'countermeasures': 'Gabion wall installation.'}
        ]
    },
    {
        'id': 'MEG-004',
        'name': 'Mawlynnong Descent',
        'subdivision': 'Pynursla',
        'district': 'East Khasi Hills',
        'state': 'Meghalaya',
        'lat': 25.2000,
        'lon': 91.9300,
        'elevation_m': 480,
        'slope_deg': 37.0,
        'rainfall_72h_mm': 260.0,
        'soil_moisture_pct': 84.0,
        'risk_score': 78,
        'risk_percentage': 78.5,
        'risk_band': 'Critical',
        'contributing_factors': [
            'Steep southern plateau descent into Bangladesh alluvial plain',
            'Heavy torrential monsoon rain washing over terrace retaining walls',
            'Erosion of weathered shale base beneath thick sandstone blocks'
        ],
        'suggested_action': 'Inspect living root bridges and tourist footpaths; divert surface rainwater streams; position emergency medical supplies.',
        'contributing_factors_detailed': [
            {'factor': 'Slope Gradient & Profile', 'value': '37.0° steep descent', 'risk_impact': 'High', 'description': 'Escarpment drop towards international border.'},
            {'factor': '72-Hour Accumulated Rainfall', 'value': '260.0 mm', 'risk_impact': 'Critical', 'description': 'Intense runoff eroding slope base.'},
            {'factor': 'Soil Saturation & Pore Pressure', 'value': '84.0% moisture', 'risk_impact': 'High', 'description': 'Saturated topsoil prone to mud slurry wash.'},
            {'factor': 'Geological Fault Line Proximity', 'value': '1.1 km from Dauki Fault Zone', 'risk_impact': 'Critical', 'description': 'Tectonic boundary with high seismic vulnerability.'},
            {'factor': 'Vegetation / Deforestation Index', 'value': 'Low (Dense climax bamboo and betel plantations)', 'risk_impact': 'Low', 'description': 'Good vegetation cover partially mitigating surface creep.'},
            {'factor': 'Road Cutting & Anthropogenic Excavation', 'value': 'Paved tourist access road winding down steep slope', 'risk_impact': 'Moderate', 'description': 'Road cutting creating unsupported embankment shoulders.'}
        ],
        'weather_forecast': {
            'temperature_c': 24.5,
            'rainfall_24h_mm': 85.0,
            'rainfall_7d_mm': 290.0,
            'humidity_pct': 94,
            'wind_speed_kmh': 15.0,
            'condition': 'Heavy Monsoon Rain'
        },
        'infrastructure_at_risk': {
            'bridges': ['Riwai Living Root Bridge Access Span', 'Wah Rymben River Culvert'],
            'power_lines': ['11kV Rural Electrification Line'],
            'hospitals': ['Mawlynnong Primary Health Post'],
            'telecom_towers': ['Jio Solar-Powered Cell Tower'],
            'alternative_routes': ['Pynursla Ridge Track (4x4 Only)']
        },
        'historical_landslides': [
            {'year': '2022', 'date': '17 June 2022', 'type': 'Extreme Precipitation Shale Slide', 'rainfall': '310 mm', 'damage': 'Descent road blocked by 300 cubic meters of mud; tourist village isolated for 4 days.', 'countermeasures': 'Stone masonry retaining wall built along critical road bends.'},
            {'year': '1897', 'date': '12 June 1897', 'type': 'Great Meghalaya Earthquake Rockfalls', 'rainfall': '340 mm', 'damage': 'Huge boulder displacement down border slopes.', 'countermeasures': 'Terrace reinforcement.'}
        ]
    },

    # ==========================================
    # 3. GANGTOK DISTRICT (SIKKIM)
    # ==========================================
    {
        'id': 'SKM-001',
        'name': '9th Mile JN Road',
        'subdivision': 'Gangtok',
        'district': 'Gangtok',
        'state': 'Sikkim',
        'lat': 27.3500,
        'lon': 88.6600,
        'elevation_m': 2100,
        'slope_deg': 49.0,
        'rainfall_72h_mm': 225.0,
        'soil_moisture_pct': 91.5,
        'risk_score': 92,
        'risk_percentage': 92.4,
        'risk_band': 'Critical',
        'contributing_factors': [
            'Arterial Jawaharlal Nehru (JN) Road to Tsomgo/Nathu La cut into sheared Chungthang gneiss',
            'Severe freeze-thaw weathering and high monsoon saturation',
            'Active boulder fall and recurring debris flow chutes directly over highway'
        ],
        'suggested_action': 'Halt civilian tourist convoy to Tsomgo Lake/Nathu La; deploy BRO (Project Swastik) heavy dozers; issue red alert across Gangtok DEOC.',
        'contributing_factors_detailed': [
            {'factor': 'Slope Gradient & Profile', 'value': '49.0° precipitous mountain slope', 'risk_impact': 'Critical', 'description': 'Steep high-altitude rock face prone to planar and wedge failures.'},
            {'factor': '72-Hour Accumulated Rainfall', 'value': '225.0 mm', 'risk_impact': 'Critical', 'description': 'High antecedent precipitation lubricating foliation planes.'},
            {'factor': 'Soil Saturation & Pore Pressure', 'value': '91.5% volumetric moisture', 'risk_impact': 'Critical', 'description': 'Excess pore water pressure accelerating debris mobilization.'},
            {'factor': 'Geological Fault Line Proximity', 'value': '1.6 km from Main Central Thrust (MCT) zone', 'risk_impact': 'Critical', 'description': 'Highly deformed, fractured, and sheared crystalline rock.'},
            {'factor': 'Vegetation / Deforestation Index', 'value': 'High (Steep alpine scree with sparse rhododendron cover)', 'risk_impact': 'High', 'description': 'Unconsolidated talus material easily mobilized by rainfall.'},
            {'factor': 'Road Cutting & Anthropogenic Excavation', 'value': 'Strategic military/tourist highway cutting without adequate rock shed', 'risk_impact': 'Critical', 'description': 'Severe toe removal along high-traffic corridor.'}
        ],
        'weather_forecast': {
            'temperature_c': 15.2,
            'rainfall_24h_mm': 75.0,
            'rainfall_7d_mm': 260.0,
            'humidity_pct': 94,
            'wind_speed_kmh': 22.0,
            'condition': 'Heavy Mountain Cloudburst'
        },
        'infrastructure_at_risk': {
            'bridges': ['JN Road Bridge #9', 'Kyongnosla Hydroelectric Flume'],
            'power_lines': ['66kV Gangtok-Tsomgo Grid Transmission Line'],
            'hospitals': ['STNM District Hospital Gangtok (14km)'],
            'telecom_towers': ['BSNL Defense Communications Mast'],
            'alternative_routes': ['Old Silk Route via Zuluk (Emergency 54km Detour)']
        },
        'historical_landslides': [
            {'year': '2011', 'date': '18 September 2011', 'type': '2011 Sikkim M6.9 Earthquake Debris Flows', 'rainfall': '180 mm (Co-seismic)', 'damage': 'M6.9 earthquake triggered catastrophic debris flows along 9th Mile JN Road; multiple army vehicles trapped; 16 casualties along highway corridor.', 'countermeasures': 'Heavy rock bolt anchoring and BRO concrete snow/rock sheds.'},
            {'year': '1968', 'date': '04 October 1968', 'type': '1968 Catastrophic Sikkim Landslide Event', 'rainfall': '1000 mm (72h deluge)', 'damage': 'Historic 1000mm 3-day rainfall triggered >20,000 landslides; JN road completely swept away; Gangtok severed for 3 weeks; over 1,000 casualties in Sikkim.', 'countermeasures': 'Comprehensive re-engineering of eastern Sikkim highway alignment.'},
            {'year': '2024', 'date': '12 June 2024', 'type': 'Recurrent Monsoon Disruptions along NH-10 / JN Road', 'rainfall': '210 mm', 'damage': 'Debris flow blocked 9th Mile for 48 hours; tourist convoys stranded.', 'countermeasures': 'Steel wire mesh and dynamic rockfall barriers.'}
        ]
    },
    {
        'id': 'SKM-002',
        'name': 'Ranipool Catchment',
        'subdivision': 'Gangtok',
        'district': 'Gangtok',
        'state': 'Sikkim',
        'lat': 27.2800,
        'lon': 88.5900,
        'elevation_m': 900,
        'slope_deg': 42.0,
        'rainfall_72h_mm': 210.0,
        'soil_moisture_pct': 89.0,
        'risk_score': 89,
        'risk_percentage': 89.1,
        'risk_band': 'Critical',
        'contributing_factors': [
            'Gateway bottleneck on NH-10 connecting Siliguri to Gangtok capital city',
            'Severe toe erosion from turbulent Rani Khola & Rorathang river confluence',
            'Colluvial debris slide with active headward retreat threatening market area'
        ],
        'suggested_action': 'Reroute heavy vehicular traffic via Pakyong/Melli bypass; station wheel loaders at Ranipool bridge; erect temporary flood barriers.',
        'contributing_factors_detailed': [
            {'factor': 'Slope Gradient & Profile', 'value': '42.0° steep valley slope', 'risk_impact': 'High', 'description': 'Steep river valley flank prone to translational and debris flows.'},
            {'factor': '72-Hour Accumulated Rainfall', 'value': '210.0 mm', 'risk_impact': 'Critical', 'description': 'Heavy river basin saturation and flash surge.'},
            {'factor': 'Soil Saturation & Pore Pressure', 'value': '89.0% volumetric moisture', 'risk_impact': 'Critical', 'description': 'Saturated colluvium losing internal friction angle.'},
            {'factor': 'Geological Fault Line Proximity', 'value': '2.0 km from regional shear zone', 'risk_impact': 'High', 'description': 'Shattered phyllite bedrock easily eroded by river currents.'},
            {'factor': 'Vegetation / Deforestation Index', 'value': 'High (Dense commercial urbanization along river banks)', 'risk_impact': 'High', 'description': 'Natural drainage blocked by concrete settlements.'},
            {'factor': 'Road Cutting & Anthropogenic Excavation', 'value': 'NH-10 riverbank highway benching with continuous toe scouring', 'risk_impact': 'Critical', 'description': 'River undermining highway embankment foundation.'}
        ],
        'weather_forecast': {
            'temperature_c': 22.0,
            'rainfall_24h_mm': 70.0,
            'rainfall_7d_mm': 240.0,
            'humidity_pct': 90,
            'wind_speed_kmh': 16.0,
            'condition': 'Heavy Monsoon Rain'
        },
        'infrastructure_at_risk': {
            'bridges': ['Ranipool Double-Lane Highway Bridge', 'Rani Khola RCC Culvert'],
            'power_lines': ['66kV Central Substation Feeder Grid'],
            'hospitals': ['Ranipool Primary Health Centre', 'CRH Manipal Hospital (3km)'],
            'telecom_towers': ['BSNL/Airtel Hub Switching Station'],
            'alternative_routes': ['Pakyong-Rorathang Secondary Bypass (Operational 16km Detour)']
        },
        'historical_landslides': [
            {'year': '2023', 'date': '17 July 2023', 'type': 'Recurrent Monsoon Disruptions along NH-10', 'rainfall': '195 mm', 'damage': 'Ranipool market inundated; NH-10 severed by 2m debris slurry; food and fuel supplies disrupted to Gangtok.', 'countermeasures': 'Heavy boulder riprap and stepped gabion river training walls.'},
            {'year': '1968', 'date': '04 October 1968', 'type': '1968 Catastrophic Sikkim Landslide Event', 'rainfall': '1000 mm (3-day event)', 'damage': 'Historic flash flood swept away original Ranipool bridge; over 80 houses destroyed.', 'countermeasures': 'High-clearance concrete arch bridge constructed.'},
            {'year': '2011', 'date': '18 September 2011', 'type': '2011 Sikkim M6.9 Earthquake Debris Flows', 'rainfall': '160 mm', 'damage': 'Road surface fractured with lateral spreading; retaining walls collapsed.', 'countermeasures': 'Micro-pile tiebacks and geo-grid reinforced earth.'}
        ]
    },
    {
        'id': 'SKM-003',
        'name': 'Martam Slope',
        'subdivision': 'Gangtok',
        'district': 'Gangtok',
        'state': 'Sikkim',
        'lat': 27.2500,
        'lon': 88.5500,
        'elevation_m': 1250,
        'slope_deg': 38.5,
        'rainfall_72h_mm': 185.0,
        'soil_moisture_pct': 85.0,
        'risk_score': 81,
        'risk_percentage': 81.2,
        'risk_band': 'Critical',
        'contributing_factors': [
            'Highly weathered Daling group chlorite-sericite schist and phyllite',
            'Crown tension cracks widening along terrace farming slopes',
            'Subsurface seepage along impermeable clay boundary layers'
        ],
        'suggested_action': 'Monitor crown tension cracks with GPS displacement sensors; install bamboo-fascine bio-engineering; drain agricultural ponds.',
        'contributing_factors_detailed': [
            {'factor': 'Slope Gradient & Profile', 'value': '38.5° terraced agricultural slope', 'risk_impact': 'High', 'description': 'Deep progressive rotational creep on agricultural hillside.'},
            {'factor': '72-Hour Accumulated Rainfall', 'value': '185.0 mm', 'risk_impact': 'High', 'description': 'Prolonged rainfall soaking deep soil profile.'},
            {'factor': 'Soil Saturation & Pore Pressure', 'value': '85.0% volumetric moisture', 'risk_impact': 'High', 'description': 'Clay gouge along schistose foliation planes causing slippage.'},
            {'factor': 'Geological Fault Line Proximity', 'value': '2.8 km from Rangpo fault axis', 'risk_impact': 'Moderate', 'description': 'Tectonically crushed rock strata.'},
            {'factor': 'Vegetation / Deforestation Index', 'value': 'Moderate (Paddy and ginger terraces modifying natural runoff)', 'risk_impact': 'Moderate', 'description': 'Standing irrigation water ponding and infiltrating into slope.'},
            {'factor': 'Road Cutting & Anthropogenic Excavation', 'value': 'Paved village link road excavated into toe', 'risk_impact': 'High', 'description': 'Unsupported toe cut triggering upslope retrogressive failure.'}
        ],
        'weather_forecast': {
            'temperature_c': 21.5,
            'rainfall_24h_mm': 55.0,
            'rainfall_7d_mm': 190.0,
            'humidity_pct': 88,
            'wind_speed_kmh': 13.0,
            'condition': 'Intermittent Heavy Rain'
        },
        'infrastructure_at_risk': {
            'bridges': ['Martam Khola RCC Culvert #18'],
            'power_lines': ['11kV Rural Grid Line - Martam Sector'],
            'hospitals': ['Martam Primary Health Sub-Centre'],
            'telecom_towers': ['Airtel 4G Cell Pole'],
            'alternative_routes': ['Singtam-Martam Ridge Road (Operational)']
        },
        'historical_landslides': [
            {'year': '2023', 'date': '22 August 2023', 'type': 'Rotational Slope Failure & Slump', 'rainfall': '170 mm', 'damage': 'Martam secondary highway cracked; 6 farmhouses suffered foundation subsidence.', 'countermeasures': 'Subsurface perforated horizontal drainpipes and vetiver grass planting.'},
            {'year': '2011', 'date': '18 September 2011', 'type': '2011 Sikkim M6.9 Earthquake Debris Flows', 'rainfall': '175 mm', 'damage': 'Severe co-seismic cracking across Martam slopes; boundary walls displaced.', 'countermeasures': 'RCC breast wall construction.'},
            {'year': '1968', 'date': '04 October 1968', 'type': '1968 Catastrophic Sikkim Landslide Event', 'rainfall': '980 mm', 'damage': 'Widespread slope slips destroyed agricultural land.', 'countermeasures': 'Terrace drainage channels.'}
        ]
    },
    {
        'id': 'SKM-004',
        'name': 'Sirwani Bypass',
        'subdivision': 'Gangtok',
        'district': 'Gangtok',
        'state': 'Sikkim',
        'lat': 27.2400,
        'lon': 88.5100,
        'elevation_m': 750,
        'slope_deg': 43.0,
        'rainfall_72h_mm': 198.0,
        'soil_moisture_pct': 87.5,
        'risk_score': 83,
        'risk_percentage': 83.0,
        'risk_band': 'Critical',
        'contributing_factors': [
            'Alternative NH-10 bypass corridor along Teesta/Rani river gorge',
            'Steep talus cuttings subject to rapid toe undercut during dam spillway discharges',
            'Highly friable quartz-mica schist prone to planar sliding'
        ],
        'suggested_action': 'Close Sirwani bypass during heavy river discharge; alert Teesta Stage V dam authorities; deploy BRO emergency recovery units.',
        'contributing_factors_detailed': [
            {'factor': 'Slope Gradient & Profile', 'value': '43.0° steep canyon cut', 'risk_impact': 'High', 'description': 'Steep gorge road cut vulnerable to toe washing.'},
            {'factor': '72-Hour Accumulated Rainfall', 'value': '198.0 mm', 'risk_impact': 'High', 'description': 'Sustained rain lubricating schist foliation planes.'},
            {'factor': 'Soil Saturation & Pore Pressure', 'value': '87.5% moisture', 'risk_impact': 'High', 'description': 'High saturation lowering effective normal stress.'},
            {'factor': 'Geological Fault Line Proximity', 'value': '1.9 km from Teesta river lineament', 'risk_impact': 'High', 'description': 'Major structural lineament with fractured bedrock.'},
            {'factor': 'Vegetation / Deforestation Index', 'value': 'Moderate (Scattered sub-tropical scrub)', 'risk_impact': 'Moderate', 'description': 'Limited root anchorage on rocky cliffs.'},
            {'factor': 'Road Cutting & Anthropogenic Excavation', 'value': 'Heavy excavation for NH-10 emergency alternative bypass', 'risk_impact': 'Critical', 'description': 'Unstable cut slope lacking permanent shotcrete lining.'}
        ],
        'weather_forecast': {
            'temperature_c': 23.5,
            'rainfall_24h_mm': 60.0,
            'rainfall_7d_mm': 215.0,
            'humidity_pct': 89,
            'wind_speed_kmh': 14.5,
            'condition': 'Heavy Monsoon Rain'
        },
        'infrastructure_at_risk': {
            'bridges': ['Sirwani Teesta River Suspension Bridge', 'Approach RCC Box Culvert'],
            'power_lines': ['Teesta Stage V 400kV High Voltage Evacuation Line'],
            'hospitals': ['Singtam District Hospital (6km)'],
            'telecom_towers': ['BSNL River Gorge Repeater Mast'],
            'alternative_routes': ['Singtam-Ranipool Main National Highway (NH-10)']
        },
        'historical_landslides': [
            {'year': '2024', 'date': '15 June 2024', 'type': 'Recurrent Monsoon Disruptions along NH-10 / Sirwani Bypass', 'rainfall': '210 mm', 'damage': 'Sirwani bypass submerged under 600m3 mud and rock debris; Singtam-Sirwani axis closed for 5 days.', 'countermeasures': 'Steel wire rockfall drapery mesh and concrete catch-drains installed.'},
            {'year': '2011', 'date': '18 September 2011', 'type': '2011 Sikkim M6.9 Earthquake Debris Flows', 'rainfall': '170 mm', 'damage': 'Extensive rockfalls from Sirwani cliffs crushed road retaining walls.', 'countermeasures': 'Heavy tiered gabion wall installation.'},
            {'year': '1968', 'date': '04 October 1968', 'type': '1968 Catastrophic Sikkim Landslide Event', 'rainfall': '1020 mm (3-day event)', 'damage': 'Teesta river mega-surge flooded Sirwani gorge destroying riverside terraces.', 'countermeasures': 'Elevated bypass alignment surveyed and constructed.'}
        ]
    }
]

# Merge pilot nodes with existing nodes
pilot_ids = {n['id'] for n in pilot_nodes}
remaining = [v for v in villages if v['id'] not in pilot_ids]
merged = pilot_nodes + remaining

with open(path, 'w', encoding='utf-8') as f:
    json.dump(merged, f, indent=2)

print(f'Successfully updated pilot nodes! Total records: {len(merged)}')
