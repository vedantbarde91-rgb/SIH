/**
 * Lightweight Client-Side EXIF GPS Parser
 * Extracts GPS Latitude & Longitude directly from JPEG files without external packages.
 */

export function extractExifGps(file) {
  return new Promise((resolve) => {
    if (!file || !file.type.includes('jpeg') && !file.type.includes('jpg')) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target.result);
        if (view.getUint16(0, false) !== 0xFFD8) {
          resolve(null); // Not valid JPEG
          return;
        }

        let length = view.byteLength;
        let offset = 2;

        while (offset < length) {
          if (view.getUint16(offset + 2, false) <= 0) break;
          const marker = view.getUint16(offset, false);
          offset += 2;

          if (marker === 0xFFE1) {
            // APP1 marker (Exif)
            if (view.getUint32(offset + 2, false) !== 0x45786966) {
              resolve(null);
              return;
            }

            const littleEndian = view.getUint16(offset + 8, false) === 0x4949;
            const tiffOffset = offset + 8;
            const firstIFDOffset = view.getUint32(tiffOffset + 4, littleEndian);

            if (firstIFDOffset < 8) {
              resolve(null);
              return;
            }

            const gpsCoords = readGpsFromIFD(view, tiffOffset, firstIFDOffset, littleEndian);
            resolve(gpsCoords);
            return;
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        resolve(null);
      } catch (err) {
        console.warn('EXIF GPS parse error:', err);
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file.slice(0, 128 * 1024)); // Read first 128KB
  });
}

function readGpsFromIFD(view, tiffOffset, ifdOffset, littleEndian) {
  const entries = view.getUint16(tiffOffset + ifdOffset, littleEndian);
  let gpsOffset = 0;

  for (let i = 0; i < entries; i++) {
    const entryOffset = tiffOffset + ifdOffset + 2 + i * 12;
    const tag = view.getUint16(entryOffset, littleEndian);
    if (tag === 0x8825) {
      // GPS Info IFD Pointer
      gpsOffset = view.getUint32(entryOffset + 8, littleEndian);
      break;
    }
  }

  if (!gpsOffset) return null;

  const gpsEntries = view.getUint16(tiffOffset + gpsOffset, littleEndian);
  let latArr = null;
  let latRef = 'N';
  let lonArr = null;
  let lonRef = 'E';

  for (let i = 0; i < gpsEntries; i++) {
    const entryOffset = tiffOffset + gpsOffset + 2 + i * 12;
    const tag = view.getUint16(entryOffset, littleEndian);

    if (tag === 0x0001) latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
    if (tag === 0x0002) latArr = readRationalArray(view, tiffOffset, entryOffset, 3, littleEndian);
    if (tag === 0x0003) lonRef = String.fromCharCode(view.getUint8(entryOffset + 8));
    if (tag === 0x0004) lonArr = readRationalArray(view, tiffOffset, entryOffset, 3, littleEndian);
  }

  if (latArr && lonArr) {
    let lat = latArr[0] + latArr[1] / 60 + latArr[2] / 3600;
    let lon = lonArr[0] + lonArr[1] / 60 + lonArr[2] / 3600;
    if (latRef === 'S') lat = -lat;
    if (lonRef === 'W') lon = -lon;
    return { lat: Number(lat.toFixed(5)), lon: Number(lon.toFixed(5)) };
  }
  return null;
}

function readRationalArray(view, tiffOffset, entryOffset, count, littleEndian) {
  const valueOffset = view.getUint32(entryOffset + 8, littleEndian);
  const result = [];
  for (let i = 0; i < count; i++) {
    const num = view.getUint32(tiffOffset + valueOffset + i * 8, littleEndian);
    const den = view.getUint32(tiffOffset + valueOffset + i * 8 + 4, littleEndian);
    result.push(den ? num / den : 0);
  }
  return result;
}

/**
 * Resolves GPS Coordinates to the nearest NER District
 */
export function resolveCoordsToDistrict(lat, lon) {
  // Bounding centers
  const DISTRICT_HUBS = [
    { district: 'Dima Hasao', state: 'Assam', lat: 25.1764, lon: 93.0245 },
    { district: 'Kamrup', state: 'Assam', lat: 26.1100, lon: 91.9400 },
    { district: 'East Khasi Hills', state: 'Meghalaya', lat: 25.3500, lon: 91.8200 },
    { district: 'Ri-Bhoi', state: 'Meghalaya', lat: 25.9500, lon: 91.8700 },
    { district: 'Gangtok', state: 'Sikkim', lat: 27.3300, lon: 88.6100 }
  ];

  let closest = DISTRICT_HUBS[0];
  let minDistanceSq = Number.MAX_VALUE;

  for (const hub of DISTRICT_HUBS) {
    const dLat = lat - hub.lat;
    const dLon = lon - hub.lon;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closest = hub;
    }
  }

  return {
    district: closest.district,
    state: closest.state
  };
}
