import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../firebase/authService';
import { useDistrict } from '../context/DistrictContext';
import {
  MapPin,
  ListFilter,
  BarChart3,
  FileCheck2,
  History,
  LogOut,
  Building2,
  ArrowUpRight
} from 'lucide-react';

export default function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentOfficer, logoutOfficer } = useDistrict();

  const officer = currentOfficer || {
    name: 'Demo Officer',
    role: 'Emergency Response Officer',
    jurisdiction: 'Dima Hasao',
    state: 'Assam',
    zone: 'NH-27 Lumding-Badarpur Corridor'
  };

  const navItems = [
    { to: '/officer/map', label: t('nav.map_view', 'Hazard Map'), icon: MapPin },
    { to: '/officer/list', label: t('nav.list_view', 'Villages & Slopes'), icon: ListFilter },
    { to: '/officer/analytics', label: t('nav.analytics', 'Rainfall & Soil Telemetry'), icon: BarChart3 },
    { to: '/officer/reports', label: t('nav.reports_review', 'Citizen Field Reports'), icon: FileCheck2 },
    { to: '/officer/history', label: t('nav.history', 'Disaster History'), icon: History },
  ];

  const handleLogout = () => {
    logoutOfficer();
    navigate('/officer/login');
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none transition-colors">
      {/* Top Section */}
      <div className="p-4 space-y-4">
        {/* Jurisdiction Identity Card */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              NER SDMA / DDMA
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{officer.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{officer.role}</div>
          
          <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex flex-col gap-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Jurisdiction:</span>
              <span className="font-semibold text-sky-600 dark:text-sky-300">{officer.jurisdiction}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Corridor:</span>
              <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={officer.zone}>
                {officer.zone || 'NH-27'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 transition group"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>FastAPI Swagger Docs</span>
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500" />
        </a>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('nav.logout', 'Sign Out')}</span>
        </button>
      </div>
    </aside>
  );
}
