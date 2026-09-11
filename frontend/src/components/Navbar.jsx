import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { authService } from '../firebase/authService';
import { useTheme } from '../context/ThemeContext';
import { useDistrict } from '../context/DistrictContext';
import { Mountain, PhoneCall, Shield, LogOut, Sun, Moon, Lock } from 'lucide-react';

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleTheme, isDark } = useTheme();

  const {
    selectedState,
    selectedDistrict,
    handleStateChange,
    handleDistrictChange,
    availableDistricts,
    isSuperAdmin,
    officerAssignedDistrict,
    currentOfficer
  } = useDistrict();

  const isOfficerRoute = location.pathname.startsWith('/officer') && location.pathname !== '/officer/login';

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base tracking-tight">
                NER-LEWS
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-semibold border border-sky-500/20 dark:border-sky-500/30">
                SIH MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block">
              {t('app.district', 'Dima Hasao & NER Hill Corridors')}
            </p>
          </div>
        </Link>

        {/* CENTER/RIGHT AREA: SCOPED AUTHORITY BADGE & STATE/DISTRICT SELECTORS ACROSS ALL ADMIN PAGES */}
        {isOfficerRoute ? (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            {/* Scoped Authority Indicator Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
              <span className="text-slate-500 dark:text-slate-400 hidden xl:inline font-medium">Scoped Authority:</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-extrabold flex items-center gap-1 ${
                  isSuperAdmin
                    ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/50'
                    : 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/50'
                }`}
              >
                {isSuperAdmin ? '👑 Super Admin (All States)' : `🛡️ District Admin (${officerAssignedDistrict || 'Dima Hasao'})`}
              </span>
            </div>

            {/* Adjacent State & District Selector Dropdowns */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              {/* State Selector */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">State:</span>
                {isSuperAdmin ? (
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold text-sky-600 dark:text-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer transition"
                    title="Select State Filter"
                  >
                    <option value="ALL">All States (NER)</option>
                    <option value="Assam">Assam</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Sikkim">Sikkim</option>
                  </select>
                ) : (
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                    title="Locked to assigned jurisdiction state"
                  >
                    <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span>{selectedState}</span>
                  </div>
                )}
              </div>

              {/* District Selector */}
              <div className="flex items-center gap-1 pl-2 border-l border-slate-300 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">District:</span>
                {isSuperAdmin ? (
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold text-sky-600 dark:text-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer transition"
                    title="Select District Filter"
                  >
                    <option value="ALL">All Districts</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                    title="Locked to assigned district jurisdiction"
                  >
                    <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span>{selectedDistrict}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Emergency Helpline for Citizen Portal */
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-medium">
            <PhoneCall className="w-3.5 h-3.5 animate-pulse text-rose-500" />
            <span>{t('app.emergency_hotline', 'State Emergency: 1070 / 1077')}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Language Selector */}
          <LanguageSwitcher />

          {currentOfficer && isOfficerRoute && (
            <button
              onClick={handleLogout}
              title="Sign out officer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold shadow-sm transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}

          {currentOfficer && !isOfficerRoute && (
            <Link
              to="/officer/map"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium shadow-sm transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Operations Hub</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
