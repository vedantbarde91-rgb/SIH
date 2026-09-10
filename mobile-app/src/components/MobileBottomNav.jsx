import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, BarChart2, List, FileText, History } from 'lucide-react';
import { authService } from '../firebase/authService';

// Mobile Bottom Navigation Bar — replaces the Sidebar used in the web app
// Shown only in the Officer portal, fixed to the bottom of the screen
export default function MobileBottomNav() {
  const officer = authService.getCurrentOfficer();
  const location = useLocation();

  // Only show for officer portal routes
  if (!officer || !location.pathname.startsWith('/officer')) return null;

  const navItems = [
    { to: '/officer/map', icon: Map, label: 'Map' },
    { to: '/officer/list', icon: List, label: 'Villages' },
    { to: '/officer/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/officer/reports', icon: FileText, label: 'Reports' },
    { to: '/officer/history', icon: History, label: 'History' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 mobile-bottom-nav">
      <div className="flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
                isActive
                  ? 'text-sky-400 bg-sky-500/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
