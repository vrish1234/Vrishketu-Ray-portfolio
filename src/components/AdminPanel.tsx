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
  EyeOff,
  Star,
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
  CheckCircle2,
  Clock,
  Globe
} from 'lucide-react';
import { 
  ProfileInfo, 
  MediaPost, 
  MediaType, 
  Language, 
  ContactMessage, 
  Story,
  GitHubRepo,
  InstagramItem,
  LinkedInPost,
  SocialSyncConfig
} from '../types';
import { 
  uploadMediaFileToSupabase, 
  fetchContactMessages, 
  deleteContactMessage, 
  fetchAllLikers,
  DetailedLiker
} from '../lib/supabase';
import { AvatarSection } from './AvatarSection';
import { AdminDashboardStats } from './AdminDashboardStats';
import { AdminSocialSync } from './AdminSocialSync';

interface AdminPanelProps {
  profile: ProfileInfo;
  posts: MediaPost[];
  onUpdateProfile: (updated: Partial<ProfileInfo>) => Promise<{ success: boolean; error?: string }>;
  onAddPost: (post: Omit<MediaPost, 'id' | 'created_at' | 'post_likes'>) => Promise<{ success: boolean; error?: string }>;
  onDeletePost: (id: string | number) => Promise<{ success: boolean; error?: string }>;
  onUpdatePost?: (postId: string | number, updates: Partial<MediaPost>) => Promise<{ success: boolean; post?: MediaPost; error?: string }>;
  language: Language;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
  onSwitchToPortfolio: () => void;
  onLogout?: () => void;
  stories: Story[];
  onAddStory: (story: Omit<Story, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  onDeleteStory: (id: string | number) => Promise<{ success: boolean; error?: string }>;
  // Social and GitHub live sync
  socialConfig?: SocialSyncConfig;
  onUpdateSocialConfig?: (config: Partial<SocialSyncConfig>) => Promise<void>;
  githubRepos?: GitHubRepo[];
  onSyncGitHub?: () => Promise<void>;
  isSyncingGitHub?: boolean;
  instagramItems?: InstagramItem[];
  onAddInstagramItem?: (item: Omit<InstagramItem, 'id' | 'timestamp'>) => void;
  onDeleteInstagramItem?: (id: string) => void;
  linkedInPosts?: LinkedInPost[];
  onAddLinkedInPost?: (post: Omit<LinkedInPost, 'id' | 'published_at'>) => void;
  onDeleteLinkedInPost?: (id: string) => void;
  onSyncAll?: () => Promise<void>;
  isSyncingAll?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  profile,
  posts,
  onUpdateProfile,
  onAddPost,
  onDeletePost,
  onUpdatePost,
  language,
  onOpenSupabaseModal,
  isSupabaseConnected,
  onSwitchToPortfolio,
  onLogout,
  stories,
  onAddStory,
  onDeleteStory,
  socialConfig,
  onUpdateSocialConfig,
  githubRepos = [],
  onSyncGitHub,
  isSyncingGitHub = false,
  instagramItems = [],
  onAddInstagramItem,
  onDeleteInstagramItem,
  linkedInPosts = [],
  onAddLinkedInPost,
  onDeleteLinkedInPost,
  onSyncAll,
  isSyncingAll = false
}) => {
  // Navigation Tabs in Admin
  const [adminTab, setAdminTab] = useState<'projects' | 'messages' | 'likes' | 'profile' | 'analytics' | 'stories' | 'social_sync'>('projects');

  // Profile Form State
  const [profileName, setProfileName] = useState(profile?.name || '');
  const [profileTitle, setProfileTitle] = useState(profile?.title || '');
  const [profileBio, setProfileBio] = useState(profile?.bio || '');
  const [profileSkills, setProfileSkills] = useState(
    Array.isArray(profile?.skills)
      ? profile.skills.join(', ')
      : (typeof profile?.skills === 'string' ? profile.skills : '')
  );
  const [profileAvatar, setProfileAvatar] = useState(profile?.avatar_url || '');
  const [profileEmail, setProfileEmail] = useState(profile?.email || '');
  const [profileLocation, setProfileLocation] = useState(profile?.location || '');
  const [profileTelegram, setProfileTelegram] = useState(profile?.telegram || '');
  const [profileGithub, setProfileGithub] = useState(profile?.github || '');
  const [profileLinkedin, setProfileLinkedin] = useState(profile?.linkedin || '');
  const [profileTwitter, setProfileTwitter] = useState(profile?.twitter || '');
  const [profileInstagram, setProfileInstagram] = useState(profile?.instagram || '');
  const [profileVenture1, setProfileVenture1] = useState(profile?.venture_1 || '');
  const [profileVenture2, setProfileVenture2] = useState(profile?.venture_2 || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Stories Management State
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [storyUploadProgress, setStoryUploadProgress] = useState(0);
  const [storyFeedback, setStoryFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDeletingStoryId, setIsDeletingStoryId] = useState<string | number | null>(null);

  // Post Visibility & Featured Toggle State
  const [togglingPostId, setTogglingPostId] = useState<string | number | null>(null);

  const handleToggleFeatured = async (post: MediaPost) => {
    if (!onUpdatePost) return;
    setTogglingPostId(post.id);
    const nextFeatured = !post.is_featured;
    await onUpdatePost(post.id, { is_featured: nextFeatured });
    setTogglingPostId(null);
  };

  const handleToggleHidden = async (post: MediaPost) => {
    if (!onUpdatePost) return;
    setTogglingPostId(post.id);
    const nextHidden = !post.is_hidden;
    await onUpdatePost(post.id, { is_hidden: nextHidden });
    setTogglingPostId(null);
  };

  const handleAvatarUpdated = (newUrl: string) => {
    setProfileAvatar(newUrl);
    onUpdateProfile({ avatar_url: newUrl });
  };

  useEffect(() => {
    if (profile) {
      setProfileName(profile.name || '');
      setProfileTitle(profile.title || '');
      setProfileBio(profile.bio || '');
      setProfileSkills(
        Array.isArray(profile.skills)
          ? profile.skills.join(', ')
          : (typeof profile.skills === 'string' ? profile.skills : '')
      );
      setProfileAvatar(profile.avatar_url || '');
      setProfileEmail(profile.email || '');
      setProfileLocation(profile.location || '');
      setProfileTelegram(profile.telegram || '');
      setProfileGithub(profile.github || '');
      setProfileLinkedin(profile.linkedin || '');
      setProfileTwitter(profile.twitter || '');
      setProfileInstagram(profile.instagram || '');
      setProfileVenture1(profile.venture_1 || '');
      setProfileVenture2(profile.venture_2 || '');
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
  const [postUploadProgress, setPostUploadProgress] = useState(0);
  const [postFeedback, setPostFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Story Publishing and Deletion Handlers
  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyFile) return;

    setIsUploadingStory(true);
    setStoryUploadProgress(0);
    setStoryFeedback(null);

    try {
      // 1. Determine media type from file format
      const media_type = storyFile.type.startsWith('video/') ? 'video' : 'image';

      // 2. Upload file
      const uploadResult = await uploadMediaFileToSupabase(storyFile, 'stories', (progress) => {
        setStoryUploadProgress(progress);
      });

      if (!uploadResult.success || !uploadResult.publicUrl) {
        setStoryFeedback({
          type: 'error',
          message: uploadResult.error || 'Failed uploading file to Supabase.'
        });
        setIsUploadingStory(false);
        return;
      }

      // 3. Save inside database/local state
      const res = await onAddStory({
        media_url: uploadResult.publicUrl,
        media_type: media_type as 'image' | 'video',
        caption: storyCaption.trim(),
        title: storyTitle.trim() || undefined
      });

      if (res.success) {
        setStoryFeedback({
          type: 'success',
          message: language === 'hi' ? 'स्टोरी / हाईलाइट सफलतापूर्वक प्रकाशित की गई!' : 'Story / Highlight published successfully!'
        });
        setStoryFile(null);
        setStoryTitle('');
        setStoryCaption('');
        const fileInput = document.getElementById('story-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setStoryFeedback({
          type: 'error',
          message: res.error || 'Failed publishing story.'
        });
      }
    } catch (err: any) {
      setStoryFeedback({
        type: 'error',
        message: err.message || 'An unexpected error occurred.'
      });
    } finally {
      setIsUploadingStory(false);
    }
  };

  const handleDeleteStoryClick = async (id: string | number) => {
    setIsDeletingStoryId(id);
    try {
      const res = await onDeleteStory(id);
      if (!res.success) {
        alert(res.error || 'Failed deleting story');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsDeletingStoryId(null);
    }
  };

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
      name: profileName,
      title: profileTitle,
      bio: profileBio,
      skills: skillsArray,
      avatar_url: profileAvatar,
      email: profileEmail,
      location: profileLocation,
      telegram: profileTelegram,
      github: profileGithub,
      linkedin: profileLinkedin,
      twitter: profileTwitter,
      instagram: profileInstagram,
      venture_1: profileVenture1,
      venture_2: profileVenture2
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
      setPostUploadProgress(0);
      const uploadResult = await uploadMediaFileToSupabase(selectedFile, 'posts', (progress) => {
        setPostUploadProgress(progress);
      });

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
      setPostFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unexpected upload error'
      });
    } finally {
      setIsAddingPost(false);
      setUploadStatusText(null);
      setPostUploadProgress(0);
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
            onClick={() => setAdminTab('stories')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              adminTab === 'stories'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>{language === 'hi' ? '24h स्टोरीज' : '24h Stories'}</span>
            {stories.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-mono font-bold animate-pulse">
                {stories.length}
              </span>
            )}
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

          <button
            onClick={() => setAdminTab('social_sync')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              adminTab === 'social_sync'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'hi' ? 'सोशल व गिटहब सिंक' : 'Social & Code Sync'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
                <div className="space-y-2">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-2.5 text-blue-300 text-xs animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>{uploadStatusText}</span>
                  </div>
                  {postUploadProgress > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                        <span>Uploading file...</span>
                        <span className="text-blue-400 font-bold">{postUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-950 rounded-full h-1.5 overflow-hidden border border-gray-800">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${postUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
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

                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                        {/* Toggle Featured on Front Page (Home) */}
                        <button
                          onClick={() => handleToggleFeatured(post)}
                          disabled={togglingPostId === post.id}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                            post.is_featured
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                              : 'bg-gray-800/80 text-gray-400 hover:text-amber-300 hover:bg-gray-800 border-gray-700'
                          }`}
                          title={language === 'hi' ? 'होमपेज पर दिखाएं (Featured)' : 'Toggle Featured on Front Page'}
                        >
                          <Star className={`w-3.5 h-3.5 ${post.is_featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                          <span>{post.is_featured ? (language === 'hi' ? 'होमपेज पर' : 'Featured') : (language === 'hi' ? 'फ़ीचर करें' : 'Feature')}</span>
                        </button>

                        {/* Toggle Hidden / Visible */}
                        <button
                          onClick={() => handleToggleHidden(post)}
                          disabled={togglingPostId === post.id}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                            post.is_hidden
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-gray-800/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border-gray-700'
                          }`}
                          title={language === 'hi' ? 'प्रोजेक्ट छुपाएं / दिखाएं' : 'Toggle Hide/Show'}
                        >
                          {post.is_hidden ? <EyeOff className="w-3.5 h-3.5 text-purple-400" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{post.is_hidden ? (language === 'hi' ? 'छुपाएं' : 'Hidden') : (language === 'hi' ? 'दिखेगा' : 'Visible')}</span>
                        </button>

                        <button
                          onClick={() => promptDeletePost(post)}
                          disabled={deletingId === post.id}
                          className="px-2.5 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs font-medium transition flex items-center gap-1.5"
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

      {/* TAB 6: 24h Story Publisher and Manager */}
      {adminTab === 'stories' && (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8 animate-fade-in">
          
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  {language === 'hi' ? '24 घंटे व्हाट्सएप/इंस्टाग्राम स्टोरीज' : '24-Hour WhatsApp & Instagram Stories'}
                </h3>
                <p className="text-xs text-gray-400">
                  {language === 'hi' ? 'स्टोरी अपलोड करें जो दर्शकों को 24 घंटे दिखाई देगी' : 'Publish interactive updates that automatically expire after exactly 24 hours'}
                </p>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 font-semibold bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-800">
              {language === 'hi' ? `सक्रिय स्टोरीज: ${stories.length}` : `Active Stories: ${stories.length}`}
            </div>
          </div>

          {/* Core Structure: Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Left side column: Story publishing form */}
            <div className="lg:col-span-2 space-y-5 bg-gray-950/40 p-5 rounded-2xl border border-gray-800/80">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-pink-400" />
                <span>{language === 'hi' ? 'नई स्टोरी जोड़ें' : 'Publish New Story'}</span>
              </h4>

              {storyFeedback && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  storyFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {storyFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{storyFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handlePublishStory} className="space-y-4">
                
                {/* Highlight Title / Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    {language === 'hi' ? 'हाईलाइट का नाम / शीर्षक (उदा: मुक्त विश्वविद्यालय):' : 'Highlight Title (e.g. Open University):'}
                  </label>
                  <input 
                    type="text"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder={language === 'hi' ? 'जैसे: मुक्त विश्वविद्यालय, AI-Edura, टेक विजन' : 'e.g. Open University, AI-Edura'}
                    maxLength={30}
                    className="w-full text-xs p-3 rounded-xl bg-gray-950 border border-gray-800 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-white outline-none"
                  />
                  <p className="text-[10px] text-gray-500">
                    {language === 'hi' 
                      ? 'यह नाम होमपेज पर गोल हाइलाइट सर्कल के नीचे प्रदर्शित होगा।'
                      : 'This title will appear beneath the circular highlight ring on the home page.'}
                  </p>
                </div>

                {/* File picker */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    {language === 'hi' ? 'वीडियो या फोटो फ़ाइल चुनें:' : 'Select Media File (Image/Video):'}
                  </label>
                  <div className="relative group rounded-xl border-2 border-dashed border-gray-800 hover:border-pink-500/50 p-6 text-center transition bg-gray-950 flex flex-col items-center justify-center gap-2">
                    <input 
                      type="file" 
                      id="story-file-input"
                      accept="image/*,video/*"
                      required
                      disabled={isUploadingStory}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setStoryFile(file);
                        setStoryFeedback(null);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:pointer-events-none"
                    />
                    
                    {storyFile ? (
                      <div className="space-y-1 z-10 pointer-events-none">
                        <p className="text-xs font-bold text-pink-400 truncate max-w-[200px]">{storyFile.name}</p>
                        <p className="text-[10px] text-gray-500">{(storyFile.size / (1024 * 1024)).toFixed(2)} MB • {storyFile.type}</p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-600 group-hover:text-pink-400 transition-colors" />
                        <div className="text-xs text-gray-400 font-medium pointer-events-none">
                          {language === 'hi' ? 'फ़ाइल अपलोड करने के लिए क्लिक करें' : 'Click to Browse File'}
                        </div>
                        <p className="text-[10px] text-gray-500">Supports PNG, JPG, WEBP, MP4</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Caption field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    {language === 'hi' ? 'स्टोरी कैप्शन (वैकल्पिक):' : 'Story Caption (Optional):'}
                  </label>
                  <textarea 
                    value={storyCaption}
                    onChange={(e) => setStoryCaption(e.target.value)}
                    placeholder={language === 'hi' ? 'अपनी स्टोरी के नीचे कैप्शन लिखें...' : 'Type a caption to overlay...'}
                    maxLength={150}
                    rows={2}
                    className="w-full text-xs p-3 rounded-xl bg-gray-950 border border-gray-800 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-white outline-none resize-none"
                  />
                  <div className="text-right text-[9px] text-gray-500 font-semibold">
                    {storyCaption.length}/150
                  </div>
                </div>

                {/* Visual upload progress bar */}
                {isUploadingStory && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-pink-400 font-semibold">
                      <span>{language === 'hi' ? 'अपलोड किया जा रहा है...' : 'Uploading status...'}</span>
                      <span className="font-mono">{storyUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-amber-500 transition-all duration-300 rounded-full"
                        style={{ width: `${storyUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!storyFile || isUploadingStory}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 disabled:from-gray-800 disabled:to-gray-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg hover:shadow-pink-500/10 active:scale-98 disabled:pointer-events-none"
                >
                  {isUploadingStory ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'hi' ? `अपलोड प्रगति: ${storyUploadProgress}%` : `Uploading: ${storyUploadProgress}%`}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{language === 'hi' ? 'स्टोरी अभी पोस्ट करें ⚡' : 'Publish Story Now ⚡'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right side column: Active stories list manager */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{language === 'hi' ? 'वर्तमान सक्रिय स्टोरीज (Active Statuses)' : 'Currently Live 24h Stories'}</span>
              </h4>

              {stories.length === 0 ? (
                <div className="h-[280px] rounded-2xl border border-dashed border-gray-800 flex flex-col items-center justify-center text-center p-6 bg-gray-950/20">
                  <Sparkles className="w-10 h-10 text-gray-700 animate-pulse mb-3" />
                  <p className="text-xs font-bold text-gray-400">
                    {language === 'hi' ? 'कोई सक्रिय स्टोरी उपलब्ध नहीं है।' : 'No active stories currently live.'}
                  </p>
                  <p className="text-[10px] text-gray-500 max-w-xs mt-1 leading-relaxed">
                    {language === 'hi' 
                      ? 'अपनी नई स्टोरी जोड़ें। यह आपके होमपेज पर अवतार के चारों ओर रंगीन इंस्टाग्राम रिंग के रूप में लाइव दिखाई देगी।' 
                      : 'Create a story above to see a beautiful WhatsApp/Instagram style glowing ring around your avatar picture.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
                  {stories.map((story) => {
                    const ageHours = Math.max(0, Math.floor((Date.now() - new Date(story.created_at).getTime()) / (1000 * 60 * 60)));
                    const timeLeftHours = Math.max(0, 24 - ageHours);

                    return (
                      <div 
                        key={story.id} 
                        className="p-3.5 rounded-2xl bg-gray-950/75 border border-gray-800 flex flex-col justify-between gap-3 group relative overflow-hidden"
                      >
                        {/* Background subtle indicator */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/[0.01] rounded-full pointer-events-none" />

                        <div className="flex items-start gap-3">
                          {/* Story Thumbnail preview */}
                          <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 bg-black border border-gray-800 flex items-center justify-center relative">
                            {story.media_type === 'video' ? (
                              <div className="flex flex-col items-center justify-center gap-1">
                                <VideoIcon className="w-4 h-4 text-pink-400" />
                                <span className="text-[8px] text-gray-400 font-mono font-bold">VIDEO</span>
                              </div>
                            ) : (
                              <img 
                                src={story.media_url} 
                                alt={story.caption || 'Thumbnail'} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          {/* Story Age / Meta Info */}
                          <div className="min-w-0 flex-1 space-y-1">
                            {story.title && (
                              <span className="inline-block text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                                🌟 {story.title}
                              </span>
                            )}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold text-gray-300">
                                {language === 'hi' ? `${ageHours} घंटे पहले` : `${ageHours}h ago`}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold">
                                {language === 'hi' ? `${timeLeftHours} घंटे शेष` : `${timeLeftHours}h left`}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 font-medium line-clamp-2">
                              {story.caption || (language === 'hi' ? '(कोई कैप्शन नहीं)' : '(No caption text)')}
                            </p>
                          </div>
                        </div>

                        {/* Story item delete interface */}
                        <div className="flex items-center justify-between border-t border-gray-900 pt-2 text-[10px]">
                          <span className="text-gray-500 font-semibold uppercase tracking-wider">
                            Format: {story.media_type}
                          </span>
                          
                          <button
                            onClick={() => handleDeleteStoryClick(story.id)}
                            disabled={isDeletingStoryId === story.id}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-400 transition flex items-center gap-1 hover:scale-105 active:scale-95 disabled:opacity-50"
                          >
                            {isDeletingStoryId === story.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            <span>{language === 'hi' ? 'हटाएं' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
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
            
            {/* Name & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  {language === 'hi' ? 'आपका पूरा नाम (Full Name)' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Vrishketu Ray"
                  className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  {language === 'hi' ? 'स्थान / देश (Location)' : 'Location'}
                </label>
                <input
                  type="text"
                  value={profileLocation}
                  onChange={(e) => setProfileLocation(e.target.value)}
                  placeholder="e.g. India"
                  className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

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

            {/* Ventures & Highlight Badges Sub-form */}
            <div className="bg-gray-950/70 p-4 rounded-2xl border border-gray-800 space-y-3.5">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{language === 'hi' ? 'मुख्य संस्थाएं व उपलब्धियां (Ventures & Highlights)' : 'Ventures & Highlights (Hero Badges)'}</span>
              </h4>
              <p className="text-[11px] text-gray-400">
                {language === 'hi' 
                  ? 'ये उपलब्धियां मुख्य स्क्रीन पर रॉकेट और स्टार आइकन के साथ चमकीले बक्से के रूप में दिखेंगी।' 
                  : 'These badges appear on the main screen below your bio with rocket and star icons.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
                    {language === 'hi' ? 'संस्था १ (Highlight 1)' : 'Highlight Venture 1'}
                  </label>
                  <input
                    type="text"
                    value={profileVenture1}
                    onChange={(e) => setProfileVenture1(e.target.value)}
                    placeholder="e.g. Founder: Ugrasena Educum"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1.5">
                    {language === 'hi' ? 'संस्था २ (Highlight 2)' : 'Highlight Venture 2'}
                  </label>
                  <input
                    type="text"
                    value={profileVenture2}
                    onChange={(e) => setProfileVenture2(e.target.value)}
                    placeholder="e.g. Creator: AI-Edura"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
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

            {/* Social profiles grid (Expanded to 5 columns for Telegram) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Telegram URL
                </label>
                <input
                  type="url"
                  value={profileTelegram}
                  onChange={(e) => setProfileTelegram(e.target.value)}
                  placeholder="https://t.me/username"
                  className="w-full bg-gray-800/90 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-blue-500 transition"
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

      {/* TAB 7: Live Social & GitHub Sync Hub */}
      {adminTab === 'social_sync' && (
        <AdminSocialSync
          socialConfig={socialConfig || {
            github_username: 'vrishketu-ray',
            github_auto_sync: true,
            instagram_username: 'thevrishbihari',
            instagram_auto_sync: true,
            linkedin_profile_url: 'https://linkedin.com/in/vrishketu-ray',
            linkedin_auto_sync: true
          }}
          onUpdateSocialConfig={onUpdateSocialConfig || (async () => {})}
          githubRepos={githubRepos}
          onSyncGitHub={onSyncGitHub || (async () => {})}
          isSyncingGitHub={isSyncingGitHub}
          instagramItems={instagramItems}
          onAddInstagramItem={onAddInstagramItem || (() => {})}
          onDeleteInstagramItem={onDeleteInstagramItem || (() => {})}
          linkedInPosts={linkedInPosts}
          onAddLinkedInPost={onAddLinkedInPost || (() => {})}
          onDeleteLinkedInPost={onDeleteLinkedInPost || (() => {})}
          onSyncAll={onSyncAll || (async () => {})}
          isSyncingAll={isSyncingAll}
          language={language}
        />
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
