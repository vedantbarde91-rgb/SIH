import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { authService } from '../firebase/authService';
import { useTheme } from '../context/ThemeContext';
import { Mountain, PhoneCall, Shield, User, LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentOfficer = authService.getCurrentOfficer();
  const { theme, toggleTheme, isDark } = useTheme();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
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
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {t('app.district', 'Dima Hasao & NER Hill Corridors')}
            </p>
          </div>
        </Link>

        {/* Emergency Helpline */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-medium">
          <PhoneCall className="w-3.5 h-3.5 animate-pulse text-rose-500" />
          <span>{t('app.emergency_hotline', 'State Emergency: 1070 / 1077')}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
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

          {currentOfficer ? (
            <div className="flex items-center gap-2">
              <Link
                to="/officer/map"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium shadow-sm transition"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Operations Hub</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out officer"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-900/40 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/report"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition"
              >
                <span>Report Issue</span>
              </Link>
              <Link
                to="/officer/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition"
              >
                <User className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                <span className="hidden sm:inline">Officer Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
