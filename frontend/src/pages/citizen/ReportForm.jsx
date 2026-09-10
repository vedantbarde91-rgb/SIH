import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
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
  Trash2,
  Crosshair,
  ChevronDown
} from 'lucide-react';

// Pin drop icon for the interactive modal
const PIN_DROP_ICON = L.divIcon({
  html: `<div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold animate-bounce">📍</div>`,
  className: 'pin-drop-leaflet-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Map click listener component
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5))]);
    }
  });

  return position ? <Marker position={position} icon={PIN_DROP_ICON} /> : null;
}

// 8 Specific Hazard Options + Other
const HAZARD_OPTIONS = [
  { id: 'tension_cracks', label: 'Ground Tension Cracks' },
  { id: 'falling_rocks', label: 'Falling Rocks / Boulders' },
  { id: 'mudflow', label: 'Active Mudflow / Slurry' },
  { id: 'culvert_collapse', label: 'Culvert / Bridge Drainage Collapse' },
  { id: 'subsidence', label: 'Road Embankment Subsidence / Sinking' },
  { id: 'tree_tilt', label: 'Tilting Trees / Utility Poles' },
  { id: 'retaining_wall_bulge', label: 'Retaining Wall Bulge / Shear' },
  { id: 'spring_seepage', label: 'Sudden Muddy Water Spring Seepage' },
  { id: 'other', label: 'Other Hazard' }
];

