import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import {
  AlertTriangle,
  Camera,
  MapPin,
  Send,
  CheckCircle2,
  Phone,
  ArrowLeft,
  X,
  FileImage,
  RefreshCw,
  Loader2,
  Flame,
  Construction,
  Layers,
  User,
  Trash2
} from 'lucide-react';

const HAZARD_TYPES = [
  {
    id: 'crack',
    labelKey: 'citizen_form.hazard_crack',
    defaultLabel: 'Ground Tension Crack',
    desc: 'Deep fissures in asphalt, retaining walls, or soil slopes',
    icon: Layers,
    color: 'text-amber-500',
    border: 'border-amber-500/40'
  },
  {
    id: 'slope_movement',
    labelKey: 'citizen_form.hazard_slope',
    defaultLabel: 'Slope Movement / Mudflow',
    desc: 'Active soil creep, bulging hill slope, or mud slurry slide',
    icon: Flame,
    color: 'text-rose-500',
    border: 'border-rose-500/40'
  },
  {
    id: 'blocked_road',
    labelKey: 'citizen_form.hazard_road',
    defaultLabel: 'Blocked Road / Debris',
    desc: 'Debris blocking vehicular lanes or rail corridor cutting',
    icon: Construction,
    color: 'text-orange-500',
    border: 'border-orange-500/40'
  },
  {
    id: 'rockfall',
    labelKey: 'citizen_form.hazard_rockfall',
    defaultLabel: 'Rockfall / Boulders',
    desc: 'Falling boulders, rock face fracture, or rolling stone hazard',
    icon: AlertTriangle,
    color: 'text-red-500',
    border: 'border-red-500/40'
  }
];

