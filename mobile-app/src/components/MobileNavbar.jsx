import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogOut, User, ChevronLeft } from 'lucide-react';
import { authService } from '../firebase/authService';
import LanguageSwitcher from './LanguageSwitcher';

// Compact mobile Navbar — shows back button on inner pages, minimal branding
export default function MobileNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const officer = authService.getCurrentOfficer();

  const isRoot = location.pathname === '/';
  const isOfficerPortal = location.pathname.startsWith('/officer') && location.pathname !== '/officer/login';

  const handleLogout = () => {
    authService.logout();
    navigate('/officer/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 h-14 flex items-center px-3 gap-2">

      {/* Back button on non-root pages */}
      {!isRoot && (
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-400"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Logo / Brand */}
      <Link to="/" className="flex items-center gap-2 flex-1">
        <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-sm tracking-tight">NER-LEWS</span>
      </Link>

      {/* Officer badge + logout */}
      {isOfficerPortal && officer ? (
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1">
            <User className="w-3 h-3 text-sky-400" />
            <span className="text-xs text-slate-300 font-medium truncate max-w-[100px]">
              {officer.name?.split(' ')[0]}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <LanguageSwitcher />
      )}
    </header>
  );
}
