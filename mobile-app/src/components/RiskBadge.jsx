import React from 'react';
import { AlertTriangle, ShieldCheck, AlertCircle, Flame } from 'lucide-react';

export function getRiskLevel(scoreOrBand) {
  if (typeof scoreOrBand === 'number') {
    if (scoreOrBand <= 25) return { band: 'Low', color: 'emerald', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    if (scoreOrBand <= 50) return { band: 'Moderate', color: 'amber', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    if (scoreOrBand <= 75) return { band: 'High', color: 'orange', bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' };
    return { band: 'Critical', color: 'red', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40', pulse: true };
  }
  const band = (scoreOrBand || '').toLowerCase();
  if (band === 'critical' || band === 'severe') {
    return { band: 'Critical', color: 'red', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40', pulse: true };
  }
  if (band === 'high') {
    return { band: 'High', color: 'orange', bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' };
  }
  if (band === 'moderate') {
    return { band: 'Moderate', color: 'amber', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
  }
  return { band: 'Low', color: 'emerald', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
}

export default function RiskBadge({ score, band, showIcon = true, size = 'md' }) {
  const info = getRiskLevel(score !== undefined ? score : band);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${info.bg} ${info.text} ${info.border} ${sizeClasses}`}
    >
      {showIcon && (
        <>
          {info.band === 'Critical' && <Flame className="w-3.5 h-3.5 animate-pulse text-rose-500" />}
          {info.band === 'High' && <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />}
          {info.band === 'Moderate' && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
          {info.band === 'Low' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
        </>
      )}
      <span>{band || info.band}</span>
      {score !== undefined && (
        <span className="font-mono opacity-80 pl-0.5">({score}/100)</span>
      )}
    </span>
  );
}
