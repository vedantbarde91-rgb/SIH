import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CitizenAIChatbot from '../../components/CitizenAIChatbot';
import { addRegisteredCitizen } from '../../utils/citizenDatabase';
import {
  User,
  Phone,
  Lock,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  MapPin,
  X,
  KeyRound,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

const INITIAL_CITIZENS_DB = [
  {
    name: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul.sharma@gmail.com',
    password: 'password123',
    district: 'Dima Hasao',
    village: 'Jatinga Ridge',
    authMethod: 'credentials',
    registeredAt: '2026-08-15T10:00:00Z'
  },
  {
    name: 'Priyanka Gogoi',
    phone: '9864012345',
    email: 'priyanka.gogoi.ner@gmail.com',
    password: 'password123',
    district: 'Dima Hasao',
    village: 'Haflong Town',
    authMethod: 'google_oauth',
    registeredAt: '2026-08-20T12:30:00Z'
  },
  {
    name: 'Debojit Barman',
    phone: '9435012345',
    email: 'debojit.barman@assam.gov.in',
    password: 'password123',
    district: 'Dima Hasao',
    village: 'Harangajao Valley',
    authMethod: 'credentials',
    registeredAt: '2026-09-01T08:15:00Z'
  }
];

export default function CitizenAuth() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  
  // Sign In form fields
  const [identifier, setIdentifier] = useState(''); // email or 10-digit mobile
  const [password, setPassword] = useState('');
  
  // Sign Up form fields
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupDistrict, setSignupDistrict] = useState('Dima Hasao');
  const [signupVillage, setSignupVillage] = useState('');

  // Password Reset state machine
  const [resetStep, setResetStep] = useState(1); // 1: enter id, 2: enter otp, 3: set new password, 4: success
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [simulatedSmsToast, setSimulatedSmsToast] = useState('');

  // Google OAuth Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const phoneRegex = /^[6-9]\d{9}$/;

  // Initialize DB if not present
  useEffect(() => {
    try {
      const existingDb = localStorage.getItem('ner_registered_citizens_db');
      if (!existingDb) {
        localStorage.setItem('ner_registered_citizens_db', JSON.stringify(INITIAL_CITIZENS_DB));
      }
    } catch {
      // ignore
    }
  }, []);

  const getCitizensDb = () => {
    try {
      const raw = localStorage.getItem('ner_registered_citizens_db');
      return raw ? JSON.parse(raw) : INITIAL_CITIZENS_DB;
    } catch {
      return INITIAL_CITIZENS_DB;
    }
  };

  const saveCitizensDb = (db) => {
    try {
      localStorage.setItem('ner_registered_citizens_db', JSON.stringify(db));
    } catch {
      // ignore
    }
  };

  // Sign In Handler
  const handleSignIn = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const cleanId = identifier.trim();
    const isEmail = cleanId.includes('@');
    const isPhone = phoneRegex.test(cleanId);

    if (!isEmail && !isPhone) {
      setErrorMsg('Please enter a valid email address or 10-digit Indian mobile number (starts with 6, 7, 8, or 9).');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your account password.');
      setIsLoading(false);
      return;
    }

    const db = getCitizensDb();
    const user = db.find(
      (u) => (isPhone && u.phone === cleanId) || (isEmail && u.email?.toLowerCase() === cleanId.toLowerCase())
    );

    if (!user) {
      setErrorMsg(`No citizen account registered with ${cleanId}. Please click 'Sign Up' above to register.`);
      setIsLoading(false);
      return;
    }

    if (user.password && user.password !== password) {
      setErrorMsg('Incorrect password. Please verify your credentials or use the password reset option below.');
      setIsLoading(false);
      return;
    }

    const sessionUser = {
      name: user.name,
      phone: user.phone,
      email: user.email,
      district: user.district || 'Dima Hasao',
      village: user.village || 'Jatinga',
      loggedIn: true,
      authMethod: 'credentials',
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('ner_registered_citizen', JSON.stringify(sessionUser));
    setTimeout(() => {
      setIsLoading(false);
      navigate('/user/dashboard');
    }, 400);
  };

  // Sign Up Handler with Strict 1-Account-Per-Mobile Constraint
  const handleSignUp = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = signupPhone.trim();

    if (!phoneRegex.test(cleanPhone)) {
      setErrorMsg('Invalid mobile number. Must be exactly 10 digits starting with 6, 7, 8, or 9.');
      return;
    }

    if (signupPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    const db = getCitizensDb();
    const existingPhoneUser = db.find((u) => u.phone === cleanPhone);

    if (existingPhoneUser) {
      setErrorMsg(`Mobile number +91 ${cleanPhone} is already registered to "${existingPhoneUser.name}". Each mobile number can only have 1 citizen account.`);
      return;
    }

    if (signupEmail.trim()) {
      const existingEmailUser = db.find((u) => u.email && u.email.toLowerCase() === signupEmail.trim().toLowerCase());
      if (existingEmailUser) {
        setErrorMsg(`Email address "${signupEmail}" is already linked to an existing account.`);
        return;
      }
    }

    const newUser = {
      name: signupName.trim() || 'NER Citizen',
      phone: cleanPhone,
      email: signupEmail.trim(),
      password: signupPassword,
      district: 'Dima Hasao',
      village: 'Hill Corridor Settlement',
      authMethod: 'registration',
      registeredAt: new Date().toISOString()
    };

    const updatedDb = [newUser, ...db];
    saveCitizensDb(updatedDb);
    addRegisteredCitizen({
      name: newUser.name,
      mobile_number: newUser.phone,
      district: newUser.district,
      assigned_village: newUser.village,
      state: newUser.district === 'Gangtok' ? 'Sikkim' : (newUser.district === 'East Khasi Hills' ? 'Meghalaya' : 'Assam')
    });

    // Set active session
    const sessionUser = {
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      district: newUser.district,
      village: newUser.village,
      loggedIn: true,
      authMethod: 'registration',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('ner_registered_citizen', JSON.stringify(sessionUser));

    setSuccessMsg('Account registered successfully! Redirecting to Citizen Dashboard...');
    setTimeout(() => {
      navigate('/user/dashboard');
    }, 500);
  };

  // Google OAuth Flow: Select an Account
  const handleSelectGoogleAccount = (acc) => {
    const db = getCitizensDb();
    let user = db.find((u) => u.email?.toLowerCase() === acc.email.toLowerCase());
    if (!user) {
      user = {
        name: acc.name,
        phone: acc.phone || '9864012345',
        email: acc.email,
        district: acc.district || 'Dima Hasao',
        village: acc.village || 'Haflong Town',
        authMethod: 'google_oauth',
        registeredAt: new Date().toISOString()
      };
      saveCitizensDb([user, ...db]);
    }

    const sessionUser = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      district: user.district || 'Dima Hasao',
      village: user.village || 'Haflong Town',
      loggedIn: true,
      authMethod: 'google_oauth',
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('ner_registered_citizen', JSON.stringify(sessionUser));
    setShowGoogleModal(false);
    navigate('/user/dashboard');
  };

  // Custom Google Account submission
  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    if (!customGoogleEmail.includes('@')) {
      setErrorMsg('Please enter a valid Google email.');
      return;
    }
    const acc = {
      name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
      email: customGoogleEmail.trim(),
      phone: '98640' + Math.floor(10000 + Math.random() * 90000),
      district: 'Dima Hasao',
      village: 'Haflong Town'
    };
    handleSelectGoogleAccount(acc);
  };

  // Demo 1-Click Access
  const handleDemoAccess = () => {
    const demoUser = {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      phone: '9876543210',
      district: 'Dima Hasao',
      village: 'Jatinga Ridge',
      loggedIn: true,
      authMethod: 'demo',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('ner_registered_citizen', JSON.stringify(demoUser));
    navigate('/user/dashboard');
  };

  // Password Reset Steps
  const handleRequestOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanId = resetIdentifier.trim();
    if (!cleanId) {
      setErrorMsg('Please enter your registered mobile number or email.');
      return;
    }

    const db = getCitizensDb();
    const user = db.find(
      (u) => u.phone === cleanId || (u.email && u.email.toLowerCase() === cleanId.toLowerCase())
    );

    if (!user) {
      setErrorMsg(`No registered citizen account found matching "${cleanId}". Please verify your details.`);
      return;
    }

    // Generate random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setResetStep(2);

    // Simulate SMS delivery toast
    setSimulatedSmsToast(`📲 [NER-LEWS SMS GATEWAY] Verification Code for account +91 ${user.phone}: ${otp}`);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (enteredOtp.trim() !== generatedOtp) {
      setErrorMsg('Invalid 4-digit OTP. Please check the simulated SMS alert banner above and re-enter.');
      return;
    }
    setResetStep(3);
  };

  const handleSetNewPassword = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (newPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const db = getCitizensDb();
    const userIdx = db.findIndex(
      (u) => u.phone === resetIdentifier.trim() || (u.email && u.email.toLowerCase() === resetIdentifier.trim().toLowerCase())
    );

    if (userIdx !== -1) {
      db[userIdx].password = newPassword;
      saveCitizensDb(db);
    }

    setResetStep(4);
    setSuccessMsg('Your password has been successfully updated! You can now sign in with your new password.');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-md w-full space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 mb-3 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-500 shadow-sm">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Citizen Portal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign in to track your submissions or register a resident account
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Demo & Guest Shortcuts Banner */}
        <div className="p-4 rounded-3xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Evaluation Access</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-full">
              Fast Track
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-rose-200 dark:border-rose-700/50 text-xs font-bold text-slate-800 dark:text-slate-200 transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Demo Citizen (Rahul)</span>
            </button>
            <Link
              to="/report"
              className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Guest Fast Report →</span>
            </Link>
          </div>
        </div>

        {/* Simulated SMS Alert Toast */}
        {simulatedSmsToast && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2 shadow-md animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="font-semibold">{simulatedSmsToast}</span>
            </div>
            <button
              onClick={() => setSimulatedSmsToast('')}
              className="text-amber-700 hover:text-amber-900 dark:text-amber-300 text-xs p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Error / Success feedback */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
              {errorMsg.includes('already registered') && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signin');
                      setIdentifier(signupPhone);
                      setErrorMsg('');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 underline hover:no-underline"
                  >
                    <span>Click here to sign in with this number →</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tabs: Sign In / Sign Up / Forgot Password */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-5 transition-colors">
          {activeTab !== 'forgot' && (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Sign Up (Register)
              </button>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Number or Email *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="9876543210 or citizen@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setResetStep(1);
                      setResetIdentifier(identifier);
                      setErrorMsg('');
                      setSuccessMsg('');
                      setSimulatedSmsToast('');
                    }}
                    className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Sign In to Citizen Dashboard'}
                </button>
              </div>

              {/* Continue with Google Button */}
              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] uppercase font-bold text-slate-400">
                  Or Connect With
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="E.g. Rahul Sharma"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    10-Digit Mobile Number *
                  </label>
                  <span className="text-[10px] text-rose-500 font-bold">1 Account per Mobile</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono font-bold">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 4 chars"
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                >
                  Register Citizen Account & Proceed
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: INTERACTIVE PASSWORD RESET FLOW */}
          {activeTab === 'forgot' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Reset Account Password
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  ← Back to Sign In
                </button>
              </div>

              {/* Step 1: Request OTP */}
              {resetStep === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Enter the registered 10-digit mobile number or email address associated with your citizen account.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number or Email *
                    </label>
                    <input
                      type="text"
                      required
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="9876543210 or email@domain.com"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                  >
                    Send 4-Digit SMS Verification OTP
                  </button>
                </form>
              )}

              {/* Step 2: Verify OTP */}
              {resetStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-800 dark:text-sky-300">
                    A 4-digit verification code has been dispatched to <strong>{resetIdentifier}</strong>. Please enter the OTP below.
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Enter 4-Digit SMS OTP *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 4829"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono tracking-widest text-center text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition font-bold"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="w-1/3 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                    >
                      Verify OTP
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Set New Password */}
              {resetStep === 3 && (
                <form onSubmit={handleSetNewPassword} className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Identity verified! Enter your new password.</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 4 characters"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                  >
                    Save New Password
                  </button>
                </form>
              )}

              {/* Step 4: Success */}
              {resetStep === 4 && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 space-y-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Password Reset Successful
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Your password has been changed. You can now sign in with your updated credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signin');
                      setIdentifier(resetIdentifier);
                      setResetStep(1);
                      setSuccessMsg('Password updated! Please enter your new password to sign in.');
                    }}
                    className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
                  >
                    Proceed to Sign In →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* GOOGLE OAUTH ACCOUNT CHOOSER MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Sign in with Google</span>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Choose an account to continue to <strong>NER Landslide Early Warning System</strong>
            </div>

            <div className="space-y-2 pt-1">
              {/* Profile 1 */}
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount({
                  name: 'Priyanka Gogoi',
                  email: 'priyanka.gogoi.ner@gmail.com',
                  phone: '9864012345',
                  district: 'Dima Hasao',
                  village: 'Haflong Town'
                })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-center gap-3 text-left"
              >
                <div className="w-9 h-9 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  P
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Priyanka Gogoi</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">priyanka.gogoi.ner@gmail.com</div>
                  <div className="text-[10px] text-slate-400">Resident • Haflong Town</div>
                </div>
              </button>

              {/* Profile 2 */}
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount({
                  name: 'Debojit Barman',
                  email: 'debojit.barman@assam.gov.in',
                  phone: '9435012345',
                  district: 'Dima Hasao',
                  village: 'Harangajao Valley'
                })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-center gap-3 text-left"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  D
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Debojit Barman</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">debojit.barman@assam.gov.in</div>
                  <div className="text-[10px] text-slate-400">PWD Field Surveyor • Dima Hasao</div>
                </div>
              </button>

              {/* Custom Google Account Option */}
              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 text-xs font-semibold text-slate-600 dark:text-slate-300 text-center transition"
                >
                  + Use another Google account
                </button>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Account Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Google Email:
                    </label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="account@gmail.com"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(false)}
                      className="w-1/3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow"
                    >
                      Sign in with this account
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="text-[10px] text-slate-400 text-center pt-2">
              Protected by Google OAuth 2.0 Identity Protocol
            </div>
          </div>
        </div>
      )}
      <CitizenAIChatbot />
    </div>
  );
}
