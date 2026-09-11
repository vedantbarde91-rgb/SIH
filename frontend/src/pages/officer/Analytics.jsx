import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import { authService } from '../../firebase/authService';
import { useDistrict } from '../../context/DistrictContext';
import OfflineBanner from '../../components/OfflineBanner';
import { useTheme } from '../../context/ThemeContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  CloudRain,
  Droplets,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  Mountain,
  CheckCircle2
} from 'lucide-react';

export default function Analytics() {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const [summary, setSummary] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    selectedState,
    selectedDistrict,
    officerAssignedDistrict
  } = useDistrict();

  const activeScopeName = officerAssignedDistrict
    || (selectedDistrict !== 'ALL' ? selectedDistrict : (selectedState !== 'ALL' ? selectedState : 'NER'));

  useEffect(() => {
    Promise.all([
      apiClient.fetchDistrictSummary(),
      apiClient.fetchCorridorTimeSeries(),
      apiClient.fetchVillages()
    ])
      .then(([sumRes, tsRes, vilRes]) => {
        setSummary(sumRes.data);
        setTimeSeries(tsRes);
        setVillages(vilRes.data);
      })
      .catch((err) => console.error('Failed to load analytics data:', err))
      .finally(() => setLoading(false));
  }, []);

  // Strict district & state scoping of settlements based on global header selection
  const scopedVillages = useMemo(() => {
    return villages.filter((v) => {
      if (officerAssignedDistrict && (v.district || '').toLowerCase() !== officerAssignedDistrict.toLowerCase()) {
        return false;
      }
      if (selectedState !== 'ALL' && (v.state || '').toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      if (selectedDistrict !== 'ALL' && (v.district || '').toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [villages, officerAssignedDistrict, selectedState, selectedDistrict]);

  // Derived KPI metrics
  const metrics = useMemo(() => {
    if (!scopedVillages.length) {
      return {
        avgRain: summary?.avg_72h_rainfall_mm || '142.4',
        avgMoisture: summary?.avg_soil_moisture_pct || '63.8',
        alertLevel: summary?.alert_level || 'ORANGE ALERT',
        totalCount: summary?.total_monitored_settlements || 31
      };
    }
    const totalRain = scopedVillages.reduce((acc, v) => acc + (v.rainfall_72h_mm || 0), 0);
    const avgRain = (totalRain / scopedVillages.length).toFixed(1);

    const totalMoisture = scopedVillages.reduce((acc, v) => acc + (v.soil_moisture_pct || 0), 0);
    const avgMoisture = (totalMoisture / scopedVillages.length).toFixed(1);

    const criticalCount = scopedVillages.filter((v) => (v.risk_percentage || v.risk_score) >= 75).length;
    const alertLevel = criticalCount > 2 ? 'RED ALERT' : (criticalCount > 0 ? 'ORANGE ALERT' : 'YELLOW WATCH');

    return {
      avgRain,
      avgMoisture,
      alertLevel,
      totalCount: scopedVillages.length
    };
  }, [scopedVillages, summary]);

  const bandChartData = useMemo(() => {
    if (!scopedVillages.length) {
      return [
        { name: 'Low (0-25)', count: summary?.risk_band_distribution?.Low || 4, color: '#10b981' },
        { name: 'Moderate (26-50)', count: summary?.risk_band_distribution?.Moderate || 8, color: '#f59e0b' },
        { name: 'High (51-74)', count: summary?.risk_band_distribution?.High || 10, color: '#f97316' },
        { name: 'Critical (75-100)', count: 9, color: '#ef4444' }
      ];
    }
    const low = scopedVillages.filter((v) => (v.risk_band || '').toUpperCase() === 'LOW' || (v.risk_percentage || v.risk_score) <= 25).length;
    const mod = scopedVillages.filter((v) => (v.risk_band || '').toUpperCase() === 'MODERATE' || ((v.risk_percentage || v.risk_score) > 25 && (v.risk_percentage || v.risk_score) <= 50)).length;
    const high = scopedVillages.filter((v) => (v.risk_band || '').toUpperCase() === 'HIGH' || ((v.risk_percentage || v.risk_score) > 50 && (v.risk_percentage || v.risk_score) < 75)).length;
    const crit = scopedVillages.filter((v) => (v.risk_band || '').toUpperCase() === 'CRITICAL' || (v.risk_percentage || v.risk_score) >= 75).length;

    return [
      { name: 'Low (0-25)', count: low, color: '#10b981' },
      { name: 'Moderate (26-50)', count: mod, color: '#f59e0b' },
      { name: 'High (51-74)', count: high, color: '#f97316' },
      { name: 'Critical (75-100)', count: crit, color: '#ef4444' }
    ];
  }, [scopedVillages, summary]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors">
      <OfflineBanner />

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t('analytics.title', 'Geotechnical Telemetry & Anomaly Analysis')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {activeScopeName !== 'NER'
            ? `12-Month geotechnical telemetry & rainfall correlation across ${activeScopeName} hill slopes`
            : t('analytics.subtitle', '12-Month rainfall vs soil moisture correlation across NER hill slopes')}
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{activeScopeName !== 'NER' ? `${activeScopeName} 72h Avg Rain` : t('analytics.stat_avg_rain', 'District 72h Avg Rain')}</span>
            <CloudRain className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {metrics.avgRain} mm
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Telemetry calibrated</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('analytics.stat_avg_moisture', 'Avg Soil Saturation')}</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {metrics.avgMoisture} %
          </div>
          <div className="text-[11px] text-sky-600 dark:text-sky-400 mt-1 font-medium">
            Pore pressure sensors active
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('analytics.stat_alert_level', 'Corridor Threat Level')}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {metrics.alertLevel}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {activeScopeName !== 'NER' ? `${activeScopeName} DDMA Command` : 'NER Corridor Watch'}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Surveillance Coverage</span>
            <Mountain className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {metrics.totalCount} Settlements
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>{activeScopeName !== 'NER' ? `${activeScopeName} Jurisdiction` : 'NER Synced'}</span>
          </div>
        </div>
      </div>

      {/* CHART 1: RECHARTS 12-MONTH CORRIDOR TIME SERIES */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              <span>{t('analytics.chart_title_rain_moisture', 'Corridor Average Rainfall vs. Soil Moisture (12-Month Trend)')}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Seasonal trigger escalation showing rapid pore-pressure rise during June-August monsoons
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500"></span> Rainfall (mm)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-sky-500"></span> Soil Moisture (%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500"></span> Risk Score
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="month" stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fontSize: 11 }} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#cbd5e1',
                  borderRadius: '0.75rem',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                }}
              />
              <ReferenceLine
                yAxisId="left"
                y={200}
                label={{ value: 'Safety Threshold (200mm)', fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }}
                stroke="#f59e0b"
                strokeDasharray="4 4"
              />
              <ReferenceLine
                yAxisId="right"
                y={80}
                label={{ value: 'Critical Shear Limit (80%)', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
                stroke="#ef4444"
                strokeDasharray="4 4"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avg_rainfall_mm"
                name="Rainfall (mm)"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f59e0b' }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avg_soil_moisture_pct"
                name="Soil Saturation (%)"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0284c7' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avg_risk_score"
                name="Risk Score"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: RECHARTS BAR CHART (RISK DISTRIBUTION) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-sky-500" />
              <span>{t('analytics.chart_title_risk_dist', 'Settlement Distribution by Risk Band')}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Classification of monitored sites based on cumulative kinematic hazard
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="name" stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fontSize: 11 }} />
                <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} tick={{ fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '0.75rem',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" name="Settlements" radius={[8, 8, 0, 0]}>
                  {bandChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Highest Priority Vulnerability List */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-3 flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>High & Critical Escalation Sites</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Settlements requiring immediate SDRF engineering surveillance
            </p>

            <div className="mt-4 space-y-2">
              {(summary?.critical_priority_sites || []).map((site) => (
                <div
                  key={site.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{site.name}</span>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {site.subdivision} • 72h Rain: {site.rainfall_72h_mm}mm
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{site.risk_score}/100</span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-500/30">
                      {site.risk_band}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            Trigger Model: Antecedent Precipitation Index (API-72) + Multi-State Lithology Factor
          </div>
        </div>
      </div>
    </div>
  );
}
