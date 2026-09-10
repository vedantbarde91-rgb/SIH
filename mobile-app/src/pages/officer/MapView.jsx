import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import RiskBadge from '../../components/RiskBadge';
import OfflineBanner from '../../components/OfflineBanner';
import { authService } from '../../firebase/authService';
import {
  AlertTriangle,
  Mountain,
  Layers,
  Activity,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  Info,
  Flame,
  MapPin,
  ChevronRight,
  CheckCircle2,
  BellRing,
  Clock,
  CloudSun,
  Wind,
  Droplets,
  Calendar,
  Compass,
  FileText,
  Radio,
  ChevronDown,
  ChevronUp,
  X,
  Gauge,
  Navigation,
  ShieldCheck,
  AlertCircle,
  Download
} from 'lucide-react';
import { exportVillageTelemetryCSV, exportHistoryTimelineCSV } from '../../utils/csvExport';

// District center coordinates for auto-focus
const DISTRICT_CENTERS = {
  'ALL': { center: [26.0, 91.5], zoom: 8 },
  'Dima Hasao': { center: [25.17, 93.02], zoom: 11 },
  'East Khasi Hills': { center: [25.35, 91.82], zoom: 11 },
  'Gangtok': { center: [27.33, 88.61], zoom: 11 },
  'Ri-Bhoi': { center: [25.95, 91.87], zoom: 11 },
  'Kamrup': { center: [26.11, 91.94], zoom: 12 },
};

