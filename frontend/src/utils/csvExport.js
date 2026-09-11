/**
 * Utility functions to export telemetry and historical disaster data as CSV files.
 */

/**
 * Exports single village telemetry details as RFC 4180 compliant CSV.
 * Columns: Node ID, Village Name, District, State, Latitude, Longitude, Risk Score (%), Risk Band, Slope Angle, 72h Antecedent Rainfall, Soil Saturation, Key Geotechnical Triggers, Recommended Action
 */
export function exportVillageTelemetryCSV(village) {
  if (!village) return;

  const headers = [
    'Node ID',
    'Village Name',
    'District',
    'State',
    'Latitude',
    'Longitude',
    'Risk Score (%)',
    'Risk Band',
    'Slope Angle (deg)',
    '72h Antecedent Rainfall (mm)',
    'Soil Saturation (%)',
    'Key Geotechnical Triggers',
    'Recommended Action'
  ];

  // Geotechnical triggers string
  let triggers = '';
  if (village.geotechnical_triggers) {
    triggers = Array.isArray(village.geotechnical_triggers)
      ? village.geotechnical_triggers.join('; ')
      : village.geotechnical_triggers;
  } else if (village.primary_risk_driver) {
    triggers = village.primary_risk_driver;
  } else {
    triggers = 'High pore water pressure; fractured Barail shale bedrock';
  }

  // Recommended Action
  let action = village.mitigation_protocol || village.recommended_action;
  if (!action) {
    const risk = village.risk_percentage || village.risk_score || 0;
    if (risk >= 75) {
      action = 'Issue Immediate Evacuation Advisory & Deploy NDRF/SDRF Field Crew';
    } else if (risk >= 50) {
      action = 'Intensify Piezometer Monitoring & Active Drainage Clearance';
    } else {
      action = 'Routine Geotechnical Sensor Surveillance';
    }
  }

  const row = [
    `"${(village.id || '').replace(/"/g, '""')}"`,
    `"${(village.name || '').replace(/"/g, '""')}"`,
    `"${(village.district || '').replace(/"/g, '""')}"`,
    `"${(village.state || '').replace(/"/g, '""')}"`,
    village.lat != null ? village.lat : '',
    village.lon != null ? village.lon : '',
    village.risk_percentage || village.risk_score || 0,
    `"${(village.risk_band || '').replace(/"/g, '""')}"`,
    village.slope_deg != null ? village.slope_deg : '',
    village.rainfall_72h_mm != null ? village.rainfall_72h_mm : '',
    village.soil_moisture_pct != null ? village.soil_moisture_pct : '',
    `"${triggers.replace(/"/g, '""')}"`,
    `"${action.replace(/"/g, '""')}"`
  ];

  const csvContent = '\uFEFF' + [headers.join(','), row.join(',')].join('\r\n');
  downloadCSV(csvContent, `Telemetry_${(village.name || 'node').replace(/[\s/\\:]+/g, '_')}_${village.id || 'export'}.csv`);
}

/**
 * Exports filtered list of historical disaster records as CSV.
 */
export function exportHistoryTimelineCSV(events, filterInfo = '') {
  if (!events || events.length === 0) return;

  const headers = [
    'Event ID',
    'Year',
    'Date',
    'Event Title',
    'Specific Location',
    'District',
    'State',
    'Hazard Type',
    'Severity Band',
    'Rainfall / Trigger',
    'Casualties & Affected Population',
    'Damage Assessment',
    'Countermeasures & Engineering Mitigations',
    'Current Status'
  ];

  const rows = events.map((e) => [
    `"${(e.id || '').replace(/"/g, '""')}"`,
    `"${(e.year || '').replace(/"/g, '""')}"`,
    `"${(e.date || '').replace(/"/g, '""')}"`,
    `"${(e.title || '').replace(/"/g, '""')}"`,
    `"${(e.location || '').replace(/"/g, '""')}"`,
    `"${(e.district || '').replace(/"/g, '""')}"`,
    `"${(e.state || '').replace(/"/g, '""')}"`,
    `"${(e.hazard_type || '').replace(/"/g, '""')}"`,
    `"${(e.severity || '').replace(/"/g, '""')}"`,
    `"${(e.rainfall || '').replace(/"/g, '""')}"`,
    `"${(e.casualties || '').replace(/"/g, '""')}"`,
    `"${(e.damage || '').replace(/"/g, '""')}"`,
    `"${(e.countermeasures || '').replace(/"/g, '""')}"`,
    `"${(e.status || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const timestamp = new Date().toISOString().slice(0, 10);
  const suffix = filterInfo ? `_${filterInfo.replace(/[\s/\\:]+/g, '_')}` : '';
  downloadCSV(csvContent, `NER_Disaster_History_Archive${suffix}_${timestamp}.csv`);
}

/**
 * Exports citizen field reports table as RFC 4180 compliant CSV.
 * Columns: Report ID, Timestamp, Hazard Type, Latitude, Longitude, Landmark / Location, District, State, Submitting Citizen Mobile Number, Verification Status, Photo Attachment URL, Officer Action Notes
 */
export function exportCitizenReportsCSV(reports, filterInfo = '') {
  if (!reports || reports.length === 0) return;

  const headers = [
    'Report ID',
    'Timestamp (ISO)',
    'Timestamp (Local)',
    'Hazard Type',
    'Latitude',
    'Longitude',
    'Landmark / Location',
    'District',
    'State',
    'Submitting Citizen Mobile Number',
    'Verification Status',
    'Photo Attachment URL',
    'Officer Action Notes'
  ];

  const rows = reports.map((r) => {
    const lat = r.lat != null ? r.lat : '';
    const lon = r.lon != null ? r.lon : (r.lng != null ? r.lng : '');
    const localTime = r.created_at ? new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '';
    const photo = r.photo_url || (r.photo_base64 ? '[Base64 Embedded Image]' : 'None');
    const officerNotes = r.officer_notes || 'Pending DEOC review';

    return [
      `"${(r.id || '').replace(/"/g, '""')}"`,
      `"${(r.created_at || '').replace(/"/g, '""')}"`,
      `"${localTime.replace(/"/g, '""')}"`,
      `"${(r.hazard_type || 'landslide').replace(/"/g, '""')}"`,
      lat,
      lon,
      `"${(r.location_name || r.location || '').replace(/"/g, '""')}"`,
      `"${(r.district || 'Dima Hasao').replace(/"/g, '""')}"`,
      `"${(r.state || 'Assam').replace(/"/g, '""')}"`,
      `"${(r.phone_number || r.phone || 'Anonymous / Guest').replace(/"/g, '""')}"`,
      `"${(r.status || 'pending').toUpperCase().replace(/"/g, '""')}"`,
      `"${photo.replace(/"/g, '""')}"`,
      `"${officerNotes.replace(/"/g, '""')}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const timestamp = new Date().toISOString().slice(0, 10);
  const suffix = filterInfo ? `_${filterInfo.replace(/[\s/\\:]+/g, '_')}` : '';
  downloadCSV(csvContent, `NER_Citizen_Field_Reports${suffix}_${timestamp}.csv`);
}

/**
 * Browser download trigger
 */
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

