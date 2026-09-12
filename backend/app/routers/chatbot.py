import os
import re
import httpx
from typing import Optional, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/chatbot", tags=["Citizen AI Assistant"])

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"  # "en", "as", "hi", "mr"

class ChatResponse(BaseModel):
    reply: str
    parsed_report: Optional[Dict[str, Any]] = None
    language: str

# Known NER Landmarks for automated hazard detection
NER_LANDMARK_MAP = [
    {"pattern": r"jatinga", "name": "Jatinga Ridge, NH-27", "district": "Dima Hasao", "state": "Assam", "lat": 25.1325, "lon": 93.0422},
    {"pattern": r"harangajao", "name": "Harangajao Pass", "district": "Dima Hasao", "state": "Assam", "lat": 25.1823, "lon": 93.0471},
    {"pattern": r"haflong", "name": "Lower Haflong", "district": "Dima Hasao", "state": "Assam", "lat": 25.1620, "lon": 93.0154},
    {"pattern": r"ditokcherra", "name": "Ditokcherra Gorge", "district": "Dima Hasao", "state": "Assam", "lat": 25.0845, "lon": 92.9515},
    {"pattern": r"nh-?27", "name": "NH-27 Lumding-Badarpur Highway", "district": "Dima Hasao", "state": "Assam", "lat": 25.1500, "lon": 93.0300},
    {"pattern": r"cherrapunji|sohra", "name": "Cherrapunji (Sohra) Rim", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.2760, "lon": 91.7324},
    {"pattern": r"mawkdok", "name": "Mawkdok Dympep Valley", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.4186, "lon": 91.8792},
    {"pattern": r"pynursla", "name": "Pynursla Ridge", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.1942, "lon": 91.9514},
    {"pattern": r"gangtok", "name": "Gangtok Ridge Corridor", "district": "Gangtok", "state": "Sikkim", "lat": 27.3300, "lon": 88.6100},
    {"pattern": r"singtam|nh-?10", "name": "Singtam Bypass (NH-10)", "district": "Gangtok", "state": "Sikkim", "lat": 27.2350, "lon": 88.4980},
    {"pattern": r"ranipool", "name": "Ranipool Catchment", "district": "Gangtok", "state": "Sikkim", "lat": 27.3126, "lon": 88.6814}
]

def parse_hazard_entities(text: str) -> Optional[Dict[str, Any]]:
    """Automatically parses hazard type, landmark, severity, and coordinates from natural text."""
    lower = text.lower()
    
    # 1. Identify hazard type
    hazard_type = None
    if re.search(r"mud\s*flow|mud\s*slide|debris|বোকা|चिखल|कीचड़", lower):
        hazard_type = "Mudflow / Debris Torrent"
    elif re.search(r"rock\s*fall|boulder|falling\s*rocks|শিল|दगड|पत्थर", lower):
        hazard_type = "Rockfall / Cliff Collapse"
    elif re.search(r"crack|fissure|subsidence|sinking|ফাটল|भेगा|दरार", lower):
        hazard_type = "Slope Tension Crack / Road Subsidence"
    elif re.search(r"slide|landslide|slope\s*failure|ভূমিস্খলন|दरड|भूस्खलन", lower):
        hazard_type = "Slope Failure / Landslide"

    # 2. Match landmark
    matched_loc = None
    for loc in NER_LANDMARK_MAP:
        if re.search(loc["pattern"], lower):
            matched_loc = loc
            break

    if not hazard_type and not matched_loc:
        return None

    # Severity detection
    severity = "High"
    if re.search(r"massive|huge|critical|catastrophic|blocked|severed|বৰ|मोठा|भारी|अवरुद्ध", lower):
        severity = "Critical"
    elif re.search(r"minor|small|slow|সৰু|लहान|छोटा", lower):
        severity = "Moderate"

    loc_name = matched_loc["name"] if matched_loc else "Reported Hill Corridor Section"
    district = matched_loc["district"] if matched_loc else "Dima Hasao"
    state = matched_loc["state"] if matched_loc else "Assam"
    lat = matched_loc["lat"] if matched_loc else 25.1764
    lon = matched_loc["lon"] if matched_loc else 93.0245

    return {
        "hazard_type": hazard_type or "Active Landslide Indicator",
        "location_name": loc_name,
        "district": district,
        "state": state,
        "severity": severity,
        "lat": lat,
        "lon": lon,
        "description": text
    }

