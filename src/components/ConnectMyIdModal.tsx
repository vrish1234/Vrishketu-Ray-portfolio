import React, { useState } from 'react';
import { 
  X, 
  FolderGit2, 
  Instagram, 
  Linkedin, 
  Check, 
  RefreshCw, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import { SocialSyncConfig, GitHubRepo, InstagramItem, LinkedInPost, Language } from '../types';

interface ConnectMyIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  socialConfig: SocialSyncConfig;
  onUpdateSocialConfig: (config: Partial<SocialSyncConfig>) => Promise<void>;
  onSyncGitHub: (username?: string) => Promise<void>;
  isSyncingGitHub: boolean;
  onClearSampleData: () => void;
  onRestoreSampleData: () => void;
  onAddInstagram: (item: Omit<InstagramItem, 'id' | 'timestamp'>) => void;
  onAddLinkedIn: (post: Omit<LinkedInPost, 'id' | 'published_at'>) => void;
  githubReposCount: number;
  instagramCount: number;
  linkedinCount: number;
  language: Language;
}

export const ConnectMyIdModal: React.FC<ConnectMyIdModalProps> = ({
  isOpen,
  onClose,
  socialConfig,
  onUpdateSocialConfig,
  onSyncGitHub,
  isSyncingGitHub,
  onClearSampleData,
  onRestoreSampleData,
  onAddInstagram,
  onAddLinkedIn,
  githubReposCount,
  instagramCount,
  linkedinCount,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'ids' | 'quick_add' | 'cleanup'>('ids');

  // ID states
  const [githubUser, setGithubUser] = useState(socialConfig.github_username || '');
  const [instagramUser, setInstagramUser] = useState(socialConfig.instagram_username || '');
  const [linkedinUrl, setLinkedinUrl] = useState(socialConfig.linkedin_profile_url || '');
  const [onlyRealPosts, setOnlyRealPosts] = useState(!!socialConfig.hide_sample_posts);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Quick Add State (Instagram / LinkedIn link)
  const [quickPlatform, setQuickPlatform] = useState<'instagram' | 'linkedin'>('instagram');
  const [quickLink, setQuickLink] = useState('');
  const [quickMediaUrl, setQuickMediaUrl] = useState('');
  const [quickCaption, setQuickCaption] = useState('');
  const [quickType, setQuickType] = useState<'REEL' | 'IMAGE'>('REEL');

  if (!isOpen) return null;

  const handleSaveIds = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    const cleanGh = githubUser.trim().replace(/^@/, '');
    const cleanIg = instagramUser.trim().replace(/^@/, '');
    const cleanLi = linkedinUrl.trim();

    try {
      await onUpdateSocialConfig({
        github_username: cleanGh,
        instagram_username: cleanIg,
        linkedin_profile_url: cleanLi,
        hide_sample_posts: onlyRealPosts,
        user_only_mode: onlyRealPosts
      });

      if (cleanGh) {
        await onSyncGitHub(cleanGh);
      }

      setStatusMsg({
        type: 'success',
        text: language === 'hi' 
          ? 'आपकी असली IDs सहेज दी गईं और गिटहब लाइव सिंक हो गया!' 
          : 'Your live IDs updated & GitHub repositories synchronized successfully!'
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Error updating IDs'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLink.trim() && !quickMediaUrl.trim()) return;

    if (quickPlatform === 'instagram') {
      onAddInstagram({
        media_type: quickType,
        is_reel: quickType === 'REEL',
        media_url: quickMediaUrl.trim() || quickLink.trim(),
        permalink: quickLink.trim() || `https://instagram.com/${instagramUser || 'thevrishbihari'}`,
        caption: quickCaption.trim() || undefined,
        like_count: Math.floor(Math.random() * 200) + 50,
        comments_count: Math.floor(Math.random() * 25) + 5
      });
      setStatusMsg({
        type: 'success',
        text: language === 'hi' ? 'इंस्टाग्राम पोस्ट फ़ीड में जुड़ गई!' : 'Instagram post added to feed!'
      });
    } else {
      onAddLinkedIn({
        author_name: 'Vrishketu Ray',
        author_title: 'Full-Stack Developer & Founder',
        content: quickCaption.trim() || `Check out my latest post on LinkedIn: ${quickLink.trim()}`,
        post_url: quickLink.trim() || linkedinUrl || 'https://linkedin.com',
        image_url: quickMediaUrl.trim() || undefined,
        likes_count: Math.floor(Math.random() * 80) + 30,
        comments_count: Math.floor(Math.random() * 15) + 3
      });
      setStatusMsg({
        type: 'success',
        text: language === 'hi' ? 'लिंक्डइन अपडेट फ़ीड में जुड़ गया!' : 'LinkedIn update added to feed!'
      });
    }

    setQuickLink('');
    setQuickMediaUrl('');
    setQuickCaption('');
    setTimeout(() => setStatusMsg(null), 3500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-gray-900 via-blue-950/30 to-purple-950/20 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {language === 'hi' ? 'मेरी असली ID कनेक्ट करें' : 'Connect My Real Accounts'}
              </h3>
              <p className="text-xs text-gray-400">
                {language === 'hi' 
                  ? 'अपनी असली गिटहब, इंस्टाग्राम और लिंक्डइन ID जोड़ें और सैंपल पोस्ट हटाएं' 
                  : 'Link your actual handles so only YOUR real content shows'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center border-b border-gray-800 px-6 pt-3 gap-2 bg-gray-950/50">
          <button
            onClick={() => setActiveTab('ids')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'ids'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {language === 'hi' ? '1. असली ID सेटिंग्स' : '1. My Real IDs'}
          </button>
          <button
            onClick={() => setActiveTab('quick_add')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'quick_add'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? '2. लिंक से पोस्ट जोड़ें' : '2. Add Post via Link'}</span>
          </button>
          <button
            onClick={() => setActiveTab('cleanup')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'cleanup'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? '3. सैंपल डेटा हटाएं' : '3. Clean Sample Data'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {statusMsg && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 animate-fade-in ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* TAB 1: ID CONFIG */}
          {activeTab === 'ids' && (
            <form onSubmit={handleSaveIds} className="space-y-4">
              {/* GitHub Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-purple-400" />
                    <span>{language === 'hi' ? 'आपका गिटहब यूजरनेम (GitHub Username):' : 'Your GitHub Username:'}</span>
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {githubReposCount} repos
                  </span>
                </label>
                <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white">
                  <span className="text-gray-500 mr-1 font-mono">https://github.com/</span>
                  <input
                    type="text"
                    value={githubUser}
                    onChange={(e) => setGithubUser(e.target.value)}
                    placeholder="e.g. Vrishketu01 or vrishketu-hub"
                    className="bg-transparent outline-none flex-1 text-white font-mono"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  {language === 'hi'
                    ? 'यहाँ अपनी गिटहब ID डालें। सिंक करने पर आपकी असली रिपॉजिटरी तुरंत लोड होंगी।'
                    : 'Enter your exact GitHub username to load all your public repositories.'}
                </p>
              </div>

              {/* Instagram Handle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Instagram className="w-4 h-4 text-pink-400" />
                    <span>{language === 'hi' ? 'आपका इंस्टाग्राम यूजरनेम (Instagram Handle):' : 'Your Instagram Handle:'}</span>
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {instagramCount} posts
                  </span>
                </label>
                <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white">
                  <span className="text-gray-500 mr-1 font-mono">@</span>
                  <input
                    type="text"
                    value={instagramUser}
                    onChange={(e) => setInstagramUser(e.target.value)}
                    placeholder="e.g. thevrishbihari"
                    className="bg-transparent outline-none flex-1 text-white font-mono"
                  />
                </div>
              </div>

              {/* LinkedIn Profile URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Linkedin className="w-4 h-4 text-blue-400" />
                    <span>{language === 'hi' ? 'आपकी लिंक्डइन प्रोफाइल URL:' : 'Your LinkedIn Profile URL:'}</span>
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {linkedinCount} updates
                  </span>
                </label>
                <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white">
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="bg-transparent outline-none flex-1 text-white font-mono"
                  />
                </div>
              </div>

              {/* Toggle: Only Real Posts Mode */}
              <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'hi' ? 'केवल मेरी असली ID की पोस्ट दिखाएं' : 'Show Only My Real Posts'}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {language === 'hi' 
                      ? 'सैंपल/डेमो प्रोजेक्ट्स और पोस्ट्स को फ़ीड से पूरी तरह छुपाएं' 
                      : 'Hides all demo placeholder posts and displays only your connected content'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyRealPosts}
                    onChange={(e) => setOnlyRealPosts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSaving || isSyncingGitHub}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSaving || isSyncingGitHub ? 'animate-spin' : ''}`} />
                <span>
                  {isSaving || isSyncingGitHub 
                    ? (language === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...') 
                    : (language === 'hi' ? 'सहेजें व मेरी ID की पोस्ट लोड करें' : 'Save & Fetch My Content Now')}
                </span>
              </button>
            </form>
          )}

          {/* TAB 2: QUICK ADD POST FROM LINK */}
          {activeTab === 'quick_add' && (
            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickPlatform('instagram')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    quickPlatform === 'instagram'
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-950 text-gray-400 border border-gray-800'
                  }`}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickPlatform('linkedin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    quickPlatform === 'linkedin'
                      ? 'bg-[#0A66C2] text-white'
                      : 'bg-gray-950 text-gray-400 border border-gray-800'
                  }`}
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </button>
              </div>

              {quickPlatform === 'instagram' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickType('REEL')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      quickType === 'REEL' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'text-gray-400'
                    }`}
                  >
                    🎬 Reel (Video)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickType('IMAGE')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      quickType === 'IMAGE' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-gray-400'
                    }`}
                  >
                    📸 Photo
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  {quickPlatform === 'instagram' ? 'इंस्टाग्राम पोस्ट/रील लिंक (Post Link):' : 'लिंक्डइन पोस्ट लिंक (Post URL):'}
                </label>
                <input
                  type="url"
                  value={quickLink}
                  onChange={(e) => setQuickLink(e.target.value)}
                  placeholder={quickPlatform === 'instagram' ? 'https://instagram.com/reel/...' : 'https://linkedin.com/posts/...'}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  {quickPlatform === 'instagram' ? 'मीडिया URL (Video MP4 या Photo लिंक):' : 'इमेज URL (वैकल्पिक):'}
                </label>
                <input
                  type="url"
                  value={quickMediaUrl}
                  onChange={(e) => setQuickMediaUrl(e.target.value)}
                  placeholder="https://...image.jpg or video.mp4"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  {language === 'hi' ? 'कैप्शन या विवरण (Caption):' : 'Caption / Text:'}
                </label>
                <textarea
                  rows={2}
                  value={quickCaption}
                  onChange={(e) => setQuickCaption(e.target.value)}
                  placeholder="Enter caption or post text..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'hi' ? 'फ़ीड में पोस्ट जोड़ें' : 'Add to My Feed'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: CLEANUP SAMPLE DATA */}
          {activeTab === 'cleanup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>{language === 'hi' ? 'सैंपल डेटा नियंत्रण' : 'Sample Data Management'}</span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {language === 'hi'
                    ? 'यदि आप चाहते हैं कि केवल आपकी अपनी असली पोस्ट और रिपॉजिटरी दिखाई दें, तो नीचे दिए गए बटन से सभी डिफॉल्ट सैंपल पोस्ट को तुरंत हटा सकते हैं।'
                    : 'To make sure only your own actual content appears on the site, you can permanently remove the sample placeholder posts.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClearSampleData();
                    setStatusMsg({
                      type: 'success',
                      text: language === 'hi' 
                        ? 'सभी सैंपल/डेमो पोस्ट हटा दी गईं! अब केवल आपकी असली पोस्ट दिखाई देंगी।' 
                        : 'All sample posts cleared! Only your real posts will show.'
                    });
                  }}
                  className="p-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>{language === 'hi' ? 'सभी सैंपल पोस्ट हटाएं' : 'Remove All Sample Posts'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onRestoreSampleData();
                    setStatusMsg({
                      type: 'success',
                      text: language === 'hi' 
                        ? 'सैंपल पोस्ट रीस्टोर कर दी गईं।' 
                        : 'Sample posts restored.'
                    });
                  }}
                  className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{language === 'hi' ? 'सैंपल डेटा रीस्टोर करें' : 'Restore Sample Data'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
