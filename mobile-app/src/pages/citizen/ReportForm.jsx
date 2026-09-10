import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { apiClient } from '../../api/client';
import { getNativeLocation, capturePhoto, hapticFeedback, isNative } from '../../utils/nativePlugins';
import {
  AlertTriangle,
  Camera,
  MapPin,
  Send,
  CheckCircle2,
  Phone,
  ArrowLeft,
  X,
  RefreshCw,
  Loader2,
  Crosshair,
  Smartphone,
} from 'lucide-react';

// Pin drop icon
const PIN_DROP_ICON = L.divIcon({
  html: `<div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold animate-bounce">📍</div>`,
  className: 'pin-drop-leaflet-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5))]);
    }
  });
  return position ? <Marker position={position} icon={PIN_DROP_ICON} /> : null;
}

const HAZARD_OPTIONS = [
  { id: 'tension_cracks', label: 'Ground Tension Cracks' },
  { id: 'falling_rocks', label: 'Falling Rocks / Boulders' },
  { id: 'mudflow', label: 'Active Mudflow / Slurry' },
  { id: 'culvert_collapse', label: 'Culvert / Bridge Collapse' },
  { id: 'subsidence', label: 'Road Embankment Sinking' },
  { id: 'tree_tilt', label: 'Tilting Trees / Poles' },
  { id: 'retaining_wall_bulge', label: 'Retaining Wall Bulge' },
  { id: 'spring_seepage', label: 'Muddy Spring Seepage' },
  { id: 'other', label: 'Other Hazard' }
];

