import React, { useState } from 'react';
import { 
  FolderGit2, 
  Instagram, 
  Linkedin, 
  RefreshCw, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Check, 
  Film, 
  Image as ImageIcon, 
  Globe, 
  Star, 
  GitFork, 
  AlertCircle,
  Radio,
  Send,
  Save,
  CheckCircle2
} from 'lucide-react';
import { GitHubRepo, InstagramItem, LinkedInPost, SocialSyncConfig, Language } from '../types';

interface AdminSocialSyncProps {
  socialConfig: SocialSyncConfig;
  onUpdateSocialConfig: (config: Partial<SocialSyncConfig>) => Promise<void>;
  githubRepos: GitHubRepo[];
  onSyncGitHub: () => Promise<void>;
  isSyncingGitHub: boolean;
  instagramItems: InstagramItem[];
  onAddInstagramItem: (item: Omit<InstagramItem, 'id' | 'timestamp'>) => void;
  onDeleteInstagramItem: (id: string) => void;
  linkedInPosts: LinkedInPost[];
  onAddLinkedInPost: (post: Omit<LinkedInPost, 'id' | 'published_at'>) => void;
  onDeleteLinkedInPost: (id: string) => void;
  onSyncAll: () => Promise<void>;
  isSyncingAll: boolean;
  language: Language;
}

