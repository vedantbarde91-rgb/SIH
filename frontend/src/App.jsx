import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
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

// Layout wrapper for Officer Portal (Sidebar + Outlet)
function OfficerLayout() {
  const currentOfficer = authService.getCurrentOfficer();

  // If not logged in, we still allow viewing in prototype demo mode or redirect to login
  if (!currentOfficer) {
    return <Navigate to="/officer/login" replace />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1">
          <Routes>
            {/* Landing Door */}
            <Route path="/" element={<Landing />} />

            {/* Citizen Portal (Guest & Logged-in Auth) */}
            <Route path="/report" element={<ReportForm />} />
            <Route path="/user/auth" element={<CitizenAuth />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />

            {/* Officer Login */}
            <Route path="/officer/login" element={<OfficerLogin />} />

            {/* Officer Scoped Dashboard */}
            <Route path="/officer" element={<OfficerLayout />}>
              <Route index element={<Navigate to="/officer/map" replace />} />
              <Route path="map" element={<MapView />} />
              <Route path="list" element={<ListView />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<ReportsReview />} />
              <Route path="history" element={<HistoryView />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
