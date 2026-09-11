/**
 * Registered Citizens Database Manager (Mock Local Storage System)
 * Stores citizen records for emergency CAP-compliant SMS early warning broadcasts.
 */

export const INITIAL_REGISTERED_CITIZENS = [
  // Dima Hasao (Assam)
  {
    name: 'Rahul Sharma',
    mobile_number: '9876543210',
    district: 'Dima Hasao',
    assigned_village: 'Jatinga Ridge',
    state: 'Assam',
    role: 'Village Headman / Gaonbura',
    verified: true,
    registered_at: '2026-08-15T10:00:00Z'
  },
  {
    name: 'Debojit Barman',
    mobile_number: '9435012345',
    district: 'Dima Hasao',
    assigned_village: 'Harangajao Pass',
    state: 'Assam',
    role: 'Local School Principal',
    verified: true,
    registered_at: '2026-08-18T14:30:00Z'
  },
  {
    name: 'Priyanka Gogoi',
    mobile_number: '9864012345',
    district: 'Dima Hasao',
    assigned_village: 'Lower Haflong',
    state: 'Assam',
    role: 'ASHA Health Worker',
    verified: true,
    registered_at: '2026-08-20T12:30:00Z'
  },
  {
    name: 'Surajit Daulagupu',
    mobile_number: '9706012891',
    district: 'Dima Hasao',
    assigned_village: 'Ditokcherra Gorge',
    state: 'Assam',
    role: 'Railway Gangman / Local Volunteer',
    verified: true,
    registered_at: '2026-08-25T09:15:00Z'
  },
  {
    name: 'Monjit Langthasa',
    mobile_number: '9954087123',
    district: 'Dima Hasao',
    assigned_village: 'Jatinga Ridge',
    state: 'Assam',
    role: 'Farmer / Roadside Vendor',
    verified: true,
    registered_at: '2026-09-01T08:00:00Z'
  },
  {
    name: 'Anjali Dimasa',
    mobile_number: '9859012345',
    district: 'Dima Hasao',
    assigned_village: 'Lower Haflong',
    state: 'Assam',
    role: 'Civil Defense Volunteer',
    verified: true,
    registered_at: '2026-09-03T11:45:00Z'
  },

  // East Khasi Hills (Meghalaya)
  {
    name: 'Banshan Marbaniang',
    mobile_number: '9856012340',
    district: 'East Khasi Hills',
    assigned_village: 'Cherrapunji Rim',
    state: 'Meghalaya',
    role: 'Community Elder / Sordar',
    verified: true,
    registered_at: '2026-08-10T16:00:00Z'
  },
  {
    name: 'Ibanylla Khongwir',
    mobile_number: '9862098712',
    district: 'East Khasi Hills',
    assigned_village: 'Mawkdok Dympep Valley',
    state: 'Meghalaya',
    role: 'Homestay Operator',
    verified: true,
    registered_at: '2026-08-14T11:20:00Z'
  },
  {
    name: 'Donbok Syiem',
    mobile_number: '9436123456',
    district: 'East Khasi Hills',
    assigned_village: 'Pynursla Ridge',
    state: 'Meghalaya',
    role: 'Transport Driver / Guide',
    verified: true,
    registered_at: '2026-08-22T15:10:00Z'
  },
  {
    name: 'Larisa Lyngdoh',
    mobile_number: '9774056789',
    district: 'East Khasi Hills',
    assigned_village: 'Mawlynnong Descent',
    state: 'Meghalaya',
    role: 'Village Tourism Secretary',
    verified: true,
    registered_at: '2026-08-28T10:05:00Z'
  },

  // Gangtok (Sikkim)
  {
    name: 'Tenzing Lepcha',
    mobile_number: '9434012399',
    district: 'Gangtok',
    assigned_village: '9th Mile JN Road',
    state: 'Sikkim',
    role: 'Panchayat President',
    verified: true,
    registered_at: '2026-08-12T13:40:00Z'
  },
  {
    name: 'Karma Bhutia',
    mobile_number: '9832045612',
    district: 'Gangtok',
    assigned_village: 'Ranipool Catchment',
    state: 'Sikkim',
    role: 'Teesta Hydro Monitoring Liaison',
    verified: true,
    registered_at: '2026-08-16T17:25:00Z'
  },
  {
    name: 'Pemba Sherpa',
    mobile_number: '9733078901',
    district: 'Gangtok',
    assigned_village: 'Martam Slope',
    state: 'Sikkim',
    role: 'Mountain Rescue Volunteer',
    verified: true,
    registered_at: '2026-08-24T08:50:00Z'
  },
  {
    name: 'Tshering Doma',
    mobile_number: '9800054321',
    district: 'Gangtok',
    assigned_village: 'Sirwani Bypass',
    state: 'Sikkim',
    role: 'State Emergency Volunteer',
    verified: true,
    registered_at: '2026-09-02T14:15:00Z'
  }
];

