import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MobileNavbar from './components/MobileNavbar';
import MobileBottomNav from './components/MobileBottomNav';
import OfflineBanner from './components/OfflineBanner';

// Pages
import Landing from './pages/Landing';
import ReportForm from './pages/citizen/ReportForm';
import CitizenAuth from './pages/citizen/CitizenAuth';
import UserDashboard from './pages/citizen/UserDashboard';
import OfficerLogin from './pages/officer/Login';
import MapView from './pages/officer/MapView';
import ListView from './pages/officer/ListView';
import Analytics from './pages/officer/Analytics';
import ReportsReview from './pages/officer/ReportsReview';
import HistoryView from './pages/officer/HistoryView';
import { authService } from './firebase/authService';

// Officer portal layout — uses bottom nav instead of sidebar
function OfficerLayout() {
  const currentOfficer = authService.getCurrentOfficer();
  if (!currentOfficer) return <Navigate to="/officer/login" replace />;

  return (
    // Add pb-16 to account for fixed bottom nav height
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      <main className="flex-1 overflow-y-auto bg-slate-950 pb-16">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <MobileNavbar />
        <OfflineBanner />
        <div className="flex-1">
          <Routes>
            {/* Landing */}
            <Route path="/" element={<Landing />} />

            {/* Citizen Portal */}
            <Route path="/report" element={<ReportForm />} />
            <Route path="/user/auth" element={<CitizenAuth />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />

            {/* Officer Login */}
            <Route path="/officer/login" element={<OfficerLogin />} />

            {/* Officer Dashboard — Mobile layout with bottom nav */}
            <Route path="/officer" element={<OfficerLayout />}>
              <Route index element={<Navigate to="/officer/map" replace />} />
              <Route path="map" element={<MapView />} />
              <Route path="list" element={<ListView />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<ReportsReview />} />
              <Route path="history" element={<HistoryView />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