export const AdminSocialSync: React.FC<AdminSocialSyncProps> = ({
  socialConfig,
  onUpdateSocialConfig,
  githubRepos,
  onSyncGitHub,
  isSyncingGitHub,
  instagramItems,
  onAddInstagramItem,
  onDeleteInstagramItem,
  linkedInPosts,
  onAddLinkedInPost,
  onDeleteLinkedInPost,
  onSyncAll,
  isSyncingAll,
  language
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'github' | 'instagram' | 'linkedin'>('github');

  // GitHub Form
  const [githubUser, setGithubUser] = useState(socialConfig.github_username || 'vrishketu-ray');
  const [isSavingGithub, setIsSavingGithub] = useState(false);
  const [githubSuccess, setGithubSuccess] = useState(false);

  // Instagram Form
  const [instagramUser, setInstagramUser] = useState(socialConfig.instagram_username || 'thevrishbihari');
  const [newIgType, setNewIgType] = useState<'REEL' | 'IMAGE'>('REEL');
  const [newIgMediaUrl, setNewIgMediaUrl] = useState('');
  const [newIgThumbUrl, setNewIgThumbUrl] = useState('');
  const [newIgPermalink, setNewIgPermalink] = useState('');
  const [newIgCaption, setNewIgCaption] = useState('');
  const [isAddingIg, setIsAddingIg] = useState(false);

  // LinkedIn Form
  const [linkedinUrl, setLinkedinUrl] = useState(socialConfig.linkedin_profile_url || 'https://linkedin.com/in/vrishketu-ray');
  const [newLiContent, setNewLiContent] = useState('');
  const [newLiImageUrl, setNewLiImageUrl] = useState('');
  const [newLiArticleTitle, setNewLiArticleTitle] = useState('');
  const [newLiArticleUrl, setNewLiArticleUrl] = useState('');
  const [newLiPostUrl, setNewLiPostUrl] = useState('');
  const [isAddingLi, setIsAddingLi] = useState(false);

  const handleSaveGithubUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGithub(true);
    await onUpdateSocialConfig({ github_username: githubUser.trim() });
    await onSyncGitHub();
    setIsSavingGithub(false);
    setGithubSuccess(true);
    setTimeout(() => setGithubSuccess(false), 2500);
  };

  const handleAddInstagramPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIgMediaUrl.trim()) return;

    setIsAddingIg(true);
    onAddInstagramItem({
      media_type: newIgType,
      is_reel: newIgType === 'REEL',
      media_url: newIgMediaUrl.trim(),
      thumbnail_url: newIgThumbUrl.trim() || undefined,
      permalink: newIgPermalink.trim() || `https://instagram.com/${instagramUser}`,
      caption: newIgCaption.trim(),
      like_count: Math.floor(Math.random() * 200) + 150,
      comments_count: Math.floor(Math.random() * 30) + 10
    });

    setNewIgMediaUrl('');
    setNewIgThumbUrl('');
    setNewIgCaption('');
    setNewIgPermalink('');
    setIsAddingIg(false);
  };

  const handleAddLinkedInUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiContent.trim()) return;

    setIsAddingLi(true);
    onAddLinkedInPost({
      author_name: 'Vrishketu Ray',
      author_title: 'Founder at Ugrasena Educum & AI-Edura | Full-Stack Architect',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      content: newLiContent.trim(),
      post_url: newLiPostUrl.trim() || linkedinUrl,
      image_url: newLiImageUrl.trim() || undefined,
      article_url: newLiArticleUrl.trim() || undefined,
      article_title: newLiArticleTitle.trim() || undefined,
      likes_count: Math.floor(Math.random() * 90) + 60,
      comments_count: Math.floor(Math.random() * 20) + 8
    });

    setNewLiContent('');
    setNewLiImageUrl('');
    setNewLiArticleTitle('');
    setNewLiArticleUrl('');
    setNewLiPostUrl('');
    setIsAddingLi(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Global Sync Trigger */}
      <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/20 to-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-600 p-0.5 shadow-lg shadow-indigo-600/20">
              <div className="w-full h-full bg-gray-950 rounded-2xl flex items-center justify-center text-white">
                <Globe className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-heading">
                  {language === 'hi' ? 'सोशल व डेवलपर लाइव सिंक केंद्र' : 'Social & Developer Live Sync Hub'}
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  REAL-TIME SYNC
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {language === 'hi'
                  ? 'गिटहब, इंस्टाग्राम रील्स व पोस्ट्स, और लिंक्डइन अपडेट्स को सीधे पोर्टफोलियो के साथ सिंक और नियंत्रित करें'
                  : 'Manage dynamic live synchronization with GitHub codebases, Instagram media, and LinkedIn insights'}
              </p>
            </div>
          </div>

          <button
            onClick={onSyncAll}
            disabled={isSyncingAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/25 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? (language === 'hi' ? 'सभी सिंक हो रहे हैं...' : 'Syncing All...') : (language === 'hi' ? '⚡ सभी चैनल्स लाइव सिंक करें' : '⚡ Sync All Channels Now')}</span>
          </button>
        </div>

        {/* Sub-Tabs switcher */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-800">
          <button
            onClick={() => setActiveSubTab('github')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeSubTab === 'github'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/25'
                : 'bg-gray-950 text-gray-400 hover:text-white border-gray-800'
            }`}
          >
            <FolderGit2 className="w-4 h-4 text-purple-400" />
            <span>🐙 GitHub ({githubRepos.length} Repos)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('instagram')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeSubTab === 'instagram'
                ? 'bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/25'
                : 'bg-gray-950 text-gray-400 hover:text-white border-gray-800'
            }`}
          >
            <Instagram className="w-4 h-4 text-pink-400" />
            <span>📸 Instagram ({instagramItems.length} Posts)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('linkedin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeSubTab === 'linkedin'
                ? 'bg-[#0A66C2] text-white border-blue-500 shadow-md shadow-blue-600/25'
                : 'bg-gray-950 text-gray-400 hover:text-white border-gray-800'
            }`}
          >
            <Linkedin className="w-4 h-4 text-blue-400" />
            <span>💼 LinkedIn ({linkedInPosts.length} Posts)</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: GITHUB CONFIGURATION & LIVE REPOS */}
      {activeSubTab === 'github' && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-5 h-5 text-purple-400" />
                <h4 className="text-base font-bold text-white">
                  {language === 'hi' ? 'गिटहब यूजरनेम व ऑटो-सिंक सेटिंग्स' : 'GitHub Username & Live Sync Settings'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Active: @{githubUser}
              </span>
            </div>

            <form onSubmit={handleSaveGithubUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {language === 'hi' ? 'गिटहब यूजरनेम (GitHub Username):' : 'GitHub Username (Public API):'}
                  </label>
                  <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs">
                    <span className="text-gray-500 mr-1 font-mono">https://github.com/</span>
                    <input
                      type="text"
                      value={githubUser}
                      onChange={(e) => setGithubUser(e.target.value)}
                      placeholder="e.g. vrishketu-ray or thevrishbihari"
                      className="bg-transparent outline-none flex-1 text-white font-mono"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {language === 'hi'
                      ? 'सिंक दबाने पर आपके इस गिटहब अकाउंट की सभी पब्लिक रिपॉजिटरी रीयल-टाइम में लोड हो जाती हैं।'
                      : 'Public repositories from this user will be synchronized live directly from api.github.com'}
                  </p>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    disabled={isSavingGithub || isSyncingGitHub}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSavingGithub || isSyncingGitHub ? 'animate-spin' : ''}`} />
                    <span>{isSavingGithub || isSyncingGitHub ? (language === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...') : (language === 'hi' ? 'सहेजें व गिटहब सिंक करें' : 'Save & Fetch Repos')}</span>
                  </button>
                </div>
              </div>

              {githubSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {language === 'hi' 
                      ? 'गिटहब यूजरनेम सहेजा गया और नवीनतम रिपॉजिटरी सिंक हो गई हैं!' 
                      : 'GitHub username updated and live repositories synchronized successfully!'}
                  </span>
                </div>
              )}
            </form>
          </div>

          {/* Currently Synced Repos List */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <h4 className="text-base font-bold text-white flex items-center justify-between">
              <span>{language === 'hi' ? `वर्तमान में सक्रिय रिपॉजिटरी (${githubRepos.length})` : `Currently Synced Repositories (${githubRepos.length})`}</span>
              <a 
                href={`https://github.com/${githubUser}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-normal"
              >
                <span>GitHub Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </h4>

            <div className="divide-y divide-gray-800">
              {githubRepos.map(repo => (
                <div key={repo.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm truncate">{repo.name}</span>
                      {repo.language && (
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-gray-800 text-gray-300">
                          {repo.language}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">{repo.description || 'No description'}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 font-mono">
                      <span>⭐ {repo.stargazers_count} stars</span>
                      <span>🍴 {repo.forks_count} forks</span>
                      <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition text-xs flex items-center gap-1.5 self-start sm:self-center shrink-0"
                  >
                    <span>View Code</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INSTAGRAM SYNC & POSTS MANAGER */}
      {activeSubTab === 'instagram' && (
        <div className="space-y-6">
          {/* Add Instagram Media Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Instagram className="w-5 h-5 text-pink-400" />
                <h4 className="text-base font-bold text-white">
                  {language === 'hi' ? 'नया इंस्टाग्राम पोस्ट या रील जोड़ें' : 'Publish / Add Instagram Post or Reel'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2.5 py-0.5 rounded-full">
                @{instagramUser}
              </span>
            </div>

            <form onSubmit={handleAddInstagramPost} className="space-y-4">
              {/* Media Type Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewIgType('REEL')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    newIgType === 'REEL'
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                      : 'bg-gray-950 text-gray-400 border border-gray-800'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>🎬 Reel (Video)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewIgType('IMAGE')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    newIgType === 'IMAGE'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-gray-950 text-gray-400 border border-gray-800'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>📸 Photo Post</span>
                </button>
              </div>

              {/* Media URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {newIgType === 'REEL' ? 'रील वीडियो URL (MP4 / WebM):' : 'फोटो URL (Image Link):'}
                  </label>
                  <input
                    type="url"
                    value={newIgMediaUrl}
                    onChange={(e) => setNewIgMediaUrl(e.target.value)}
                    placeholder="https://...mp4 or image.jpg"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-pink-500 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {language === 'hi' ? 'इंस्टाग्राम पोस्ट लिंक (Permalink):' : 'Instagram Permalink:'}
                  </label>
                  <input
                    type="url"
                    value={newIgPermalink}
                    onChange={(e) => setNewIgPermalink(e.target.value)}
                    placeholder={`https://instagram.com/p/... or https://instagram.com/reel/...`}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-pink-500 transition"
                  />
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  {language === 'hi' ? 'कैप्शन और हैशटैग्स (Caption & Tags):' : 'Caption & Hashtags:'}
                </label>
                <textarea
                  rows={2}
                  value={newIgCaption}
                  onChange={(e) => setNewIgCaption(e.target.value)}
                  placeholder="e.g. Building AI-Edura 🚀 #TheVrishBihari #UgrasenaEducum"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-pink-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isAddingIg}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'hi' ? 'इंस्टाग्राम पोस्ट फ़ीड में जोड़ें' : 'Add to Instagram Live Feed'}</span>
              </button>
            </form>
          </div>

          {/* Synced Instagram Posts List */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <h4 className="text-base font-bold text-white flex items-center justify-between">
              <span>{language === 'hi' ? `सक्रिय इंस्टाग्राम पोस्ट्स (${instagramItems.length})` : `Active Instagram Posts (${instagramItems.length})`}</span>
              <a 
                href={`https://instagram.com/${instagramUser}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-pink-400 hover:underline flex items-center gap-1 font-normal"
              >
                <span>@{instagramUser}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {instagramItems.map(item => (
                <div key={item.id} className="p-3 rounded-2xl bg-gray-950 border border-gray-800 flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-black overflow-hidden shrink-0 border border-gray-800 flex items-center justify-center">
                    {item.is_reel ? (
                      <Film className="w-6 h-6 text-pink-400" />
                    ) : (
                      <img src={item.media_url} alt="Instagram thumbnail" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-pink-500/10 text-pink-400">
                        {item.is_reel ? 'REEL' : 'IMAGE'}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-2">{item.caption || '(No caption)'}</p>
                    <div className="flex items-center gap-3 pt-1">
                      <a 
                        href={item.permalink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => onDeleteInstagramItem(item.id)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LINKEDIN SYNC & POSTS MANAGER */}
      {activeSubTab === 'linkedin' && (
        <div className="space-y-6">
          {/* Add LinkedIn Update Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Linkedin className="w-5 h-5 text-blue-400" />
                <h4 className="text-base font-bold text-white">
                  {language === 'hi' ? 'लिंक्डइन विचार व आर्टिकल अपडेट जोड़ें' : 'Publish / Add LinkedIn Update'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                in/vrishketu-ray
              </span>
            </div>

            <form onSubmit={handleAddLinkedInUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  {language === 'hi' ? 'अपडेट या विचार सामग्री (Post Content):' : 'Update Content / Insight:'}
                </label>
                <textarea
                  rows={4}
                  value={newLiContent}
                  onChange={(e) => setNewLiContent(e.target.value)}
                  placeholder="Share tech milestones, architectural insights, or student success stories..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white text-xs outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {language === 'hi' ? 'अटैच्ड इमेज URL (वैकल्पिक):' : 'Attached Image URL (Optional):'}
                  </label>
                  <input
                    type="url"
                    value={newLiImageUrl}
                    onChange={(e) => setNewLiImageUrl(e.target.value)}
                    placeholder="https://...image.jpg"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {language === 'hi' ? 'आर्टिकल / रिसोर्स लिंक (वैकल्पिक):' : 'Article / Resource URL (Optional):'}
                  </label>
                  <input
                    type="url"
                    value={newLiArticleUrl}
                    onChange={(e) => setNewLiArticleUrl(e.target.value)}
                    placeholder="https://...article-link"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    {language === 'hi' ? 'आर्टिकल शीर्षक (वैकल्पिक):' : 'Article / Milestone Title (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={newLiArticleTitle}
                    onChange={(e) => setNewLiArticleTitle(e.target.value)}
                    placeholder="e.g. Scaling Adaptive AI-Edura"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAddingLi}
                className="w-full py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'hi' ? 'लिंक्डइन फ़ीड में प्रकाशित करें' : 'Publish to LinkedIn Feed'}</span>
              </button>
            </form>
          </div>

          {/* Synced LinkedIn Posts List */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <h4 className="text-base font-bold text-white flex items-center justify-between">
              <span>{language === 'hi' ? `सक्रिय लिंक्डइन पोस्ट्स (${linkedInPosts.length})` : `Active LinkedIn Posts (${linkedInPosts.length})`}</span>
              <a 
                href={linkedinUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-normal"
              >
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </h4>

            <div className="divide-y divide-gray-800">
              {linkedInPosts.map(post => (
                <div key={post.id} className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{post.author_name}</span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <span>👍 {post.likes_count || 120} likes</span>
                      <span>💬 {post.comments_count || 24} comments</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-blue-400 text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Post</span>
                    </a>
                    <button
                      onClick={() => onDeleteLinkedInPost(post.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
