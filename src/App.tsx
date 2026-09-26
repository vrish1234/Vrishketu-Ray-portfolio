import React, { useState, useEffect } from 'react';
import { 
  fetchProfileData, 
  fetchPostsData, 
  updateProfileData, 
  createPostData, 
  deletePostData, 
  addPostLike, 
  addPostComment,
  getStoredConfig, 
  saveStoredConfig, 
  clearStoredConfig, 
  testSupabaseConnection 
} from './lib/supabase';
import { ProfileInfo, MediaPost, Language } from './types';
import { DEFAULT_PROFILE, DEFAULT_POSTS } from './data/defaultData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProjectsFeed } from './components/ProjectsFeed';
import { ContactSection } from './components/ContactSection';
import { AdminPanel } from './components/AdminPanel';
import { SupabaseModal } from './components/SupabaseModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AlertTriangle, Database, Sparkles, Heart, Lock, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'admin'>('portfolio');
  const [profile, setProfile] = useState<ProfileInfo>(DEFAULT_PROFILE);
  const [posts, setPosts] = useState<MediaPost[]>(DEFAULT_POSTS);
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

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const profileRes = await fetchProfileData();
      const postsRes = await fetchPostsData();

      if (profileRes?.profile) setProfile(profileRes.profile);
      if (postsRes?.posts && Array.isArray(postsRes.posts)) setPosts(postsRes.posts);

      const config = getStoredConfig();
      setSupabaseConfig(config);
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
    if (res.success) {
      setProfile(prev => ({ ...prev, ...updated }));
    }
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

        {/* View Switcher */}
        {activeTab === 'portfolio' || !isAdminAuthenticated ? (
          <div id="view-portfolio" className="space-y-10 animate-fade-in">
            {/* Hero Profile Presentation */}
            <HeroSection
              profile={profile}
              totalPosts={posts.length}
              totalLikes={totalLikes}
              language={language}
            />

            {/* Media & Projects Feed */}
            <ProjectsFeed
              posts={posts}
              onLike={handleLike}
              onComment={handleComment}
              language={language}
            />

            {/* Direct Contact & Collaboration Section */}
            <ContactSection
              language={language}
              recipientEmail={profile.email || 'vrishketuray000@gmail.com'}
              telegramUrl={profile.telegram || 'https://t.me/thevrishbihari'}
              instagramUrl={profile.instagram || 'https://instagram.com/thevrishbihari'}
              linkedinUrl={profile.linkedin || 'https://linkedin.com/in/vrishketu-ray'}
            />
          </div>
        ) : (
          <AdminPanel
            profile={profile}
            posts={posts}
            onUpdateProfile={handleUpdateProfile}
            onAddPost={handleAddPost}
            onDeletePost={handleDeletePost}
            language={language}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            isSupabaseConnected={supabaseConfig.isConnected}
            onSwitchToPortfolio={() => setActiveTab('portfolio')}
            onLogout={handleAdminLogout}
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

            {/* Discreet / Hidden Admin Login Icon in the Footer Corner */}
            <button
              id="admin-secret-lock-trigger"
              onClick={() => {
                if (isAdminAuthenticated) {
                  setActiveTab(activeTab === 'admin' ? 'portfolio' : 'admin');
                } else {
                  setIsAdminLoginModalOpen(true);
                }
              }}
              title={
                isAdminAuthenticated
                  ? (language === 'hi' ? 'एडमिन सत्र सक्रिय (क्लिक करें)' : 'Admin Session Active')
                  : (language === 'hi' ? 'व्यवस्थापक प्रवेश' : 'System Administration')
              }
              aria-label="Admin Access"
              className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 transition-all opacity-40 hover:opacity-100 hover:scale-110 active:scale-95"
            >
              {isAdminAuthenticated ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
