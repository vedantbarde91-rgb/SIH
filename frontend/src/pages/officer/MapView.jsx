import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import RiskBadge, { getRiskLevel } from '../../components/RiskBadge';
import OfflineBanner from '../../components/OfflineBanner';
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
  BellRing
} from 'lucide-react';

// District center coordinates for auto-focus
const DISTRICT_CENTERS = {
  'ALL': { center: [25.45, 92.45], zoom: 9 },
  'Dima Hasao': { center: [25.17, 93.02], zoom: 11 },
  'East Khasi Hills': { center: [25.35, 91.82], zoom: 11 },
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

  const borderClass = isSelected ? 'border-2 border-white ring-2 ring-sky-400' : 'border border-slate-900';

  const html = `
    <div class="relative flex items-center justify-center w-7 h-7">
      ${pulseHtml}
      <div style="background-color: ${color};" class="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shadow-lg ${borderClass}">
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

  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [mapCenter, setMapCenter] = useState(DISTRICT_CENTERS['Dima Hasao'].center);
  const [mapZoom, setMapZoom] = useState(11);
  const [loading, setLoading] = useState(true);
  const [isCachedData, setIsCachedData] = useState(false);
  const [basemap, setBasemap] = useState('esriTopo'); // 'esriTopo' | 'osm'

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
    } else {
      setMapCenter(DISTRICT_CENTERS['ALL'].center);
      setMapZoom(9);
    }
  };

  // Handle District selection change
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    const target = DISTRICT_CENTERS[district] || DISTRICT_CENTERS['ALL'];
    setMapCenter(target.center);
    setMapZoom(target.zoom);
  };

  // Filtered villages based on State, District, and Risk Band
  const filteredVillages = useMemo(() => {
    return villages.filter((v) => {
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
  }, [villages, selectedState, selectedDistrict, selectedFilter]);

  // High-Risk Settlements (risk_score >= 75) in the current filtered scope
  const highRiskVillages = useMemo(() => {
    return filteredVillages
      .filter((v) => v.risk_score >= 75)
      .sort((a, b) => b.risk_score - a.risk_score);
  }, [filteredVillages]);

  // Available districts based on selected state
  const availableDistricts = useMemo(() => {
    if (selectedState === 'Assam') return ['Dima Hasao', 'Kamrup'];
    if (selectedState === 'Meghalaya') return ['East Khasi Hills', 'Ri-Bhoi'];
    return ['Dima Hasao', 'East Khasi Hills', 'Ri-Bhoi', 'Kamrup'];
  }, [selectedState]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      <OfflineBanner forceOffline={isCachedData} onRefresh={loadData} />

      {/* DYNAMIC HIGH-RISK ALERT BANNER (CRITICAL SITES >= 75) */}
      {highRiskVillages.length > 0 && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs shadow-md border-b border-rose-700 animate-in fade-in flex flex-wrap items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-white/20 animate-pulse flex-shrink-0">
              <BellRing className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold uppercase tracking-wide">
                {t('map.high_risk_alert', 'CRITICAL HAZARD WARNING:')}
              </span>
              <span className="ml-1 font-medium">
                {highRiskVillages.length} locations have breached the dangerous 75/100 threshold in{' '}
                <strong>{selectedDistrict !== 'ALL' ? selectedDistrict : (selectedState !== 'ALL' ? selectedState : 'NER Corridor')}</strong>:
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
            {highRiskVillages.slice(0, 4).map((v) => (
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
                <span className="bg-white text-rose-700 px-1 rounded-full text-[10px] font-mono">
                  {v.risk_score}
                </span>
              </button>
            ))}
            {highRiskVillages.length > 4 && (
              <span className="text-[10px] opacity-80">+{highRiskVillages.length - 4} more</span>
            )}
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
              {t('map.title', 'Landslide Vulnerability & Multi-State Surveillance Map')}
            </h2>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Active: {filteredVillages.length} settlements mapped • {highRiskVillages.length} critical alerts
            </div>
          </div>
        </div>

        {/* STATE & DISTRICT SELECTORS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* State Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {t('map.state_label', 'State:')}
            </span>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition"
            >
              <option value="ALL">{t('map.all_states', 'All States (Assam & Meghalaya)')}</option>
              <option value="Assam">Assam</option>
              <option value="Meghalaya">Meghalaya</option>
            </select>
          </div>

          {/* District Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {t('map.district_label', 'District:')}
            </span>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition"
            >
              <option value="ALL">{t('map.all_districts', 'All Districts')}</option>
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

      {/* MAIN MAP & SIDEBAR TELEMETRY LAYOUT */}
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
                        {village.district}, {village.state} • {village.elevation_m}m elev
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
              <span>Risk Band Scale</span>
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

        {/* SIDEBAR TELEMETRY & CIVIL ACTION CARD */}
        <div className="w-full lg:w-96 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 overflow-y-auto p-4 sm:p-5 flex flex-col justify-between flex-shrink-0 z-10 transition-colors">
          {selectedVillage ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    {selectedVillage.district}, {selectedVillage.state}
                  </span>
                  <RiskBadge score={selectedVillage.risk_score} band={selectedVillage.risk_band} size="sm" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {selectedVillage.name}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  ID: {selectedVillage.id} • {selectedVillage.lat.toFixed(4)}°N, {selectedVillage.lon.toFixed(4)}°E
                </div>
              </div>

              {/* Geotechnical Quick Telemetry Grid */}
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

              {/* Contributing Reasons */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-orange-500" />
                  <span>{t('map.contributing_triggers', 'Key Contributing Triggers')}</span>
                </div>
                <div className="space-y-1.5">
                  {selectedVillage.contributing_factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Action Protocol */}
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>{t('map.suggested_action', 'Civil Defense Protocol')}</span>
                </div>
                <p className="text-xs text-rose-900 dark:text-rose-100 leading-relaxed font-medium">
                  {selectedVillage.suggested_action}
                </p>
              </div>

              {/* Quick Actions for Officer */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => alert(`Warning SMS broadcast dispatched to ${selectedVillage.name} community leaders and local police station.`)}
                  className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition"
                >
                  Broadcast Alert SMS
                </button>
                <button
                  onClick={() => alert(`SDRF response order initiated for ${selectedVillage.name} corridor.`)}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
                >
                  Deploy SDRF
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Mountain className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p>{t('map.click_hint', 'Click or hover over any marker to inspect geotechnical factors and suggested civil defense actions.')}</p>
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
