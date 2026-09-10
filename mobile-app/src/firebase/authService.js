import { auth } from "./config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

// Pre-seeded verified demo accounts for 3 NER pilot districts + Super Admin
export const DEMO_OFFICERS = [
  {
    email: "superadmin@ner-sdma.gov.in",
    password: "Password@123",
    name: "Dr. Himanta Sharma",
    role: "Super Administrator (All States / Full Regional View)",
    jurisdiction: "ALL",
    state: "ALL",
    zone: "All 8 NER States & Pilot Corridors",
    badgeNumber: "NER-SDMA-HQ-001"
  },
  {
    email: "officer.dimahasao@assam-sdma.gov.in",
    password: "Password@123",
    name: "Rajesh Barman",
    role: "Assam District Officer (Dima Hasao)",
    jurisdiction: "Dima Hasao",
    state: "Assam",
    zone: "NH-27 Lumding-Badarpur & Jatinga Corridor",
    badgeNumber: "AS-SDMA-DH-042"
  },
  {
    email: "officer.eastkhasi@meghalaya-sdma.gov.in",
    password: "Password@123",
    name: "Wandashisha Lyngdoh",
    role: "Meghalaya District Officer (East Khasi Hills)",
    jurisdiction: "East Khasi Hills",
    state: "Meghalaya",
    zone: "Shillong-Sohra-Dawki Highway Corridor",
    badgeNumber: "ML-SDMA-EKH-018"
  },
  {
    email: "officer.gangtok@sikkim-sdma.gov.in",
    password: "Password@123",
    name: "Tenzing Bhutia",
    role: "Sikkim District Officer (Gangtok)",
    jurisdiction: "Gangtok",
    state: "Sikkim",
    zone: "NH-10 & JN Road Nathu La Corridor",
    badgeNumber: "SK-SDMA-GTK-007"
  }
];

const STORAGE_KEY = "ner_lews_officer_session";

export const authService = {
  getCurrentOfficer() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async login(email, password) {
    // 1. Check if matching pre-seeded demo officers
    const demoMatch = DEMO_OFFICERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && (u.password === password || password === "demo")
    );
    if (demoMatch) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoMatch));
      return demoMatch;
    }

    // 2. Attempt real Firebase Auth if live credentials are configured
    if (auth && !auth.config?.apiKey?.startsWith("AIzaSyDummy")) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const officerProfile = {
          email: userCred.user.email,
          name: userCred.user.displayName || email.split("@")[0],
          role: "Authorized Emergency Response Officer",
          jurisdiction: "Dima Hasao",
          state: "Assam",
          zone: "North Cachar Hills",
          badgeNumber: `OF-${userCred.user.uid.slice(0, 6).toUpperCase()}`
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(officerProfile));
        return officerProfile;
      } catch (err) {
        throw new Error(err.message || "Authentication failed");
      }
    }

    // 3. Fallback for prototyping if user enters any credentials with @
    if (email && email.includes("@")) {
      const fallbackOfficer = {
        email,
        name: email.split("@")[0].replace(".", " ").toUpperCase(),
        role: "District Response Officer",
        jurisdiction: "Dima Hasao",
        state: "Assam",
        zone: "Central Corridor",
        badgeNumber: "AS-PROTOTYPE-01"
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackOfficer));
      return fallbackOfficer;
    }

    throw new Error("Invalid email or credentials");
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    if (auth) {
      signOut(auth).catch(() => {});
    }
  }
};
