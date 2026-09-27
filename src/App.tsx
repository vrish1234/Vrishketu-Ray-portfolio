import React, { useState, useEffect } from 'react';
import { 
  fetchProfileData, 
  fetchPostsData, 
  updateProfileData, 
  createPostData, 
  deletePostData, 
  updatePostData,
  addPostLike, 
  addPostComment,
  getStoredConfig, 
  saveStoredConfig, 
  clearStoredConfig, 
  testSupabaseConnection,
  fetchStories,
  createStory,
  deleteStory
} from './lib/supabase';
import { ProfileInfo, MediaPost, Language, Story } from './types';
import { DEFAULT_PROFILE, DEFAULT_POSTS } from './data/defaultData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProjectsFeed } from './components/ProjectsFeed';
import { ContactSection } from './components/ContactSection';
import { AdminPanel } from './components/AdminPanel';
import { SupabaseModal } from './components/SupabaseModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Tooltip } from './components/Tooltip';
import { 
  AlertTriangle, 
  Database, 
  Sparkles, 
  Heart, 
  Lock, 
  ShieldCheck, 
  Briefcase, 
  Mail,
  FolderGit2,
  Instagram,
  Linkedin
} from 'lucide-react';
import { 
  getSocialSyncConfig, 
  saveSocialSyncConfig, 
  getStoredGitHubRepos, 
  fetchLiveGitHubRepos, 
  getStoredInstagramItems, 
  addInstagramItem, 
  deleteInstagramItem, 
  getStoredLinkedInPosts, 
  addLinkedInPost, 
  deleteLinkedInPost, 
  syncAllPlatforms,
  clearAllSampleData,
  restoreSampleData
} from './lib/socialSync';
import { 
  GitHubRepo, 
  InstagramItem, 
  LinkedInPost, 
  SocialSyncConfig, 
  ProjectsSubTab 
} from './types';
import { GitHubFeed } from './components/GitHubFeed';
import { InstagramFeed } from './components/InstagramFeed';
import { LinkedInFeed } from './components/LinkedInFeed';
import { SocialSyncBar } from './components/SocialSyncBar';
import { ConnectMyIdModal } from './components/ConnectMyIdModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'admin'>('portfolio');
  const [portfolioTab, setPortfolioTab] = useState<'feed' | 'projects' | 'contact'>('feed');
  const [profile, setProfile] = useState<ProfileInfo>(DEFAULT_PROFILE);
  const [posts, setPosts] = useState<MediaPost[]>(DEFAULT_POSTS);
  const [stories, setStories] = useState<Story[]>([]);
  const [language, setLanguage] = useState<Language>('hi');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState(getStoredConfig());
  const [dismissBanner, setDismissBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Discreet Admin Authentication State (Persistent via sessionStorage)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('vrish_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Social & Developer Live Sync State
  const [socialConfig, setSocialConfig] = useState<SocialSyncConfig>(() => getSocialSyncConfig());
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>(() => getStoredGitHubRepos());
  const [instagramItems, setInstagramItems] = useState<InstagramItem[]>(() => getStoredInstagramItems());
  const [linkedInPosts, setLinkedInPosts] = useState<LinkedInPost[]>(() => getStoredLinkedInPosts());
  const [projectsSubTab, setProjectsSubTab] = useState<ProjectsSubTab>('all');
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [isSyncingSocial, setIsSyncingSocial] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSyncToast({ message, type });
    setTimeout(() => {
      setSyncToast(null);
    }, 4500);
  };

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const profileRes = await fetchProfileData();
      const postsRes = await fetchPostsData();
      const storiesRes = await fetchStories();

      if (profileRes?.profile) setProfile(profileRes.profile);
      if (postsRes?.posts && Array.isArray(postsRes.posts)) setPosts(postsRes.posts);
      if (storiesRes?.stories && Array.isArray(storiesRes.stories)) {
        setStories(storiesRes.stories);
      }

      const config = getStoredConfig();
      setSupabaseConfig(config);

      // Background GitHub Live Sync if configured
      const sCfg = getSocialSyncConfig();
      setSocialConfig(sCfg);
      if (sCfg.github_auto_sync && sCfg.github_username) {
        fetchLiveGitHubRepos(sCfg.github_username).then(res => {
          if (res.repos && res.repos.length > 0) {
            setGithubRepos(res.repos);
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed loading portfolio data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Safe likes calculation
  const totalLikes = Array.isArray(posts)
    ? posts.reduce((acc, p) => {
        const count = Array.isArray(p?.post_likes)
          ? p.post_likes.length
          : (typeof p?.likes_count === 'number' ? p.likes_count : 0);
        return acc + count;
      }, 0)
    : 0;

  // Update profile
  const handleUpdateProfile = async (updated: Partial<ProfileInfo>) => {
    const res = await updateProfileData(updated);
    // Always update the React state immediately so that any changes (like profile avatar) reflect across the UI instantly
    setProfile(prev => ({ ...prev, ...updated }));
    return res;
  };

  // Add post
  const handleAddPost = async (newPost: Omit<MediaPost, 'id' | 'created_at' | 'post_likes'>) => {
    const res = await createPostData(newPost);
    if (res.success && res.post) {
      setPosts(prev => [res.post!, ...prev]);
    }
    return res;
  };

  // Delete post
  const handleDeletePost = async (id: string | number) => {
    const res = await deletePostData(id);
    if (res.success) {
      setPosts(prev => prev.filter(p => String(p.id) !== String(id)));
    }
    return res;
  };

  // Update post (featured / hidden toggles)
  const handleUpdatePost = async (id: string | number, updates: Partial<MediaPost>) => {
    const res = await updatePostData(id, updates);
    if (res.success) {
      setPosts(prev => prev.map(p => String(p.id) === String(id) ? { ...p, ...updates } : p));
    }
    return res;
  };

  // Like a post
  const handleLike = async (postId: string | number, visitorName: string): Promise<boolean> => {
    const res = await addPostLike(postId, visitorName);
    if (res.success) {
      setPosts(prev => prev.map(post => {
        if (String(post.id) === String(postId)) {
          const currentLikes = post.post_likes ? [...post.post_likes] : [];
          currentLikes.push({
            id: Date.now(),
            post_id: postId,
            visitor_name: visitorName,
            created_at: new Date().toISOString()
          });
          return {
            ...post,
            post_likes: currentLikes,
            likes_count: currentLikes.length
          };
        }
        return post;
      }));
      return true;
    }
    return false;
  };

  // Add a comment to a post
  const handleComment = async (postId: string | number, visitorName: string, commentText: string): Promise<boolean> => {
    const res = await addPostComment(postId, visitorName, commentText);
    if (res.success && res.comment) {
      setPosts(prev => prev.map(post => {
        if (String(post.id) === String(postId)) {
          const currentComments = post.post_comments ? [...post.post_comments] : [];
          currentComments.push(res.comment!);
          return {
            ...post,
            post_comments: currentComments
          };
        }
        return post;
      }));
      return true;
    }
    return false;
  };

  // Create Story
  const handleAddStory = async (story: Omit<Story, 'id' | 'created_at'>) => {
    const res = await createStory(story);
    if (res.success && res.story) {
      setStories(prev => [res.story!, ...prev]);
    }
    return res;
  };

  // Delete Story
  const handleDeleteStory = async (id: string | number) => {
    const res = await deleteStory(id);
    if (res.success) {
      setStories(prev => prev.filter(s => String(s.id) !== String(id)));
    }
    return res;
  };

  // GitHub sync handler
  const handleSyncGitHub = async (usernameOverride?: string) => {
    setIsSyncingGitHub(true);
    const targetUsername = usernameOverride || socialConfig.github_username || 'vrish1234';
    try {
      const res = await fetchLiveGitHubRepos(targetUsername);
      if (res.repos && res.repos.length > 0) {
        setGithubRepos(res.repos);
        showToast(
          language === 'hi' 
            ? `@${res.actualUsername || targetUsername} से ${res.repos.length} रिपॉजिटरीज़ सिंक हो गईं!` 
            : `Synced ${res.repos.length} repositories from @${res.actualUsername || targetUsername}!`,
          'success'
        );
      } else {
        showToast(
          language === 'hi' ? 'गिटहब से 0 रिपॉजिटरीज़ मिलीं।' : 'Found 0 repositories on GitHub.',
          'info'
        );
      }
      setSocialConfig(getSocialSyncConfig());
    } catch (e: any) {
      console.error('GitHub sync error:', e);
      showToast(language === 'hi' ? 'गिटहब सिंक में त्रुटि हुई।' : 'Error syncing GitHub.', 'error');
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  // Sync all platforms (GitHub, Instagram, LinkedIn)
  const handleSyncAllSocial = async () => {
    setIsSyncingSocial(true);
    try {
      const result = await syncAllPlatforms(socialConfig);
      setGithubRepos(getStoredGitHubRepos());
      setInstagramItems(getStoredInstagramItems());
      setLinkedInPosts(getStoredLinkedInPosts());
      setSocialConfig(getSocialSyncConfig());
      
      showToast(
        language === 'hi'
          ? `✓ सिंक पूर्ण: ${result.githubCount} गिटहब कोड, ${result.instagramCount} इंस्टाग्राम पोस्ट, ${result.linkedinCount} लिंक्डइन अपडेट्स`
          : `✓ Sync complete: ${result.githubCount} GitHub repos, ${result.instagramCount} Instagram media, ${result.linkedinCount} LinkedIn updates`,
        'success'
      );
    } catch (e) {
      console.error('Social sync error:', e);
      showToast(language === 'hi' ? 'सिंक के दौरान समस्या आई।' : 'Sync encountered an issue.', 'error');
    } finally {
      setIsSyncingSocial(false);
    }
  };

  // Clear / Restore Sample Data Handlers
  const handleClearSampleData = () => {
    clearAllSampleData();
    setGithubRepos(getStoredGitHubRepos());
    setInstagramItems(getStoredInstagramItems());
    setLinkedInPosts(getStoredLinkedInPosts());
    setSocialConfig(getSocialSyncConfig());
  };

  const handleRestoreSampleData = () => {
    restoreSampleData();
    setGithubRepos(getStoredGitHubRepos());
    setInstagramItems(getStoredInstagramItems());
    setLinkedInPosts(getStoredLinkedInPosts());
    setSocialConfig(getSocialSyncConfig());
  };

  // Social config update
  const handleUpdateSocialConfig = async (configUpdate: Partial<SocialSyncConfig>) => {
    const updated = saveSocialSyncConfig(configUpdate);
    setSocialConfig(updated);
  };

  // Instagram item handlers
  const handleAddInstagram = (item: Omit<InstagramItem, 'id' | 'timestamp'>) => {
    addInstagramItem(item);
    setInstagramItems(getStoredInstagramItems());
  };

  const handleDeleteInstagram = (id: string) => {
    deleteInstagramItem(id);
    setInstagramItems(getStoredInstagramItems());
  };

  // LinkedIn post handlers
  const handleAddLinkedIn = (post: Omit<LinkedInPost, 'id' | 'published_at'>) => {
    addLinkedInPost(post);
    setLinkedInPosts(getStoredLinkedInPosts());
  };

  const handleDeleteLinkedIn = (id: string) => {
    deleteLinkedInPost(id);
    setLinkedInPosts(getStoredLinkedInPosts());
  };

  // Save Supabase Configuration
  const handleSaveSupabaseConfig = async (url: string, anonKey: string) => {
    if (url && anonKey) {
      const test = await testSupabaseConnection(url, anonKey);
      saveStoredConfig(url, anonKey, test.success);
      setSupabaseConfig({ url, anonKey, isConnected: test.success });
      await loadData();
    }
  };

  const handleClearSupabaseConfig = () => {
    clearStoredConfig();
    setSupabaseConfig({ url: '', anonKey: '', isConnected: false });
    loadData();
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'hi' ? 'en' : 'hi'));
  };

  // Admin authentication handlers
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('vrish_admin_auth', 'true');
      sessionStorage.setItem('vrish_admin_email', 'vrishketuray000@gmail.com');
    } catch {
      // ignore storage errors
    }
    setActiveTab('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('vrish_admin_auth');
      sessionStorage.removeItem('vrish_admin_email');
    } catch {
      // ignore storage errors
    }
    setActiveTab('portfolio');
  };

  const handleTabChange = (tab: 'portfolio' | 'admin') => {
    if (tab === 'admin') {
      if (!isAdminAuthenticated) {
        setIsAdminLoginModalOpen(true);
        return;
      }
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isSupabaseConnected={supabaseConfig.isConnected}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        language={language}
        onToggleLanguage={toggleLanguage}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogout={handleAdminLogout}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Supabase Notice Banner (Admin only) */}
        {isAdminAuthenticated && !supabaseConfig.isConnected && !dismissBanner && (
          <div 
            id="config-banner" 
            className="bg-gradient-to-r from-amber-950/70 via-gray-900 to-amber-950/40 border border-amber-500/40 text-amber-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-0.5">
                <p className="font-bold text-amber-300">
                  {language === 'hi' ? '⚠️ Supabase सेटअप सूचना:' : '⚠️ Supabase Connection Ready:'}
                </p>
                <p className="text-amber-200/90 text-xs">
                  {language === 'hi' 
                    ? 'वर्तमान में ऐप स्थानीय डेटाबेस (Local Storage) पर पूरी तरह कार्यरत है। क्लाउड सिंक के लिए अपनी Supabase URL और Anon Key दर्ज करें।'
                    : 'Currently operating seamlessly in Local Storage mode. Connect your Supabase URL & Anon Key for real-time cloud persistence.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-bold rounded-lg transition shadow-sm"
              >
                {language === 'hi' ? 'कनेक्ट करें' : 'Connect Supabase'}
              </button>
              <button
                onClick={() => setDismissBanner(true)}
                className="px-2.5 py-1.5 text-xs text-amber-400/80 hover:text-amber-200 transition"
              >
                {language === 'hi' ? 'हटाएं' : 'Dismiss'}
              </button>
            </div>
          </div>
        )}

        {/* Beautiful User-Friendly Section Switcher */}
        {(activeTab === 'portfolio' || !isAdminAuthenticated) && (
          <div className="sticky top-[68px] z-30 py-2.5 bg-gray-950/80 backdrop-blur-md border-b border-gray-900/60 flex justify-center -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="bg-gray-900/90 border border-gray-800 p-1.5 rounded-2xl flex items-center gap-1.5 w-full max-w-lg shadow-xl shadow-black/60">
              <button
                onClick={() => {
                  setPortfolioTab('feed');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  portfolioTab === 'feed'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{language === 'hi' ? 'मुख्य फ़ीड' : 'Home / Feed'}</span>
              </button>

              <button
                onClick={() => {
                  setPortfolioTab('projects');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  portfolioTab === 'projects'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                <Briefcase className="w-4 h-4 shrink-0 text-blue-400" />
                <span>{language === 'hi' ? 'प्रोजेक्ट्स' : 'Projects'}</span>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gray-950 text-blue-400 border border-gray-800">
                  {posts.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setPortfolioTab('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  portfolioTab === 'contact'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>{language === 'hi' ? 'संपर्क' : 'Contact'}</span>
              </button>
            </div>
          </div>
        )}

        {/* View Switcher */}
        {activeTab === 'portfolio' || !isAdminAuthenticated ? (
          <div id="view-portfolio" className="space-y-10 animate-fade-in">
            {/* 1. Home Feed Tab (Hero + Highlights + Posts) */}
            {portfolioTab === 'feed' && (
              <div className="space-y-10 animate-fade-in">
                {/* Hero Profile Presentation containing biography summary & Highlights/Stories */}
                <HeroSection
                  profile={profile}
                  totalPosts={posts.length}
                  totalLikes={totalLikes}
                  language={language}
                  stories={stories}
                  isLoading={isLoading}
                />

                {/* Live Social & Developer Ecosystem Bar */}
                <SocialSyncBar
                  githubCount={githubRepos.length}
                  instagramCount={instagramItems.length}
                  linkedinCount={linkedInPosts.length}
                  onSelectTab={(tab) => {
                    setPortfolioTab('projects');
                    setProjectsSubTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onGlobalSync={handleSyncAllSocial}
                  isSyncing={isSyncingSocial}
                  onOpenConnectModal={() => setIsConnectModalOpen(true)}
                  isUserOnlyMode={!!(socialConfig.user_only_mode || socialConfig.hide_sample_posts)}
                  language={language}
                />

                {/* Media & Projects Feed - Curated 1-2 spotlight posts on front page */}
                <ProjectsFeed
                  posts={posts}
                  onLike={handleLike}
                  onComment={handleComment}
                  language={language}
                  isLoading={isLoading}
                  isCompact={true}
                  onViewAllProjects={() => {
                    setPortfolioTab('projects');
                    setProjectsSubTab('all');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}

            {/* 2. Dedicated Projects Tab */}
            {portfolioTab === 'projects' && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-gradient-to-r from-blue-950/30 via-gray-900 to-indigo-950/10 border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                    <Briefcase className="w-4 h-4" />
                    <span>{language === 'hi' ? 'पोर्टफोलियो संग्रह व लाइव सोशल फ़ीड' : 'Portfolio Showcase & Live Feeds'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                    {language === 'hi' ? '🚀 मेरे सभी प्रोजेक्ट्स, कोड व सोशल अपडेट्स' : '🚀 Projects, Codebases & Social Channels'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
                    {language === 'hi' 
                      ? 'यहाँ मेरे सभी डिजिटल इनोवेशन्स, गिटहब लाइव रिपॉजिटरी, इंस्टाग्राम रील्स व पोस्ट्स, और लिंक्डइन अपडेट्स रीयल-टाइम में उपलब्ध हैं।'
                      : 'Explore my production software systems, real-time GitHub repositories, Instagram reels, and professional LinkedIn insights.'}
                  </p>
                </div>

                {/* Sub-Tabs Switcher */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-900 border border-gray-800 rounded-2xl">
                  <button
                    onClick={() => setProjectsSubTab('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      projectsSubTab === 'all'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? `सभी प्रोजेक्ट्स (${posts.length})` : `All Projects (${posts.length})`}</span>
                  </button>

                  <button
                    onClick={() => setProjectsSubTab('github')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      projectsSubTab === 'github'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>{language === 'hi' ? `गिटहब लाइव कोड (${githubRepos.length})` : `GitHub Repos (${githubRepos.length})`}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </button>

                  <button
                    onClick={() => setProjectsSubTab('instagram')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      projectsSubTab === 'instagram'
                        ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span>{language === 'hi' ? `इंस्टाग्राम रील्स व पोस्ट्स (${instagramItems.length})` : `Instagram Feed (${instagramItems.length})`}</span>
                  </button>

                  <button
                    onClick={() => setProjectsSubTab('linkedin')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      projectsSubTab === 'linkedin'
                        ? 'bg-[#0A66C2] text-white shadow-md shadow-blue-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{language === 'hi' ? `लिंक्डइन अपडेट्स (${linkedInPosts.length})` : `LinkedIn Activity (${linkedInPosts.length})`}</span>
                  </button>
                </div>

                {/* SubTab Views */}
                {projectsSubTab === 'all' && (
                  <ProjectsFeed
                    posts={posts}
                    onLike={handleLike}
                    onComment={handleComment}
                    language={language}
                    isLoading={isLoading}
                    isCompact={false}
                  />
                )}

                {projectsSubTab === 'github' && (
                  <GitHubFeed
                    repos={githubRepos}
                    username={socialConfig.github_username}
                    onSync={handleSyncGitHub}
                    isSyncing={isSyncingGitHub}
                    language={language}
                    lastSynced={socialConfig.github_last_synced}
                  />
                )}

                {projectsSubTab === 'instagram' && (
                  <InstagramFeed
                    items={instagramItems}
                    username={socialConfig.instagram_username}
                    onSync={handleSyncAllSocial}
                    isSyncing={isSyncingSocial}
                    isLoading={isLoading || isSyncingSocial}
                    language={language}
                    lastSynced={socialConfig.instagram_last_synced}
                    onOpenConnectModal={() => setIsConnectModalOpen(true)}
                  />
                )}

                {projectsSubTab === 'linkedin' && (
                  <LinkedInFeed
                    posts={linkedInPosts}
                    profileUrl={socialConfig.linkedin_profile_url}
                    onSync={handleSyncAllSocial}
                    isSyncing={isSyncingSocial}
                    isLoading={isLoading || isSyncingSocial}
                    language={language}
                    lastSynced={socialConfig.linkedin_last_synced}
                    onOpenConnectModal={() => setIsConnectModalOpen(true)}
                  />
                )}
              </div>
            )}

            {/* 3. Dedicated Contact Tab */}
            {portfolioTab === 'contact' && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-gradient-to-r from-indigo-950/30 via-gray-900 to-blue-950/10 border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                    <Mail className="w-4 h-4" />
                    <span>{language === 'hi' ? 'सीधा संपर्क हब' : 'Direct Channel Hub'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                    {language === 'hi' ? '🤝 बातचीत शुरू करें या सहयोग प्रस्ताव भेजें' : '🤝 Hire Vrishketu / Let’s Collaborate'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
                    {language === 'hi' 
                      ? 'यदि आप एक नया वेंचर शुरू करना चाहते हैं, कंसल्टेंसी के लिए बात करना चाहते हैं या मेरे साथ काम करने के लिए उत्सुक हैं, तो नीचे दिए गए फ़ॉर्म को भरें या हमारे सोशल मीडिया हैंडल पर सीधे संपर्क करें।'
                      : 'Ready to build something together? Send a direct secure message or reach out via fast Telegram, Instagram, or LinkedIn links below.'}
                  </p>
                </div>

                <ContactSection
                  language={language}
                  recipientEmail={profile.email || 'vrishketuray000@gmail.com'}
                  telegramUrl={profile.telegram || 'https://t.me/thevrishbihari'}
                  instagramUrl={profile.instagram || 'https://instagram.com/thevrishbihari'}
                  linkedinUrl={profile.linkedin || 'https://linkedin.com/in/vrishketu-ray'}
                />
              </div>
            )}
          </div>
        ) : (
          <AdminPanel
            profile={profile}
            posts={posts}
            onUpdateProfile={handleUpdateProfile}
            onAddPost={handleAddPost}
            onDeletePost={handleDeletePost}
            onUpdatePost={handleUpdatePost}
            language={language}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            isSupabaseConnected={supabaseConfig.isConnected}
            onSwitchToPortfolio={() => setActiveTab('portfolio')}
            onLogout={handleAdminLogout}
            stories={stories}
            onAddStory={handleAddStory}
            onDeleteStory={handleDeleteStory}
            socialConfig={socialConfig}
            onUpdateSocialConfig={handleUpdateSocialConfig}
            githubRepos={githubRepos}
            onSyncGitHub={handleSyncGitHub}
            isSyncingGitHub={isSyncingGitHub}
            instagramItems={instagramItems}
            onAddInstagramItem={handleAddInstagram}
            onDeleteInstagramItem={handleDeleteInstagram}
            linkedInPosts={linkedInPosts}
            onAddLinkedInPost={handleAddLinkedIn}
            onDeleteLinkedInPost={handleDeleteLinkedIn}
            onSyncAll={handleSyncAllSocial}
            isSyncingAll={isSyncingSocial}
          />
        )}
      </main>

      {/* Supabase Configuration & Migration Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        currentUrl={supabaseConfig.url}
        currentAnonKey={supabaseConfig.anonKey}
        isConnected={supabaseConfig.isConnected}
        onSaveConfig={handleSaveSupabaseConfig}
        onClearConfig={handleClearSupabaseConfig}
        language={language}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccessLogin={handleAdminLoginSuccess}
        language={language}
      />

      {/* Connect My Real ID Modal */}
      <ConnectMyIdModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        socialConfig={socialConfig}
        onUpdateSocialConfig={handleUpdateSocialConfig}
        onSyncGitHub={handleSyncGitHub}
        isSyncingGitHub={isSyncingGitHub}
        onClearSampleData={handleClearSampleData}
        onRestoreSampleData={handleRestoreSampleData}
        onAddInstagram={handleAddInstagram}
        onAddLinkedIn={handleAddLinkedIn}
        githubReposCount={githubRepos.length}
        instagramCount={instagramItems.length}
        linkedinCount={linkedInPosts.length}
        language={language}
      />

      {/* Floating Sync Toast Notification */}
      {syncToast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 max-w-md px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 animate-fade-in transition-all ${
            syncToast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : syncToast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-blue-950/90 border-blue-500/40 text-blue-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium leading-snug flex-1">
            {syncToast.message}
          </p>
          <button 
            onClick={() => setSyncToast(null)}
            className="text-gray-400 hover:text-white text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-gray-950 py-8 px-4 mt-12 text-center text-xs text-gray-500 relative">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="font-semibold text-gray-300">© Vrishketu Ray. All Rights Reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-[11px] text-gray-500 hidden sm:inline">Founder of Ugrasena Educum & AI-Edura</span>
          </div>

          <div className="flex items-center gap-4 text-gray-400 font-medium">
            <button 
              onClick={() => setActiveTab('portfolio')} 
              className="hover:text-blue-400 transition"
            >
              Portfolio
            </button>
            {isAdminAuthenticated && (
              <>
                <span>•</span>
                <button 
                  onClick={() => setActiveTab('admin')} 
                  className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <p className="text-[11px] text-gray-600">
              Personal Portfolio & Ventures
            </p>

            {/* Admin Login Button wrapped in Custom Tooltip Component displaying 'Admin Access' on hover */}
            <Tooltip content="Admin Access" position="top">
              <button
                id="admin-secret-lock-trigger"
                onClick={() => {
                  if (isAdminAuthenticated) {
                    setActiveTab(activeTab === 'admin' ? 'portfolio' : 'admin');
                  } else {
                    setIsAdminLoginModalOpen(true);
                  }
                }}
                aria-label="Admin Access"
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800/80 border border-transparent hover:border-blue-500/40 transition-all hover:scale-110 active:scale-95 cursor-pointer"
              >
                {isAdminAuthenticated ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                )}
              </button>
            </Tooltip>
          </div>
        </div>
      </footer>
    </div>
  );
}
