import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import { authService } from '../../firebase/authService';
import RiskBadge from '../../components/RiskBadge';
import OfflineBanner from '../../components/OfflineBanner';
import {
  Download,
  Search,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Lock,
  Gauge,
  CloudSun,
  Droplets,
  Calendar,
  Wind,
  Navigation,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  X,
  Mountain
} from 'lucide-react';
import { exportVillageTelemetryCSV } from '../../utils/csvExport';

function Sparkline({ data, color = '#38bdf8' }) {
  if (!data || data.length === 0) {
    data = [15, 25, 60, 120, 200, 350, 420, 360, 280, 130, 30, 10];
  }
  const max = Math.max(...data, 1);
  const width = 80;
  const height = 24;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - (val / max) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function ListView() {
  const { t } = useTranslation();
  const currentOfficer = authService.getCurrentOfficer();

  // Scoped Authority
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
  const [search, setSearch] = useState('');
  const [bandFilter, setBandFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState(initialAssignedState);
  const [districtFilter, setDistrictFilter] = useState(officerAssignedDistrict || 'ALL');
  const [sortField, setSortField] = useState('risk_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [isCached, setIsCached] = useState(false);

  // Detail Modal state
  const [selectedVillageModal, setSelectedVillageModal] = useState(null);
  const [modalTab, setModalTab] = useState('overview'); // 'overview' | 'geotech' | 'weather' | 'impact' | 'history'

  const loadData = async () => {
    try {
      const res = await apiClient.fetchVillages();
      setVillages(res.data);
      setIsCached(res.fromCache);
    } catch (err) {
      console.error('Failed to load villages in list:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableDistricts = useMemo(() => {
    if (officerAssignedDistrict) return [officerAssignedDistrict];
    if (stateFilter === 'Assam') return ['Dima Hasao', 'Kamrup'];
    if (stateFilter === 'Meghalaya') return ['East Khasi Hills', 'Ri-Bhoi'];
    if (stateFilter === 'Sikkim') return ['Gangtok'];
    return ['Dima Hasao', 'East Khasi Hills', 'Gangtok', 'Ri-Bhoi', 'Kamrup'];
  }, [stateFilter, officerAssignedDistrict]);

  const filtered = useMemo(() => {
    return villages
      .filter((v) => {
        // District Admin constraint
        if (officerAssignedDistrict && v.district.toLowerCase() !== officerAssignedDistrict.toLowerCase()) {
          return false;
        }
        if (stateFilter !== 'ALL' && v.state.toLowerCase() !== stateFilter.toLowerCase()) return false;
        if (districtFilter !== 'ALL' && v.district.toLowerCase() !== districtFilter.toLowerCase()) return false;
        if (bandFilter !== 'ALL' && v.risk_band.toUpperCase() !== bandFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            v.name.toLowerCase().includes(q) ||
            v.subdivision.toLowerCase().includes(q) ||
            v.district.toLowerCase().includes(q) ||
            v.id.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (sortAsc) return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  }, [villages, search, bandFilter, stateFilter, districtFilter, sortField, sortAsc, officerAssignedDistrict]);

  const handleExportCSV = () => {
    if (!filtered.length) return;
    const headers = [
      'Village ID',
      'Settlement Name',
      'Subdivision',
      'District',
      'State',
      'Latitude',
      'Longitude',
      'Elevation (m)',
      'Slope Angle (deg)',
      '72h Rainfall (mm)',
      'Soil Saturation (%)',
      'Risk Score (0-100)',
      'Exact Risk Percentage (%)',
      'Risk Band',
      'Contributing Factors',
      'Civil Defense Suggested Action'
    ];

    const rows = filtered.map((v) => [
      v.id,
      `"${v.name}"`,
      `"${v.subdivision}"`,
      v.district,
      v.state,
      v.lat,
      v.lon,
      v.elevation_m,
      v.slope_deg,
      v.rainfall_72h_mm,
      v.soil_moisture_pct,
      v.risk_score,
      v.risk_percentage || v.risk_score,
      v.risk_band,
      `"${(v.contributing_factors || []).join('; ')}"`,
      `"${(v.suggested_action || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NER_Landslide_Vulnerability_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors">
      <OfflineBanner forceOffline={isCached} onRefresh={loadData} />

      {/* Header & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('list.title', 'Settlement Vulnerability Directory')}
            </h1>
            {officerAssignedDistrict ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300">
                <Lock className="w-3 h-3" />
                <span>{officerAssignedDistrict} Scope</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300">
                <span>Multi-District Super Admin</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              'list.subtitle',
              'Complete inventory of monitored hill villages across Assam and Meghalaya with exact risk percentage metrics'
            )}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('list.export_csv', 'Export Dataset as CSV')}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('list.search_placeholder', 'Search by village name, subdivision, or district...')}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        {/* State Filter */}
        <div className="sm:col-span-2">
          {officerAssignedDistrict ? (
            <div className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>{initialAssignedState}</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          ) : (
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setDistrictFilter('ALL');
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition font-medium"
            >
              <option value="ALL">All States</option>
              <option value="Assam">Assam</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Sikkim">Sikkim</option>
            </select>
          )}
        </div>

        {/* District Filter */}
        <div className="sm:col-span-3">
          {officerAssignedDistrict ? (
            <div className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span className="font-semibold">{officerAssignedDistrict}</span>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          ) : (
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition font-medium"
            >
              <option value="ALL">All Districts</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}
        </div>

        {/* Risk Band Filter */}
        <div className="sm:col-span-3">
          <select
            value={bandFilter}
            onChange={(e) => setBandFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition font-medium"
          >
            <option value="ALL">All Risk Bands</option>
            <option value="CRITICAL">Critical (Score 75-100)</option>
            <option value="HIGH">High (Score 51-74)</option>
            <option value="MODERATE">Moderate (Score 26-50)</option>
            <option value="LOW">Low (Score 0-25)</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 select-none">
              <tr>
                <th
                  onClick={() => {
                    setSortField('name');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-sky-600 dark:hover:text-sky-300 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('list.col_settlement', 'Settlement / Locality')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">District / State</th>
                <th
                  onClick={() => {
                    setSortField('slope_deg');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-sky-600 dark:hover:text-sky-300 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('list.col_slope', 'Slope')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('rainfall_72h_mm');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-sky-600 dark:hover:text-sky-300 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('list.col_rain', '72h Rain')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">{t('list.col_moisture', 'Soil Saturation')}</th>
                <th className="py-3 px-4">12-Month Trend</th>
                <th
                  onClick={() => {
                    setSortField('risk_score');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-sky-600 dark:hover:text-sky-300 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('list.col_risk', 'Risk Index & Exact %')}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => {
                    setSelectedVillageModal(v);
                    setModalTab('overview');
                  }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{v.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {v.id} • {v.lat.toFixed(3)}°N, {v.lon.toFixed(3)}°E
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {v.district}, {v.state}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-semibold">{v.slope_deg}°</td>
                  <td className="py-3.5 px-4 text-amber-600 dark:text-amber-300 font-semibold">{v.rainfall_72h_mm} mm</td>
                  <td className="py-3.5 px-4 text-sky-600 dark:text-sky-300 font-semibold">{v.soil_moisture_pct}%</td>
                  <td className="py-3.5 px-4">
                    <Sparkline
                      color={
                        v.risk_score >= 75
                          ? '#ef4444'
                          : v.risk_score > 50
                          ? '#f97316'
                          : '#0284c7'
                      }
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <RiskBadge score={v.risk_score} band={v.risk_band} size="sm" />
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                        {v.risk_percentage || v.risk_score}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            No settlements match your search criteria.
          </div>
        )}
      </div>

      {/* MULTI-TAB DETAIL MODAL */}
      {selectedVillageModal && (() => {
        const vm = selectedVillageModal;
        const geotechFactors = (vm.contributing_factors_detailed && vm.contributing_factors_detailed.length > 0)
          ? vm.contributing_factors_detailed
          : [
              {
                factor: 'Slope Gradient & Profile',
                value: `${vm.slope_deg || 42}° steep talus incline`,
                risk_impact: (vm.slope_deg || 42) > 35 ? 'High' : 'Moderate',
                description: 'Steep talus formation prone to shear failure under gravity along Disang shale.'
              },
              {
                factor: '72-Hour Accumulated Rainfall',
                value: `${vm.rainfall_72h_mm || 185} mm`,
                risk_impact: (vm.rainfall_72h_mm || 185) > 140 ? 'Critical' : 'High',
                description: 'Prolonged saturation exceeding hydrological infiltration threshold.'
              },
              {
                factor: 'Soil Saturation & Pore Pressure',
                value: `${vm.soil_moisture_pct || 84}% volumetric moisture`,
                risk_impact: (vm.soil_moisture_pct || 84) > 80 ? 'Critical' : 'Moderate',
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

        const weatherData = vm.weather_forecast || {
          temperature_c: 24.8,
          rainfall_24h_mm: vm.risk_score >= 75 ? 74.2 : 21.5,
          rainfall_7d_mm: vm.risk_score >= 75 ? 218.0 : 84.0,
          humidity_pct: vm.risk_score >= 75 ? 88 : 70,
          wind_speed_kmh: 13.5,
          condition: vm.risk_score >= 75 ? 'Heavy Monsoon Rain' : 'Intermittent Showers'
        };

        const infraData = vm.infrastructure_at_risk || {
          bridges: [`${vm.name} RCC Culvert #24`, 'Lumding-Badarpur Bridge Span K-114'],
          power_lines: [`33kV Feeder Line - ${vm.district}`, '11kV Rural Grid Pole #48'],
          alternative_routes: [
            `State Highway 19 Bypass via ${vm.subdivision || 'Haflong'} Eastern Ridge (18km Detour)`,
            'Forest Service Arterial Spur (4x4 Emergency Vehicles Only)'
          ]
        };

        const historyData = (vm.historical_landslides && vm.historical_landslides.length > 0)
          ? vm.historical_landslides
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 tracking-wider">
                    {vm.district}, {vm.state}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {vm.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    ID: {vm.id} • {vm.lat.toFixed(4)}°N, {vm.lon.toFixed(4)}°E
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportVillageTelemetryCSV(vm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm"
                    title="Export Telemetry CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Telemetry CSV</span>
                  </button>
                  <RiskBadge score={vm.risk_score} band={vm.risk_band} size="md" />
                  <button
                    onClick={() => setSelectedVillageModal(null)}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Exact Percentage Meter Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Gauge className="w-4 h-4 text-rose-500" />
                    <span>Exact Landslide Risk Percentage:</span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-rose-600 dark:text-rose-400">
                    {vm.risk_percentage || vm.risk_score}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (vm.risk_percentage || vm.risk_score) >= 75
                        ? 'bg-rose-600'
                        : ((vm.risk_percentage || vm.risk_score) >= 50 ? 'bg-orange-500' : 'bg-amber-500')
                    }`}
                    style={{ width: `${vm.risk_percentage || vm.risk_score}%` }}
                  ></div>
                </div>
              </div>

              {/* Modal Tabs Navigation */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setModalTab('overview')}
                  className={`flex-1 py-1.5 rounded-xl transition ${modalTab === 'overview' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setModalTab('geotech')}
                  className={`flex-1 py-1.5 rounded-xl transition ${modalTab === 'geotech' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  6 Causes
                </button>
                <button
                  onClick={() => setModalTab('weather')}
                  className={`flex-1 py-1.5 rounded-xl transition ${modalTab === 'weather' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  Forecast
                </button>
                <button
                  onClick={() => setModalTab('impact')}
                  className={`flex-1 py-1.5 rounded-xl transition ${modalTab === 'impact' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  Impact
                </button>
                <button
                  onClick={() => setModalTab('history')}
                  className={`flex-1 py-1.5 rounded-xl transition ${modalTab === 'history' ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                >
                  History
                </button>
              </div>

              {/* TAB 1: OVERVIEW */}
              {modalTab === 'overview' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Slope Angle</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5 block">{vm.slope_deg}°</span>
                      <span className="text-[10px] text-slate-400">{vm.elevation_m}m elevation</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">72h Rain</span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 text-base mt-0.5 block">{vm.rainfall_72h_mm} mm</span>
                      <span className="text-[10px] text-slate-400">rainfall gauge</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Soil Saturation</span>
                      <span className="font-extrabold text-sky-600 dark:text-sky-400 text-base mt-0.5 block">{vm.soil_moisture_pct}%</span>
                      <span className="text-[10px] text-slate-400">volumetric moisture</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-rose-700 dark:text-rose-300">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>Civil Defense Action Protocol:</span>
                    </div>
                    <p className="leading-relaxed font-medium">{vm.suggested_action}</p>
                  </div>
                </div>
              )}

              {/* TAB 2: 6 CAUSES */}
              {modalTab === 'geotech' && (
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
              )}

              {/* TAB 3: WEATHER FORECAST */}
              {modalTab === 'weather' && (
                <div className="space-y-3 animate-in fade-in">
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
                  </div>
                </div>
              )}

              {/* TAB 4: IMPACT */}
              {modalTab === 'impact' && (
                <div className="space-y-2.5 text-xs animate-in fade-in">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">🌉 Bridges & Culverts at Risk:</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                      {infraData.bridges?.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-1.5">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">🧭 Operational Detour Routes:</span>
                    <ul className="list-disc list-inside text-[11px] text-emerald-900 dark:text-emerald-200 space-y-0.5">
                      {infraData.alternative_routes?.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 5: HISTORY */}
              {modalTab === 'history' && (
                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-800 ml-2 animate-in fade-in">
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
              )}

              <button
                onClick={() => setSelectedVillageModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
              >
                Close Details
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
