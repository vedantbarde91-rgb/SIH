import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { WifiOff, Database, RotateCw } from 'lucide-react';

export default function OfflineBanner({ forceOffline = false, onRefresh }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState(forceOffline);
  const [cacheTime, setCacheTime] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const ts = apiClient.getCacheTimestamp();
    if (ts) {
      setCacheTime(new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveOffline = !isOnline || simulatedOffline;

  if (!effectiveOffline) {
    return (
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Telemetry Feed: Connected to Dima Hasao DEOC Geotechnical Network</span>
        </div>
        <button
          onClick={() => setSimulatedOffline(true)}
          className="text-slate-400 hover:text-sky-300 transition underline underline-offset-2"
          title="Demo toggle for SIH evaluators to demonstrate offline cached mode"
        >
          [Demo: Test Offline Cache Banner]
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-950/80 border-b border-amber-600/40 px-4 py-2 text-amber-200 text-xs shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
          <div>
            <span className="font-semibold text-amber-300">Offline Mode Active: </span>
            <span>
              Showing cached surveillance data {cacheTime ? `from ${cacheTime}` : '(local storage cache)'}.
            </span>
            <span className="text-amber-400/80 ml-1">
              (Read-only cache mode; field write operations queued safely).
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSimulatedOffline(false);
              if (onRefresh) onRefresh();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium border border-amber-500/30 transition"
          >
            <RotateCw className="w-3 h-3" />
            <span>Reconnect Live</span>
          </button>
        </div>
      </div>
    </div>
  );
}
