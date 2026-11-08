import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertTriangle, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const { loginWithPassword, requestVerification, verifyCode } = useAuth();

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP state (for fallback option)
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Primary: Email & Password Sign-in
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      await loginWithPassword(email.trim(), password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Secondary: OTP Request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');
    setDebugOtp(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your administrator email.');
      return;
    }

    try {
      setLoading(true);
      const res = await requestVerification(email.trim());
      setSuccessNotice(res.message);
      if (res.debugOtp) setDebugOtp(res.debugOtp);
      setOtpStep('code');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Secondary: OTP Verify
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpCode.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      await verifyCode(email.trim(), otpCode.trim());
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Incorrect code or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80">
        {/* Header Icon */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyanCustom-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/30 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Clinic Admin Portal
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Secure Clinic Management & Appointment Console
          </p>
        </div>

        {/* Security Policy Alert (Private & Confidential: Admin email removed from public display) */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <Lock className="w-3.5 h-3.5" />
            <span>Authorized Personnel Only</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Administrative access is strictly restricted to authorized clinic staff. Unauthorized attempts are blocked by security protocols.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Success Notice */}
        {successNotice && (
          <div className="flex items-start gap-2.5 p-3.5 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-brand-600" />
            <span className="leading-snug">{successNotice}</span>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'password'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'otp'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Email OTP Code
          </button>
        </div>

        {/* Primary Method: Email & Password */}
        {authMode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@clinic.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-navy-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-navy-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-cyanCustom-600 hover:from-brand-700 hover:to-cyanCustom-700 shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Secondary Method: Email OTP */
          otpStep === 'email' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@clinic.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-navy-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    6-Digit Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpStep('email')}
                    className="text-xs text-brand-600 hover:underline font-semibold"
                  >
                    Change Email
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-center font-mono font-bold tracking-[0.4em] text-lg text-navy-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {debugOtp && (
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <span className="text-brand-800">Preview OTP: <strong className="font-mono text-brand-900">{debugOtp}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(debugOtp)}
                    className="px-2 py-0.5 bg-brand-600 text-white rounded font-bold text-[11px]"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            </form>
          )
        )}

        <div className="text-center pt-2">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            ← Return to Public Website
          </a>
        </div>
      </div>
    </div>
  );
};
