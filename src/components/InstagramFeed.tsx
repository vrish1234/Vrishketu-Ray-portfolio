import React, { useState } from 'react';
import { 
  Instagram, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  MessageCircle, 
  ExternalLink, 
  RefreshCw, 
  Film, 
  Sparkles, 
  Image as ImageIcon,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Clock,
  Maximize2,
  Layers
} from 'lucide-react';
import { InstagramItem, Language } from '../types';

interface InstagramFeedProps {
  items: InstagramItem[];
  username: string;
  onSync: () => Promise<void>;
  isSyncing: boolean;
  language: Language;
  lastSynced?: string;
  onOpenConnectModal?: () => void;
  isLoading?: boolean;
}

export const InstagramFeed: React.FC<InstagramFeedProps> = ({
  items,
  username,
  onSync,
  isSyncing,
  language,
  lastSynced,
  onOpenConnectModal,
  isLoading = false
}) => {
  const [filterType, setFilterType] = useState<'all' | 'reels' | 'images'>('all');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const cleanUsername = username.replace(/^@/, '');

  // High-fidelity shimmer skeleton loader while Instagram data is loading
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Banner Skeleton */}
        <div className="bg-gradient-to-r from-pink-950/20 via-purple-950/15 to-gray-900 border border-pink-500/20 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-pink-600/20 border border-pink-500/30 animate-shimmer shrink-0" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-56 bg-gray-800 rounded-lg animate-shimmer" />
                  <div className="h-5 w-24 bg-pink-500/20 rounded-full animate-shimmer" />
                </div>
                <div className="h-3.5 w-80 max-w-full bg-gray-800/60 rounded animate-shimmer" />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-32 bg-gray-800/80 rounded-xl animate-shimmer" />
              <div className="h-9 w-36 bg-pink-600/30 rounded-xl animate-shimmer" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80">
            <div className="h-7 w-28 bg-pink-600/30 rounded-xl animate-shimmer" />
            <div className="h-7 w-24 bg-gray-800 rounded-xl animate-shimmer" />
            <div className="h-7 w-24 bg-gray-800 rounded-xl animate-shimmer" />
          </div>
        </div>

        {/* Instagram Grid Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 items-start">
          {[1, 2, 3, 4].map(idx => (
            <div
              key={`ig-skeleton-${idx}`}
              className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
            >
              {/* Media Square Shimmer */}
              <div className="relative aspect-[4/5] sm:aspect-square bg-gray-950 flex items-center justify-center animate-shimmer">
                <div className="w-14 h-14 rounded-full bg-gray-800/80 flex items-center justify-center">
                  <div className="w-6 h-6 rounded bg-gray-700/50" />
                </div>
                <div className="absolute top-3 left-3">
                  <div className="h-6 w-16 bg-gray-800/90 rounded-full" />
                </div>
              </div>

              {/* Card Meta & Caption Skeleton */}
              <div className="p-4 sm:p-5 space-y-3 bg-gray-900/90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-12 bg-gray-800 rounded animate-shimmer" />
                    <div className="h-4 w-12 bg-gray-800 rounded animate-shimmer" />
                  </div>
                  <div className="h-3.5 w-16 bg-gray-800/60 rounded animate-shimmer" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-3.5 w-full bg-gray-800/70 rounded animate-shimmer" />
                  <div className="h-3.5 w-4/5 bg-gray-800/50 rounded animate-shimmer" />
                </div>
                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
                  <div className="h-4 w-16 bg-gray-800/60 rounded animate-shimmer" />
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-16 bg-gray-800 rounded-xl animate-shimmer" />
                    <div className="h-7 w-24 bg-pink-500/20 rounded-xl animate-shimmer" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredItems = items.filter(item => {
    if (filterType === 'reels') return item.is_reel || item.media_type === 'REEL' || item.media_type === 'VIDEO';
    if (filterType === 'images') return !item.is_reel && (item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM');
    return true;
  });

  const togglePlay = (id: string, videoEl: HTMLVideoElement | null) => {
    if (!videoEl) return;
    if (playingVideoId === id) {
      videoEl.pause();
      setPlayingVideoId(null);
    } else {
      videoEl.play().catch(() => {});
      setPlayingVideoId(id);
    }
  };

  const handleShare = (permalink: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(permalink);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-950/30 via-purple-950/20 to-gray-900 border border-pink-500/20 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5 shadow-lg shadow-pink-500/20">
                <div className="w-full h-full bg-gray-950 rounded-2xl flex items-center justify-center text-white">
                  <Instagram className="w-7 h-7 text-pink-400" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 border-2 border-gray-900" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight font-heading">
                  {language === 'hi' ? 'इंस्टाग्राम लाइव पोस्ट्स, रील्स व स्टोरीज' : 'Instagram Live Posts & Reels'}
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  @{cleanUsername}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {language === 'hi'
                  ? 'इंस्टाग्राम पर साझा किए गए वीडियो रील्स, टेक वर्कस्पेस और 24-घंटे स्टोरीज का लाइव फ़ीड'
                  : 'Direct feed of video reels, photo updates, and behind-the-scenes engineering moments'}
              </p>
            </div>
          </div>

          {/* Sync Trigger, Quick Add & External Instagram Link */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {onOpenConnectModal && (
              <button
                onClick={onOpenConnectModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 text-xs font-semibold transition hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>{language === 'hi' ? 'मेरी ID / पोस्ट जोड़ें' : 'Add My Post / ID'}</span>
              </button>
            )}

            <button
              onClick={onSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white text-xs font-semibold border border-gray-700 transition shadow-sm hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-pink-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (language === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...') : (language === 'hi' ? 'इंस्टा सिंक' : 'Sync Instagram')}</span>
            </button>

            <a
              href={`https://instagram.com/${cleanUsername}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-pink-600/20 hover:scale-105 active:scale-95"
            >
              <span>{language === 'hi' ? 'इंस्टाग्राम पर फॉलो करें' : 'Follow on Instagram'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {language === 'hi' ? `सभी पोस्ट्स (${items.length})` : `All Updates (${items.length})`}
          </button>
          <button
            onClick={() => setFilterType('reels')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'reels'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-pink-400" />
            <span>{language === 'hi' ? 'रील्स (Reels)' : 'Reels'}</span>
          </button>
          <button
            onClick={() => setFilterType('images')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'images'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'hi' ? 'फ़ोटो (Photos)' : 'Photos'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Instagram Media */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 items-start">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mx-auto">
              <Instagram className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <p className="text-gray-200 font-bold text-base">
                {language === 'hi' 
                  ? `@${cleanUsername} के लिए कोई पोस्ट नहीं मिली` 
                  : `No Instagram posts found for @${cleanUsername}`}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {language === 'hi' 
                  ? 'अपनी रील्स या फोटो पोस्ट का लिंक जोड़ें ताकि आपकी असली पोस्ट यहाँ दिखाई दें।' 
                  : 'Add your Instagram reel or photo link to display your real media here.'}
              </p>
            </div>

            {onOpenConnectModal && (
              <div className="pt-2">
                <button
                  onClick={onOpenConnectModal}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-lg shadow-pink-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'मेरी Instagram पोस्ट जोड़ें' : 'Add My Instagram Post'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredItems.map(item => {
            const isVideo = item.is_reel || item.media_type === 'REEL' || item.media_type === 'VIDEO';
            const isExpanded = expandedIds.has(item.id);
            const isLongCaption = (item.caption || '').length > 120;

            return (
              <div
                key={item.id}
                className={`bg-gray-900 border rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 ${
                  isExpanded 
                    ? 'border-pink-500/60 shadow-pink-500/10 ring-1 ring-pink-500/20' 
                    : 'border-gray-800 hover:border-pink-500/30'
                }`}
              >
                {/* Media Container */}
                <div className="relative aspect-[4/5] sm:aspect-square bg-black overflow-hidden flex items-center justify-center">
                  {isVideo ? (
                    <div className="relative w-full h-full">
                      <video
                        id={`ig-video-${item.id}`}
                        src={item.media_url}
                        poster={item.thumbnail_url}
                        loop
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={(e) => togglePlay(item.id, e.currentTarget)}
                      />

                      {/* Overlay Controls */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                        {playingVideoId !== item.id && (
                          <div className="w-14 h-14 rounded-full bg-pink-600/80 backdrop-blur-md text-white flex items-center justify-center shadow-2xl pointer-events-auto cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                            onClick={() => {
                              const el = document.getElementById(`ig-video-${item.id}`) as HTMLVideoElement;
                              togglePlay(item.id, el);
                            }}
                          >
                            <Play className="w-6 h-6 fill-white ml-0.5" />
                          </div>
                        )}
                      </div>

                      {/* Badges on Video */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-pink-300 text-[10px] font-bold border border-white/10 flex items-center gap-1">
                          <Film className="w-3 h-3 text-pink-400" />
                          <span>REEL</span>
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMuted(!isMuted);
                          }}
                          className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-pink-300 border border-white/10 transition hover:scale-105"
                        >
                          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full group/img overflow-hidden">
                      <img
                        src={item.media_url}
                        alt={item.caption || 'Instagram Post'}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-purple-300 text-[10px] font-bold border border-white/10 flex items-center gap-1">
                          <Instagram className="w-3 h-3 text-purple-400" />
                          <span>POST</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content and Engagement Bar */}
                <div className="p-4 sm:p-5 space-y-3 bg-gray-900/90 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Likes and Comments Counters */}
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-rose-400 font-semibold font-mono">
                          <Heart className="w-4 h-4 fill-rose-500/20 text-rose-400" />
                          <span>{item.like_count || 320}</span>
                        </span>

                        <span className="flex items-center gap-1.5 text-blue-400 font-semibold font-mono">
                          <MessageCircle className="w-4 h-4 text-blue-400" />
                          <span>{item.comments_count || 42}</span>
                        </span>
                      </div>

                      <span className="text-[11px] text-gray-500 font-mono">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Caption with Smooth 'View More' Transition */}
                    {item.caption && (
                      <div className="space-y-1.5">
                        <div 
                          className={`text-xs text-gray-300 leading-relaxed transition-all duration-300 ${
                            isExpanded ? 'line-clamp-none whitespace-pre-line' : 'line-clamp-3'
                          }`}
                        >
                          <span className="font-bold text-white mr-1.5 font-mono">@{cleanUsername}</span>
                          <span>{item.caption}</span>
                        </div>

                        {/* View More / View Less Inline Button */}
                        {(isLongCaption || isExpanded) && (
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 transition flex items-center gap-1 pt-0.5 cursor-pointer"
                          >
                            <span>
                              {isExpanded 
                                ? (language === 'hi' ? 'कम विवरण देखें' : 'View less') 
                                : (language === 'hi' ? 'पूरा विवरण देखें...' : 'View more...')}
                            </span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Expanded Media Details Tray */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-60 opacity-100 pt-2' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="bg-gray-950/80 rounded-2xl p-3 border border-pink-500/20 space-y-2 text-[11px] text-gray-300">
                        <div className="flex items-center justify-between text-gray-400">
                          <span className="flex items-center gap-1">
                            <Info className="w-3 h-3 text-pink-400" />
                            <span>{language === 'hi' ? 'मीडिया विवरण:' : 'Media Details:'}</span>
                          </span>
                          <span className="font-mono text-[10px] text-pink-300 font-bold uppercase">
                            {isVideo ? 'Reel / MP4 Video' : 'HQ Image / WebP'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 border-t border-gray-800">
                          <div className="text-gray-400">
                            <span className="block text-gray-500">{language === 'hi' ? 'पोस्ट ID' : 'Post ID'}</span>
                            <span className="text-gray-300 truncate block">{item.id}</span>
                          </div>
                          <div className="text-gray-400">
                            <span className="block text-gray-500">{language === 'hi' ? 'समय' : 'Timestamp'}</span>
                            <span className="text-gray-300 block">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center justify-between text-[10px] text-gray-400">
                          <span>{language === 'hi' ? 'डायरेक्ट मीडिया URL' : 'Direct Media'}</span>
                          <a 
                            href={item.media_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-pink-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>{language === 'hi' ? 'कच्चा स्त्रोत खोलें' : 'Open Raw Source'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Action Link */}
                  <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
                    <button
                      onClick={() => handleShare(item.permalink, item.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">{language === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{language === 'hi' ? 'शेयर' : 'Share'}</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium transition cursor-pointer flex items-center gap-1"
                        title={isExpanded ? 'Collapse card' : 'Expand full details'}
                      >
                        <span>{isExpanded ? (language === 'hi' ? 'संक्षिप्त' : 'Less') : (language === 'hi' ? 'विवरण' : 'Details')}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3 text-pink-400" /> : <ChevronDown className="w-3 h-3 text-pink-400" />}
                      </button>

                      <a
                        href={item.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-semibold transition hover:scale-105 active:scale-95"
                      >
                        <span>{language === 'hi' ? 'इंस्टाग्राम' : 'Instagram'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

