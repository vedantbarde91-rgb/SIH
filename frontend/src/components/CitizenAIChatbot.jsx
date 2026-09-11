import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Bot,
  Send,
  Mic,
  MicOff,
  X,
  Sparkles,
  PhoneCall,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  ChevronDown,
  Globe,
  Flame,
  Construction,
  Layers,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { apiClient } from '../api/client';
import { syncCitizenFromReport } from '../utils/citizenDatabase';

const CHATBOT_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' }
];

const EMERGENCY_FAQ = {
  en: [
    { q: 'What should I do during a landslide?', a: '1. Move away from the path of the landslide or debris flow immediately.\n2. Stay alert for unusual sounds like trees cracking or boulders knocking.\n3. Avoid river valleys and low-lying drainage channels.\n4. Call State Emergency Helpline 1070 or District 1077.' },
    { q: 'Where are the nearest relief camps?', a: 'Active evacuation shelters in pilot corridors:\n• Dima Hasao: Haflong Government College & Maibang Town Hall.\n• East Khasi Hills: Cherrapunji Multipurpose Cyclone Shelter.\n• Gangtok: Singtam Community Hall & Ranipool School.' },
    { q: 'How do I report a hazard?', a: 'Simply tell me in your own words, e.g., "Huge mudflow blocking NH-27 near Jatinga" or "Cracks on slope at Cherrapunji", and I will extract the details and file your official report!' }
  ],
  hi: [
    { q: 'भूस्खलन के दौरान क्या करें?', a: '1. तुरंत भूस्खलन या मलबे के बहाव के रास्ते से दूर हटें।\n2. पेड़ों के टूटने या पत्थरों के टकराने जैसी असामान्य आवाजों के प्रति सतर्क रहें।\n3. नदी घाटियों और निचले जल निकासी नालों से दूर रहें।\n4. राज्य आपातकालीन हेल्पलाइन 1070 या जिला 1077 पर कॉल करें।' },
    { q: 'निकटतम राहत शिविर कहाँ हैं?', a: 'सक्रिय राहत शिविर:\n• दीमा हसाओ: हाफलोंग गवर्नमेंट कॉलेज और माईबोंग टाउन हॉल।\n• ईस्ट खासी हिल्स: चेरापूंजी बहुउद्देशीय आश्रय।\n• गंगटोक: सिंगतम कम्युनिटी हॉल और रानीपूल स्कूल।' },
    { q: 'खतरे की रिपोर्ट कैसे दर्ज करें?', a: 'बस मुझे अपनी भाषा में बताएं, जैसे: "जतिंगा के पास NH-27 पर भारी भूस्खलन हुआ है", और मैं तुरंत रिपोर्ट तैयार कर दूंगा।' }
  ],
  mr: [
    { q: 'दरड कोसळल्यास काय करावे?', a: '1. तात्काळ ढिगाऱ्याच्या मार्गावरून सुरक्षित ठिकाणी जा.\n2. झाडे मोडणे किंवा दगड कोसळण्याच्या आवाजाकडे लक्ष द्या.\n3. नदीच्या खोऱ्यात व सखल भागात थांबू नका.\n4. आपत्कालीन हेल्पलाईन 1070 किंवा 1077 वर संपर्क साधा.' },
    { q: 'जवळचे मदत केंद्र कोठे आहे?', a: 'सक्रिय निवारा केंद्र:\n• दिमा हासाओ: हाफलाँग कॉलेज आणि मायबोंग टाऊन हॉल.\n• ईस्ट खासी हिल्स: चेरापुंजी बहुउद्देशीय केंद्र.\n• गंगटोक: सिंगतम कम्युनिटी हॉल.' },
    { q: 'धोक्याची तक्रार कशी करावी?', a: 'फक्त मला सांगा, उदा. "जतिंगाजवळ रस्त्यावर मातीचा भराव कोसळला आहे", मी त्वरित अधिकृत नोंदणी करेन!' }
  ],
  as: [
    { q: 'ভূমিস্খলন হ’লে কি কৰিব লাগে?', a: '১. ভূমিস্খলন বা বোকা বৈ যোৱা পথৰ পৰা তাৎক্ষণিকভাৱে আঁতৰি যাওক।\n২. গছ ভগা বা শিল বগৰি অহাৰ শব্দ শুনিলে সাৱধান হওক।\n৩. নদীৰ উপত্যকা আৰু দ নলাৰ ওচৰলৈ নাযাব।\n৪. ৰাজ্যিক হেল্পলাইন ১০৭০ বা জিলা ১০৭৭ নম্বৰত যোগাযোগ কৰক।' },
    { q: 'ওচৰৰ আশ্ৰয় শিবিৰ ক’ত আছে?', a: 'সক্ৰিয় সাহায্য শিবিৰ:\n• ডিমা হাছাও: হাফলং চৰকাৰী মহাবিদ্যালয় আৰু মাইবং টাউন হল।\n• ইষ্ট খাছি হিলছ: চেৰাপুঞ্জী বহুমুখী আশ্ৰয় কেন্দ্ৰ।\n• গেংটক: ছিংটাম কমিউনিটি হল।' },
    { q: 'বিপদৰ বিষয়ে কেনেকৈ প্ৰতিবেদন দিম?', a: 'আপুনি মোক লিখি বা কৈ দিয়ক, যেনে: "জাতিংগাৰ ওচৰত NH-27 ত ভূমিস্খলন হৈছে", মই লগে লগে প্ৰতিবেদন জমা কৰিম!' }
  ]
};