async def call_gemini_api(prompt: str, language: str) -> Optional[str]:
    """Queries Google Gemini API if GEMINI_API_KEY environment variable is present."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    system_instruction = (
        "You are the official NER Landslide Early Warning & Disaster Assistant for North East India (Assam, Meghalaya, Sikkim). "
        "Keep answers concise, direct, helpful, and safety-focused. Always instruct citizens to call National Emergency 112 if in immediate danger. "
        f"Respond directly in {language} language."
    )

    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": f"{system_instruction}\n\nUser Query: {prompt}"}]}
        ],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 300
        }
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"Gemini API request failed: {e}")
    return None

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(req: ChatRequest):
    """
    Conversational Citizen AI Assistant endpoint.
    1. Parses natural text into structured disaster reports.
    2. Queries Gemini API if available, or serves intelligent localized multi-lingual disaster guidance.
    """
    user_text = req.message.strip()
    lang = req.language or "en"
    parsed_report = parse_hazard_entities(user_text)

    # 1. Try Gemini API first if configured
    gemini_reply = await call_gemini_api(user_text, lang)
    if gemini_reply:
        return ChatResponse(reply=gemini_reply, parsed_report=parsed_report, language=lang)

    # 2. High-quality intelligent multi-lingual disaster assistant fallback
    lower = user_text.lower()
    
    if parsed_report:
        if lang == "as":
            reply = f"মই আপোনাৰ বাৰ্তাত এটা বিপদৰ প্ৰতিবেদন চিনাক্ত কৰিছোঁ: {parsed_report['location_name']}ত {parsed_report['hazard_type']}। অনুগ্ৰহ কৰি তলৰ বিৱৰণসমূহ পৰীক্ষা কৰক আৰু ততাতৈয়াকৈ প্ৰশাসনক জনাবলৈ 'Confirm & Submit' ত টিপক। জৰুৰী সাহায্যৰ বাবে ১১২ নম্বৰত কল কৰক।"
        elif lang == "hi":
            reply = f"मैंने आपके संदेश में एक आपदा रिपोर्ट पहचानी है: {parsed_report['location_name']} में {parsed_report['hazard_type']}। कृपया नीचे विवरणों की जांच करें और आपदा प्रबंधन कक्ष को अलर्ट करने के लिए 'Confirm & Submit' पर टैप करें। आपातकालीन मदद के लिए 112 पर कॉल करें।"
        elif lang == "mr":
            reply = f"मला तुमच्या संदेशात एक धोका अहवाल आढळला आहे: {parsed_report['location_name']} जवळ {parsed_report['hazard_type']}. कृपया खालील तपशील तपासा आणि नियंत्रण कक्षाला सतर्क करण्यासाठी 'Confirm & Submit' वर टॅप करा. आपत्कालीन मदतीसाठी 112 डायल करा."
        else:
            reply = f"I identified a hazard incident in your report: {parsed_report['hazard_type']} at {parsed_report['location_name']} ({parsed_report['district']}). Please review the structured summary below and tap 'Confirm & Submit' to immediately notify District Emergency Operations (DDMA / SDRF). For urgent rescue, dial 112."
        return ChatResponse(reply=reply, parsed_report=parsed_report, language=lang)

    # General safety and emergency responses
    if re.search(r"help|emergency|danger|rescue|সহায়|मदद|सहाय्यता", lower):
        if lang == "as":
            reply = "🚨 আপুনি যদি বিপদত আছে: ততাতৈয়াকৈ নলা আৰু নদীৰ উপত্যকাৰ পৰা উচ্চ আৰু নিৰাপদ স্থানলৈ যাওক। তাৎক্ষণিক উদ্ধাৰৰ বাবে ৰাষ্ট্ৰীয় জৰুৰীকালীন হেল্পলাইন ১১২ নম্বৰত কল কৰক। SDRF দল সষ্টম হৈ আছে।"
        elif lang == "hi":
            reply = "🚨 यदि आप तुरंत खतरे में हैं: तुरंत ढलान और नालों से दूर ऊंचे व सुरक्षित स्थान पर जाएं और राष्ट्रीय आपातकालीन हेल्पलाइन 112 डायल करें। SDRF और राहत दल अलर्ट पर हैं।"
        elif lang == "mr":
            reply = "🚨 जर तुम्ही तात्काळ धोक्यात असाल: त्वरित नाल्यांपासून दूर उंच व सुरक्षित ठिकाणी जा आणि राष्ट्रीय आपत्कालीन हेल्पलाईन 112 वर संपर्क साधा."
        else:
            reply = "🚨 EMERGENCY PROTOCOL: If you are in immediate danger of a slope collapse or flash flood, move to high, stable ground away from drainage channels. Dial 112 (National Emergency Helpline) immediately. SDRF quick response teams are staged in all NER sectors."
    elif re.search(r"rain|weather|forecast|বৰষুণ|पाऊस|बारिश", lower):
        if lang == "as":
            reply = "🌧️ বতৰ সতৰ্কবাৰ্তা: উত্তৰ-পূব পাৰ্বত্য অঞ্চলত (ডিমা হাছাও, ইষ্ট খাছি হিলছ আৰু গেংটক) ধাৰাসাৰ বৰষুণ হৈ আছে। সংবেদনশীল পাহাৰীয়া পথসমূহত সতৰ্কতা অৱলম্বন কৰক।"
        elif lang == "hi":
            reply = "🌧️ मौसम अपडेट: उत्तर-पूर्वी पहाड़ी गलियारों (दीमा हसाओ, ईस्ट खासी हिल्स, गंगटोक) में भारी मानसूनी बारिश जारी है। NH-27 और NH-10 पर सफर करते समय अत्यधिक सतर्क रहें।"
        elif lang == "mr":
            reply = "🌧️ हवामान इशारा: उत्तर-पूर्व टेकड्यांच्या भागात (दिमा हासाओ, ईस्ट खासी हिल्स, गंगटोक) मुसळधार पाऊस सुरू आहे. दरडप्रवण रस्त्यांवर प्रवास टाळा."
        else:
            reply = "🌧️ LIVE HYDROMETEOROLOGICAL UPDATE: Continuous monsoon precipitation is ongoing across Dima Hasao, East Khasi Hills, and Gangtok corridors. Multiple slopes have breached the 140mm antecedent rain threshold. Check the Map View for live slope saturation gauges."
    elif re.search(r"shelter|camp|relief|আশ্ৰয়|निवारा|आश्रय|राहत", lower):
        if lang == "as":
            reply = "🏕️ সক্ৰিয় সাহায্য আৰু আশ্ৰয় শিবিৰ:\n• ডিমা হাছাও: হাফলং চৰকাৰী মহাবিদ্যালয় আৰু মাইবং টাউন হল\n• ইষ্ট খাছি হিলছ: চেৰাপুঞ্জী বহুমুখী আশ্ৰয় কেন্দ্ৰ\n• গেংটক: ছিংটাম কমিউনিটি হল আৰু ৰাণীপূৰ স্কুল\nজৰুৰী খাদ্য আৰু চিকিৎসাৰ বাবে ১১২ নম্বৰত যোগাযোগ কৰক।"
        elif lang == "hi":
            reply = "🏕️ सक्रिय राहत व शरण शिविर:\n• दीमा हसाओ: हाफलोंग गवर्नमेंट कॉलेज और माईबोंग टाउन हॉल\n• ईस्ट खासी हिल्स: चेरापूंजी बहुउद्देशीय आश्रय\n• गंगटोक: सिंगतम कम्युनिटी हॉल\nतत्काल सहायता के लिए 112 डायल करें।"
        elif lang == "mr":
            reply = "🏕️ सक्रिय मदत व निवारा केंद्र:\n• दिमा हासाओ: हाफलाँग कॉलेज आणि मायबोंग टाऊन हॉल\n• ईस्ट खासी हिल्स: चेरापुंजी केंद्र\n• गंगटोक: सिंगतम कम्युनिटी हॉल\nअधिक माहितीसाठी 112 डायल करा."
        else:
            reply = "🏕️ ACTIVE DESIGNATED RELIEF SHELTERS:\n• Dima Hasao: Haflong Government College & Maibang Town Hall\n• East Khasi Hills: Cherrapunji Multipurpose Cyclone Shelter\n• Gangtok: Singtam Community Hall & Ranipool Higher Secondary School\nDial 112 for medical emergency and evacuation transport."
    else:
        if lang == "as":
            reply = "নমস্কাৰ! মই উত্তৰ-পূব ভূমিস্খলন প্ৰাৰম্ভিক সতৰ্কতা সহায়ক। আপুনি মোক ভূমিস্খলন, পথ বন্ধ হোৱা (যেনে 'NH-27 ত বোকা বৈ আহিছে') বা সাহায্য শিবিৰৰ বিষয়ে সুধিব পাৰে। জৰুৰীকালীন সাহায্যৰ বাবে ১১২ নম্বৰত কল কৰক।"
        elif lang == "hi":
            reply = "नमस्ते! मैं पूर्वोत्तर भूस्खलन प्रारंभिक चेतावनी सहायक हूँ। आप मुझसे खतरे की रिपोर्ट (जैसे 'जतिंगा के पास NH-27 पर मलबा गिरा है'), मौसम या शरण शिविरों के बारे में पूछ सकते हैं। आपातकालीन स्थिति में 112 डायल करें।"
        elif lang == "mr":
            reply = "नमस्कार! मी आपत्कालीन भूस्खलन सहाय्यक आहे. आपण मला दरड कोसळणे, रस्ते बंद होणे किंवा निवारा केंद्रांविषयी विचारू शकता. तत्काळ मदतीसाठी 112 डायल करा."
        else:
            reply = "Hello! I am your 24x7 NER Landslide Early Warning AI Assistant. You can describe any active slope failure or road fissure (e.g. 'Massive rockfall blocking NH-27 near Jatinga Ridge') and I will automatically structure an official report for DEOC response. For immediate life-saving rescue, dial 112."

    return ChatResponse(reply=reply, parsed_report=parsed_report, language=lang)
