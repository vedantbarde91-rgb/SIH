import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import CitizenAIChatbot from '../../components/CitizenAIChatbot';
import {
  User,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Camera,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Building,
  RefreshCw,
  Search,
  MessageSquareQuote,
  ShieldAlert,
  Inbox
} from 'lucide-react';

export default function UserDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load current user and fetch their isolated reports
  useEffect(() => {
    let activeUser = null;
    try {
      const raw = localStorage.getItem('ner_registered_citizen');
      if (raw) {
        activeUser = JSON.parse(raw);
        setCurrentUser(activeUser);
      } else {
        // If not logged in, redirect to citizen auth
        navigate('/user/auth');
        return;
      }
    } catch {
      navigate('/user/auth');
      return;
    }

    if (activeUser) {
      loadUserReports(activeUser);
    }
  }, [navigate]);

  const loadUserReports = async (user) => {
    if (!user) return;
    setLoading(true);
    try {
      const userPhone = user.phone ? user.phone.replace(/\D/g, '') : '';
      const userEmail = user.email ? user.email.toLowerCase() : '';

      // 1. Fetch remote reports filtered by user_id from backend
      let remoteReports = [];
      try {
        remoteReports = await apiClient.fetchReports({ user_id: userPhone || userEmail });
      } catch (err) {
        console.warn('Remote report fetch fallback to local:', err);
      }

      // 2. Fetch local storage submitted reports for offline/immediate updates
      let localReports = [];
      try {
        const rawLocal = localStorage.getItem('ner_user_submitted_reports');
        if (rawLocal) {
          localReports = JSON.parse(rawLocal);
        }
      } catch (err) {
        console.warn('Failed to parse local reports:', err);
      }

      // 3. Strict Data Isolation Filter: ONLY include reports belonging to THIS user
      const isOwner = (r) => {
        const rUser = (r.user_id || '').toString().trim().toLowerCase();
        const rPhone = (r.phone_number || '').toString().replace(/\D/g, '');
        const rEmail = (r.email || '').toString().trim().toLowerCase();

        return (
          (userPhone && (rUser === userPhone || rPhone === userPhone)) ||
          (userEmail && (rUser === userEmail || rEmail === userEmail))
        );
      };

      const myLocal = localReports.filter(isOwner);
      const myRemote = remoteReports.filter(isOwner);

      // Merge and deduplicate by report id
      const combinedMap = new Map();
      // Add remote first
      myRemote.forEach((r) => combinedMap.set(r.id, r));
      // Overlay local submissions (or vice versa if remote has newer admin updates)
      myLocal.forEach((r) => {
        if (combinedMap.has(r.id)) {
          // If remote exists, preserve remote's status and officer_notes as the authority
          const rem = combinedMap.get(r.id);
          combinedMap.set(r.id, {
            ...r,
            status: rem.status || r.status,
            officer_notes: rem.officer_notes !== undefined ? rem.officer_notes : r.admin_notes
          });
        } else {
          combinedMap.set(r.id, r);
        }
      });

      const finalReports = Array.from(combinedMap.values()).sort((a, b) => {
        const dateA = new Date(a.created_at || a.timestamp || 0);
        const dateB = new Date(b.created_at || b.timestamp || 0);
        return dateB - dateA;
      });

      setReports(finalReports);
    } catch (err) {
      console.error('Error loading isolated user reports:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (currentUser) {
      loadUserReports(currentUser);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ner_registered_citizen');
    navigate('/user/auth');
  };

  // Helper for status badge styling
  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('verified') || s.includes('actioned') || s.includes('reviewed')) {
      return 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800';
    }
    if (s.includes('inspect') || s.includes('progress') || s.includes('dispatched')) {
      return 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800';
    }
    return 'text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/70 border-sky-300 dark:border-sky-800';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Citizen Profile Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-500 font-extrabold text-xl shadow-md">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {currentUser?.name || 'NER Citizen'}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                  {currentUser?.authMethod === 'google_oauth' ? 'Google Verified' : 'Resident Account'}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span>📱 +91 {currentUser?.phone || '9876543210'}</span>
                {currentUser?.email && <span>✉️ {currentUser.email}</span>}
                <span>📍 {currentUser?.village || 'Jatinga'}, {currentUser?.district || 'Dima Hasao'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              title="Refresh Reports"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-500' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Hazard</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-500 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overview Stat Cards (Isolated to this user) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your Submitted Hazards</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {reports.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified by SDRF / DDMA</div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {reports.filter((r) => (r.status || '').toLowerCase().includes('verified') || (r.status || '').toLowerCase().includes('actioned')).length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Data Privacy Guard</div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
                Isolated to Account
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Only your submissions are shown
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Hazard Reports Table & Tracking */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                My Submitted Hazard Reports
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live status tracking and official administrative response notes from District Emergency Operations Centre
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Account: +91 {currentUser?.phone}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-500" />
              <p>Fetching your personal hazard submissions...</p>
            </div>
          ) : reports.length === 0 ? (
            /* Clean Empty State for Data Isolation */
            <div className="py-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-500 mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  No Hazard Reports Submitted Under This Account
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                  You have not submitted any landslide reports yet under mobile <strong>+91 {currentUser?.phone}</strong>. As a resident or commuter, your geo-tagged reports help alert District Authorities and the SDRF in real time.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Your First Hazard Report →</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Isolated List of Reports */
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {report.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {report.hazard_type}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${getStatusBadge(report.status)}`}>
                        {report.status || 'Pending Review'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {report.created_at ? new Date(report.created_at).toLocaleString() : (report.timestamp || 'Recent')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {report.photo_url && (
                      <div className="md:col-span-3">
                        <img
                          src={report.photo_url}
                          alt="Field hazard evidence"
                          className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                      </div>
                    )}

                    <div className={report.photo_url ? 'md:col-span-9 space-y-2.5' : 'md:col-span-12 space-y-2.5'}>
                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span className="font-semibold">{report.location_name || report.location || 'NER Corridor'}</span>
                        {report.district && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                            {report.district}
                          </span>
                        )}
                        {report.lat && report.lon && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({Number(report.lat).toFixed(4)}, {Number(report.lon).toFixed(4)})
                          </span>
                        )}
                      </div>

                      {report.description && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 leading-relaxed">
                          "{report.description}"
                        </p>
                      )}

                      {/* Official Admin / SDRF Action Response Banner (Action Visibility) */}
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
                        <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold mb-1">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Official DDMA / SDRF Action Response:</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {report.officer_notes || report.admin_notes || 'Report successfully routed to District Emergency Operations Centre. Initial triage underway.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CitizenAIChatbot />
    </div>
  );
}
