import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import RiskBadge from '../../components/RiskBadge';
import OfflineBanner from '../../components/OfflineBanner';
import {
  Download,
  Search,
  ChevronRight,
  ArrowUpDown,
  Filter
} from 'lucide-react';

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

  const [villages, setVillages] = useState([]);
  const [search, setSearch] = useState('');
  const [bandFilter, setBandFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [sortField, setSortField] = useState('risk_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [selectedVillageModal, setSelectedVillageModal] = useState(null);

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

  const filtered = useMemo(() => {
    return villages
      .filter((v) => {
        if (stateFilter !== 'ALL' && v.state.toLowerCase() !== stateFilter.toLowerCase()) return false;
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
  }, [villages, search, bandFilter, stateFilter, sortField, sortAsc]);

  const handleExportCSV = () => {
    if (!villages.length) return;
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
      'Risk Band',
      'Contributing Factors',
      'Civil Defense Suggested Action'
    ];

    const rows = villages.map((v) => [
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('list.title', 'Settlement Vulnerability Directory')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'list.subtitle',
              'Complete inventory of monitored hill villages across Assam and Meghalaya'
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2">
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
        <div>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition font-medium"
          >
            <option value="ALL">All States</option>
            <option value="Assam">Assam</option>
            <option value="Meghalaya">Meghalaya</option>
          </select>
        </div>

        {/* Risk Band Filter */}
        <div>
          <select
            value={bandFilter}
            onChange={(e) => setBandFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition font-medium"
          >
            <option value="ALL">All Risk Bands</option>
            <option value="CRITICAL">Critical (75-100)</option>
            <option value="HIGH">High (51-74)</option>
            <option value="MODERATE">Moderate (26-50)</option>
            <option value="LOW">Low (0-25)</option>
          </select>
        </div>
      </div>

      {/* Villages Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm dark:shadow-xl overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  onClick={() => {
                    setSortField('name');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-sky-600 dark:hover:text-sky-300 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t('list.col_name', 'Settlement Name')}</span>
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
                    <span>{t('list.col_risk', 'Risk Index')}</span>
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
                  onClick={() => setSelectedVillageModal(v)}
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
                    <RiskBadge score={v.risk_score} band={v.risk_band} size="sm" />
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

      {/* DETAIL MODAL */}
      {selectedVillageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 tracking-wider">
                  {selectedVillageModal.district}, {selectedVillageModal.state}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedVillageModal.name}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {selectedVillageModal.id} • {selectedVillageModal.lat}°N, {selectedVillageModal.lon}°E
                </div>
              </div>
              <RiskBadge score={selectedVillageModal.risk_score} band={selectedVillageModal.risk_band} size="md" />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 text-[10px] block">Slope Angle</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedVillageModal.slope_deg}°</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 text-[10px] block">72h Rainfall</span>
                <span className="font-bold text-amber-600 dark:text-amber-300 text-sm">{selectedVillageModal.rainfall_72h_mm} mm</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 text-[10px] block">Soil Saturation</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">{selectedVillageModal.soil_moisture_pct}%</span>
              </div>
            </div>

            {/* Triggers */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Geotechnical Triggers
              </span>
              {selectedVillageModal.contributing_factors.map((f, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-slate-800">
                  • {f}
                </div>
              ))}
            </div>

            {/* Suggested Action */}
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-900 dark:text-rose-200">
              <span className="font-bold uppercase tracking-wider text-[10px] block text-rose-700 dark:text-rose-300 mb-1">
                Civil Defense Action Protocol
              </span>
              {selectedVillageModal.suggested_action}
            </div>

            <button
              onClick={() => setSelectedVillageModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
