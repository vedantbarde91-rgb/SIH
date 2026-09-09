const API_BASE = "http://localhost:8000/api";

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

  async fetchDistrictSummary() {
    try {
      const res = await fetch(`${API_BASE}/analytics/district-summary`);
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

  async fetchReports(status = null) {
    const url = status ? `${API_BASE}/reports?status=${status}` : `${API_BASE}/reports`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      localStorage.setItem(CACHE_KEYS.REPORTS, JSON.stringify(data));
      return data;
    } catch (err) {
      const cached = localStorage.getItem(CACHE_KEYS.REPORTS);
      if (cached) {
        const list = JSON.parse(cached);
        return status ? list.filter((r) => r.status === status) : list;
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
  }
};
