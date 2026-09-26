import React, { useState } from 'react';
import { 
  Linkedin, 
  ExternalLink, 
  RefreshCw, 
  ThumbsUp, 
  Heart, 
  Sparkles, 
  MessageSquare, 
  Share2, 
  Globe, 
  Check, 
  FileText,
  Briefcase,
  Award,
  Search,
  BookOpen,
  Image as ImageIcon,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { LinkedInPost, Language } from '../types';
import { extractPostMediaAndLinks } from '../lib/linkedinMediaParser';
import { 
  LinkPreviewCard, 
  ImageAttachment, 
  FormattedPostContent 
} from './LinkedInMediaPreview';

interface LinkedInFeedProps {
  posts: LinkedInPost[];
  profileUrl: string;
  onSync: () => Promise<void>;
  isSyncing: boolean;
  language: Language;
  lastSynced?: string;
  onOpenConnectModal?: () => void;
}

export const LinkedInFeed: React.FC<LinkedInFeedProps> = ({
  posts,
  profileUrl,
  onSync,
  isSyncing,
  language,
  lastSynced,
  onOpenConnectModal
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'links' | 'media'>('all');

  const handleShare = (url: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return language === 'hi' ? 'अभी-अभी' : 'Just now';
      if (diffHours < 24) return language === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return language === 'hi' ? `${diffDays} दिन पहले` : `${diffDays}d ago`;
      const diffWeeks = Math.floor(diffDays / 7);
      return language === 'hi' ? `${diffWeeks} सप्ताह पहले` : `${diffWeeks}w ago`;
    } catch {
      return '';
    }
  };

  // Filter posts based on search query and content type
  const filteredPosts = posts.filter(post => {
    const media = extractPostMediaAndLinks(post);

    const matchesSearch = 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.article_title && post.article_title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'links') {
      return media.articleLinks.length > 0;
    }
    if (activeFilter === 'media') {
      return media.imageUrls.length > 0;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-gray-900 to-indigo-950/20 border border-blue-500/20 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[#0A66C2] p-2.5 flex items-center justify-center text-white shadow-lg shadow-blue-600/25">
                <Linkedin className="w-8 h-8 fill-current" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-gray-900" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight font-heading">
                  {language === 'hi' ? 'लिंक्डइन लाइव अपडेट्स, आर्टिकल्स व विचार' : 'LinkedIn Live Updates & Insights'}
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  in/vrishketu-ray
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {language === 'hi'
                  ? 'सॉफ्टवेयर आर्किटेक्चर, एडटेक विजन, स्टार्टअप मील के पत्थर और मीडिया प्रीव्यू कार्ड्स'
                  : 'Professional insights, tech venture milestones, and rich interactive link previews'}
              </p>
            </div>
          </div>

          {/* Sync Trigger, Connect ID & External LinkedIn Link */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {onOpenConnectModal && (
              <button
                onClick={onOpenConnectModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'hi' ? 'मेरी ID / पोस्ट जोड़ें' : 'Add My Post / ID'}</span>
              </button>
            )}

            <button
              onClick={onSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white text-xs font-semibold border border-gray-700 transition shadow-sm hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (language === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...') : (language === 'hi' ? 'लिंक्डइन सिंक' : 'Sync LinkedIn')}</span>
            </button>

            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold transition shadow-lg shadow-blue-600/25 hover:scale-105 active:scale-95"
            >
              <span>{language === 'hi' ? 'लिंक्डइन पर जुड़ें' : 'Connect on LinkedIn'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-800/80">
          <div className="bg-gray-950/60 rounded-xl p-3 border border-gray-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">{language === 'hi' ? 'उद्यम' : 'Ventures'}</div>
              <div className="text-xs font-bold text-white">Ugrasena Educum & AI-Edura</div>
            </div>
          </div>

          <div className="bg-gray-950/60 rounded-xl p-3 border border-gray-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">{language === 'hi' ? 'विशेषज्ञता' : 'Domain'}</div>
              <div className="text-xs font-bold text-white">Full-Stack & EdTech AI</div>
            </div>
          </div>

          <div className="bg-gray-950/60 rounded-xl p-3 border border-gray-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">{language === 'hi' ? 'सक्रियता' : 'Network'}</div>
              <div className="text-xs font-bold text-emerald-400">Open to Collaboration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'लिंक्डइन पोस्ट्स या आर्टिकल्स खोजें...' : 'Search posts, insights or articles...'}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {language === 'hi' ? 'सभी पोस्ट्स' : 'All Updates'}
          </button>

          <button
            onClick={() => setActiveFilter('links')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeFilter === 'links'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'hi' ? 'आर्टिकल्स व लिंक्स' : 'Articles & Links'}</span>
          </button>

          <button
            onClick={() => setActiveFilter('media')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeFilter === 'media'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'hi' ? 'मीडिया' : 'Media'}</span>
          </button>
        </div>
      </div>

      {/* LinkedIn Posts Timeline */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
              <Linkedin className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <p className="text-gray-200 font-bold text-base">
                {language === 'hi' ? 'कोई लिंक्डइन पोस्ट नहीं मिली' : 'No LinkedIn updates found'}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {language === 'hi' 
                  ? 'अपनी लिंक्डइन प्रोफाइल जोड़ें या अपनी पोस्ट का लिंक यहाँ पेस्ट करें ताकि केवल आपकी अपनी असली पोस्ट ही दिखें।' 
                  : 'Link your LinkedIn profile or add your post links here to display only your real professional updates.'}
              </p>
            </div>

            {onOpenConnectModal && (
              <div className="pt-2">
                <button
                  onClick={onOpenConnectModal}
                  className="px-4 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'मेरी LinkedIn पोस्ट जोड़ें' : 'Add My LinkedIn Post'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredPosts.map(post => {
            // Extract rich media and web links using regex parser
            const media = extractPostMediaAndLinks(post);

            return (
              <article
                key={post.id}
                className="bg-gray-900 border border-gray-800 hover:border-blue-500/30 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 transition-all duration-300"
              >
                {/* Post Author Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={post.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt={post.author_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white hover:text-blue-400 transition cursor-pointer">
                          {post.author_name}
                        </h4>
                        <span className="text-[11px] text-gray-400">• 1st</span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1 max-w-md">
                        {post.author_title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                        <span>{formatRelativeTime(post.published_at)}</span>
                        <span>•</span>
                        <Globe className="w-3 h-3 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                    title="View original post on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 fill-current" />
                  </a>
                </div>

                {/* Post Content with Clickable URLs and Styled Hashtags */}
                <FormattedPostContent content={post.content} />

                {/* Rich Media Previews: Image Attachments with Lightbox */}
                {media.imageUrls.map((imgUrl, idx) => (
                  <ImageAttachment
                    key={`img-${idx}-${imgUrl}`}
                    imageUrl={imgUrl}
                    altText={post.article_title || 'LinkedIn Media Attachment'}
                    language={language}
                  />
                ))}

                {/* Rich Media Previews: Detected Shared Article / Web Resource Cards */}
                {media.articleLinks.map((articleLink, idx) => (
                  <LinkPreviewCard
                    key={`link-${idx}-${articleLink.url}`}
                    metadata={articleLink}
                    language={language}
                  />
                ))}

                {/* Reactions & Engagement Row */}
                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="flex items-center -space-x-1">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                        👍
                      </span>
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                        ❤️
                      </span>
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        👏
                      </span>
                    </div>
                    <span className="text-gray-300 font-medium font-mono text-[11px]">
                      {post.likes_count || 120}
                    </span>
                    <span>•</span>
                    <span className="text-gray-400 text-[11px]">
                      {post.comments_count || 24} {language === 'hi' ? 'टिप्पणियां' : 'comments'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare(post.post_url, post.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
                      title="Share link"
                    >
                      {copiedId === post.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    </button>

                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition hover:scale-105 active:scale-95"
                    >
                      <span>{language === 'hi' ? 'लिंक्डइन पर देखें' : 'View on LinkedIn'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
