import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../api/client';
import {
  AlertTriangle,
  Shield,
  Send,
  Mountain,
  CloudRain,
  Activity,
  ArrowRight,
  CheckCircle2,
  Radio,
  Layers,
  Flame,
  Truck,
  X,
  User,
  Phone,
  MapPin,
  Building
} from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [showCitizenModal, setShowCitizenModal] = useState(false);

  // Citizen registration modal form state
  const [citizenName, setCitizenName] = useState(() => {
    const saved = localStorage.getItem('ner_registered_citizen');
    return saved ? JSON.parse(saved).name : '';
  });
  const [citizenPhone, setCitizenPhone] = useState(() => {
    const saved = localStorage.getItem('ner_registered_citizen');
    return saved ? JSON.parse(saved).phone : '';
  });
  const [citizenVillage, setCitizenVillage] = useState(() => {
    const saved = localStorage.getItem('ner_registered_citizen');
    return saved ? JSON.parse(saved).village : '';
  });
  const [citizenDistrict, setCitizenDistrict] = useState('Dima Hasao');

  useEffect(() => {
    apiClient.fetchDistrictSummary()
      .then((res) => setSummary(res.data))
      .catch((err) => console.warn("Could not fetch summary on landing:", err));
  }, []);

  const handleCitizenRegisterAndProceed = (e) => {
    e.preventDefault();
    const citizenProfile = {
      name: citizenName.trim() || 'Anonymous Commuter',
      phone: citizenPhone.trim() || '',
      village: citizenVillage.trim() || 'Dima Hasao Corridor',
      district: citizenDistrict,
      registeredAt: new Date().toISOString()
    };
    localStorage.setItem('ner_registered_citizen', JSON.stringify(citizenProfile));
    setShowCitizenModal(false);
    navigate('/report');
  };

  const handleGuestProceed = () => {
    setShowCitizenModal(false);
    navigate('/report');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Banner Ticker */}
      <div className="bg-sky-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2 text-center text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sky-700 dark:text-sky-300 font-medium">
          <Radio className="w-3.5 h-3.5 animate-pulse text-sky-500" />
          <span>{t('landing.badge', 'Smart India Hackathon Prototype — NER Hill Corridors')}</span>
        </div>
      </div>

      {/* Main 2-Column Classic Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: THE NER LANDSLIDE CHALLENGE */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Geo-Hazard Crisis in North East India</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {t('landing.challenge_title', 'The NER Landslide Challenge')}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {t(
                  'landing.challenge_desc',
                  'The young geological formations of North East India face intense seasonal crises. Multiple complex triggers converge to create catastrophic slope failures:'
                )}
              </p>
            </div>

            {/* In-depth Geotechnical Challenge Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: Monsoon Rains */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-2.5">
                  <CloudRain className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t('landing.challenge_rain_title', 'Extreme Precipitation')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {t(
                    'landing.challenge_rain_desc',
                    '72h rainfall frequently exceeds 250mm, triggering acute pore pressure along bedding planes.'
                  )}
                </p>
              </div>

              {/* Card 2: Fragile Slopes */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2.5">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t('landing.challenge_geo_title', 'Fragile Geomechanics')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {t(
                    'landing.challenge_geo_desc',
                    'Disang and Barail sandstone-shale formations with steep cut-slopes susceptible to shear failure.'
                  )}
                </p>
              </div>

              {/* Card 3: Blocked NH-27 */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 mb-2.5">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t('landing.challenge_lifeline_title', 'NH-27 Road Blockades')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {t(
                    'landing.challenge_lifeline_desc',
                    'Debris flows sever vital links between Brahmaputra valley, Barak valley, Tripura, and Mizoram.'
                  )}
                </p>
              </div>
            </div>

            {/* Quick Pilot Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Monitored Sites</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {summary?.total_monitored_settlements || '25'}
                </div>
                <div className="text-[10px] text-slate-500">Dima Hasao & Hill Zones</div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-rose-500">High Risk Alerts</div>
                <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                  {summary?.risk_band_distribution?.Critical || '5'} Sites
                </div>
                <div className="text-[10px] text-slate-500">Harangajao & Jatinga</div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-amber-500">Peak 72h Rain</div>
                <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                  265 mm
                </div>
                <div className="text-[10px] text-slate-500">Exceeds safety index</div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-emerald-500">DEOC Response</div>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Active
                </div>
                <div className="text-[10px] text-slate-500">Early dissemination</div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PORTAL ENTRY POINTS */}
          <div className="lg:col-span-5 space-y-4">
            <div className="mb-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Select Your Portal Entry Point
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose citizen field reporting or authorized administrative command.
              </p>
            </div>

            {/* CARD 1: Citizen Hazard Report Door */}
            <div className="p-6 rounded-3xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-900/90 border border-rose-200 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-500/60 shadow-lg dark:shadow-xl transition flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-500 mb-3 group-hover:scale-105 transition">
                    <Send className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold uppercase tracking-wider">
                    Citizen & Commuter
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('landing.citizen_door_title', 'Citizen & Commuter Hazard Report')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {t(
                    'landing.citizen_door_desc',
                    'Spotted a road crack, falling boulders, or active mudflow? Upload a photo and geo-tagged coordinates directly to district authorities in under 30 seconds.'
                  )}
                </p>

                <div className="mt-3.5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Instant visual photo evidence preview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Automatic GPS coordinates capture</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCitizenModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/20 transition group-hover:shadow-rose-600/40"
                >
                  <span>{t('landing.citizen_door_btn', 'Report a Hazard / Issue')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>

            {/* CARD 2: Officer Operations Hub Door */}
            <div className="p-6 rounded-3xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-900/90 border border-sky-200 dark:border-sky-500/30 hover:border-sky-400 dark:hover:border-sky-500/60 shadow-lg dark:shadow-xl transition flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3 group-hover:scale-105 transition">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold uppercase tracking-wider">
                    Authorized Access
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('landing.officer_door_title', 'Officer Operations Dashboard')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {t(
                    'landing.officer_door_desc',
                    'Dedicated command center for District Disaster Management Authorities (DDMA), PWD engineers, and SDRF teams for Dima Hasao and NER hill corridors.'
                  )}
                </p>

                <div className="mt-3.5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                    <span>Multi-State & District Leaflet Topo Map</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                    <span>Dynamic High-Risk Danger Alerts (Risk ≥ 75)</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/officer/login"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-xs sm:text-sm border border-sky-500/30 shadow-md transition group-hover:border-sky-400"
                >
                  <span>{t('landing.officer_door_btn', 'Authorized Officer Login')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CITIZEN REGISTRATION / QUICK LOGIN MODAL */}
      {showCitizenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                  Citizen Portal Entry
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {t('citizen_modal.title', 'Citizen Registration / Quick Login')}
                </h3>
              </div>
              <button
                onClick={() => setShowCitizenModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                'citizen_modal.subtitle',
                'Please provide basic information before submitting a field hazard report. This helps emergency response teams coordinate quickly.'
              )}
            </p>

            <form onSubmit={handleCitizenRegisterAndProceed} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('citizen_modal.name_label', 'Full Name')} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder={t('citizen_modal.name_placeholder', 'E.g., Rahul Sharma')}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('citizen_modal.mobile_label', 'Mobile Number')} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder={t('citizen_modal.mobile_placeholder', 'E.g., 9876543210')}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              {/* Village */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('citizen_modal.village_label', 'Village / Locality')} *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={citizenVillage}
                    onChange={(e) => setCitizenVillage(e.target.value)}
                    placeholder={t('citizen_modal.village_placeholder', 'E.g., Jatinga Village / Harangajao')}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('citizen_modal.district_label', 'District / Corridor')}
                </label>
                <select
                  value={citizenDistrict}
                  onChange={(e) => setCitizenDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
                >
                  <option value="Dima Hasao">Dima Hasao, Assam (NH-27 Corridor)</option>
                  <option value="East Khasi Hills">East Khasi Hills, Meghalaya (Sohra/Shillong)</option>
                  <option value="Ri-Bhoi">Ri-Bhoi, Meghalaya (Guwahati-Shillong Pass)</option>
                  <option value="Kamrup">Kamrup Metro, Assam (Jorabat/Sonapur)</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition"
                >
                  {t('citizen_modal.submit_btn', 'Complete Registration & Proceed')}
                </button>
                <button
                  type="button"
                  onClick={handleGuestProceed}
                  className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition"
                >
                  {t('citizen_modal.guest_btn', 'Continue as Guest (Fast Report)')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Smart India Hackathon • AI Landslide Early Warning & Dissemination Platform
          </p>
          <div className="flex items-center gap-4">
            <span>Dima Hasao & East Khasi Hills Corridors</span>
            <span>•</span>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-sky-500 underline">
              FastAPI Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
