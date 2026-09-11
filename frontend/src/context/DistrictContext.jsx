import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authService } from '../firebase/authService';

const DistrictContext = createContext(null);

export const STATE_DISTRICT_MAP = {
  'Assam': ['Dima Hasao', 'Kamrup'],
  'Meghalaya': ['East Khasi Hills', 'Ri-Bhoi'],
  'Sikkim': ['Gangtok']
};

export const DISTRICT_TO_STATE_MAP = {
  'Dima Hasao': 'Assam',
  'Kamrup': 'Assam',
  'East Khasi Hills': 'Meghalaya',
  'Ri-Bhoi': 'Meghalaya',
  'Gangtok': 'Sikkim'
};

export function DistrictProvider({ children }) {
  const currentOfficer = authService.getCurrentOfficer();

  // Role Scoping: Super Admin vs District Admin
  const isSuperAdmin = useMemo(() => {
    if (!currentOfficer) return true;
    const role = (currentOfficer.role || '').toLowerCase();
    return role.includes('super') || currentOfficer.jurisdiction === 'ALL';
  }, [currentOfficer]);

  const officerAssignedDistrict = useMemo(() => {
    if (!currentOfficer || currentOfficer.jurisdiction === 'ALL') return null;
    return currentOfficer.jurisdiction || null;
  }, [currentOfficer]);

  const officerAssignedState = useMemo(() => {
    if (!officerAssignedDistrict) return null;
    return DISTRICT_TO_STATE_MAP[officerAssignedDistrict] || (currentOfficer.state || 'Assam');
  }, [officerAssignedDistrict, currentOfficer]);

  // Persistent initial state
  const [selectedState, setSelectedState] = useState(() => {
    if (officerAssignedState) return officerAssignedState;
    try {
      return localStorage.getItem('ner_global_selected_state') || 'ALL';
    } catch {
      return 'ALL';
    }
  });

  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    if (officerAssignedDistrict) return officerAssignedDistrict;
    try {
      return localStorage.getItem('ner_global_selected_district') || 'ALL';
    } catch {
      return 'ALL';
    }
  });

  // Sync when officer jurisdiction changes
  useEffect(() => {
    if (officerAssignedDistrict) {
      setSelectedDistrict(officerAssignedDistrict);
      if (officerAssignedState) {
        setSelectedState(officerAssignedState);
      }
    }
  }, [officerAssignedDistrict, officerAssignedState]);

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
    if (officerAssignedDistrict) return [officerAssignedDistrict];
    if (selectedState === 'Assam') return STATE_DISTRICT_MAP['Assam'];
    if (selectedState === 'Meghalaya') return STATE_DISTRICT_MAP['Meghalaya'];
    if (selectedState === 'Sikkim') return STATE_DISTRICT_MAP['Sikkim'];
    return ['Dima Hasao', 'East Khasi Hills', 'Gangtok', 'Kamrup', 'Ri-Bhoi'];
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
    currentOfficer
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
