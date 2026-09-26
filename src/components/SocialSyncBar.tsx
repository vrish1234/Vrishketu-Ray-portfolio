import React from 'react';
import { 
  Instagram, 
  Linkedin, 
  RefreshCw, 
  FolderGit2, 
  Sparkles, 
  ArrowRight,
  Radio
} from 'lucide-react';
import { Language, ProjectsSubTab } from '../types';

interface SocialSyncBarProps {
  githubCount: number;
  instagramCount: number;
  linkedinCount: number;
  onSelectTab: (tab: ProjectsSubTab) => void;
  activeSubTab?: ProjectsSubTab;
  onGlobalSync?: () => Promise<void>;
  isSyncing?: boolean;
  onOpenConnectModal?: () => void;
  isUserOnlyMode?: boolean;
  language: Language;
}

export const SocialSyncBar: React.FC<SocialSyncBarProps> = ({
  githubCount,
  instagramCount,
  linkedinCount,
  onSelectTab,
  activeSubTab,
  onGlobalSync,
  isSyncing = false,
  onOpenConnectModal,
  isUserOnlyMode = false,
  language
}) => {
  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Status Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{language === 'hi' ? 'लाइव सोशल व कोड सिंक' : 'Live Social & Code Ecosystem'}</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {isUserOnlyMode ? (language === 'hi' ? 'केवल मेरी ID' : 'USER ID ONLY') : 'LIVE ACTIVE'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              {language === 'hi' 
                ? 'गिटहब, इंस्टाग्राम रील्स और लिंक्डइन अपडेट्स आपकी ID से सीधे जुड़े हैं' 
                : 'GitHub repositories, Instagram reels, and LinkedIn updates linked to your real handles'}
            </p>
          </div>
        </div>

        {/* Platform Buttons Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* GitHub Pill */}
          <button
            onClick={() => onSelectTab('github')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              activeSubTab === 'github'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                : 'bg-gray-950 text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
            <span>GitHub</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
              {githubCount}
            </span>
          </button>

          {/* Instagram Pill */}
          <button
            onClick={() => onSelectTab('instagram')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              activeSubTab === 'instagram'
                ? 'bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/30'
                : 'bg-gray-950 text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
            }`}
          >
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>Instagram</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 font-mono font-bold">
              {instagramCount}
            </span>
          </button>

          {/* LinkedIn Pill */}
          <button
            onClick={() => onSelectTab('linkedin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              activeSubTab === 'linkedin'
                ? 'bg-[#0A66C2] text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-gray-950 text-gray-300 hover:text-white hover:bg-gray-800 border-gray-800'
            }`}
          >
            <Linkedin className="w-3.5 h-3.5 text-blue-400" />
            <span>LinkedIn</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold">
              {linkedinCount}
            </span>
          </button>

          {/* Connect / Change My Real ID Button */}
          {onOpenConnectModal && (
            <button
              onClick={onOpenConnectModal}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'मेरी ID सेट करें' : 'Connect My ID'}</span>
            </button>
          )}

          {/* Global Refresh Sync Button */}
          {onGlobalSync && (
            <button
              onClick={onGlobalSync}
              disabled={isSyncing}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium border border-gray-700 transition flex items-center gap-1.5 disabled:opacity-50"
              title={language === 'hi' ? 'सभी सोशल व कोड सिंक करें' : 'Sync All Live Channels'}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? (language === 'hi' ? 'सिंक...' : 'Syncing...') : (language === 'hi' ? 'सिंक' : 'Sync All')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
