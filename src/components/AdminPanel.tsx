import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Database, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Music, 
  ExternalLink,
  Save, 
  User, 
  Eye, 
  AlertTriangle, 
  X, 
  LogOut, 
  FileUp, 
  FileText, 
  Loader2,
  Mail,
  MessageSquare,
  Heart,
  Users,
  BarChart3,
  RefreshCw,
  Calendar,
  ShieldCheck,
  Instagram,
  Inbox,
  CheckCircle2
} from 'lucide-react';
import { ProfileInfo, MediaPost, MediaType, Language, ContactMessage } from '../types';
import { 
  uploadMediaFileToSupabase, 
  fetchContactMessages, 
  deleteContactMessage, 
  fetchAllLikers,
  DetailedLiker
} from '../lib/supabase';
import { AvatarSection } from './AvatarSection';
import { AdminDashboardStats } from './AdminDashboardStats';

interface AdminPanelProps {
  profile: ProfileInfo;
  posts: MediaPost[];
  onUpdateProfile: (updated: Partial<ProfileInfo>) => Promise<{ success: boolean; error?: string }>;
  onAddPost: (post: Omit<MediaPost, 'id' | 'created_at' | 'post_likes'>) => Promise<{ success: boolean; error?: string }>;
  onDeletePost: (id: string | number) => Promise<{ success: boolean; error?: string }>;
  language: Language;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
  onSwitchToPortfolio: () => void;
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  profile,
  posts,
  onUpdateProfile,
  onAddPost,
  onDeletePost,
  language,
  onOpenSupabaseModal,
  isSupabaseConnected,
  onSwitchToPortfolio,
  onLogout
}) => {
  // Navigation Tabs in Admin
  const [adminTab, setAdminTab] = useState<'projects' | 'messages' | 'likes' | 'profile' | 'analytics'>('projects');

  // Profile Form State
  const [profileTitle, setProfileTitle] = useState(profile?.title || '');
  const [profileBio, setProfileBio] = useState(profile?.bio || '');
  const [profileSkills, setProfileSkills] = useState(
    Array.isArray(profile?.skills)
      ? profile.skills.join(', ')
      : (typeof profile?.skills === 'string' ? profile.skills : '')
  );
  const [profileAvatar, setProfileAvatar] = useState(profile?.avatar_url || '');
  const [profileEmail, setProfileEmail] = useState(profile?.email || '');
  const [profileGithub, setProfileGithub] = useState(profile?.github || '');
  const [profileLinkedin, setProfileLinkedin] = useState(profile?.linkedin || '');
  const [profileTwitter, setProfileTwitter] = useState(profile?.twitter || '');
  const [profileInstagram, setProfileInstagram] = useState(profile?.instagram || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAvatarUpdated = (newUrl: string) => {
    setProfileAvatar(newUrl);
    onUpdateProfile({ avatar_url: newUrl });
  };

  useEffect(() => {
    if (profile) {
      setProfileTitle(profile.title || '');
      setProfileBio(profile.bio || '');
      setProfileSkills(
        Array.isArray(profile.skills)
          ? profile.skills.join(', ')
          : (typeof profile.skills === 'string' ? profile.skills : '')
      );
      setProfileAvatar(profile.avatar_url || '');
      setProfileEmail(profile.email || '');
      setProfileGithub(profile.github || '');
      setProfileLinkedin(profile.linkedin || '');
      setProfileTwitter(profile.twitter || '');
      setProfileInstagram(profile.instagram || '');
    }
  }, [profile]);

  // Add Post Form State (Direct File Upload)
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postType, setPostType] = useState<MediaType>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [postFeedback, setPostFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Deleting Post state
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [postToDelete, setPostToDelete] = useState<MediaPost | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  // Contact Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | number | null>(null);

  // Visitor Likers State
  const [allLikers, setAllLikers] = useState<DetailedLiker[]>([]);
  const [isLoadingLikers, setIsLoadingLikers] = useState(false);

  // Load Admin Data (Messages & Likers)
  const loadAdminData = async () => {
    setIsLoadingMessages(true);
    setIsLoadingLikers(true);
    try {
      const [msgRes, likersRes] = await Promise.all([
        fetchContactMessages(),
        fetchAllLikers()
      ]);
      if (msgRes?.messages) setMessages(msgRes.messages);
      if (Array.isArray(likersRes)) setAllLikers(likersRes);
    } catch (err) {
      console.error('Failed loading admin engagement records:', err);
    } finally {
      setIsLoadingMessages(false);
      setIsLoadingLikers(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Compute Total Likes
  const totalLikesCount = posts.reduce((acc, p) => {
    const count = Array.isArray(p.post_likes) ? p.post_likes.length : (p.likes_count || 0);
    return acc + count;
  }, 0);

  // Handle direct file selection
  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    let detectedType: MediaType = 'image';
    if (file.type.startsWith('video/')) {
      detectedType = 'video';
    } else if (file.type.startsWith('audio/')) {
      detectedType = 'audio';
    } else {
      detectedType = 'image';
    }

    setPostType(detectedType);
    setSelectedFile(file);

    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    const preview = URL.createObjectURL(file);
    setFilePreviewUrl(preview);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileFeedback(null);

    const skillsArray = profileSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const result = await onUpdateProfile({
      title: profileTitle,
      bio: profileBio,
      skills: skillsArray,
      avatar_url: profileAvatar,
      email: profileEmail,
      github: profileGithub,
      linkedin: profileLinkedin,
      twitter: profileTwitter,
      instagram: profileInstagram
    });

    setIsSavingProfile(false);
    if (result.success) {
      setProfileFeedback({
        type: 'success',
        message: language === 'hi' ? 'प्रोफाइल सफलतापूर्वक अपडेट हो गई!' : 'Profile updated successfully!'
      });
      setTimeout(() => setProfileFeedback(null), 4000);
    } else {
      setProfileFeedback({
        type: 'error',
        message: result.error || (language === 'hi' ? 'प्रोफाइल अपडेट करने में विफल।' : 'Failed to update profile.')
      });
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      alert(language === 'hi' ? 'कृपया प्रोजेक्ट का शीर्षक दर्ज करें!' : 'Please enter a project title!');
      return;
    }

    if (!selectedFile) {
      alert(
        language === 'hi' 
          ? 'कृपया अपलोड करने के लिए फ़ाइल चुनें (छवि, वीडियो या ऑडियो)!' 
          : 'Please select a media file (Image, Video, or Audio) to upload!'
      );
      return;
    }

    setIsAddingPost(true);
    setPostFeedback(null);

    try {
      setUploadStatusText(
        language === 'hi'
          ? `सुपाबेस स्टोरेज बकेट 'portfolio-media' में फ़ाइल अपलोड हो रही है...`
          : `Uploading media file to Supabase Storage 'portfolio-media' bucket...`
      );

      // 1. Upload to Supabase Storage bucket
      const uploadResult = await uploadMediaFileToSupabase(selectedFile);

      if (!uploadResult.success || !uploadResult.publicUrl) {
        setIsAddingPost(false);
        setUploadStatusText(null);
        setPostFeedback({
          type: 'error',
          message: uploadResult.error || (language === 'hi' ? 'फ़ाइल अपलोड विफल रही।' : 'Failed to upload media file.')
        });
        return;
      }

      setUploadStatusText(
        language === 'hi'
          ? 'सुपाबेस डेटाबेस में पोस्ट रिकॉर्ड सेव हो रहा है...'
          : 'Saving post record into Supabase database...'
      );

      // 2. Save post record into database
      const result = await onAddPost({
        title: postTitle.trim(),
        description: postDesc.trim(),
        media_type: postType,
        media_url: uploadResult.publicUrl
      });

      setIsAddingPost(false);
      setUploadStatusText(null);

      if (result.success) {
        setPostFeedback({
          type: 'success',
          message: language === 'hi' 
            ? 'प्रोजेक्ट सफलतापूर्वक अपलोड और प्रकाशित हो गया!' 
            : 'Project successfully uploaded & published!'
        });
        setPostTitle('');
        setPostDesc('');
        handleClearFile();
        setTimeout(() => setPostFeedback(null), 5000);
      } else {
        setPostFeedback({
          type: 'error',
          message: result.error || (language === 'hi' ? 'पोस्ट जोड़ने में त्रुटि।' : 'Failed to add post.')
        });
      }
    } catch (err: unknown) {
      setIsAddingPost(false);
      setUploadStatusText(null);
      setPostFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unexpected upload error'
      });
    }
  };

  // Delete Post handlers
  const promptDeletePost = (post: MediaPost) => {
    setPostToDelete(post);
  };

  const cancelDeletePost = () => {
    if (isDeletingPost) return;
    setPostToDelete(null);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeletingPost(true);
    setDeletingId(postToDelete.id);
    await onDeletePost(postToDelete.id);
    setIsDeletingPost(false);
    setDeletingId(null);
    setPostToDelete(null);
  };

  // Delete Contact Message handler
  const handleDeleteMessage = async (id: string | number) => {
    setDeletingMessageId(id);
    const res = await deleteContactMessage(id);
    if (res.success) {
      setMessages(prev => prev.filter(m => String(m.id) !== String(id)));
    }
    setDeletingMessageId(null);
  };

  return (
    <div id="view-admin" className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-blue-950/40 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                {language === 'hi' ? 'एडमिन कंट्रोल पैनल' : 'Admin Control Panel'}
              </h2>
              <p className="text-xs text-gray-400">
                {language === 'hi' 
                  ? 'ऋषिकेतू राय • सुरक्षित व्यवस्थापक नियंत्रण' 
                  : 'Vrishketu Ray • Authorized Management Console'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
              isSupabaseConnected
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{isSupabaseConnected ? 'Supabase Connected' : 'Connect Supabase'}</span>
          </button>

          <button
            onClick={onSwitchToPortfolio}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            <span>{language === 'hi' ? 'व्यू पोर्टफोलियो' : 'View Live'}</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
              title={language === 'hi' ? 'एडमिन से लॉगआउट करें' : 'Logout Admin Session'}
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Admin Analytics Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Posts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gray-900/90 border border-gray-800/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">{language === 'hi' ? 'कुल प्रोजेक्ट्स' : 'Total Projects'}</span>
            <ImageIcon className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">{posts.length}</p>
          <p className="text-[11px] text-gray-500">
            {posts.filter(p => p.media_type === 'image').length} images • {posts.filter(p => p.media_type === 'video').length} videos
          </p>
        </div>

        {/* Total Likes */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gray-900/90 border border-gray-800/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">{language === 'hi' ? 'कुल लाइक्स' : 'Total Likes'}</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">{totalLikesCount}</p>
          <p className="text-[11px] text-gray-500">
            {language === 'hi' ? 'सार्वजनिक रूप से सत्यापित' : 'Visitor appreciations'}
          </p>
        </div>

        {/* Total Inquiries / Messages */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gray-900/90 border border-gray-800/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">{language === 'hi' ? 'संपर्क संदेश' : 'Contact Messages'}</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">{messages.length}</p>
          <p className="text-[11px] text-gray-500">
            {language === 'hi' ? 'सीधे फॉर्म से प्राप्त' : 'Incoming inquiries'}
          </p>
        </div>

        {/* Database Mode */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gray-900/90 border border-gray-800/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">{language === 'hi' ? 'सिंक स्थिति' : 'Database Sync'}</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-sm sm:text-base font-bold text-white font-heading truncate">
            {isSupabaseConnected ? 'Supabase Cloud' : 'Local Storage'}
          </p>
          <p className="text-[11px] text-gray-500">
            {isSupabaseConnected ? 'Live PostgreSQL + Storage' : 'Offline fallback active'}
          </p>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3 gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              adminTab === 'projects'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'प्रोजेक्ट्स व अपलोड' : 'Projects & Direct Upload'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
              {posts.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('messages')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              adminTab === 'messages'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'hi' ? 'संपर्क संदेश (Inbox)' : 'Contact Messages'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              {messages.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('likes')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              adminTab === 'likes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>{language === 'hi' ? 'लाइक करने वाले दर्शक' : 'Visitor Likes Audit'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono">
              {totalLikesCount}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              adminTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'hi' ? 'एनालिटिक्स चार्ट' : 'Engagement Stats'}</span>
          </button>

          <button
            onClick={() => setAdminTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              adminTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'hi' ? 'प्रोफाइल सेटिंग्स' : 'Profile Settings'}</span>
          </button>
        </div>

        <button
          onClick={loadAdminData}
          disabled={isLoadingMessages || isLoadingLikers}
          className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition"
          title="Refresh Messages & Likes Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages || isLoadingLikers ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      {/* TAB 1: Projects & Direct Media Upload */}
      {adminTab === 'projects' && (
        <div className="space-y-8 animate-fade-in">
          {/* Direct File Upload Form (No URL Box) */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    {language === 'hi' ? 'नया मीडिया / प्रोजेक्ट प्रकाशित करें' : 'Publish New Project / Direct Media'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {language === 'hi' 
                      ? `सीधे सुपाबेस स्टोरेज बकेट 'portfolio-media' में अपलोड करें (कोई URL बॉक्स नहीं)` 
                      : `Direct file picker (<input type="file">) uploading to 'portfolio-media' bucket`}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Direct Storage Upload
              </span>
            </div>

            {postFeedback && (
              <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                postFeedback.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {postFeedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{postFeedback.message}</span>
              </div>
            )}

            <form id="post-form" onSubmit={handlePostSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {language === 'hi' ? 'प्रोजेक्ट का शीर्षक (Title)' : 'Project Title'}
                  </label>
                  <input
                    type="text"
                    id="post-title"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. AI-Edura Smart Assessment Engine"
                    className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {language === 'hi' ? 'मीडिया प्रकार (Media Category)' : 'Media Category'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPostType('image')}
                      className={`py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                        postType === 'image'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-gray-800/70 border-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostType('video')}
                      className={`py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                        postType === 'video'
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                          : 'bg-gray-800/70 border-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      <VideoIcon className="w-3.5 h-3.5" />
                      <span>Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostType('audio')}
                      className={`py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                        postType === 'audio'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                          : 'bg-gray-800/70 border-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Music className="w-3.5 h-3.5" />
                      <span>Audio</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  {language === 'hi' ? 'विवरण (Description / Summary)' : 'Description / Tech Summary'}
                </label>
                <textarea
                  id="post-desc"
                  rows={2}
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  placeholder={language === 'hi' ? 'प्रोजेक्ट का विवरण, स्टैक और उद्देश्य लिखें...' : 'Key architectural points, stack used, and live impact...'}
                  className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Direct File Picker (No URL box) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-300">
                    {language === 'hi' ? 'सीधे फ़ाइल चुनें (Direct Storage File Picker)' : 'Select Media File (<input type="file">)'}
                  </label>
                  <span className="text-[11px] text-blue-400 font-mono">
                    Bucket: portfolio-media
                  </span>
                </div>

                {/* Hidden native input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  id="direct-media-file-input"
                  accept={
                    postType === 'image'
                      ? 'image/*'
                      : postType === 'video'
                      ? 'video/*'
                      : postType === 'audio'
                      ? 'audio/*'
                      : 'image/*,video/*,audio/*'
                  }
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  className="hidden"
                />

                {/* Dropzone or Preview */}
                {!selectedFile ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' 
                        : 'border-gray-700 hover:border-gray-600 bg-gray-950/60 hover:bg-gray-950'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {language === 'hi' 
                          ? 'फ़ाइल चुनने के लिए क्लिक करें या यहाँ खींचें' 
                          : 'Click to choose file or drag & drop here'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {postType === 'image' && 'JPG, PNG, GIF, WebP, SVG'}
                        {postType === 'video' && 'MP4, WebM, MOV, OGG video'}
                        {postType === 'audio' && 'MP3, WAV, AAC, OGG audio'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'media'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {filePreviewUrl && (
                      <div className="rounded-xl overflow-hidden bg-gray-900 border border-gray-800 max-h-48 flex items-center justify-center">
                        {postType === 'image' && (
                          <img src={filePreviewUrl} alt="Preview" className="max-h-48 object-contain" />
                        )}
                        {postType === 'video' && (
                          <video src={filePreviewUrl} controls className="max-h-48 w-full object-contain" />
                        )}
                        {postType === 'audio' && (
                          <audio src={filePreviewUrl} controls className="w-full my-2 px-3" />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {uploadStatusText && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-2.5 text-blue-300 text-xs animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{uploadStatusText}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isAddingPost || !selectedFile}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {isAddingPost ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{language === 'hi' ? 'अपलोड हो रहा है...' : 'Uploading to Supabase & Publishing...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>
                      {language === 'hi' ? 'स्टोरेज में अपलोड करें व प्रकाशित करें' : 'Upload to Supabase Storage & Publish'}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Manage Existing Posts */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  {language === 'hi' ? 'प्रकाशित प्रोजेक्ट्स प्रबंधित करें' : 'Manage Published Projects'}
                </h3>
                <p className="text-xs text-gray-400">
                  {language === 'hi' ? 'सक्रिय प्रोजेक्ट्स की समीक्षा करें या उन्हें हटाएं' : 'View active media entries, review engagement, or remove'}
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-xl bg-gray-800 text-gray-300 border border-gray-700 self-start sm:self-auto font-mono">
                {posts.length} {language === 'hi' ? 'प्रोजेक्ट्स' : 'Projects'}
              </span>
            </div>

            {posts.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">
                {language === 'hi' ? 'कोई प्रोजेक्ट उपलब्ध नहीं है।' : 'No projects currently published.'}
              </p>
            ) : (
              <div className="divide-y divide-gray-800/80">
                {posts.map(post => {
                  const likesCount = post.post_likes ? post.post_likes.length : (post.likes_count || 0);

                  return (
                    <div key={post.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 shrink-0 overflow-hidden">
                          {post.media_type === 'image' && (
                            <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                          )}
                          {post.media_type === 'video' && (
                            <div className="w-full h-full flex items-center justify-center text-emerald-400">
                              <VideoIcon className="w-6 h-6" />
                            </div>
                          )}
                          {post.media_type === 'audio' && (
                            <div className="w-full h-full flex items-center justify-center text-purple-400">
                              <Music className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{post.title}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 uppercase font-mono">
                              {post.media_type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-1">{post.description || 'No description'}</p>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            <span className="text-rose-400 font-semibold">❤️ {likesCount} Likes</span>
                            <span>•</span>
                            <a 
                              href={post.media_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <span>Media File</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => promptDeletePost(post)}
                          disabled={deletingId === post.id}
                          className="px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs font-medium transition flex items-center gap-1.5"
                          title={language === 'hi' ? 'पोस्ट हटाएं' : 'Delete Project'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Contact Form Messages Inbox */}
      {adminTab === 'messages' && (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  {language === 'hi' ? 'प्राप्त संपर्क संदेश (Contact Inquiries)' : 'Contact Inquiries & Messages'}
                </h3>
                <p className="text-xs text-gray-400">
                  {language === 'hi' 
                    ? 'सुपाबेस `contact_messages` टेबल से प्राप्त संदेश' 
                    : 'Messages submitted via the portfolio contact form'}
                </p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-xl bg-gray-800 text-gray-300 border border-gray-700 font-mono">
              {messages.length} Total
            </span>
          </div>

          {isLoadingMessages ? (
            <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <p className="text-xs">Loading contact messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-600" />
              <p className="text-sm font-medium">No contact messages yet.</p>
              <p className="text-xs text-gray-600">Messages sent via the website contact form will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {messages.map((msg) => (
                <div key={msg.id} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-xs">
                        {msg.sender_name ? msg.sender_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{msg.sender_name}</h4>
                        <a 
                          href={`mailto:${msg.sender_email}`} 
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Mail className="w-3 h-3" />
                          <span>{msg.sender_email}</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {msg.created_at && (
                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        disabled={deletingMessageId === msg.id}
                        className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-gray-950/80 rounded-xl border border-gray-800/80 text-xs sm:text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Visitor Likes Audit (Private Names List) */}
      {adminTab === 'likes' && (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  {language === 'hi' ? 'सुरक्षित दर्शक लाइक्स ऑडिट (Admin Only)' : 'Visitor Likes Audit (Private Admin View)'}
                </h3>
                <p className="text-xs text-gray-400">
                  {language === 'hi' 
                    ? 'प्रत्येक प्रोजेक्ट को लाइक करने वाले दर्शकों के नाम (सार्वजनिक रूप से छिपे हुए)' 
                    : 'List of all visitors who liked each project (kept hidden from public view for privacy)'}
                </p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
              🔒 Confidential
            </span>
          </div>

          <div className="space-y-6">
            {posts.map(post => {
              const likesList = post.post_likes || [];
              const likesCount = likesList.length || post.likes_count || 0;

              return (
                <div key={post.id} className="p-4 sm:p-5 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      <h4 className="text-sm font-bold text-white">{post.title}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 uppercase font-mono">
                        {post.media_type}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-rose-400">
                      ❤️ {likesCount} Likes
                    </span>
                  </div>

                  {likesList.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No individual visitor names recorded yet for this post.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                      {likesList.map((like, i) => {
                        const name = typeof like === 'string' ? like : (like?.visitor_name || 'Anonymous Visitor');
                        const date = typeof like === 'object' && like?.created_at ? new Date(like.created_at).toLocaleDateString() : '';

                        return (
                          <div 
                            key={like?.id || i}
                            className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                                {name.charAt(0).toUpperCase()}
                              </span>
                              <span className="text-gray-200 font-medium truncate">{name}</span>
                            </div>
                            {date && (
                              <span className="text-[10px] text-gray-500 shrink-0 ml-1">{date}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: Engagement Analytics Dashboard */}
      {adminTab === 'analytics' && (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                {language === 'hi' ? 'एनालिटिक्स और जुड़ाव आंकड़े' : 'Engagement Analytics & Insights'}
              </h3>
              <p className="text-xs text-gray-400">
                {language === 'hi' ? 'प्रोजेक्ट्स के लाइक्स और दर्शकों के जुड़ाव का ग्राफ' : 'Visualized insights into how visitors are interacting with your projects'}
              </p>
            </div>
          </div>

          <AdminDashboardStats posts={posts} language={language} />
        </div>
      )}

      {/* TAB 4: Profile Settings */}
      {adminTab === 'profile' && (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                {language === 'hi' ? 'प्रोफाइल व सोशल मीडिया सेटिंग्स' : 'Profile & Social Media Settings'}
              </h3>
              <p className="text-xs text-gray-400">
                {language === 'hi' ? 'शीर्षक, बायो, कौशल और सभी सोशल मीडिया लिंक्स' : 'Update headline, summary, skills, email, and social profiles'}
              </p>
            </div>
          </div>

          {profileFeedback && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              profileFeedback.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}>
              {profileFeedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{profileFeedback.message}</span>
            </div>
          )}

          {/* Profile Picture Upload Section */}
          <AvatarSection 
            profile={profile} 
            language={language} 
            onAvatarUpdated={handleAvatarUpdated} 
          />

          <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                {language === 'hi' ? 'Title / Tagline (शीर्षक)' : 'Title / Professional Tagline'}
              </label>
              <input
                type="text"
                id="admin-title"
                value={profileTitle}
                onChange={(e) => setProfileTitle(e.target.value)}
                placeholder="e.g. Full-Stack Developer & EdTech Entrepreneur"
                className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                {language === 'hi' ? 'Bio (बायो / परिचय)' : 'Bio / Professional Summary'}
              </label>
              <textarea
                id="admin-bio"
                rows={3}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Write your professional summary..."
                className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                {language === 'hi' ? 'Skills / Technologies (अल्पविराम से अलग करें)' : 'Skills & Tech Stack (comma separated)'}
              </label>
              <input
                type="text"
                value={profileSkills}
                onChange={(e) => setProfileSkills(e.target.value)}
                placeholder="Next.js, Supabase, Gemini API, React, TypeScript, PostgreSQL..."
                className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="vrishketuray000@gmail.com"
                  className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Avatar / Photo URL
                </label>
                <input
                  type="url"
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                  placeholder="https://.../photo.jpg"
                  className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={profileLinkedin}
                  onChange={(e) => setProfileLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={profileGithub}
                  onChange={(e) => setProfileGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Twitter / X URL
                </label>
                <input
                  type="url"
                  value={profileTwitter}
                  onChange={(e) => setProfileTwitter(e.target.value)}
                  placeholder="https://twitter.com/username"
                  className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram URL</span>
                </label>
                <input
                  type="url"
                  value={profileInstagram}
                  onChange={(e) => setProfileInstagram(e.target.value)}
                  placeholder="https://instagram.com/vrishketuray"
                  className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-pink-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-4"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSavingProfile 
                  ? (language === 'hi' ? 'सेव हो रहा है...' : 'Saving Changes...') 
                  : (language === 'hi' ? 'प्रोफाइल सेव करें' : 'Save Profile Changes')}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* Confirmation Modal for Post Deletion */}
      {postToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={cancelDeletePost}
                disabled={isDeletingPost}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 id="delete-dialog-title" className="text-lg font-bold text-white font-heading">
                {language === 'hi' ? 'क्या आप इस प्रोजेक्ट को हटाना चाहते हैं?' : 'Delete Project Entry?'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {language === 'hi' 
                  ? 'यह क्रिया वापस नहीं ली जा सकती। यह प्रोजेक्ट आपके पोर्टफोलियो और डेटाबेस से स्थायी रूप से हटा दिया जाएगा।'
                  : 'This action cannot be undone. This project entry will be permanently removed from your portfolio and database.'}
              </p>

              <div className="mt-3 p-3 bg-gray-950/80 rounded-xl border border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden shrink-0 flex items-center justify-center text-gray-300">
                  {postToDelete.media_type === 'image' && (
                    <img src={postToDelete.media_url} alt="" className="w-full h-full object-cover" />
                  )}
                  {postToDelete.media_type === 'video' && <VideoIcon className="w-4 h-4 text-emerald-400" />}
                  {postToDelete.media_type === 'audio' && <Music className="w-4 h-4 text-purple-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{postToDelete.title}</h4>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {postToDelete.media_type} • {postToDelete.likes_count || (postToDelete.post_likes ? postToDelete.post_likes.length : 0)} {language === 'hi' ? 'लाइक्स' : 'Likes'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cancelDeletePost}
                disabled={isDeletingPost}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold transition"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeletingPost}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold transition shadow-lg shadow-rose-600/20 flex items-center gap-2"
              >
                {isDeletingPost ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{language === 'hi' ? 'हटाया जा रहा है...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'हाँ, हटाएं' : 'Yes, Delete Project'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