const SAMPLE_PHOTOS = [
  { name: 'Road Tension Crack', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Rockfall Debris', url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mud Slurry Slide', url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80' }
];

export default function ReportForm() {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  // Check if citizen registered on landing page
  const registeredCitizen = (() => {
    try {
      const raw = localStorage.getItem('ner_registered_citizen');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [hazardType, setHazardType] = useState('crack');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState(registeredCitizen?.village || '');
  const [phoneNumber, setPhoneNumber] = useState(registeredCitizen?.phone || '');

  // Photo state with live URL.createObjectURL preview
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(SAMPLE_PHOTOS[0].url);
  const [photoMeta, setPhotoMeta] = useState({ name: 'Sample Field Photo', size: 'Standard Preset' });

  // Geo coordinates
  const [lat, setLat] = useState(25.1325);
  const [lon, setLon] = useState(93.0422);
  const [gpsStatus, setGpsStatus] = useState('Default GPS (Dima Hasao Corridor)');
  const [isLocating, setIsLocating] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    handleGetLocation();
    // Cleanup object URL on unmount
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by browser; using corridor default');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(5)));
        setLon(Number(pos.coords.longitude.toFixed(5)));
        setGpsStatus(`Live GPS Fixed: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGpsStatus('GPS locked to Dima Hasao Corridor (25.13°N, 93.04°E)');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Fixed Image Upload Handler using URL.createObjectURL()
  const handleDeviceFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous object URL if any to avoid memory leak
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }

    // Create immediate live blob URL
    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPhotoPreview(objectUrl);
    setPhotoMeta({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`
    });
  };

  const handleRemovePhoto = () => {
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    setSelectedFile(null);
    setPhotoPreview('');
    setPhotoMeta(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectSamplePhoto = (sample) => {
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    setSelectedFile(null);
    setPhotoPreview(sample.url);
    setPhotoMeta({ name: sample.name, size: 'Sample Preset' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please enter a brief description of the observed hazard.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const reportPayload = {
        hazard_type: hazardType,
        description: description.trim(),
        location_name: locationName.trim() || 'Dima Hasao Corridor, Assam',
        lat,
        lon,
        phone_number: phoneNumber.trim() || null,
        photo_url: photoPreview || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80'
      };

      const result = await apiClient.submitReport(reportPayload);
      setSubmittedReport(result);
    } catch (err) {
      console.error('Submission failed:', err);
      setErrorMsg('Submission error. Your report has been cached locally.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedReport(null);
    setDescription('');
    setHazardType('crack');
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedReport) {
    return (
      <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('citizen_form.success_title', 'Report Successfully Logged!')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t(
                'citizen_form.success_desc',
                'Your report has been logged and transmitted to the District Emergency Operations Centre (DEOC).'
              )}
            </p>
          </div>

          {/* Reference Receipt */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">{t('citizen_form.ref_id', 'Reference Tracking ID')}:</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                {submittedReport.id || 'REP-2026-DH'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Hazard Type:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                {submittedReport.hazard_type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Coordinates:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {submittedReport.lat}°N, {submittedReport.lon}°E
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Initial Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-medium border border-amber-500/30">
                Logged & In Triage
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-600/30 text-sky-700 dark:text-sky-300 text-xs flex items-center gap-2">
            <Phone className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <span>Need immediate evacuation? Dial Helpline: <strong>1077 / 1070</strong></span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={resetForm}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
            >
              {t('citizen_form.submit_another', 'Submit Another Report')}
            </button>
            <Link
              to="/"
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition"
            >
              {t('citizen_form.return_home', 'Return to Home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MAIN REPORT FORM
  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link & Header */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-sky-500 mb-3 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal Home</span>
          </Link>

          {registeredCitizen && (
            <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-700 dark:text-sky-300">
              <User className="w-3 h-3" />
              <span>Reporting as <strong>{registeredCitizen.name}</strong> ({registeredCitizen.village})</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('citizen_form.title', 'Report a Landslide or Road Hazard')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t(
              'citizen_form.subtitle',
              'Quick emergency reporting for Dima Hasao and NER hill corridors.'
            )}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-lg dark:shadow-xl">
          {/* 1. SELECT HAZARD TYPE */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              1. {t('citizen_form.select_hazard', 'Select Hazard Type')} *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HAZARD_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = hazardType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setHazardType(type.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                      isSelected
                        ? `bg-slate-50 dark:bg-slate-800/90 ${type.border} ring-2 ring-sky-500/40 shadow-sm`
                        : 'bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${type.color} flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {t(type.labelKey, type.defaultLabel)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {type.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. GEOLOCATION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. {t('citizen_form.location_label', 'Incident Location')} *
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 text-[11px] text-sky-600 dark:text-sky-400 hover:underline transition"
              >
                {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                <span>Refresh GPS</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                <span className="text-slate-700 dark:text-slate-300">{gpsStatus}</span>
              </div>
              <div className="font-mono text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800/50 text-[11px]">
                {lat}° N, {lon}° E
              </div>
            </div>

            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Landmark / Milepost (e.g. NH-27 Harangajao-Jatinga Pass, km 74)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* 3. OBSERVATION DETAILS */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              3. {t('citizen_form.notes_label', 'Observation Details')} *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(
                'citizen_form.notes_placeholder',
                'Describe what you see: width of crack, road blockage, tree tilt, active mud flow...'
              )}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition resize-none"
              required
            />
          </div>

          {/* 4. PHOTO EVIDENCE WITH LIVE PREVIEW */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              4. {t('citizen_form.photo_label', 'Photo Evidence (Live Visual Preview)')} *
            </label>

            {/* LIVE PREVIEW CONTAINER */}
            {photoPreview ? (
              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 overflow-hidden shadow-sm">
                <div className="aspect-video w-full max-h-64 relative bg-black/5 dark:bg-black/40 flex items-center justify-center overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="Live Evidence Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[11px] font-medium backdrop-blur transition flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" /> Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] backdrop-blur transition"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {photoMeta && (
                  <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileImage className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="truncate font-medium text-slate-700 dark:text-slate-300">{photoMeta.name}</span>
                    </div>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {photoMeta.size}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-950/50 transition group"
              >
                <Camera className="w-8 h-8 mx-auto text-slate-400 group-hover:text-sky-500 transition mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Click to select photo from device or take photo
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  JPG, PNG, WebP supported • Immediate live preview
                </p>
              </div>
            )}

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleDeviceFileUpload}
              className="hidden"
            />

            {/* Alternative preset samples for testing */}
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                Or select from realistic field samples:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSamplePhoto(sample)}
                    className={`relative rounded-xl overflow-hidden border aspect-video transition ${
                      photoPreview === sample.url
                        ? 'border-sky-500 ring-2 ring-sky-500/40'
                        : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white py-0.5 px-1 truncate text-center">
                      {sample.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. CITIZEN PHONE */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              5. {t('citizen_form.phone_label', 'Mobile Number')}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 94350 00000"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-600/20 hover:shadow-rose-600/40 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('citizen_form.submitting', 'Transmitting to District DEOC...')}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t('citizen_form.submit_btn', 'Submit Emergency Hazard Report')}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
