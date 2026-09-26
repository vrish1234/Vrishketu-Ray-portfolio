import React from 'react';
import { Database, HardDrive, Languages, LogOut, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface NavbarProps {
  activeTab: 'portfolio' | 'admin';
  onTabChange: (tab: 'portfolio' | 'admin') => void;
  isSupabaseConnected: boolean;
  onOpenSupabaseModal: () => void;
  language: Language;
  onToggleLanguage: () => void;
  isAdminAuthenticated: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isSupabaseConnected,
  onOpenSupabaseModal,
  language,
  onToggleLanguage,
  isAdminAuthenticated,
  onLogout
}) => {
  return (
    <nav className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap justify-between items-center gap-3">
        {/* Brand */}
        <div 
          onClick={() => onTabChange('portfolio')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg font-heading tracking-wide group-hover:scale-105 transition-transform">
            VR
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                Vrishketu<span className="text-blue-400">.dev</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 -mt-0.5 hidden sm:block">
              {language === 'hi' ? 'फुल-स्टैक और एडटेक उद्यमी' : 'Full-Stack & EdTech Portfolio'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Storage / Supabase Status Badge (Admin only) */}
          {isAdminAuthenticated && (
            <button
              onClick={onOpenSupabaseModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Database Connection Settings"
            >
              {isSupabaseConnected ? (
                <>
                  <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="hidden md:inline">Supabase Live</span>
                  <span className="md:hidden">Supabase</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Local Storage (Click to sync Supabase)</span>
                  <span className="md:hidden">Local DB</span>
                </>
              )}
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-800 text-gray-300 text-xs font-medium border border-gray-700 transition"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'hi' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* Authenticated Admin Controls */}
          {isAdminAuthenticated && (
            <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-xl border border-gray-800 animate-fade-in">
              <button
                onClick={() => onTabChange('portfolio')}
                id="btn-portfolio"
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                  activeTab === 'portfolio'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                {language === 'hi' ? 'पोर्टफोलियो' : 'Portfolio'}
              </button>
              <button
                onClick={() => onTabChange('admin')}
                id="btn-admin"
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'hi' ? 'एडमिन पैनल' : 'Admin'}</span>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                title={language === 'hi' ? 'एडमिन से लॉगआउट करें' : 'Logout Admin Session'}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
