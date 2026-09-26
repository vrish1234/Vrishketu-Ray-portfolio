import React, { useState } from 'react';
import { 
  GitFork, 
  Star, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  Code2, 
  Sparkles, 
  FolderGit2, 
  Globe, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { GitHubRepo, Language } from '../types';
import { GitHubUserProfile } from '../lib/socialSync';

interface GitHubFeedProps {
  repos: GitHubRepo[];
  username: string;
  userProfile?: GitHubUserProfile | null;
  onSync: () => Promise<void>;
  isSyncing: boolean;
  language: Language;
  lastSynced?: string;
  onOpenConnectModal?: () => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  React: '#61dafb',
  default: '#8b949e'
};

export const GitHubFeed: React.FC<GitHubFeedProps> = ({
  repos,
  username,
  userProfile,
  onSync,
  isSyncing,
  language,
  lastSynced,
  onOpenConnectModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'name'>('updated');

  // Compute statistics
  const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  
  // Extract distinct languages
  const availableLanguages = Array.from(
    new Set(repos.map(r => r.language).filter(Boolean) as string[])
  );

  // Filtering
  const filteredRepos = repos
    .filter(repo => {
      const matchesSearch = 
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (repo.topics && repo.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesLanguage = selectedLanguage === 'all' || repo.language === selectedLanguage;
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      if (sortBy === 'stars') return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 2) return language === 'hi' ? 'अभी-अभी' : 'Just now';
      if (diffMins < 60) return language === 'hi' ? `${diffMins} मिनट पहले` : `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return language === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return language === 'hi' ? `${diffDays} दिन पहले` : `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900/90 to-purple-950/20 border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gray-950 border border-gray-700/80 p-2.5 flex items-center justify-center text-white shadow-inner">
                {/* GitHub Invertocat SVG */}
                <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-gray-900" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight font-heading">
                  {language === 'hi' ? 'गिटहब लाइव रिपॉजिटरी सिंक' : 'GitHub Live Repositories'}
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  LIVE API
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                <span>@{username}</span>
                <span>•</span>
                <span>
                  {language === 'hi'
                    ? 'गिटहब पर किया गया हर कोड व प्रोजेक्ट बदलाव यहाँ अपने आप सिंक होता है'
                    : 'Real-time synchronization with public codebases, commits & releases'}
                </span>
              </p>
            </div>
          </div>

          {/* Sync Trigger, ID Connect & External GitHub Link */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {onOpenConnectModal && (
              <button
                onClick={onOpenConnectModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{language === 'hi' ? 'मेरी GitHub ID बदलें' : 'Set My Username'}</span>
              </button>
            )}

            <button
              onClick={onSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white text-xs font-semibold border border-gray-700 transition shadow-sm hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (language === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...') : (language === 'hi' ? 'गिटहब सिंक करें' : 'Sync GitHub')}</span>
            </button>

            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95"
            >
              <span>{language === 'hi' ? 'गिटहब प्रोफाइल' : 'Open GitHub'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-800/80">
          <div className="bg-gray-950/60 rounded-xl p-3 border border-gray-800/60">
            <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium">
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'hi' ? 'कुल रिपॉजिटरी' : 'Public Repos'}</span>
            </div>
            <div className="text-xl font-bold text-white mt-1 font-mono">{repos.length}</div>
          </div>

          <div className="bg-gray-950/60 rounded-xl p-3 border border-gray-800/60">
            <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? 'कुल स्टार्स' : 'Total Stars'}</span>
            </div>
            <div className="text-xl font-bold text-amber-300 mt-1 font-mono">{totalStars}</div>
          </div>

          <div className="bg-gray-950/60 rounded-xl p-3 border border-gray-800/60">
            <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium">
              <GitFork className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === 'hi' ? 'फॉर्क्स' : 'Total Forks'}</span>
            </div>
            <div className="text-xl font-bold text-purple-300 mt-1 font-mono">{totalForks}</div>
          </div>

          <div className="bg-gray-950/60 rounded-xl p-3 border border-gray-800/60">
            <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'hi' ? 'अंतिम सिंक' : 'Last Synced'}</span>
            </div>
            <div className="text-xs font-semibold text-emerald-300 mt-1 truncate">
              {lastSynced ? formatRelativeTime(lastSynced) : (language === 'hi' ? 'सक्रिय' : 'Live')}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'रिपॉजिटरी, विवरण या टैग द्वारा खोजें...' : 'Search repos by name, tech or topic...'}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedLanguage('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              selectedLanguage === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {language === 'hi' ? 'सभी भाषाएं' : 'All Tech'}
          </button>
          {availableLanguages.map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
                selectedLanguage === lang
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.default }}
              />
              <span>{lang}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRepos.length === 0 ? (
          <div className="col-span-full bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <p className="text-gray-200 font-bold text-base">
                {language === 'hi' 
                  ? `@${username} के लिए कोई पब्लिक रिपॉजिटरी नहीं मिली` 
                  : `No public repositories found for @${username}`}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {language === 'hi' 
                  ? 'यदि आपका गिटहब यूजरनेम अलग है, तो नीचे दिए गए बटन से अपना सही यूजरनेम दर्ज करें ताकि केवल आपकी अपनी असली रिपॉजिटरी ही दिखें।' 
                  : 'If you use a different GitHub handle, connect your real username so only your actual public code projects appear here.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onOpenConnectModal && (
                <button
                  onClick={onOpenConnectModal}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'मेरी सही GitHub ID डालें' : 'Set My Correct Username'}</span>
                </button>
              )}

              <button
                onClick={onSync}
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{language === 'hi' ? 'पुनः प्रयास करें' : 'Retry Live Sync'}</span>
              </button>
            </div>
          </div>
        ) : (
          filteredRepos.map(repo => (
            <div
              key={repo.id}
              className="bg-gray-900/90 hover:bg-gray-900 border border-gray-800 hover:border-gray-700/80 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between gap-4 group"
            >
              <div className="space-y-2.5">
                {/* Repo Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderGit2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm sm:text-base font-bold text-white hover:text-blue-400 transition truncate group-hover:underline flex items-center gap-1"
                    >
                      <span className="truncate">{repo.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700/60 shrink-0">
                    Public
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {repo.description || (language === 'hi' ? 'कोई विवरण प्रदान नहीं किया गया।' : 'No description provided for this codebase.')}
                </p>

                {/* Topics Cloud */}
                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {repo.topics.slice(0, 4).map(topic => (
                      <span
                        key={topic}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20"
                      >
                        #{topic}
                      </span>
                    ))}
                    {repo.topics.length > 4 && (
                      <span className="text-[10px] text-gray-500 font-mono px-1 py-0.5">
                        +{repo.topics.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Repo Footer Info */}
              <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-3">
                  {repo.language && (
                    <div className="flex items-center gap-1.5 font-medium">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || LANGUAGE_COLORS.default }}
                      />
                      <span>{repo.language}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-gray-400 font-mono text-[11px]">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>{repo.stargazers_count || 0}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-400 font-mono text-[11px]">
                    <GitFork className="w-3.5 h-3.5 text-purple-400" />
                    <span>{repo.forks_count || 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-semibold transition"
                      title="Live Demo / Deployment"
                    >
                      <Globe className="w-3 h-3" />
                      <span>{language === 'hi' ? 'डेमो' : 'Demo'}</span>
                    </a>
                  )}

                  <span className="text-[11px] text-gray-500 font-mono">
                    {formatRelativeTime(repo.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
