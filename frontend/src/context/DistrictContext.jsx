import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authService } from '../firebase/authService';

const DistrictContext = createContext(null);

export const STATE_DISTRICT_MAP = {
  'Assam': [
    'Dima Hasao',
    'Kamrup',
    'Cachar',
    'Karbi Anglong',
    'Hailakandi',
    'Karimganj'
  ],
  'Meghalaya': [
    'East Khasi Hills',
    'Ri-Bhoi',
    'West Khasi Hills',
    'South West Khasi Hills',
    'West Jaintia Hills',
    'East Jaintia Hills',
    'West Garo Hills',
    'South Garo Hills'
  ],
  'Sikkim': [
    'Gangtok',
    'Mangan',
    'Namchi',
    'Gyalshing',
    'Pakyong',
    'Soreng'
  ]
};

export const DISTRICT_TO_STATE_MAP = {
  // Assam Districts
  'Dima Hasao': 'Assam',
  'Kamrup': 'Assam',
  'Cachar': 'Assam',
  'Karbi Anglong': 'Assam',
  'Hailakandi': 'Assam',
  'Karimganj': 'Assam',

  // Meghalaya Districts
  'East Khasi Hills': 'Meghalaya',
  'Ri-Bhoi': 'Meghalaya',
  'West Khasi Hills': 'Meghalaya',
  'South West Khasi Hills': 'Meghalaya',
  'West Jaintia Hills': 'Meghalaya',
  'East Jaintia Hills': 'Meghalaya',
  'West Garo Hills': 'Meghalaya',
  'South Garo Hills': 'Meghalaya',

  // Sikkim Districts
  'Gangtok': 'Sikkim',
  'Mangan': 'Sikkim',
  'Namchi': 'Sikkim',
  'Gyalshing': 'Sikkim',
  'Pakyong': 'Sikkim',
  'Soreng': 'Sikkim'
};