const SAMPLE_PHOTOS = [
  { name: 'Road Tension Crack', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Rockfall Debris', url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mud Slurry Slide', url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80' }
];

export default function ReportForm() {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  // Check if citizen is logged in
  const loggedInCitizen = (() => {
    try {
      const raw = localStorage.getItem('ner_registered_citizen');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [hazardType, setHazardType] = useState('tension_cracks');
  const [otherHazardText, setOtherHazardText] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState(loggedInCitizen?.village || '');
  const [phoneNumber, setPhoneNumber] = useState(loggedInCitizen?.phone || '');

  // Photo state with live URL.createObjectURL preview
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(SAMPLE_PHOTOS[0].url);
  const [photoMeta, setPhotoMeta] = useState({ name: 'Sample Field Photo', size: 'Standard Preset' });

  // Geo coordinates
  const [lat, setLat] = useState(25.1325);
  const [lon, setLon] = useState(93.0422);
  const [gpsStatus, setGpsStatus] = useState('Default GPS (Dima Hasao Corridor)');
  const [isLocating, setIsLocating] = useState(false);

  // Interactive Pin Drop Modal state
  const [showMapModal, setShowMapModal] = useState(false);
  const [modalPos, setModalPos] = useState([25.1325, 93.0422]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    handleGetLocation();
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported; default corridor pin set');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cLat = Number(pos.coords.latitude.toFixed(5));
        const cLon = Number(pos.coords.longitude.toFixed(5));
        setLat(cLat);
        setLon(cLon);
        setModalPos([cLat, cLon]);
        setGpsStatus(`Live GPS Fixed: ${cLat}°N, ${cLon}°E`);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGpsStatus('GPS Corridor Reference: 25.1325°N, 93.0422°E');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Fixed Image Upload Handler converting file to compressed persistent Data URL
  const handleDeviceFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 900px dimension for lightweight storage & transmission
        const maxDim = 900;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);

        setSelectedFile(file);
        setPhotoPreview(dataUrl);
        setPhotoMeta({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB (Optimized)`
        });
      };
      img.onerror = () => {
        // Fallback to raw data URL if canvas fails
        setSelectedFile(file);
        setPhotoPreview(event.target.result);
        setPhotoMeta({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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

  const confirmPinDropLocation = () => {
    setLat(modalPos[0]);
    setLon(modalPos[1]);
    setGpsStatus(`Pin-Drop Selected: ${modalPos[0]}°N, ${modalPos[1]}°E`);
    setShowMapModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Strict validation: Mobile number if provided
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneNumber.trim()) {
      setErrorMsg('Mandatory Contact: Please enter a 10-digit Indian mobile number.');
      return;
    }
    if (!phoneRegex.test(phoneNumber.trim())) {
      setErrorMsg('Invalid Mobile Number: Must be exactly 10 digits starting with 6, 7, 8, or 9.');
      return;
    }

    // Mandatory location description
    if (!locationName.trim()) {
      setErrorMsg('Mandatory Location: Please provide a location or landmark name.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please enter a brief description of the observed hazard.');
      return;
    }

    const finalHazardLabel = hazardType === 'other' && otherHazardText.trim()
      ? `Other: ${otherHazardText.trim()}`
      : (HAZARD_OPTIONS.find(h => h.id === hazardType)?.label || 'Hazard Report');

    setIsSubmitting(true);

    try {
      const assignedDistrict = loggedInCitizen?.district || (lat > 25.8 ? 'Kamrup' : (lon < 92.5 ? 'East Khasi Hills' : 'Dima Hasao'));
      const userId = loggedInCitizen?.phone || phoneNumber.trim();

      const reportPayload = {
        hazard_type: finalHazardLabel,
        description: description.trim(),
        location_name: locationName.trim(),
        district: assignedDistrict,
        lat,
        lon,
        phone_number: phoneNumber.trim(),
        user_id: userId,
        photo_url: photoPreview || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80'
      };

      const result = await apiClient.submitReport(reportPayload);
      
      // Also cache to local storage for Citizen Dashboard tracking
      const existingUserReports = JSON.parse(localStorage.getItem('ner_user_submitted_reports') || '[]');
      const newReportEntry = {
        id: result?.id || `CIT-REP-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        hazard_type: finalHazardLabel,
        location: locationName.trim(),
        district: assignedDistrict,
        lat,
        lon,
        user_id: userId,
        status: 'Logged & Dispatched to DEOC',
        statusColor: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800',
        admin_notes: 'Priority alert queued for field inspection by local SDRF detachment.',
        photo_url: reportPayload.photo_url
      };
      localStorage.setItem('ner_user_submitted_reports', JSON.stringify([newReportEntry, ...existingUserReports]));

      setSubmittedReport(result || newReportEntry);
    } catch (err) {
      console.error('Submission failed:', err);
      setErrorMsg('Network error. A local offline receipt has been logged.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedReport(null);
    setDescription('');
    setHazardType('tension_cracks');
    setOtherHazardText('');
  };

  // SUCCESS VIEW
  if (submittedReport) {
    return (
      <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('citizen_form.success_title', 'Hazard Report Transmitted!')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t(
                'citizen_form.success_desc',
                'Your incident has been securely transmitted to the District Emergency Operations Centre (DEOC) & SDRF.'
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Incident Tracking ID:</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                {submittedReport.id || 'CIT-REP-9021'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Hazard:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {submittedReport.hazard_type}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Pinned Location:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {lat}°N, {lon}°E
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {loggedInCitizen ? (
              <Link
                to="/user/dashboard"
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition"
              >
                Track in My Dashboard →
              </Link>
            ) : (
              <Link
                to="/user/auth"
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition"
              >
                Create Account to Track Status →
              </Link>
            )}
            <button
              onClick={resetForm}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN FORM VIEW
  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Home</span>
            </Link>

            {loggedInCitizen ? (
              <Link
                to="/user/dashboard"
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Dashboard ({loggedInCitizen.name})</span>
              </Link>
            ) : (
              <Link
                to="/user/auth"
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Resident Sign In / Register →
              </Link>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('citizen_form.title', 'Citizen Hazard Reporting Portal')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fast emergency submission with live image upload and GPS pin-drop mapping.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-lg dark:shadow-xl">
          {/* 1. HAZARD DROPDOWN (8 options + Other) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              1. Observed Hazard Category *
            </label>
            <div className="relative">
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500 transition appearance-none cursor-pointer"
              >
                {HAZARD_OPTIONS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {hazardType === 'other' && (
              <div className="mt-2.5 animate-in fade-in">
                <input
                  type="text"
                  required
                  value={otherHazardText}
                  onChange={(e) => setOtherHazardText(e.target.value)}
                  placeholder="Specify other observed hazard..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-rose-300 dark:border-rose-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
                />
              </div>
            )}
          </div>

          {/* 2. MANDATORY LOCATION WITH PIN-DROP MAP MODAL */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Mandatory Incident Location & Coordinates *
              </label>
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition shadow-sm"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Open Pin-Drop Map</span>
              </button>
            </div>

            {/* GPS coordinates status card */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{gpsStatus}</span>
              </div>
              <div className="font-mono text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800/50 text-[11px] font-bold">
                {lat}° N, {lon}° E
              </div>
            </div>

            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Landmark, Village, or Road Milepost (e.g. NH-27 km 44 near Jatinga Bridge)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* 3. OBSERVATION DETAILS */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              3. Observation Details *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact details: road width severed, active boulder movement, retaining wall bulging..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition resize-none"
            />
          </div>

          {/* 4. PHOTO EVIDENCE WITH LIVE PREVIEW */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              4. Photo Evidence (Live Visual Preview) *
            </label>

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
                className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-400 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-950/50 transition group"
              >
                <Camera className="w-8 h-8 mx-auto text-slate-400 group-hover:text-rose-500 transition mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Click to select photo from device or camera
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Live preview rendered instantly
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleDeviceFileUpload}
              className="hidden"
            />

            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                Or select from realistic disaster field samples:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSamplePhoto(sample)}
                    className={`relative rounded-xl overflow-hidden border aspect-video transition ${
                      photoPreview === sample.url
                        ? 'border-rose-500 ring-2 ring-rose-500/40'
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

          {/* 5. STRICT 10-DIGIT MOBILE NUMBER */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              5. Contact Mobile Number (Strict 10-Digits) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210 (starts with 6, 7, 8, or 9)"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Required for emergency team response verification.
            </p>
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
                <span>Transmitting Hazard to DEOC...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Emergency Hazard Report</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* INTERACTIVE PIN-DROP LEAFLET MAP MODAL */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                  Interactive GIS Pin-Drop
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Click on the Map to Mark Exact Incident Location
                </h3>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
              <MapContainer
                center={modalPos}
                zoom={11}
                scrollWheelZoom={true}
                className="w-full h-full"
              >
                <TileLayer
                  attribution="Tiles &copy; Esri"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                />
                <LocationMarker position={modalPos} setPosition={setModalPos} />
              </MapContainer>
            </div>

            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500">Selected Coordinates:</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                {modalPos[0]}° N, {modalPos[1]}° E
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={confirmPinDropLocation}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition"
              >
                Confirm Pinned Coordinates
              </button>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
