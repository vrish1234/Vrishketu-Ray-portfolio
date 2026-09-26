import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: () => void;
  language: Language;
}

// Exact admin credentials as requested
export const ADMIN_CREDENTIALS = {
  email: 'vrishketuray000@gmail.com',
  password: 'Vrish@1234'
};

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  language
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Verification against exact requested credentials
    if (
      trimmedEmail === ADMIN_CREDENTIALS.email.toLowerCase() &&
      trimmedPassword === ADMIN_CREDENTIALS.password
    ) {
      setLoginSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setLoginSuccess(false);
        onSuccessLogin();
        onClose();
      }, 700);
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        setErrorMsg(
          language === 'hi'
            ? 'गलत ईमेल या पासवर्ड! कृपया सही एडमिन क्रेडेंशियल्स दर्ज करें।'
            : 'Incorrect email or password. Please verify admin credentials.'
        );
      }, 300);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setErrorMsg(null);
    setEmail('');
    setPassword('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
    >
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition"
          aria-label="Close Login Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md shadow-blue-500/10 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 id="admin-login-title" className="text-xl font-bold text-white font-heading tracking-tight">
              {language === 'hi' ? 'एडमिन प्रमाणीकरण' : 'Admin Portal Login'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {language === 'hi' 
                ? 'सुरक्षित एडमिन डैशबोर्ड तक पहुँचने के लिए लॉगिन करें।' 
                : 'Enter your credentials to access the management dashboard.'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">{language === 'hi' ? 'प्रमाणीकरण विफल' : 'Access Denied'}</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {loginSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="font-semibold">
              {language === 'hi' ? 'लॉगिन सफल! एडमिन डैशबोर्ड लोड हो रहा है...' : 'Credentials verified! Launching Admin Panel...'}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-300">
              {language === 'hi' ? 'एडमिन ईमेल (Email)' : 'Admin Email'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                autoComplete="email"
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-950/90 border border-gray-700/80 rounded-xl text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-300">
                {language === 'hi' ? 'पासवर्ड (Password)' : 'Password'}
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-950/90 border border-gray-700/80 rounded-xl text-white text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || loginSuccess}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === 'hi' ? 'सत्यापित किया जा रहा है...' : 'Authenticating...'}</span>
                </>
              ) : loginSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{language === 'hi' ? 'सफलतापूर्वक लॉग इन' : 'Access Granted'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{language === 'hi' ? 'डैशबोर्ड में प्रवेश करें' : 'Unlock Admin Dashboard'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="pt-3 border-t border-gray-800 text-center">
          <p className="text-[11px] text-gray-500">
            {language === 'hi'
              ? 'यह पोर्टल केवल व्यवस्थापक (Admin) के उपयोग हेतु संरक्षित है।'
              : 'Restricted area. Authorized administrator access only.'}
          </p>
        </div>
      </div>
    </div>
  );
};
