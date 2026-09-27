import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Music, 
  Search, 
  Share2, 
  Check, 
  Sparkles, 
  ExternalLink, 
  MessageSquare,
  X,
  Send,
  Lock,
  CheckCircle2,
  ArrowRight,
  Star,
  Copy,
  Link as LinkIcon
} from 'lucide-react';
import { MediaPost, MediaType, Language } from '../types';

interface ProjectsFeedProps {
  posts: MediaPost[];
  onLike: (postId: string | number, visitorName: string) => Promise<boolean>;
  onComment?: (postId: string | number, visitorName: string, commentText: string) => Promise<boolean>;
  language: Language;
  isLoading?: boolean;
  isCompact?: boolean;
  onViewAllProjects?: () => void;
}

interface ShareToast {
  id: string | number;
  title: string;
  url: string;
}

export const ProjectsFeed: React.FC<ProjectsFeedProps> = ({
  posts,
  onLike,
  onComment,
  language,
  isLoading = false,
  isCompact = false,
  onViewAllProjects
}) => {
  const [activeLikePost, setActiveLikePost] = useState<MediaPost | null>(null);
  const [activeCommentPost, setActiveCommentPost] = useState<MediaPost | null>(null);
  
  const [visitorNameInput, setVisitorNameInput] = useState(() => {
    try {
      return localStorage.getItem('portfolio_visitor_name') || '';
    } catch {
      return '';
    }
  });

  const [commentVisitorName, setCommentVisitorName] = useState(() => {
    try {
      return localStorage.getItem('portfolio_visitor_name') || '';
    } catch {
      return '';
    }
  });
  const [commentTextInput, setCommentTextInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  const [isSubmittingLike, setIsSubmittingLike] = useState(false);
  const [justLiked, setJustLiked] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<'all' | MediaType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [shareToast, setShareToast] = useState<ShareToast | null>(null);

  // Auto-dismiss share toast after 3.5 seconds
  useEffect(() => {
    if (shareToast) {
      const timer = setTimeout(() => {
        setShareToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [shareToast]);

  // SKELETON SCREEN PLACEHOLDER WHILE DATA IS BEING FETCHED
  if (isLoading) {
    return (
      <section className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div className="space-y-2">
            <div className="h-8 bg-gray-800 rounded-xl w-60" />
            <div className="h-4 bg-gray-800/60 rounded w-80 max-w-full" />
          </div>
          <div className="h-9 w-48 bg-gray-800/60 rounded-xl" />
        </div>

        {/* Search bar skeleton */}
        <div className="h-11 bg-gray-800/40 rounded-xl w-full" />

        {/* Project Card Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-gray-800 rounded-full" />
                <div className="h-5 w-16 bg-gray-800 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-gray-800 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-800/60 rounded" />
                <div className="h-4 w-4/5 bg-gray-800/50 rounded" />
              </div>
              <div className="h-52 bg-gray-800/80 rounded-xl w-full" />
              <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                <div className="h-8 w-24 bg-gray-800 rounded-lg" />
                <div className="h-8 w-24 bg-gray-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const handleOpenLikeModal = (post: MediaPost) => {
    setActiveLikePost(post);
  };

  const handleOpenCommentModal = (post: MediaPost) => {
    setActiveCommentPost(post);
    setCommentSuccess(false);
    setCommentTextInput('');
  };

  const handleConfirmLike = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLikePost) return;

    const trimmedName = visitorNameInput.trim();
    if (!trimmedName) {
      alert(language === 'hi' ? 'कृपया लाइक करने के लिए अपना नाम दर्ज करें!' : 'Please enter your name to like this project!');
      return;
    }

    try {
      localStorage.setItem('portfolio_visitor_name', trimmedName);
    } catch {
      // ignore
    }

    setIsSubmittingLike(true);
    const success = await onLike(activeLikePost.id, trimmedName);
    setIsSubmittingLike(false);

    if (success) {
      setJustLiked(prev => ({ ...prev, [String(activeLikePost.id)]: true }));
      setActiveLikePost(null);
      setTimeout(() => {
        setJustLiked(prev => ({ ...prev, [String(activeLikePost.id)]: false }));
      }, 4000);
    }
  };

  const handleConfirmComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentPost || !onComment) return;

    const trimmedName = commentVisitorName.trim();
    const trimmedText = commentTextInput.trim();

    if (!trimmedName || !trimmedText) {
      alert(language === 'hi' ? 'कृपया अपना नाम और टिप्पणी दोनों दर्ज करें!' : 'Please enter both your name and feedback!');
      return;
    }

    try {
      localStorage.setItem('portfolio_visitor_name', trimmedName);
    } catch {
      // ignore
    }

    setIsSubmittingComment(true);
    const success = await onComment(activeCommentPost.id, trimmedName, trimmedText);
    setIsSubmittingComment(false);

    if (success) {
      setCommentSuccess(true);
      setTimeout(() => {
        setCommentSuccess(false);
        setActiveCommentPost(null);
        setCommentTextInput('');
      }, 2000);
    }
  };

  const handleShare = async (post: MediaPost) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const shareUrl = `${origin}${pathname}#post-${post.id}`;

    let copiedSuccessfully = false;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        copiedSuccessfully = true;
      } catch {
        // fallback below
      }
    }

    if (!copiedSuccessfully) {
      try {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = shareUrl;
        tempTextArea.style.position = 'fixed';
        tempTextArea.style.left = '-9999px';
        document.body.appendChild(tempTextArea);
        tempTextArea.focus();
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        copiedSuccessfully = true;
      } catch {
        // ignore
      }
    }

    setCopiedId(post.id);
    setShareToast({
      id: post.id,
      title: post.title,
      url: shareUrl
    });

    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  // Filter out posts hidden by admin
  const visiblePosts = posts.filter(post => !post.is_hidden);

  // If in compact mode (Front page / Home feed):
  // User requested: "mera post ke bare mein ek do post ke bare mein jaega aur kuchh nahin"
  // Prioritize admin-featured projects, or default to latest 2 projects
  let filteredPosts: MediaPost[] = [];
  if (isCompact) {
    const featured = visiblePosts.filter(p => p.is_featured);
    const regular = visiblePosts.filter(p => !p.is_featured);
    filteredPosts = [...featured, ...regular].slice(0, 2);
  } else {
    filteredPosts = visiblePosts.filter(post => {
      const matchesType = filterType === 'all' || post.media_type === filterType;
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.description && post.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }

  return (
    <section className="space-y-6">
      {/* Header and Filter Controls */}
      {isCompact ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'स्पॉटलाइट प्रोजेक्ट्स' : 'Spotlight Projects'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              {language === 'hi' ? '🔥 चुनिंदा प्रोजेक्ट्स' : '🔥 Featured Highlights'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {language === 'hi'
                ? 'Vrishketu Ray द्वारा निर्मित प्रमुख एडटेक व डिजिटल इनोवेशन्स की एक संक्षिप्त झलक।'
                : 'A curated spotlight on key production software systems and digital ventures.'}
            </p>
          </div>

          {onViewAllProjects && (
            <button
              onClick={onViewAllProjects}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 hover:text-white text-xs font-bold transition shadow-sm self-start sm:self-auto hover:scale-105 active:scale-95"
            >
              <span>{language === 'hi' ? `सभी प्रोजेक्ट्स देखें (${visiblePosts.length})` : `Explore All (${visiblePosts.length})`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading flex items-center gap-2.5">
                <span>{language === 'hi' ? 'प्रोजेक्ट्स और मीडिया अपलोड्स' : 'Projects & Uploads'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-sans">
                  {filteredPosts.length}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                {language === 'hi'
                  ? 'फुल-स्टैक ऍप्लिकेशन्स, एडटेक प्लेटफ़ॉर्म और तकनीकी प्रोजेक्ट्स की लाइव गैलरी'
                  : 'Interactive showcase of full-stack projects, digital media, and platform demos'}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg transition font-medium ${
                    filterType === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {language === 'hi' ? 'सभी' : 'All'}
                </button>
                <button
                  onClick={() => setFilterType('image')}
                  className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 ${
                    filterType === 'image'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>{language === 'hi' ? 'तस्वीरें' : 'Images'}</span>
                </button>
                <button
                  onClick={() => setFilterType('video')}
                  className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 ${
                    filterType === 'video'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <VideoIcon className="w-3 h-3" />
                  <span>{language === 'hi' ? 'वीडियो' : 'Videos'}</span>
                </button>
                <button
                  onClick={() => setFilterType('audio')}
                  className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1 ${
                    filterType === 'audio'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Music className="w-3 h-3" />
                  <span>{language === 'hi' ? 'ऑडियो' : 'Audio'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'शीर्षक, विवरण या तकनीक द्वारा खोजें...'
                  : 'Search projects by keyword, technology, or description...'
              }
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-gray-200 outline-none focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </>
      )}

      {/* Grid of Posts */}
      <div id="posts-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.length === 0 ? (
          <div className="col-span-full bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-gray-300 font-medium">
              {language === 'hi' ? 'कोई प्रोजेक्ट या मीडिया नहीं मिला।' : 'No matching projects found.'}
            </p>
            <p className="text-xs text-gray-500">
              {language === 'hi' ? 'कृपया अपनी खोज या फ़िल्टर रीसेट करें।' : 'Try clearing your search query or switching filters.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-750 text-gray-200 text-xs font-semibold rounded-lg transition border border-gray-700"
              >
                <span>{language === 'hi' ? 'खोज साफ़ करें' : 'Clear Search'}</span>
              </button>
            )}
          </div>
        ) : (
          filteredPosts.map(post => {
            const likesCount = Array.isArray(post.post_likes)
              ? post.post_likes.length
              : (typeof post.likes_count === 'number' ? post.likes_count : 0);

            const commentsCount = Array.isArray(post.post_comments)
              ? post.post_comments.length
              : 0;

            return (
              <div
                key={post.id}
                id={`post-${post.id}`}
                className="bg-gray-900/95 border border-gray-800 hover:border-gray-700/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all hover:shadow-blue-500/5 group"
              >
                <div>
                  {/* Top Metadata: Tag & Date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 border border-gray-700 text-gray-300">
                      {post.media_type === 'image' && <ImageIcon className="w-3 h-3 text-blue-400" />}
                      {post.media_type === 'video' && <VideoIcon className="w-3 h-3 text-emerald-400" />}
                      {post.media_type === 'audio' && <Music className="w-3 h-3 text-purple-400" />}
                      <span className="capitalize">{post.media_type}</span>
                    </span>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {post.created_at && (
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      )}
                      <button
                        onClick={() => handleShare(post)}
                        className="p-1 hover:text-gray-300 transition"
                        title="Copy project link"
                      >
                        {copiedId === post.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-blue-300 group-hover:text-blue-200 transition-colors font-heading leading-snug">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="text-gray-300/90 text-sm mt-2 line-clamp-3 leading-relaxed">
                      {post.description}
                    </p>
                  )}

                  {/* Media Content Box */}
                  <div className="mt-4 overflow-hidden rounded-xl bg-gray-950 border border-gray-800/80">
                    {post.media_type === 'image' && (
                      <div className="relative group/media overflow-hidden">
                        <img
                          src={post.media_url}
                          alt={post.title}
                          className="rounded-xl w-full h-52 object-cover transition-transform duration-500 group-hover/media:scale-105"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      </div>
                    )}

                    {post.media_type === 'video' && (
                      <video
                        src={post.media_url}
                        controls
                        preload="metadata"
                        className="rounded-xl w-full h-52 object-cover bg-black"
                      >
                        {language === 'hi' ? 'आपका ब्राउज़र वीडियो टैग का समर्थन नहीं करता।' : 'Your browser does not support the video tag.'}
                      </video>
                    )}

                    {post.media_type === 'audio' && (
                      <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                            <Music className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-purple-300">Audio Track / Tech Podcast</p>
                            <p className="text-[11px] text-gray-400">Preview & listen below</p>
                          </div>
                        </div>
                        <audio
                          src={post.media_url}
                          controls
                          className="w-full h-10 accent-blue-500 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Interaction: Likes & Feedback */}
                <div className="mt-6 pt-4 border-t border-gray-800/90 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {/* Primary Like Button */}
                      <button
                        id={`like-button-${post.id}`}
                        onClick={() => handleOpenLikeModal(post)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 border shadow-sm active:scale-95 ${
                          justLiked[String(post.id)]
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'bg-gray-800 hover:bg-gray-750 hover:border-rose-500/40 text-gray-200 border-gray-700'
                        }`}
                      >
                        <Heart 
                          className={`w-4 h-4 transition-transform duration-300 ${
                            justLiked[String(post.id)] || likesCount > 0
                              ? 'text-rose-500 fill-rose-500 scale-110' 
                              : 'text-gray-400'
                          }`} 
                        />
                        <span>
                          {justLiked[String(post.id)]
                            ? (language === 'hi' ? 'लाइक किया!' : 'Liked!')
                            : (language === 'hi' ? 'लाइक करें' : 'Like')}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-gray-900/80 text-white font-mono text-[11px]">
                          {likesCount}
                        </span>
                      </button>

                      {/* Comment / Feedback Button */}
                      <button
                        id={`comment-button-${post.id}`}
                        onClick={() => handleOpenCommentModal(post)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 bg-gray-800 hover:bg-gray-750 hover:border-blue-500/40 text-gray-200 border border-gray-700 shadow-sm active:scale-95"
                        title="Leave private feedback / comment"
                      >
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        <span>{language === 'hi' ? 'टिप्पणी' : 'Comment'}</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-gray-900/80 text-white font-mono text-[11px]">
                          {commentsCount}
                        </span>
                      </button>
                    </div>

                    {/* Quick Share Button */}
                    <button
                      onClick={() => handleShare(post)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border shadow-sm active:scale-95 cursor-pointer ${
                        copiedId === post.id
                          ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30'
                          : 'bg-gray-800 hover:bg-gray-700 hover:border-blue-500/40 text-gray-300 hover:text-white border-gray-700'
                      }`}
                      title={language === 'hi' ? 'क्विक शेयर: डायरेक्ट लिंक कॉपी करें' : 'Quick Share: Copy direct link to clipboard'}
                    >
                      {copiedId === post.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300 font-bold">{language === 'hi' ? 'कॉपी हुआ!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>{language === 'hi' ? 'क्विक शेयर' : 'Quick Share'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Public Engagement & Privacy Notice */}
                  <div className="flex items-center justify-between text-xs bg-gray-950/70 px-3 py-2 rounded-xl border border-gray-800/60">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>
                        {likesCount > 0
                          ? (language === 'hi' 
                              ? `${likesCount} दर्शकों ने सराहा • ${commentsCount} टिप्पणियां`
                              : `${likesCount} ${likesCount === 1 ? 'appreciation' : 'appreciations'} • ${commentsCount} feedback`)
                          : (language === 'hi'
                              ? 'अभी तक कोई लाइक नहीं • पहले दर्शक बनें!'
                              : 'Be the first to appreciate this project!')}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono hidden sm:inline flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Privacy Protected</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View All Projects Button in Compact / Home Feed View */}
      {isCompact && onViewAllProjects && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={onViewAllProjects}
            className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>
              {language === 'hi'
                ? `🚀 सभी ${visiblePosts.length} प्रोजेक्ट्स और वर्क्स देखें`
                : `🚀 Explore All ${visiblePosts.length} Works & Demos`}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Visitor Like Prompt Modal */}
      {activeLikePost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveLikePost(null)}
        >
          <div 
            className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    {language === 'hi' ? 'प्रोजेक्ट को लाइक करें' : 'Appreciate Project'}
                  </h3>
                  <p className="text-xs text-gray-400 truncate max-w-[220px] sm:max-w-xs">
                    {activeLikePost.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveLikePost(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmLike} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  {language === 'hi' ? 'अपना नाम दर्ज करें (Visitor Name):' : 'Enter your name to leave a like:'}
                </label>
                <input
                  type="text"
                  autoFocus
                  id="visitor-like-name-input"
                  value={visitorNameInput}
                  onChange={(e) => setVisitorNameInput(e.target.value)}
                  placeholder={language === 'hi' ? 'जैसे: राहुल शर्मा' : 'e.g. Alex Morgan'}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-rose-500 transition"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed flex items-start gap-1.5">
                  <Lock className="w-3 h-3 text-gray-500 shrink-0 mt-0.5" />
                  <span>
                    {language === 'hi' 
                      ? 'गोपनीयता नियम: आपका नाम केवल एडमिन डैशबोर्ड में ऋषिकेतू राय को दिखेगा; सार्वजनिक रूप से किसी अन्य दर्शक को नहीं दिखेगा।' 
                      : 'Strict Privacy: Your name is privately recorded for Vrishketu Ray in the Admin Dashboard; only the aggregate count is public.'}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveLikePost(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-gray-700 bg-gray-800/80 hover:bg-gray-800 text-gray-300 text-xs font-semibold transition"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLike}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>
                    {isSubmittingLike 
                      ? (language === 'hi' ? 'सेव हो रहा है...' : 'Saving...') 
                      : (language === 'hi' ? 'लाइक दर्ज करें' : 'Confirm Like')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visitor Comment / Feedback Modal */}
      {activeCommentPost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveCommentPost(null)}
        >
          <div 
            className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    {language === 'hi' ? 'प्रोजेक्ट पर टिप्पणी भेजें' : 'Share Project Feedback'}
                  </h3>
                  <p className="text-xs text-gray-400 truncate max-w-[240px] sm:max-w-sm">
                    {activeCommentPost.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCommentPost(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {commentSuccess ? (
              <div className="py-6 text-center space-y-2 animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">
                  {language === 'hi' ? 'टिप्पणी सफलतापूर्वक भेजी गई!' : 'Feedback Delivered!'}
                </h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {language === 'hi'
                    ? 'आपकी टिप्पणी सुरक्षित रूप से ऋषिकेतू राय के एडमिन पैनल में भेज दी गई है।'
                    : 'Your comment has been securely delivered to Vrishketu Ray in the private Admin Dashboard.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmComment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {language === 'hi' ? 'आपका नाम (Visitor Name):' : 'Your Full Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    id="visitor-comment-name-input"
                    value={commentVisitorName}
                    onChange={(e) => setCommentVisitorName(e.target.value)}
                    placeholder={language === 'hi' ? 'जैसे: राहुल शर्मा' : 'e.g. Alex Morgan'}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {language === 'hi' ? 'आपकी टिप्पणी / सुझाव (Feedback):' : 'Your Comment / Feedback:'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    id="visitor-comment-text-input"
                    value={commentTextInput}
                    onChange={(e) => setCommentTextInput(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'इस प्रोजेक्ट के बारे में अपनी राय, विचार या तकनीकी प्रश्न लिखें...'
                        : 'Share your impressions, architecture feedback, or collaboration thoughts...'
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm outline-none focus:border-blue-500 transition resize-y"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed flex items-start gap-1.5">
                    <Lock className="w-3 h-3 text-gray-500 shrink-0 mt-0.5" />
                    <span>
                      {language === 'hi' 
                        ? 'सुरक्षा व गोपनीयता: आगंतुकों की टिप्पणियां और नाम केवल व्यवस्थापक पैनल में प्रदर्शित होते हैं, ताकि आपकी निजता सुरक्षित रहे।' 
                        : 'Strict Privacy: Visitor comments and names are visible ONLY to the verified Admin in the protected Dashboard.'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveCommentPost(null)}
                    className="w-1/2 py-2.5 rounded-xl border border-gray-700 bg-gray-800/80 hover:bg-gray-800 text-gray-300 text-xs font-semibold transition"
                  >
                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
                  >
                    {isSubmittingComment ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{language === 'hi' ? 'भेजा जा रहा है...' : 'Sending...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'टिप्पणी भेजें' : 'Submit Feedback'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Floating Quick Share Success Toast Notification */}
      {shareToast && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-gray-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-4 shadow-2xl shadow-emerald-500/10 animate-fade-in flex items-start justify-between gap-3 text-white ring-1 ring-emerald-500/20"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white tracking-tight font-heading">
                  {language === 'hi' ? 'डायरेक्ट लिंक कॉपी हो गया!' : 'Direct Link Copied!'}
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  CLIPBOARD
                </span>
              </div>
              <p className="text-[11px] text-gray-300 font-medium truncate">
                {shareToast.title}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono bg-gray-950/80 px-2 py-1 rounded-lg border border-gray-800">
                <LinkIcon className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                <span className="truncate">{shareToast.url}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShareToast(null)}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition shrink-0 cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};
