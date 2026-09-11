import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Ensure L is globally bound for Leaflet plugins
if (typeof window !== 'undefined' && !window.L) {
  window.L = L;
}

let isHeatPluginLoaded = false;

async function loadHeatPlugin() {
  if (typeof window !== 'undefined' && !window.L) {
    window.L = L;
  }
  if (!isHeatPluginLoaded && typeof L.heatLayer !== 'function') {
    await import('leaflet.heat');
    isHeatPluginLoaded = true;
  }
}

/**
 * GisHeatmapLayer: True GIS density/intensity heatmap for Leaflet
 * Renders smooth Gaussian thermal gradients based on geotechnical risk scores.
 * High risk points (> 75%) glow intensely in red/amber; safe zones remain green/clear.
 */
export default function GisHeatmapLayer({
  points = [],
  radius = 36,
  blur = 24,
  maxZoom = 15,
  minOpacity = 0.4,
  gradient = {
    0.2: '#10b981', // green / safe
    0.4: '#06b6d4', // cyan / low-risk
    0.6: '#eab308', // amber / moderate
    0.75: '#f97316', // orange / high
    0.88: '#ef4444', // red / critical
    1.0: '#7f1d1d'  // intense deep crimson / extreme
  }
}) {
  const map = useMap();
  const heatLayerRef = useRef(null);
  const [pluginReady, setPluginReady] = useState(typeof L.heatLayer === 'function');

  // Ensure plugin is dynamically imported with window.L initialized
  useEffect(() => {
    let mounted = true;
    if (typeof L.heatLayer !== 'function') {
      loadHeatPlugin()
        .then(() => {
          if (mounted) setPluginReady(true);
        })
        .catch((err) => {
          console.error('Failed to initialize GIS heatmap layer:', err);
        });
    } else {
      setPluginReady(true);
    }
    return () => {
      mounted = false;
    };
  }, []);

  // Update or create the L.heatLayer instance
  useEffect(() => {
    if (!pluginReady || !map || typeof L.heatLayer !== 'function') return;

    // Format points: [lat, lon, intensity]
    // intensity is 0.0 to 1.0 (higher risk score = higher thermal intensity)
    const validPoints = points
      .filter((p) => p && typeof p[0] === 'number' && typeof p[1] === 'number')
      .map((p) => [
        p[0],
        p[1],
        typeof p[2] === 'number' ? Math.max(0.1, Math.min(1.0, p[2])) : 0.5
      ]);

    if (heatLayerRef.current) {
      heatLayerRef.current.setLatLngs(validPoints);
    } else {
      heatLayerRef.current = L.heatLayer(validPoints, {
        radius,
        blur,
        maxZoom,
        max: 1.0,
        minOpacity,
        gradient
      }).addTo(map);
    }

    return () => {
      if (heatLayerRef.current) {
        try {
          map.removeLayer(heatLayerRef.current);
        } catch {
          // ignore
        }
        heatLayerRef.current = null;
      }
    };
  }, [pluginReady, map, points, radius, blur, maxZoom, minOpacity, gradient]);

  return null;
}