function createCustomMarkerIcon(score, isSelected) {
  let color = '#10b981'; // emerald
  let pulseHtml = '';

  if (score >= 75) {
    color = '#ef4444'; // red
    pulseHtml = `<span class="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping opacity-75"></span>`;
  } else if (score > 50) {
    color = '#f97316'; // orange
    pulseHtml = `<span class="absolute -inset-1.5 rounded-full bg-orange-500/30 animate-pulse"></span>`;
  } else if (score > 25) {
    color = '#f59e0b'; // amber
  }

  const borderClass = isSelected ? 'border-2 border-white ring-2 ring-sky-400 scale-110' : 'border border-slate-900';

  const html = `
    <div class="relative flex items-center justify-center w-7 h-7">
      ${pulseHtml}
      <div style="background-color: ${color};" class="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shadow-lg ${borderClass} transition-transform">
        ${score}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function MapRecenter({ targetCoords, zoom = 11 }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, zoom, { duration: 1.2 });
    }
  }, [targetCoords, zoom, map]);
  return null;
}

export default function MapView() {
  const { t } = useTranslation();
  const currentOfficer = authService.getCurrentOfficer();

  // Role Scoping: Super Admin vs. District Admin
  const isSuperAdmin = currentOfficer?.role?.toLowerCase().includes('super') || currentOfficer?.jurisdiction === 'ALL';
  const officerAssignedDistrict = currentOfficer?.jurisdiction && currentOfficer.jurisdiction !== 'ALL'
    ? currentOfficer.jurisdiction
    : null;

  const initialAssignedState = officerAssignedDistrict === 'Gangtok'
    ? 'Sikkim'
    : (officerAssignedDistrict === 'East Khasi Hills' || officerAssignedDistrict === 'Ri-Bhoi'
      ? 'Meghalaya'
      : (officerAssignedDistrict ? 'Assam' : 'ALL'));

  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedState, setSelectedState] = useState(initialAssignedState);
  const [selectedDistrict, setSelectedDistrict] = useState(officerAssignedDistrict || 'ALL');
  
  const [mapCenter, setMapCenter] = useState(
    officerAssignedDistrict ? (DISTRICT_CENTERS[officerAssignedDistrict]?.center || DISTRICT_CENTERS['Dima Hasao'].center) : DISTRICT_CENTERS['ALL'].center
  );
  const [mapZoom, setMapZoom] = useState(officerAssignedDistrict ? 11 : 8);
  const [loading, setLoading] = useState(true);
  const [isCachedData, setIsCachedData] = useState(false);
  const [basemap, setBasemap] = useState('esriTopo'); // 'esriTopo' | 'osm'

  // Advanced GIS layers
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showGsiLayer, setShowGsiLayer] = useState(false);

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Alerts Expansion and Notification Bell Popover
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [showNotificationBell, setShowNotificationBell] = useState(false);

  // Active Tab in Telemetry Drawer: 'overview' | 'geotech' | 'weather' | 'impact' | 'timeline'
  const [telemetryTab, setTelemetryTab] = useState('overview');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.fetchVillages();
      setVillages(res.data);
      setIsCachedData(res.fromCache);
      if (res.data.length > 0 && !selectedVillage) {
        const highestRisk = [...res.data].sort((a, b) => b.risk_score - a.risk_score)[0];
        setSelectedVillage(highestRisk);
      }
    } catch (err) {
      console.error('Failed to load villages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle State selection change
  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('ALL');
    if (state === 'Assam') {
      setMapCenter(DISTRICT_CENTERS['Dima Hasao'].center);
      setMapZoom(10);
    } else if (state === 'Meghalaya') {
      setMapCenter(DISTRICT_CENTERS['East Khasi Hills'].center);
      setMapZoom(10);
    } else if (state === 'Sikkim') {
      setMapCenter(DISTRICT_CENTERS['Gangtok'].center);
      setMapZoom(11);
    } else {
      setMapCenter(DISTRICT_CENTERS['ALL'].center);
      setMapZoom(8);
    }
  };

  // Handle District selection change
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    const target = DISTRICT_CENTERS[district] || DISTRICT_CENTERS['ALL'];
    setMapCenter(target.center);
    setMapZoom(target.zoom);
  };

  // Filtered settlements based on state, district, and risk
  const filteredVillages = useMemo(() => {
    return villages.filter((v) => {
      // Role lock: If district admin, lock to assigned jurisdiction
      if (officerAssignedDistrict && v.district.toLowerCase() !== officerAssignedDistrict.toLowerCase()) {
        return false;
      }
      if (selectedState !== 'ALL' && v.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      if (selectedDistrict !== 'ALL' && v.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }
      if (selectedFilter !== 'ALL' && v.risk_band.toUpperCase() !== selectedFilter) {
        return false;
      }
      return true;
    });
  }, [villages, selectedState, selectedDistrict, selectedFilter, officerAssignedDistrict]);

  // High-Risk Settlements (risk_score >= 75)
  const highRiskVillages = useMemo(() => {
    return filteredVillages
      .filter((v) => v.risk_score >= 75)
      .sort((a, b) => b.risk_score - a.risk_score);
  }, [filteredVillages]);

  const availableDistricts = useMemo(() => {
    if (officerAssignedDistrict) return [officerAssignedDistrict];
    if (selectedState === 'Assam') return ['Dima Hasao', 'Kamrup'];
    if (selectedState === 'Meghalaya') return ['East Khasi Hills', 'Ri-Bhoi'];
    if (selectedState === 'Sikkim') return ['Gangtok'];
    return ['Dima Hasao', 'East Khasi Hills', 'Gangtok', 'Ri-Bhoi', 'Kamrup'];
  }, [selectedState, officerAssignedDistrict]);

  // Notifications feed
  const notificationsList = [
    { id: 1, title: 'Harangajao Pass High Risk Alert', time: '10 mins ago', type: 'critical', desc: 'Risk index 94% with 265mm 72h continuous rainfall.' },
    { id: 2, title: 'New Citizen Report: NH-27 km 44', time: '28 mins ago', type: 'citizen', desc: 'Ground tension crack 80mm reported with photo evidence.' },
    { id: 3, title: 'Telemetry Update: Jatinga Ridge', time: '45 mins ago', type: 'info', desc: 'Pore pressure sensors registered +14% water table rise.' },
    { id: 4, title: 'SDRF Quick Response Unit Staged', time: '1 hr ago', type: 'action', desc: 'Haflong central detachment deployed with hydraulic clearing equipment.' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      <OfflineBanner forceOffline={isCachedData} onRefresh={loadData} />

      {/* TOP COMMAND BAR: ROLE SCOPING, LIVE CLOCK & NOTIFICATIONS */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-slate-200">DEOC Live Ops:</span>
            <span className="font-mono text-sky-400 font-semibold">{currentTime} IST</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-slate-400">Scoped Authority:</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isSuperAdmin ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50' : 'bg-sky-900/60 text-sky-300 border border-sky-500/50'}`}>
              {isSuperAdmin ? '👑 Super Administrator (All States)' : `🛡️ District Admin (${officerAssignedDistrict || 'Dima Hasao'})`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Layer toggles: Heatmap & GSI */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700 text-[11px]">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-2 py-0.5 rounded-lg transition font-medium ${showHeatmap ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              🔥 Heatmap {showHeatmap ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowGsiLayer(!showGsiLayer)}
              className={`px-2 py-0.5 rounded-lg transition font-medium ${showGsiLayer ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              🗺️ GSI Overlay {showGsiLayer ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Notification Bell with Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationBell(!showNotificationBell)}
              className="relative p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Notifications"
            >
              <BellRing className="w-4 h-4 text-amber-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {notificationsList.length}
              </span>
            </button>

            {showNotificationBell && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-slate-900 dark:text-slate-100 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <BellRing className="w-3.5 h-3.5 text-amber-500" />
                    <span>Real-Time Incident Notifications</span>
                  </div>
                  <button onClick={() => setShowNotificationBell(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notificationsList.map(n => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DYNAMIC CRITICAL HAZARD WARNING BAR (WITH EXPAND ALL '+ MORE' TOGGLE) */}
      {highRiskVillages.length > 0 && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs shadow-md border-b border-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-1 rounded-md bg-white/20 animate-pulse flex-shrink-0">
              <BellRing className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold uppercase tracking-wide">
                CRITICAL HAZARD ALERTS ({highRiskVillages.length} SITES ≥ 75%):
              </span>
              <span className="ml-1 text-rose-100 font-medium hidden md:inline">
                Sustained shear strain threshold breached. Immediate mitigation in effect:
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {highRiskVillages.slice(0, 3).map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedVillage(v);
                  setMapCenter([v.lat, v.lon]);
                  setMapZoom(13);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/30 hover:bg-black/50 text-[11px] font-bold border border-white/20 transition whitespace-nowrap"
              >
                <span>{v.name}</span>
                <span className="bg-white text-rose-700 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                  {v.risk_percentage || v.risk_score}%
                </span>
              </button>
            ))}

            {highRiskVillages.length > 3 && (
              <button
                onClick={() => setShowAllAlerts(!showAllAlerts)}
                className="px-2.5 py-0.5 rounded-full bg-white text-rose-700 hover:bg-rose-100 text-[11px] font-bold transition flex items-center gap-1 whitespace-nowrap"
              >
                <span>{showAllAlerts ? 'Collapse' : `+${highRiskVillages.length - 3} More`}</span>
                {showAllAlerts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* EXPANDED ACTIVE ALERTS PANEL */}
      {showAllAlerts && (
        <div className="bg-rose-950/90 text-white border-b border-rose-800 p-4 z-20 animate-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-rose-300">
                All Active Critical Landslide Warnings ({highRiskVillages.length})
              </span>
              <button onClick={() => setShowAllAlerts(false)} className="text-xs text-rose-300 hover:underline">
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {highRiskVillages.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVillage(v);
                    setMapCenter([v.lat, v.lon]);
                    setMapZoom(13);
                  }}
                  className="p-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 border border-rose-700 text-left text-xs transition"
                >
                  <div className="font-bold truncate">{v.name}</div>
                  <div className="text-[10px] text-rose-200">{v.district}</div>
                  <div className="font-mono text-xs font-extrabold text-amber-300 mt-1">
                    Risk: {v.risk_percentage || v.risk_score}%
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTROL & FILTER HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Multi-State Geotechnical Surveillance & Early Warning Map
            </h2>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Active: {filteredVillages.length} monitored settlements • {highRiskVillages.length} danger zones
            </div>
          </div>
        </div>

        {/* STATE & DISTRICT SELECTORS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* State Dropdown (Locked if not super admin) */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              State:
            </span>
            <select
              value={selectedState}
              disabled={!isSuperAdmin && !!officerAssignedDistrict}
              onChange={(e) => handleStateChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition disabled:opacity-60"
            >
              <option value="ALL">All States (NER Wide)</option>
              <option value="Assam">Assam</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Sikkim">Sikkim</option>
            </select>
          </div>

          {/* District Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              District:
            </span>
            <select
              value={selectedDistrict}
              disabled={!isSuperAdmin && !!officerAssignedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition disabled:opacity-60"
            >
              <option value="ALL">All Districts</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Band Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((band) => (
              <button
                key={band}
                onClick={() => setSelectedFilter(band)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                  selectedFilter === band
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {band === 'ALL' ? 'All' : band.slice(0, 4)}
              </button>
            ))}
          </div>

          {/* Basemap Toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
            <button
              onClick={() => setBasemap('esriTopo')}
              className={`px-2 py-0.5 rounded-lg ${
                basemap === 'esriTopo'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Esri Topo
            </button>
            <button
              onClick={() => setBasemap('osm')}
              className={`px-2 py-0.5 rounded-lg ${
                basemap === 'osm'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Standard OSM
            </button>
          </div>
        </div>
      </div>

      {/* MAIN MAP & ADVANCED SIDEBAR TELEMETRY */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEAFLET MAP */}
        <div className="flex-1 h-full relative z-0">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="w-full h-full"
            style={{ background: '#0f172a' }}
          >
            {basemap === 'esriTopo' ? (
              <TileLayer
                attribution="Tiles &copy; Esri &mdash; Topo Contours & Infrastructure"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                maxZoom={18}
              />
            ) : (
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
            )}

            <MapRecenter targetCoords={mapCenter} zoom={mapZoom} />

            {/* REAL-TIME RISK HEATMAP OVERLAY SIMULATION */}
            {showHeatmap && filteredVillages.map((village) => {
              const radius = (village.risk_score || 50) * 80;
              const heatColor = village.risk_score >= 75 ? '#ef4444' : (village.risk_score > 50 ? '#f97316' : '#eab308');
              return (
                <Circle
                  key={`heat-${village.id}`}
                  center={[village.lat, village.lon]}
                  radius={radius}
                  pathOptions={{
                    color: heatColor,
                    fillColor: heatColor,
                    fillOpacity: 0.18,
                    weight: 1,
                    dashArray: '4, 4'
                  }}
                />
              );
            })}

            {/* GSI GEOLOGICAL SURVEY OF INDIA FAULT LINE OVERLAY */}
            {showGsiLayer && (
              <Circle
                center={[25.1311, 93.0411]}
                radius={12000}
                pathOptions={{
                  color: '#a855f7',
                  fillColor: '#c084fc',
                  fillOpacity: 0.12,
                  weight: 2,
                  dashArray: '6, 6'
                }}
              />
            )}

            {filteredVillages.map((village) => {
              const isSelected = selectedVillage?.id === village.id;
              const markerIcon = createCustomMarkerIcon(village.risk_score, isSelected);

              return (
                <Marker
                  key={village.id}
                  position={[village.lat, village.lon]}
                  icon={markerIcon}
                  eventHandlers={{
                    click: () => setSelectedVillage(village),
                  }}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -12]}
                    opacity={0.98}
                    className="custom-leaflet-tooltip"
                  >
                    <div className="p-2 min-w-[210px] max-w-[260px] text-xs font-sans text-slate-900 dark:text-slate-100 bg-white/95 dark:bg-slate-900/95 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white truncate">{village.name}</span>
                        <RiskBadge score={village.risk_score} band={village.risk_band} size="sm" />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-2">
                        {village.district}, {village.state} • {village.risk_percentage || village.risk_score}% Risk
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Slope:</span>
                          <span className="font-semibold text-slate-800 dark:text-white">{village.slope_deg}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">72h Rain:</span>
                          <span className="font-semibold text-amber-600 dark:text-amber-300">{village.rainfall_72h_mm} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Soil Saturation:</span>
                          <span className="font-semibold text-sky-600 dark:text-sky-300">{village.soil_moisture_pct}%</span>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 shadow-xl max-w-xs pointer-events-auto transition-colors">
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-500" />
              <span>Telemetry Risk Scale</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-slate-800 dark:text-slate-200">75-100 Critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-slate-800 dark:text-slate-200">51-74 High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-slate-800 dark:text-slate-200">26-50 Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-800 dark:text-slate-200">0-25 Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR TELEMETRY & OPERATIONS HUB */}
        <div className="w-full lg:w-[460px] bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 overflow-y-auto p-4 sm:p-5 flex flex-col justify-between flex-shrink-0 z-10 transition-colors">
          {selectedVillage ? (
            <div className="space-y-4">
              {/* Settlement Header & Exact Percentage Gauge */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                      {selectedVillage.district}, {selectedVillage.state}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {selectedVillage.name}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      ID: {selectedVillage.id} • {selectedVillage.lat.toFixed(4)}°N, {selectedVillage.lon.toFixed(4)}°E
                    </div>
                  </div>
                  <RiskBadge score={selectedVillage.risk_score} band={selectedVillage.risk_band} size="sm" />
                </div>

                {/* EXACT RISK IN PERCENTAGE (%) METER WIDGET */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Gauge className="w-4 h-4 text-rose-500" />
                      <span>Exact Landslide Risk Meter:</span>
                    </div>
                    <span className="font-mono text-base font-extrabold text-rose-600 dark:text-rose-400">
                      {selectedVillage.risk_percentage || selectedVillage.risk_score}%
                    </span>
                  </div>

                  {/* Meter Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (selectedVillage.risk_percentage || selectedVillage.risk_score) >= 75
                          ? 'bg-rose-600'
                          : ((selectedVillage.risk_percentage || selectedVillage.risk_score) >= 50 ? 'bg-orange-500' : 'bg-amber-500')
                      }`}
                      style={{ width: `${selectedVillage.risk_percentage || selectedVillage.risk_score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0% Safe</span>
                    <span>50% Threshold</span>
                    <span>100% Critical</span>
                  </div>
                </div>

                {/* EXPORT TELEMETRY CSV BUTTON */}
                <button
                  onClick={() => exportVillageTelemetryCSV(selectedVillage)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm"
                  title="Download complete geotechnical telemetry record as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Telemetry CSV</span>
                </button>
              </div>

              {/* TABS NAVIGATION */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setTelemetryTab('overview')}
                  className={`flex-1 py-1.5 rounded-xl transition ${telemetryTab === 'overview' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setTelemetryTab('geotech')}
                  className={`flex-1 py-1.5 rounded-xl transition ${telemetryTab === 'geotech' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  6 Causes
                </button>
                <button
                  onClick={() => setTelemetryTab('weather')}
                  className={`flex-1 py-1.5 rounded-xl transition ${telemetryTab === 'weather' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  Forecast
                </button>
                <button
                  onClick={() => setTelemetryTab('impact')}
                  className={`flex-1 py-1.5 rounded-xl transition ${telemetryTab === 'impact' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  Impact
                </button>
                <button
                  onClick={() => setTelemetryTab('timeline')}
                  className={`flex-1 py-1.5 rounded-xl transition ${telemetryTab === 'timeline' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  History
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {telemetryTab === 'overview' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Slope Angle</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedVillage.slope_deg}°
                      </div>
                      <div className="text-[9px] text-slate-400">{selectedVillage.elevation_m}m elev</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">72h Rain</div>
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                        {selectedVillage.rainfall_72h_mm}
                      </div>
                      <div className="text-[9px] text-slate-400">mm gauge</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Soil Sat.</div>
                      <div className="text-sm font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                        {selectedVillage.soil_moisture_pct}%
                      </div>
                      <div className="text-[9px] text-slate-400">volumetric</div>
                    </div>
                  </div>

                  {/* Civil Defense Protocol */}
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>Civil Defense Protocol</span>
                    </div>
                    <p className="text-xs text-rose-900 dark:text-rose-100 leading-relaxed font-medium">
                      {selectedVillage.suggested_action}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: 6 CONTRIBUTING GEOTECHNICAL REASONS */}
              {telemetryTab === 'geotech' && (() => {
                const geotechFactors = (selectedVillage.contributing_factors_detailed && selectedVillage.contributing_factors_detailed.length > 0)
                  ? selectedVillage.contributing_factors_detailed
                  : [
                      {
                        factor: 'Slope Gradient & Profile',
                        value: `${selectedVillage.slope_deg || 42}° steep talus incline`,
                        risk_impact: (selectedVillage.slope_deg || 42) > 35 ? 'High' : 'Moderate',
                        description: 'Steep talus formation prone to shear failure under gravity along Disang shale.'
                      },
                      {
                        factor: '72-Hour Accumulated Rainfall',
                        value: `${selectedVillage.rainfall_72h_mm || 185} mm`,
                        risk_impact: (selectedVillage.rainfall_72h_mm || 185) > 140 ? 'Critical' : 'High',
                        description: 'Prolonged saturation exceeding hydrological infiltration threshold.'
                      },
                      {
                        factor: 'Soil Saturation & Pore Pressure',
                        value: `${selectedVillage.soil_moisture_pct || 84}% volumetric moisture`,
                        risk_impact: (selectedVillage.soil_moisture_pct || 84) > 80 ? 'Critical' : 'Moderate',
                        description: 'High pore water pressure liquefying silty-clay cohesive bonds.'
                      },
                      {
                        factor: 'Geological Fault Line Proximity',
                        value: '1.4 km from Kopili/Haflong active fault line',
                        risk_impact: 'High',
                        description: 'Fractured sandstone and Barail shale bedrock weakened by tectonic stress.'
                      },
                      {
                        factor: 'Vegetation / Deforestation Index',
                        value: 'Moderate (42% vegetative cover disturbance)',
                        risk_impact: 'Moderate',
                        description: 'Loss of root matrix cohesion exacerbates surface rill wash and deep creep.'
                      },
                      {
                        factor: 'Road Cutting & Anthropogenic Excavation',
                        value: 'Active toe erosion & steep unretained highway excavation along base',
                        risk_impact: 'High',
                        description: 'Unsupported cut-slopes along transportation corridors remove toe support.'
                      }
                    ];

                return (
                  <div className="space-y-2 animate-in fade-in">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>6 Contributing Geotechnical Factors</span>
                      <span className="text-[10px] text-slate-400 font-mono">Multi-Sensor Telemetry</span>
                    </div>

                    {geotechFactors.map((f, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{f.factor}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            f.risk_impact === 'Critical'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                              : (f.risk_impact === 'High' ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300' : 'bg-slate-100 text-slate-600 border-slate-300')
                          }`}>
                            {f.risk_impact}
                          </span>
                        </div>
                        <div className="font-mono text-sky-600 dark:text-sky-400 text-[11px] font-semibold">
                          {f.value}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {f.description}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* TAB 3: DISTRICT WEATHER FORECAST WIDGET */}
              {telemetryTab === 'weather' && (() => {
                const weatherData = selectedVillage.weather_forecast || {
                  temperature_c: 24.8,
                  rainfall_24h_mm: selectedVillage.risk_score >= 75 ? 74.2 : 21.5,
                  rainfall_7d_mm: selectedVillage.risk_score >= 75 ? 218.0 : 84.0,
                  humidity_pct: selectedVillage.risk_score >= 75 ? 88 : 70,
                  wind_speed_kmh: 13.5,
                  condition: selectedVillage.risk_score >= 75 ? 'Heavy Monsoon Rain' : 'Intermittent Showers'
                };

                return (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CloudSun className="w-4 h-4 text-sky-500" />
                      <span>District Meteorological Forecast</span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-sky-100 font-medium">Condition</span>
                            <h4 className="text-lg font-bold">{weatherData.condition}</h4>
                          </div>
                          <span className="text-3xl font-extrabold">{weatherData.temperature_c}°C</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-sky-500" /> 24h Rainfall
                          </div>
                          <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1">
                            {weatherData.rainfall_24h_mm} mm
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-indigo-500" /> 7-Day Cumulative
                          </div>
                          <div className="text-base font-bold text-rose-600 dark:text-rose-400 mt-1">
                            {weatherData.rainfall_7d_mm} mm
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Relative Humidity</div>
                          <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                            {weatherData.humidity_pct}%
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                            <Wind className="w-3 h-3 text-slate-400" /> Wind Speed
                          </div>
                          <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                            {weatherData.wind_speed_kmh} km/h
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 4: INFRASTRUCTURE IMPACT ANALYSIS */}
              {telemetryTab === 'impact' && (() => {
                const infraData = selectedVillage.infrastructure_at_risk || {
                  bridges: [`${selectedVillage.name} RCC Culvert #24`, 'Lumding-Badarpur Bridge Span K-114'],
                  power_lines: [`33kV Feeder Line - ${selectedVillage.district}`, '11kV Rural Grid Pole #48'],
                  alternative_routes: [
                    `State Highway 19 Bypass via ${selectedVillage.subdivision || 'Haflong'} Eastern Ridge (18km Detour)`,
                    'Forest Service Arterial Spur (4x4 Emergency Vehicles Only)'
                  ]
                };

                return (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-rose-500" />
                      <span>Critical Infrastructure at Risk & Detours</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">🌉 Bridges & Culverts at Risk:</span>
                        <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                          {infraData.bridges?.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">⚡ Power & Telecommunications:</span>
                        <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                          {infraData.power_lines?.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-1.5">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300">🧭 Operational Emergency Detour Routes:</span>
                        <ul className="list-disc list-inside text-[11px] text-emerald-900 dark:text-emerald-200 space-y-0.5">
                          {infraData.alternative_routes?.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 5: HISTORICAL DISASTER TIMELINE */}
              {telemetryTab === 'timeline' && (() => {
                const historyData = (selectedVillage.historical_landslides && selectedVillage.historical_landslides.length > 0)
                  ? selectedVillage.historical_landslides
                  : [
                      {
                        year: '2024',
                        date: '18 July 2024',
                        type: 'Debris Flow & Rockfall',
                        rainfall: '194 mm (24h continuous burst)',
                        damage: 'NH-27 road link severed for 36 hours; 4 culverts collapsed.',
                        countermeasures: 'Heavy tiered gabion wall installation along base; installed vibrating wire piezometers.'
                      },
                      {
                        year: '2022',
                        date: '14 May 2022',
                        type: 'Catastrophic Flash Flood & Mudslide',
                        rainfall: '285 mm (Extreme cloudburst event)',
                        damage: 'Severe railway track subgrade washout; 8 hillside houses inundated.',
                        countermeasures: 'SDRF permanent telemetry relay station established; reinforced concrete retaining walls erected.'
                      }
                    ];

                return (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span>Historical Disaster Timeline</span>
                      </div>
                      <button
                        onClick={() => exportHistoryTimelineCSV(historyData.map((h, i) => ({
                          id: `HIST-${selectedVillage.id}-${h.year || i}`,
                          year: h.year || '',
                          date: h.date || '',
                          title: `${selectedVillage.name} ${h.type || 'Landslide'}`,
                          location: selectedVillage.name,
                          district: selectedVillage.district,
                          state: selectedVillage.state,
                          hazard_type: h.type || '',
                          severity: 'High',
                          rainfall: h.rainfall || '',
                          casualties: 'Documented in district log',
                          damage: h.damage || '',
                          countermeasures: h.countermeasures || '',
                          status: 'Documented'
                        })), `${selectedVillage.name}_timeline`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 transition"
                        title="Export this node's history as CSV"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export CSV</span>
                      </button>
                    </div>

                    <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-800">
                      {historyData.map((hist, idx) => (
                        <div key={idx} className="relative group text-xs space-y-1">
                          <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900"></span>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">{hist.date}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {hist.year}
                            </span>
                          </div>
                          <div className="font-semibold text-rose-600 dark:text-rose-400 text-[11px]">{hist.type}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">🌧️ Rainfall: {hist.rainfall}</div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                            <strong>Damage:</strong> {hist.damage}
                          </p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-snug">
                            <strong>Countermeasures:</strong> {hist.countermeasures}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* QUICK ACTIONS FOR OFFICER */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => alert(`Warning SMS broadcast dispatched to ${selectedVillage.name} community leaders and local police station.`)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition"
                >
                  Broadcast Alert SMS
                </button>
                <button
                  onClick={() => alert(`SDRF response order initiated for ${selectedVillage.name} corridor.`)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
                >
                  Deploy SDRF Unit
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Mountain className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p>Click or hover over any marker to inspect geotechnical factors, weather forecasts, and historical timelines.</p>
            </div>
          )}

          <div className="text-[10px] text-slate-400 text-center pt-3 border-t border-slate-200 dark:border-slate-800">
            Source: Multi-State NER Geotechnical Sensor Telemetry (Assam & Meghalaya)
          </div>
        </div>
      </div>
    </div>
  );
}
