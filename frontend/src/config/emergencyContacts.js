/**
 * EMERGENCY CONTACTS CONFIGURATION
 * 
 * You can update, add, or remove emergency contact phone numbers here at any time.
 * These numbers are used by the Automated SMS Warning Broadcast system to dispatch
 * civil defense and evacuation alerts to designated emergency officers.
 */
export const EMERGENCY_SMS_CONFIG = {
  // Primary National Emergency Helpline (India)
  nationalHelpline: '112',

  // Team Member 1 (Assigned for Entire District Alert Scope)
  districtOfficerNumber: '7499246109',
  districtOfficerName: 'District Disaster Management Officer (DDMA)',

  // Team Member 2 (Assigned for All NER Regional Pilot Contacts Scope)
  nerRegionalOfficerNumber: '9356374732',
  nerRegionalOfficerName: 'State Emergency Operations Center (SEOC / SDRF)',

  // Additional District Helpline fallbacks
  dimaHasaoControlRoom: '112',
  eastKhasiHillsControlRoom: '112',
  gangtokControlRoom: '112'
};
