import React, { useState, useEffect } from 'react';
import {
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldAlert,
  Smartphone,
  Server,
  X,
  Clock,
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { getRegisteredCitizens, getCitizensByDistrict } from '../utils/citizenDatabase';
import { EMERGENCY_SMS_CONFIG } from '../config/emergencyContacts';

export default function SmsBroadcastModal({ isOpen, onClose, village }) {
  if (!isOpen || !village) return null;

  const [broadcastScope, setBroadcastScope] = useState('district'); // 'village' | 'district' | 'all'
  const [gatewayProvider, setGatewayProvider] = useState('fast2sms'); // 'fast2sms' | 'twilio' | 'cdac'
  const [apiKey, setApiKey] = useState('DEMO_FAST2SMS_DLT_KEY_9884X');
  const [customMsg, setCustomMsg] = useState('');

  // Transmission simulation state
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendStage, setSendStage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState([]);

  const district = village.district || 'Dima Hasao';
  const villageName = village.name || 'Harangajao Pass';
  const riskScore = village.risk_percentage || village.risk_score || 85;
  const rain72h = village.rainfall_72h_mm || 187;

  // Retrieve recipients based on scope and inject designated team contact numbers
  const allCitizens = getRegisteredCitizens();
  const districtCitizens = getCitizensByDistrict(district);
  const villageCitizens = districtCitizens.filter(
    (c) => (c.assigned_village || '').toLowerCase().includes(villageName.toLowerCase()) ||
           villageName.toLowerCase().includes((c.assigned_village || '').toLowerCase())
  );

  // Designated team test numbers from config/emergencyContacts.js
  const teamMemberDistrict = {
    name: 'Team Officer (Primary DDMA)',
    mobile_number: EMERGENCY_SMS_CONFIG.districtOfficerNumber, // 7499246109
    assigned_village: `${district} Operations Desk`
  };
  const teamMemberNER = {
    name: 'Team Officer (Regional SEOC)',
    mobile_number: EMERGENCY_SMS_CONFIG.nerRegionalOfficerNumber, // 9356374732
    assigned_village: 'NER Inter-State Coordination'
  };

  const targetList = broadcastScope === 'village'
    ? [teamMemberDistrict, ...(villageCitizens.length > 0 ? villageCitizens : districtCitizens.slice(0, 3))]
    : (broadcastScope === 'district'
        ? [teamMemberDistrict, ...districtCitizens]
        : [teamMemberDistrict, teamMemberNER, ...allCitizens]);

  // Default CAP template message with 112 helpline
  const defaultTemplate = `[DISASTER ALERT - SDMA NER] ⚠️ CRITICAL LANDSLIDE ADVISORY: Imminent slope failure detected at ${villageName} (${district}). 72h Rain: ${rain72h}mm. Risk: ${riskScore}%. Immediate evacuation recommended to nearest SDMA shelter. Dial 112 for 24x7 Emergency Assistance.`;

  useEffect(() => {
    setCustomMsg(defaultTemplate);
    setSentSuccess(false);
    setSendProgress(0);
    setDispatchLogs([]);
  }, [village, broadcastScope]);

  const handleStartBroadcast = () => {
    setIsSending(true);
    setSendProgress(10);
    setSendStage('Initializing CAP 1.2 XML Protocol payload...');

    setTimeout(() => {
      setSendProgress(35);
      setSendStage(`Connecting to ${gatewayProvider.toUpperCase()} Telecom Gateway...`);
    }, 700);

    setTimeout(() => {
      setSendProgress(65);
      setSendStage(`Disseminating to ${targetList.length} registered mobile towers in ${district}...`);
    }, 1500);

    setTimeout(() => {
      setSendProgress(90);
      setSendStage('Verifying cellular tower delivery receipts...');
    }, 2300);

    setTimeout(() => {
      setSendProgress(100);
      setSendStage('100% Broadcast Successfully Delivered');
      setIsSending(false);
      setSentSuccess(true);

      const logs = targetList.map((c, i) => {
        const isTeamNumber = c.mobile_number === EMERGENCY_SMS_CONFIG.districtOfficerNumber || 
                             c.mobile_number === EMERGENCY_SMS_CONFIG.nerRegionalOfficerNumber;
        return {
          id: `LOG-${Date.now()}-${i}`,
          recipient: c.name,
          maskedMobile: isTeamNumber ? `+91 ${c.mobile_number} (Team Direct)` : (c.mobile_number ? `+91 ${c.mobile_number.slice(0, 5)}***${c.mobile_number.slice(-2)}` : '+91 98*** ***10'),
          village: c.assigned_village || villageName,
          status: 'DELIVERED',
          gatewayRef: `DLT-${Math.floor(100000 + Math.random() * 900000)}`,
          timestamp: new Date().toLocaleTimeString()
        };
      });
      setDispatchLogs(logs);
    }, 3100);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 my-8 transition-colors">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm animate-pulse">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
                  Emergency CAP Protocol
                </span>
                <span className="text-[10px] font-mono text-rose-100">NDMA / SDMA Multi-Tower Relay</span>
              </div>
              <h3 className="text-lg font-bold tracking-tight mt-0.5">
                Automated SMS Warning Broadcast
              </h3>
              <p className="text-xs text-rose-100">
                Target Node: <strong>{villageName}</strong> • {district} ({riskScore}% Risk)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Target Audience Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>1. Select Broadcast Jurisdiction & Target Radius</span>
              <span className="text-sky-600 dark:text-sky-400 font-bold font-mono">
                {targetList.length} Registered Citizens
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setBroadcastScope('village')}
                className={`p-3 rounded-2xl border text-left text-xs transition ${
                  broadcastScope === 'village'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold truncate">Immediate Node</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{villageName} & Ridge</div>
              </button>

              <button
                type="button"
                onClick={() => setBroadcastScope('district')}
                className={`p-3 rounded-2xl border text-left text-xs transition ${
                  broadcastScope === 'district'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold truncate">Entire District</div>
                <div className="text-[11px] text-slate-400 mt-0.5">All {district} Contacts</div>
              </button>

              <button
                type="button"
                onClick={() => setBroadcastScope('all')}
                className={`p-3 rounded-2xl border text-left text-xs transition ${
                  broadcastScope === 'all'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold truncate">All NER Pilot Contacts</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Assam, Meghalaya, Sikkim</div>
              </button>
            </div>

            {/* Prototype Relay Phone Numbers Badge */}
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span>Configured Team Relay Numbers:</span>
              </span>
              <span className="font-mono text-[10px] font-bold">
                {broadcastScope === 'all' 
                  ? `${EMERGENCY_SMS_CONFIG.districtOfficerNumber} & ${EMERGENCY_SMS_CONFIG.nerRegionalOfficerNumber}` 
                  : `${EMERGENCY_SMS_CONFIG.districtOfficerNumber} (Primary Officer)`}
              </span>
            </div>
          </div>

          {/* SMS Content Live Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>2. Common Alerting Protocol (CAP) SMS Payload</span>
              <span className="text-[11px] text-slate-400 font-mono">{customMsg.length} / 160 GSM chars</span>
            </label>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 relative">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Cellular Terminal Preview:</span>
              </div>
              <textarea
                rows={4}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500 font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* SMS Gateway Integration Hook */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Server className="w-4 h-4 text-sky-500" />
                <span>3. Telecom Gateway Integration Hook</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                API Mock Live
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'fast2sms', name: 'Fast2SMS (Govt DLT)' },
                { id: 'twilio', name: 'Twilio Cloud SMS' },
                { id: 'cdac', name: 'C-DAC CAP Gateway' }
              ].map((gw) => (
                <button
                  key={gw.id}
                  type="button"
                  onClick={() => setGatewayProvider(gw.id)}
                  className={`p-2 rounded-xl text-center border text-[11px] font-semibold transition ${
                    gatewayProvider === gw.id
                      ? 'bg-sky-50 dark:bg-sky-950 border-sky-500 text-sky-600 dark:text-sky-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {gw.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs pt-1">
              <div className="relative flex-1">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Gateway API Key or DLT Sender ID"
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              </div>
              <span className="text-[10px] text-slate-400">Header: SDMA-NER</span>
            </div>
          </div>

          {/* Animated Transmission Progress */}
          {isSending && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 animate-spin text-rose-600" />
                  <span>{sendStage}</span>
                </div>
                <span className="font-mono text-sm">{sendProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-300 rounded-full"
                  style={{ width: `${sendProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Broadcast Success and Delivery Logs */}
          {sentSuccess && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>
                  Emergency Broadcast Dispatch Complete! {dispatchLogs.length} Cellular Receipts Confirmed.
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Real-Time Cellular Delivery Audit Log:
                </span>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {dispatchLogs.map((log) => (
                    <div key={log.id} className="p-2.5 flex items-center justify-between bg-slate-50 dark:bg-slate-950 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{log.recipient}</span>
                        <span className="text-slate-400 font-mono ml-2">{log.maskedMobile}</span>
                        <div className="text-[10px] text-slate-500">{log.village}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                          {log.status}
                        </span>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{log.timestamp} • {log.gatewayRef}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
          >
            {sentSuccess ? 'Close Console' : 'Cancel'}
          </button>

          {!sentSuccess && (
            <button
              type="button"
              disabled={isSending || targetList.length === 0}
              onClick={handleStartBroadcast}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSending ? 'Transmitting Over Tower Grid...' : `Dispatch SMS to ${targetList.length} Contacts`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
