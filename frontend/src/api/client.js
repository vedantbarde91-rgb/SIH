//const API_BASE = "http://localhost:8000/api";
const API_URL = "https://sih-1-z04k.onrender.com";

const CACHE_KEYS = {
  VILLAGES: "ner_lews_cached_villages",
  SUMMARY: "ner_lews_cached_summary",
  TIMESTAMP: "ner_lews_cache_timestamp",
  REPORTS: "ner_lews_cached_reports"
};

export const apiClient = {
  // Check online status
  isOnline() {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  },

  getCacheTimestamp() {
    return localStorage.getItem(CACHE_KEYS.TIMESTAMP) || null;
  },

  async fetchVillages(params = {}) {
    const query = new URLSearchParams();
    if (params.state && params.state !== "ALL") query.append("state", params.state);
    if (params.district && params.district !== "ALL") query.append("district", params.district);
    if (params.band && params.band !== "ALL") query.append("band", params.band);
    if (params.min_risk) query.append("min_risk", params.min_risk);
    if (params.search) query.append("search", params.search);

    try {
      const res = await fetch(`${API_BASE}/villages?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Update cache
      localStorage.setItem(CACHE_KEYS.VILLAGES, JSON.stringify(data));
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, new Date().toISOString());
      return { data, fromCache: false };
    } catch (err) {
      console.warn("API request failed, loading from local cache:", err.message);
      const cached = localStorage.getItem(CACHE_KEYS.VILLAGES);
      if (cached) {
        return { data: JSON.parse(cached), fromCache: true };
      }
      throw err;
    }
  },

  async fetchVillageDetail(id) {
    try {
      const res = await fetch(`${API_BASE}/villages/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      // Fallback search in cached villages
      const cached = localStorage.getItem(CACHE_KEYS.VILLAGES);
      if (cached) {
        const list = JSON.parse(cached);
        const match = list.find((v) => v.id === id);
        if (match) return match;
      }
      throw err;
    }
  },

  async fetchDistrictSummary(state = "ALL", district = "ALL") {
    try {
      const q = new URLSearchParams();
      if (state && state !== "ALL") q.append("state", state);
      if (district && district !== "ALL") q.append("district", district);
      const res = await fetch(`${API_BASE}/analytics/district-summary?${q.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      localStorage.setItem(CACHE_KEYS.SUMMARY, JSON.stringify(data));
      return { data, fromCache: false };
    } catch (err) {
      const cached = localStorage.getItem(CACHE_KEYS.SUMMARY);
      if (cached) {
        return { data: JSON.parse(cached), fromCache: true };
      }
      throw err;
    }
  },

  async fetchWeather11Day(state = "Assam", district = "Dima Hasao") {
    try {
      const q = new URLSearchParams();
      if (state && state !== "ALL") q.append("state", state);
      if (district && district !== "ALL") q.append("district", district);
      const res = await fetch(`${API_BASE}/analytics/weather-11day?${q.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("11-day weather fetch failed:", err);
      return null;
    }
  },

  async chatWithAssistant(message, language = "en", history = []) {
    try {
      const res = await fetch(`${API_BASE}/chatbot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language, history })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("Chatbot API request failed:", err);
      return null;
    }
  },

  async fetchCorridorTimeSeries() {
    try {
      const res = await fetch(`${API_BASE}/analytics/corridor-time-series`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("Time series fetch failed:", err);
      return [];
    }
  },

  async fetchReports(params = null) {
    let query = '';
    if (typeof params === 'string') {
      query = `?status=${params}`;
    } else if (params && typeof params === 'object') {
      const q = new URLSearchParams();
      if (params.status && params.status !== 'ALL') q.append('status', params.status);
      if (params.district && params.district !== 'ALL') q.append('district', params.district);
      if (params.user_id) q.append('user_id', params.user_id);
      const str = q.toString();
      if (str) query = `?${str}`;
    }

    const url = `${API_BASE}/reports${query}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      const cached = localStorage.getItem(CACHE_KEYS.REPORTS);
      if (cached) {
        let list = JSON.parse(cached);
        if (params && typeof params === 'object') {
          if (params.status && params.status !== 'ALL') {
            list = list.filter((r) => r.status === params.status);
          }
          if (params.district && params.district !== 'ALL') {
            list = list.filter((r) => (r.district || 'Dima Hasao').toLowerCase() === params.district.toLowerCase());
          }
          if (params.user_id) {
            list = list.filter((r) => r.user_id === params.user_id || r.phone_number === params.user_id);
          }
        } else if (typeof params === 'string' && params !== 'ALL') {
          list = list.filter((r) => r.status === params);
        }
        return list;
      }
      return [];
    }
  },

  async submitReport(reportData) {
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("Backend report submission failed, queuing locally:", err);
      // Generate client-side report entry for offline resilience
      const offlineReport = {
        id: `OFFLINE-REP-${Date.now().toString().slice(-4)}`,
        ...reportData,
        status: "pending",
        created_at: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem(CACHE_KEYS.REPORTS) || "[]");
      existing.unshift(offlineReport);
      localStorage.setItem(CACHE_KEYS.REPORTS, JSON.stringify(existing));
      return offlineReport;
    }
  },

  async updateReportStatus(reportId, status, officerNotes = "") {
    try {
      const res = await fetch(`${API_BASE}/reports/${reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, officer_notes: officerNotes })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      // Local storage update fallback
      const cached = JSON.parse(localStorage.getItem(CACHE_KEYS.REPORTS) || "[]");
      const found = cached.find((r) => r.id === reportId);
      if (found) {
        found.status = status;
        found.officer_notes = officerNotes;
        localStorage.setItem(CACHE_KEYS.REPORTS, JSON.stringify(cached));
        return found;
      }
      throw err;
    }
  },

  async predictRisk(features) {
    try {
      const res = await fetch(`${API_BASE}/villages/predict-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Predict risk call failed:", err);
      throw err;
    }
  },

  async fetchWeatherForecast(lat, lon) {
    try {
      const res = await fetch(`${API_BASE}/weather/${lat}/${lon}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("Live weather fetch failed, using fallback:", err);
      return {
        source: "Client Fallback",
        rainfall_72h_mm: 95.0,
        precipitation_rate_2h_mm: 12.0,
        soil_moisture_pct: 62.0,
        flash_flood_warning: false,
        warning_reasons: ["Telemetry within normal bounds"]
      };
    }
  },

  async fetchElevation(lat, lon) {
    try {
      const res = await fetch(`${API_BASE}/elevation/${lat}/${lon}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("Live elevation fetch failed:", err);
      return { elevation_m: 650, slope_deg: 32.0, slope_category: "Steep (30°-45°)" };
    }
  },

  async fetchHistoricalLandslides(params = {}) {
    const query = new URLSearchParams();
    if (params.state && params.state !== "ALL") query.append("state", params.state);
    if (params.district && params.district !== "ALL") query.append("district", params.district);
    if (params.min_fatalities) query.append("min_fatalities", params.min_fatalities);
    if (params.limit) query.append("limit", params.limit);

    try {
      const res = await fetch(`${API_BASE}/historical-landslides?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("Historical landslides fetch failed:", err);
      return { type: "FeatureCollection", features: [] };
    }
  },

  async fetchVillageLiveRisk(villageId) {
    try {
      const res = await fetch(`${API_BASE}/villages/${villageId}/live-risk`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`Live risk fetch failed for village ${villageId}:`, err);
      return null;
    }
  }
};
