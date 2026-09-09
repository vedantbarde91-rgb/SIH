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
            Click below to instantly sign in with pre-seeded credentials scoped to Dima Hasao:
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(0)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-sky-600/20 hover:bg-slate-100 dark:hover:bg-sky-600/30 border border-sky-200 dark:border-sky-500/40 text-left text-xs transition shadow-sm"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white">DDMO Rajesh Barman</span>
                <div className="text-[10px] text-sky-600 dark:text-sky-400">Jurisdiction: Dima Hasao, Assam</div>
              </div>
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-300">1-Click Login →</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(1)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left text-xs transition shadow-sm"
            >
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100">PWD Engineer Anupam Sen</span>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Zone: Jatinga-Harangajao Highway</div>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Select →</span>
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
