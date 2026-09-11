import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import OfflineBanner from '../../components/OfflineBanner';
import { authService } from '../../firebase/authService';
import { useDistrict } from '../../context/DistrictContext';
import {
  FileCheck2,
  AlertTriangle,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Eye,
  Layers,
  Flame,
  Construction,
  ShieldAlert,
  Download
} from 'lucide-react';
import { exportCitizenReportsCSV } from '../../utils/csvExport';

export default function ReportsReview() {
  const { t } = useTranslation();
  const {
    selectedState,
    selectedDistrict,
    officerAssignedDistrict,
    isSuperAdmin
  } = useDistrict();

  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);
  const [activeOfficerNote, setActiveOfficerNote] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  const loadReports = async () => {
    try {
      const params = officerAssignedDistrict ? { district: officerAssignedDistrict } : null;
      const data = await apiClient.fetchReports(params);
      setReports(data);
    } catch (err) {
      console.error('Failed to load citizen reports:', err);
    }
  };

  useEffect(() => {
    loadReports();
  }, [officerAssignedDistrict]);

  const handleStatusChange = async (reportId, newStatus) => {
    setUpdatingId(reportId);
    const note = activeOfficerNote[reportId] || '';
    try {
      await apiClient.updateReportStatus(reportId, newStatus, note);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus, officer_notes: note || r.officer_notes } : r))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (officerAssignedDistrict && (r.district || '').toLowerCase() !== officerAssignedDistrict.toLowerCase()) return false;
    if (selectedState !== 'ALL' && r.state && r.state.toLowerCase() !== selectedState.toLowerCase()) return false;
    if (selectedDistrict !== 'ALL' && (r.district || '').toLowerCase() !== selectedDistrict.toLowerCase()) return false;
    if (filterStatus === 'ALL') return true;
    return r.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'actioned':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Actioned / Dispatched
          </span>
        );
      case 'reviewed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 text-xs font-semibold border border-sky-500/30 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> Reviewed by DDMA
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Triage
          </span>
        );
    }
  };

  const getHazardIcon = (type) => {
    switch (type) {
      case 'crack':
        return <Layers className="w-4 h-4 text-amber-500" />;
      case 'slope_movement':
        return <Flame className="w-4 h-4 text-rose-500" />;
      case 'blocked_road':
        return <Construction className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors">
      <OfflineBanner onRefresh={loadReports} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-sky-500" />
            <span>{t('reports.title', 'Crowdsourced Field Hazard Reports')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'reports.subtitle',
              'Review ground reports submitted by local villagers, travelers, and field crews'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {['ALL', 'pending', 'reviewed', 'actioned'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                  filterStatus === st
                    ? 'bg-sky-600 text-white shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* Export Reports (CSV) Button */}
          <button
            onClick={() => exportCitizenReportsCSV(filteredReports, officerAssignedDistrict || (selectedDistrict !== 'ALL' ? selectedDistrict : selectedState))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
            title="Download citizen reports archive as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Reports (CSV)</span>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden flex flex-col justify-between transition-colors"
          >
            {/* Top: Photo & Details */}
            <div>
              {report.photo_url && (
                <div
                  className="relative h-44 w-full bg-slate-100 dark:bg-slate-950 cursor-pointer group overflow-hidden"
                  onClick={() => setSelectedPhotoModal(report.photo_url)}
                >
                  <img
                    src={report.photo_url}
                    alt="Citizen submission"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="bg-black/60 px-2 py-0.5 rounded-md backdrop-blur text-[10px] flex items-center gap-1 font-mono">
                      <MapPin className="w-3 h-3 text-sky-400" />
                      {report.lat.toFixed(4)}°N, {report.lon.toFixed(4)}°E
                    </span>
                    <span className="text-[10px] text-white hover:text-sky-300 flex items-center gap-0.5">
                      <Eye className="w-3 h-3" /> Zoom
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-5 space-y-3">
                {/* Meta details */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {getHazardIcon(report.hazard_type)}
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      {report.hazard_type.replace('_', ' ')}
                    </span>
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {report.location_name || 'Dima Hasao Corridor'}
                </div>

                {/* Free Text Note */}
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 leading-relaxed">
                  "{report.description}"
                </p>

                {/* Citizen Phone & Timestamp */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  {report.phone_number && (
                    <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-mono">
                      <Phone className="w-3 h-3" />
                      <span>{report.phone_number}</span>
                    </div>
                  )}
                </div>

                {/* Officer Notes if present */}
                {report.officer_notes && (
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-[11px] text-sky-800 dark:text-sky-200">
                    <span className="font-semibold text-sky-700 dark:text-sky-300 block">DEOC Action Log:</span>
                    {report.officer_notes}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Triage Status Updater */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <select
                  value={report.status}
                  disabled={updatingId === report.id}
                  onChange={(e) => handleStatusChange(report.id, e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition"
                >
                  <option value="pending">Set Status: Pending Inspection</option>
                  <option value="reviewed">Set Status: Reviewed by DDMA</option>
                  <option value="actioned">Set Status: Dispatched / Actioned</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Add officer action note..."
                  value={activeOfficerNote[report.id] || ''}
                  onChange={(e) =>
                    setActiveOfficerNote({ ...activeOfficerNote, [report.id]: e.target.value })
                  }
                  className="flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => handleStatusChange(report.id, report.status)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition"
                >
                  Log
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="py-16 text-center text-slate-400 text-xs">
          No reports found for this status.
        </div>
      )}

      {/* PHOTO ZOOM MODAL */}
      {selectedPhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl">
            <img src={selectedPhotoModal} alt="Enlarged evidence" className="w-full h-auto max-h-[80vh] object-contain" />
            <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-300">
              Click anywhere to close preview
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