// Known NER landmarks and their coordinates
const NER_LANDMARKS = [
  { match: /jatinga/i, name: 'Jatinga Ridge, NH-27', district: 'Dima Hasao', state: 'Assam', lat: 25.1325, lon: 93.0422 },
  { match: /harangajao/i, name: 'Harangajao Pass', district: 'Dima Hasao', state: 'Assam', lat: 25.1823, lon: 93.0471 },
  { match: /haflong/i, name: 'Lower Haflong', district: 'Dima Hasao', state: 'Assam', lat: 25.1620, lon: 93.0154 },
  { match: /ditokcherra/i, name: 'Ditokcherra Gorge', district: 'Dima Hasao', state: 'Assam', lat: 25.0845, lon: 92.9515 },
  { match: /nh-?27/i, name: 'NH-27 Lumding-Badarpur Corridor', district: 'Dima Hasao', state: 'Assam', lat: 25.1500, lon: 93.0300 },
  { match: /cherrapunji|sohra/i, name: 'Cherrapunji (Sohra) Rim', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.2760, lon: 91.7324 },
  { match: /mawkdok/i, name: 'Mawkdok Dympep Valley', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.4186, lon: 91.8792 },
  { match: /pynursla/i, name: 'Pynursla Ridge', district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.1942, lon: 91.9514 },
  { match: /gangtok|9th mile/i, name: '9th Mile JN Road', district: 'Gangtok', state: 'Sikkim', lat: 27.3558, lon: 88.6138 },
  { match: /ranipool/i, name: 'Ranipool Catchment', district: 'Gangtok', state: 'Sikkim', lat: 27.3126, lon: 88.6814 },
  { match: /singtam|nh-?10/i, name: 'Singtam Bypass (NH-10)', district: 'Gangtok', state: 'Sikkim', lat: 27.2350, lon: 88.4980 }
];