const STORAGE_KEY = 'ner_registered_citizens_db';

/**
 * Retrieve all registered citizens from localStorage, seeding if not present.
 */
export function getRegisteredCitizens() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REGISTERED_CITIZENS));
      return INITIAL_REGISTERED_CITIZENS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REGISTERED_CITIZENS));
      return INITIAL_REGISTERED_CITIZENS;
    }
    return parsed;
  } catch {
    return INITIAL_REGISTERED_CITIZENS;
  }
}

/**
 * Save registered citizens list to localStorage.
 */
export function saveRegisteredCitizens(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save registered citizens db:', err);
  }
}

/**
 * Add or update a registered citizen record.
 */
export function addRegisteredCitizen(citizen) {
  if (!citizen || !citizen.mobile_number) return;
  const cleanPhone = citizen.mobile_number.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) return;

  const current = getRegisteredCitizens();
  const existingIdx = current.findIndex(
    (c) => (c.mobile_number || c.phone || '').replace(/\D/g, '').slice(-10) === cleanPhone
  );

  const formatted = {
    name: citizen.name || 'Local Citizen',
    mobile_number: cleanPhone,
    phone: cleanPhone,
    district: citizen.district || 'Dima Hasao',
    assigned_village: citizen.assigned_village || citizen.village || 'General Corridor',
    state: citizen.state || (citizen.district === 'Gangtok' ? 'Sikkim' : (citizen.district === 'East Khasi Hills' ? 'Meghalaya' : 'Assam')),
    role: citizen.role || 'Registered Resident',
    verified: true,
    registered_at: citizen.registered_at || new Date().toISOString()
  };

  if (existingIdx >= 0) {
    current[existingIdx] = { ...current[existingIdx], ...formatted };
  } else {
    current.unshift(formatted);
  }

  saveRegisteredCitizens(current);
  return formatted;
}

/**
 * Sync citizen from hazard report submission.
 */
export function syncCitizenFromReport(report) {
  if (!report || (!report.phone_number && !report.phone)) return;
  const phone = report.phone_number || report.phone;
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) return;

  addRegisteredCitizen({
    name: report.user_name || 'Reporting Citizen',
    mobile_number: cleanPhone,
    district: report.district || 'Dima Hasao',
    assigned_village: report.location_name || report.location || 'Reported Location',
    state: report.state || (report.district === 'Gangtok' ? 'Sikkim' : (report.district === 'East Khasi Hills' ? 'Meghalaya' : 'Assam')),
    role: 'Field Hazard Contributor',
    registered_at: report.created_at || new Date().toISOString()
  });
}

/**
 * Filter citizens by district.
 */
export function getCitizensByDistrict(district) {
  const all = getRegisteredCitizens();
  if (!district || district.toUpperCase() === 'ALL') return all;
  return all.filter((c) => (c.district || '').toLowerCase() === district.toLowerCase());
}
