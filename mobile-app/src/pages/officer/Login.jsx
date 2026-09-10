import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService, DEMO_OFFICERS } from '../../firebase/authService';
import {
  Shield,
  Lock,
  Mail,
  ArrowLeft,
  AlertCircle,
  Zap
} from 'lucide-react';

export default function OfficerLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await authService.login(email, password);
      navigate('/officer/map');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (officerIndex = 0) => {
    const demo = DEMO_OFFICERS[officerIndex] || DEMO_OFFICERS[0];
    setEmail(demo.email);
    setPassword(demo.password);
    setIsLoading(true);
    try {
      await authService.login(demo.email, demo.password);
      navigate('/officer/map');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-md w-full space-y-6">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-sky-500 mb-4 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal Home</span>
          </Link>

          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3 shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Emergency Operations Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authorized portal for District Disaster Management Authority (DDMA), PWD engineers, and response agencies.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Demo Login Pill for SIH Evaluators */}
        <div className="p-4 rounded-3xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-600/40 space-y-2.5">
          <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 text-xs font-bold">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Hackathon Quick-Access Demo Accounts</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Click below to instantly sign in with official district credentials or Super Admin regional authority:
          </p>
          <div className="flex flex-col gap-2 pt-1">
            {/* 1. Super Admin */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(0)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-purple-950/30 hover:bg-slate-100 dark:hover:bg-purple-900/40 border border-purple-300 dark:border-purple-600/50 text-left text-xs transition shadow-sm"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">Super Administrator</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold">ALL NER</span>
                </div>
                <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">superadmin@ner-sdma.gov.in</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">All 8 NER States & Corridors (Unrestricted View)</div>
              </div>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-300">1-Click Login →</span>
            </button>

            {/* 2. Assam (Dima Hasao) */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(1)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-sky-600/20 hover:bg-slate-100 dark:hover:bg-sky-600/30 border border-sky-200 dark:border-sky-500/40 text-left text-xs transition shadow-sm"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">Assam District Officer (Dima Hasao)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 font-bold">LOCKED</span>
                </div>
                <div className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">officer.dimahasao@assam-sdma.gov.in</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Locked strictly to Dima Hasao (NH-27 / Jatinga)</div>
              </div>
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-300">1-Click Login →</span>
            </button>

            {/* 3. Meghalaya (East Khasi Hills) */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(2)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-emerald-600/20 hover:bg-slate-100 dark:hover:bg-emerald-600/30 border border-emerald-200 dark:border-emerald-500/40 text-left text-xs transition shadow-sm"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">Meghalaya District Officer (East Khasi Hills)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold">LOCKED</span>
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">officer.eastkhasi@meghalaya-sdma.gov.in</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Locked strictly to East Khasi Hills (Sohra / Dawki)</div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-300">1-Click Login →</span>
            </button>

            {/* 4. Sikkim (Gangtok) */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(3)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-amber-600/20 hover:bg-slate-100 dark:hover:bg-amber-600/30 border border-amber-200 dark:border-amber-500/40 text-left text-xs transition shadow-sm"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">Sikkim District Officer (Gangtok)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold">LOCKED</span>
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">officer.gangtok@sikkim-sdma.gov.in</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Locked strictly to Gangtok (NH-10 / 9th Mile JN Road)</div>
              </div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-300">1-Click Login →</span>
            </button>
          </div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl transition-colors">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Official Gov / Agency Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer.dimahasao@disastermgmt.ner.gov.in"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In to Operations Hub'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