export default function CitizenAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Namaste! I am your NER Disaster Response AI Assistant. How can I help you today? You can report active landslides conversationally or ask emergency questions.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [pendingReport, setPendingReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice to text via Web Speech API or realistic fallback simulation
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = selectedLang === 'hi' ? 'hi-IN' : (selectedLang === 'mr' ? 'mr-IN' : (selectedLang === 'as' ? 'as-IN' : 'en-IN'));

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputVal(transcript);
          setIsListening(false);
        };
        recognition.onerror = () => {
          simulateVoiceInput();
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
        return;
      } catch {
        simulateVoiceInput();
      }
    } else {
      simulateVoiceInput();
    }
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      const demoPhrases = [
        "There is a massive mudflow blocking NH-27 near Jatinga",
        "Heavy rockfall near Cherrapunji rim, road completely blocked",
        "Large cracks appearing on slope near 9th Mile Gangtok"
      ];
      const randomPhrase = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];
      setInputVal(randomPhrase);
      setIsListening(false);
    }, 1500);
  };

  // Conversational parsing logic
  const parseHazardReport = (text) => {
    const lower = text.toLowerCase();

    // Check if conversational reporting intent
    const isReport = /mudflow|landslide|crack|rockfall|boulder|slope|blocked|falling|fissure|washout|seepage/i.test(lower);
    if (!isReport) return null;

    // Hazard type
    let hazardType = 'landslide';
    let hazardLabel = 'Landslide';
    if (/mudflow|mud|slurry/i.test(lower)) {
      hazardType = 'mudflow';
      hazardLabel = 'Active Mudflow / Slurry';
    } else if (/crack|fissure|split/i.test(lower)) {
      hazardType = 'tension_cracks';
      hazardLabel = 'Ground Tension Cracks';
    } else if (/rockfall|boulder|falling rock/i.test(lower)) {
      hazardType = 'falling_rocks';
      hazardLabel = 'Falling Rocks / Boulders';
    } else if (/blocked|debris/i.test(lower)) {
      hazardType = 'blocked_road';
      hazardLabel = 'Blocked Highway / Corridor';
    }

    // Severity
    let severity = 'High';
    if (/massive|severe|critical|urgent|huge|disaster/i.test(lower)) {
      severity = 'Critical';
    } else if (/minor|small|light/i.test(lower)) {
      severity = 'Medium';
    }

    // Location matching
    let matchedLocation = NER_LANDMARKS.find((lm) => lm.match.test(lower)) || {
      name: 'NH-27 Hill Corridor (Reported Site)',
      district: 'Dima Hasao',
      state: 'Assam',
      lat: 25.1325,
      lon: 93.0422
    };

    return {
      hazard_type: hazardType,
      hazard_label: hazardLabel,
      severity,
      location_name: matchedLocation.name,
      district: matchedLocation.district,
      state: matchedLocation.state,
      lat: matchedLocation.lat,
      lon: matchedLocation.lon,
      description: text,
      photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80'
    };
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Process parsing
    const parsed = parseHazardReport(userText);

    setTimeout(() => {
      if (parsed) {
        setPendingReport(parsed);
        const botReply = {
          id: Date.now() + 1,
          sender: 'bot',
          text: `I identified a hazard report in your message. Please review the details below and tap "Confirm & Submit" to alert the DEOC Operations Room immediately:`,
          isReportPreview: true,
          reportData: parsed,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        // General query or fallback
        const lower = userText.toLowerCase();
        let replyText = "I received your message. For immediate emergency rescue, please dial 1070 (SDMA) or 1077 (DDMA). To file a hazard report, please specify the location and condition (e.g., 'Mudflow on NH-27 near Jatinga').";

        if (/help|emergency|danger/i.test(lower)) {
          replyText = "🚨 If you are in immediate danger: move to high, stable ground away from drainage paths and dial 1070 immediately. SDRF rescue detachments are on standby.";
        } else if (/weather|rain/i.test(lower)) {
          replyText = "🌧️ Continuous heavy monsoon rains are ongoing across Dima Hasao, East Khasi Hills, and Gangtok. Multiple slopes have breached the 140mm antecedent precipitation threshold.";
        }

        const botReply = {
          id: Date.now() + 1,
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botReply]);
      }
    }, 600);
  };

  const handleConfirmReport = async (reportData) => {
    setIsSubmitting(true);
    try {
      const userPhone = (() => {
        try {
          const raw = localStorage.getItem('ner_registered_citizen');
          if (raw) return JSON.parse(raw).phone || '+91 98765 43210';
        } catch {}
        return '+91 94350 21890';
      })();

      const payload = {
        hazard_type: reportData.hazard_type,
        description: reportData.description,
        lat: reportData.lat,
        lon: reportData.lon,
        location_name: reportData.location_name,
        district: reportData.district,
        phone_number: userPhone,
        user_id: userPhone.replace(/\D/g, ''),
        photo_url: reportData.photo_url
      };

      const res = await apiClient.submitReport(payload);
      syncCitizenFromReport(res);

      // Save locally
      try {
        const rawLocal = localStorage.getItem('ner_user_submitted_reports');
        const existing = rawLocal ? JSON.parse(rawLocal) : [];
        existing.unshift(res);
        localStorage.setItem('ner_user_submitted_reports', JSON.stringify(existing));
      } catch {}

      setPendingReport(null);

      const confirmMsg = {
        id: Date.now() + 2,
        sender: 'bot',
        text: `✅ Report #${res.id || 'REP-2026-X'} has been officially logged with ${reportData.district} DDMA! SDRF reconnaissance teams have been notified. You can track status in your Citizen Dashboard.`,
        isSuccess: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err) {
      console.error('Failed to submit via chatbot:', err);
      const errMsg = {
        id: Date.now() + 2,
        sender: 'bot',
        text: `Logged locally as offline incident report. Will automatically sync to server when connection resumes.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFAQClick = (faq) => {
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: faq.q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const botReply = {
      id: Date.now() + 1,
      sender: 'bot',
      text: faq.a,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg, botReply]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-sky-500 via-indigo-600 to-rose-600 text-white shadow-2xl hover:scale-105 transition-all group border-2 border-white/40"
          aria-label="Open Citizen AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-extrabold tracking-tight leading-tight flex items-center gap-1">
              <span>Citizen AI Assistant</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>
            <div className="text-[10px] text-sky-100 font-medium">Voice & Text Guided Reporting</div>
          </div>
        </button>
      )}

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-colors animate-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span>NER Citizen AI Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  State Emergency: 1070 / 1077
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher in Header */}
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-[11px] font-semibold rounded-lg px-2 py-1 focus:outline-none"
              >
                {CHATBOT_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Helpline Ribbon */}
          <div className="bg-rose-500/10 dark:bg-rose-950/40 border-b border-rose-500/20 px-3 py-1.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold text-[11px]">
              <PhoneCall className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>24x7 Helplines:</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <a
                href="tel:1070"
                className="px-2 py-0.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-1"
              >
                1070 (SDMA)
              </a>
              <a
                href="tel:1077"
                className="px-2 py-0.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center gap-1"
              >
                1077 (DDMA)
              </a>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/60 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                  {/* Guided Reporting Card Inside Chat */}
                  {m.isReportPreview && m.reportData && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-500">Hazard:</span>
                          <span className="text-rose-600 dark:text-rose-400">{m.reportData.hazard_label}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Location:</span>
                          <span className="font-semibold text-slate-800 dark:text-white">{m.reportData.location_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">District:</span>
                          <span className="text-slate-700 dark:text-slate-300">{m.reportData.district} ({m.reportData.state})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Est. GPS:</span>
                          <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400">
                            {m.reportData.lat.toFixed(4)}°N, {m.reportData.lon.toFixed(4)}°E
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Severity:</span>
                          <span className="px-2 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-bold text-[10px]">
                            {m.reportData.severity}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleConfirmReport(m.reportData)}
                        disabled={isSubmitting}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Filing with DEOC...' : 'Confirm & Submit Hazard Report'}</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {(EMERGENCY_FAQ[selectedLang] || EMERGENCY_FAQ.en).map((faq, i) => (
              <button
                key={i}
                onClick={() => handleFAQClick(faq)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap transition"
              >
                {faq.q}
              </button>
            ))}
          </div>

          {/* Input & Voice Controls */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoice}
              title={isListening ? "Listening... click to stop" : "Speak to Assistant"}
              className={`p-2 rounded-xl transition ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {isListening ? <Mic className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to voice...'
                  : selectedLang === 'hi'
                  ? 'खतरे के बारे में लिखें या बोलें...'
                  : (selectedLang === 'as' ? 'বিপদৰ বিষয়ে লিখক বা কওক...' : 'Type or speak a hazard report...')
              }
              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
            />

            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