export function DistrictProvider({ children }) {
  // Reactive officer state so auth updates trigger re-renders everywhere
  const [currentOfficer, setCurrentOfficer] = useState(() => authService.getCurrentOfficer());

  // Role Scoping: Super Admin vs District Admin
  const isSuperAdmin = useMemo(() => {
    if (!currentOfficer) return true;
    const role = (currentOfficer.role || '').toLowerCase();
    const juris = (currentOfficer.jurisdiction || '').toUpperCase();
    return role.includes('super') || juris === 'ALL';
  }, [currentOfficer]);

  const officerAssignedDistrict = useMemo(() => {
    if (!currentOfficer || currentOfficer.jurisdiction === 'ALL') return null;
    return currentOfficer.jurisdiction || null;
  }, [currentOfficer]);

  const officerAssignedState = useMemo(() => {
    if (!officerAssignedDistrict) {
      if (currentOfficer && currentOfficer.state && currentOfficer.state !== 'ALL') {
        return currentOfficer.state;
      }
      return null;
    }
    return DISTRICT_TO_STATE_MAP[officerAssignedDistrict] || (currentOfficer?.state || 'Assam');
  }, [officerAssignedDistrict, currentOfficer]);

  // Selected State
  const [selectedState, setSelectedState] = useState(() => {
    const officer = authService.getCurrentOfficer();
    if (officer && officer.jurisdiction && officer.jurisdiction !== 'ALL') {
      return DISTRICT_TO_STATE_MAP[officer.jurisdiction] || officer.state || 'Assam';
    }
    try {
      return localStorage.getItem('ner_global_selected_state') || 'ALL';
    } catch {
      return 'ALL';
    }
  });

  // Selected District
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    const officer = authService.getCurrentOfficer();
    if (officer && officer.jurisdiction && officer.jurisdiction !== 'ALL') {
      return officer.jurisdiction;
    }
    try {
      return localStorage.getItem('ner_global_selected_district') || 'ALL';
    } catch {
      return 'ALL';
    }
  });

  // Keep state synchronized whenever currentOfficer changes
  useEffect(() => {
    if (currentOfficer) {
      if (currentOfficer.jurisdiction && currentOfficer.jurisdiction !== 'ALL') {
        setSelectedDistrict(currentOfficer.jurisdiction);
        const mappedState = DISTRICT_TO_STATE_MAP[currentOfficer.jurisdiction] || currentOfficer.state || 'Assam';
        setSelectedState(mappedState);
      } else {
        // Super Admin default
        setSelectedState('ALL');
        setSelectedDistrict('ALL');
      }
    }
  }, [currentOfficer]);

  // Persist for Super Admin
  useEffect(() => {
    if (isSuperAdmin && !officerAssignedDistrict) {
      try {
        localStorage.setItem('ner_global_selected_state', selectedState);
        localStorage.setItem('ner_global_selected_district', selectedDistrict);
      } catch {
        // ignore
      }
    }
  }, [selectedState, selectedDistrict, isSuperAdmin, officerAssignedDistrict]);

  // Available districts based on selectedState
  const availableDistricts = useMemo(() => {
    if (officerAssignedDistrict) {
      return [officerAssignedDistrict];
    }
    if (selectedState && STATE_DISTRICT_MAP[selectedState]) {
      return STATE_DISTRICT_MAP[selectedState];
    }
    // ALL selected -> aggregate all districts
    return Object.values(STATE_DISTRICT_MAP).flat();
  }, [selectedState, officerAssignedDistrict]);

  // Handlers for state and district changes
  const handleStateChange = (newState) => {
    if (!isSuperAdmin && officerAssignedDistrict) return; // Locked for district admins
    setSelectedState(newState);
    if (newState === 'ALL') {
      setSelectedDistrict('ALL');
    } else {
      const validDistricts = STATE_DISTRICT_MAP[newState] || [];
      if (!validDistricts.includes(selectedDistrict)) {
        setSelectedDistrict('ALL');
      }
    }
  };

  const handleDistrictChange = (newDistrict) => {
    if (!isSuperAdmin && officerAssignedDistrict) return; // Locked for district admins
    setSelectedDistrict(newDistrict);
    if (newDistrict !== 'ALL' && DISTRICT_TO_STATE_MAP[newDistrict]) {
      setSelectedState(DISTRICT_TO_STATE_MAP[newDistrict]);
    }
  };

  // Synchronous Reactive Login
  const loginOfficer = useCallback(async (email, password) => {
    const officer = await authService.login(email, password);
    setCurrentOfficer(officer);
    if (officer.jurisdiction && officer.jurisdiction !== 'ALL') {
      const mappedState = DISTRICT_TO_STATE_MAP[officer.jurisdiction] || officer.state || 'Assam';
      setSelectedState(mappedState);
      setSelectedDistrict(officer.jurisdiction);
    } else {
      setSelectedState('ALL');
      setSelectedDistrict('ALL');
    }
    return officer;
  }, []);

  // Synchronous Reactive Logout
  const logoutOfficer = useCallback(() => {
    authService.logout();
    setCurrentOfficer(null);
    setSelectedState('ALL');
    setSelectedDistrict('ALL');
    try {
      localStorage.removeItem('ner_global_selected_state');
      localStorage.removeItem('ner_global_selected_district');
    } catch {
      // ignore
    }
  }, []);

  const value = {
    selectedState,
    selectedDistrict,
    setSelectedState,
    setSelectedDistrict,
    handleStateChange,
    handleDistrictChange,
    availableDistricts,
    isSuperAdmin,
    officerAssignedDistrict,
    officerAssignedState,
    currentOfficer,
    loginOfficer,
    logoutOfficer
  };

  return (
    <DistrictContext.Provider value={value}>
      {children}
    </DistrictContext.Provider>
  );
}

export function useDistrict() {
  const context = useContext(DistrictContext);
  if (!context) {
    throw new Error('useDistrict must be used within a DistrictProvider');
  }
  return context;
}