export default function MobileReportForm() {
  const { t } = useTranslation();

  const loggedInCitizen = (() => {
    try {
      const raw = localStorage.getItem('ner_registered_citizen');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const [hazardType, setHazardType] = useState('tension_cracks');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState(loggedInCitizen?.village || '');
  const [phoneNumber, setPhoneNumber] = useState(loggedInCitizen?.phone || '');

  // Photo state
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoMeta, setPhotoMeta] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // GPS state
  const [lat, setLat] = useState(25.1325);
  const [lon, setLon] = useState(93.0422);
  const [gpsStatus, setGpsStatus] = useState('Default GPS (Dima Hasao Corridor)');
  const [isLocating, setIsLocating] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [modalPos, setModalPos] = useState([25.1325, 93.0422]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    handleGetLocation();
  }, []);

  // ── Native GPS ──────────────────────────────────────────────────────────────
  const handleGetLocation = async () => {
    setIsLocating(true);
    setGpsStatus('Acquiring GPS...');
    try {
      const coords = await getNativeLocation();
      const cLat = Number(coords.latitude.toFixed(5));
      const cLon = Number(coords.longitude.toFixed(5));
      setLat(cLat);
      setLon(cLon);
      setModalPos([cLat, cLon]);
      setGpsStatus(`📍 Live GPS: ${cLat}°N, ${cLon}°E (±${Math.round(coords.accuracy)}m)`);
      await hapticFeedback('light');
    } catch (err) {
      setGpsStatus('GPS failed — default corridor pin set');
      console.warn('GPS error:', err.message);
    } finally {
      setIsLocating(false);
    }
  };

  // ── Native Camera ───────────────────────────────────────────────────────────
  const handleOpenCamera = async () => {
    setIsCameraLoading(true);
    setCameraError('');
    try {
      const photo = await capturePhoto();
      if (!photo) {
        // User cancelled
        setIsCameraLoading(false);
        return;
      }

      // Resize using canvas for lightweight storage
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        setPhotoPreview(dataUrl);
        setPhotoMeta({ name: `Photo_${Date.now()}.jpg`, size: `${Math.round(dataUrl.length * 0.75 / 1024)} KB` });
        setIsCameraLoading(false);
      };
      img.onerror = () => {
        setPhotoPreview(photo.dataUrl);
        setPhotoMeta({ name: `Photo_${Date.now()}.jpg`, size: 'Captured' });
        setIsCameraLoading(false);
      };
      img.src = photo.dataUrl;

      await hapticFeedback('light');
    } catch (err) {
      setCameraError(err.message);
      setIsCameraLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoMeta(null);
    setCameraError('');
  };

  const confirmPinDropLocation = () => {
    setLat(modalPos[0]);
    setLon(modalPos[1]);
    setGpsStatus(`📍 Pin: ${modalPos[0]}°N, ${modalPos[1]}°E`);
    setShowMapModal(false);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneNumber.trim()) {
      setErrorMsg('Mobile number is required for follow-up notifications.');
      return;
    }
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      setErrorMsg('Enter a valid 10-digit Indian mobile number (starting with 6–9).');
      return;
    }

    setIsSubmitting(true);
    await hapticFeedback('medium');

    try {
      const reportPayload = {
        hazard_type: hazardType,
        description: description.trim() || `Observed ${hazardType.replace(/_/g, ' ')} near ${locationName || 'Dima Hasao corridor'}.`,
        latitude: lat,
        longitude: lon,
        location_name: locationName.trim() || 'Dima Hasao Pilot Corridor, Assam',
        phone_number: phoneNumber.trim(),
        photo_url: photoPreview || null,
        district: 'Dima Hasao',
        user_id: loggedInCitizen?.id || null,
        source: isNative() ? 'mobile-app' : 'mobile-web',
      };

      const result = await apiClient.submitReport(reportPayload);
      setSubmittedReport(result);
      await hapticFeedback('heavy');
    } catch (err) {
      setErrorMsg(`Submission failed: ${err.message}`);
      await hapticFeedback('heavy');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────────────────────────
  if (submittedReport) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted!</h2>
          <p className="text-slate-400 mb-6">Your hazard report has been received by DEOC.</p>

          <div className="bg-slate-800 rounded-2xl p-4 text-left mb-6 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Reference ID</p>
            <p className="font-mono text-emerald-400 font-bold text-lg">{submittedReport.id || 'REP-2026-LEWS'}</p>
            <div className="mt-3 pt-3 border-t border-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-400" />
              <div>
                <p className="text-xs text-slate-400">DEOC Emergency</p>
                <p className="text-white font-bold">1800-180-1234</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSubmittedReport(null)}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold transition-colors"
          >
            Submit Another Report
          </button>
          <Link to="/" className="block mt-3 text-slate-400 text-sm text-center py-2">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ── MAIN FORM ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-8">

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <Link to="/" className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div>
          <h1 className="font-bold text-white text-base">Report a Hazard</h1>
          <p className="text-xs text-slate-400">NER-LEWS • Citizen Field Report</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-sky-400">
          {isNative() ? <><Smartphone className="w-3 h-3" /> Native App</> : '🌐 Web'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-5 space-y-5">

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-rose-900/30 border border-rose-700 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <p className="text-rose-300 text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Hazard Type — Large Touch Targets */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Hazard Type *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {HAZARD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setHazardType(opt.id)}
                className={`p-3 rounded-xl text-left text-sm font-medium border transition-all ${
                  hazardType === opt.id
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* GPS Location */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            GPS Location
          </label>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <p className="text-sm text-slate-300 flex-1">{gpsStatus}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                {isLocating ? 'Locating...' : 'Get My GPS'}
              </button>
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-semibold transition-colors"
              >
                📍 Pin
              </button>
            </div>
          </div>
        </div>

        {/* Camera / Photo */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Photo Evidence
          </label>
          {photoPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-700">
              <img src={photoPreview} alt="Captured hazard" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              {photoMeta && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-1.5">
                  <p className="text-xs text-white">{photoMeta.name} • {photoMeta.size}</p>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenCamera}
              disabled={isCameraLoading}
              className="w-full h-36 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              {isCameraLoading
                ? <><Loader2 className="w-8 h-8 text-sky-400 animate-spin" /><p className="text-sm text-slate-400">Opening camera...</p></>
                : <><Camera className="w-8 h-8 text-slate-500" /><p className="text-sm text-slate-400 font-medium">{isNative() ? 'Open Camera / Gallery' : 'Upload Photo'}</p><p className="text-xs text-slate-500">Tap to {isNative() ? 'take or select photo' : 'choose image'}</p></>
              }
            </button>
          )}
          {cameraError && <p className="text-xs text-rose-400 mt-1.5">{cameraError}</p>}
        </div>

        {/* Location Name */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Location / Village Name
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Jatinga, NH-27 km 112"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you observed — size, severity, road conditions..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Mobile Number * <span className="text-slate-500 normal-case font-normal">(for DEOC follow-up)</span>
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="10-digit mobile number"
            maxLength={10}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors"
        >
          {isSubmitting
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            : <><Send className="w-5 h-5" /> Submit Hazard Report</>
          }
        </button>

        <p className="text-xs text-slate-500 text-center pb-2">
          Your report goes directly to the District Emergency Operations Centre (DEOC)
        </p>
      </form>

      {/* Map Pin Drop Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
            <button onClick={() => setShowMapModal(false)} className="p-2 rounded-xl hover:bg-slate-800">
              <X className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h3 className="font-bold text-white text-sm">Drop Location Pin</h3>
              <p className="text-xs text-slate-400">Tap on the map to set exact location</p>
            </div>
          </div>
          <div className="flex-1">
            <MapContainer
              center={modalPos}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri, HERE, Garmin"
              />
              <LocationMarker position={modalPos} setPosition={setModalPos} />
            </MapContainer>
          </div>
          <div className="bg-slate-900 border-t border-slate-800 p-4">
            <p className="text-xs text-slate-400 mb-3 text-center">
              Selected: {modalPos[0]}°N, {modalPos[1]}°E
            </p>
            <button
              onClick={confirmPinDropLocation}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-colors"
            >
              ✓ Confirm This Location
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
