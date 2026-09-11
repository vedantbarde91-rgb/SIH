import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CitizenAIChatbot from '../components/CitizenAIChatbot';
import {
  Shield,
  Send,
  ArrowRight,
  CheckCircle2,
  User
} from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 flex-1 flex flex-col justify-center">
        {/* Clean, Classic Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {t('landing.welcome_title', 'Welcome to the NER Landslide Monitoring Platform')}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {t('landing.welcome_subtitle', 'AI-Powered Early Warning, Geotechnical Telemetry & Dissemination for North East India')}
          </p>
        </div>

        {/* Exactly Two Main Portal Entry Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto w-full">
          {/* CARD 1: User / Citizen Portal */}
          <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-500/50 shadow-lg dark:shadow-2xl transition flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 transition shadow-sm">
                  <User className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                  {t('nav.citizen_portal', 'Citizen Portal')}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('landing.user_portal_title', 'User & Citizen Portal')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {t('landing.user_portal_desc', 'Report active landslides, rockfalls, and road fissures. Sign in to track mitigation status and SDRF response notes, or submit an instant report as a guest.')}
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Personal dashboard with real-time SDRF action tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Live photo preview & interactive pin-drop map coordinates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Strict verification for rapid community dispatch</span>
                </div>
              </div>
            </div>

            {/* Actions: Register / Sign In + Guest Submission */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
              <Link
                to="/user/auth"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/25 transition group-hover:shadow-rose-600/40"
              >
                <span>{t('landing.register_signin_btn', 'Register / Sign In')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/report"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition"
              >
                <span>{t('landing.guest_report_btn', 'Submit as Guest (Instant Fast Report)')}</span>
              </Link>
            </div>
          </div>

          {/* CARD 2: Officer Operations Dashboard */}
          <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-500/50 shadow-lg dark:shadow-2xl transition flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 transition shadow-sm">
                  <Shield className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30">
                  {t('landing.officer_door_title', 'Authorized Command')}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('landing.officer_dashboard_title', 'Officer Dashboard')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {t('landing.officer_dashboard_desc', 'Dedicated operations console for District Disaster Management Authorities (DDMA), PWD engineers, and State Disaster Response Force (SDRF).')}
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <span>Multi-state GIS surveillance & real-time heatmaps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <span>Weather telemetry, 6 geotechnical causes & impact analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <span>Critical alert broadcasts & SDRF deployment protocols</span>
                </div>
              </div>
            </div>

            {/* Action: Officer Login */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
              <Link
                to="/officer/login"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/25 transition group-hover:shadow-sky-600/40"
              >
                <span>{t('landing.officer_login_btn', 'Authorized Officer Login')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Smart India Hackathon Prototype • AI Landslide Early Warning & Dissemination Platform
          </p>
          <div className="flex items-center gap-4">
            <span>Dima Hasao, Kamrup, East Khasi Hills, Ri-Bhoi</span>
            <span>•</span>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-sky-500 underline">
              FastAPI Docs
            </a>
          </div>
        </div>
      </footer>
      <CitizenAIChatbot />
    </div>
  );
}
