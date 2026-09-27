import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  AlertCircle, 
  Video as VideoIcon, 
  Music, 
  Image as ImageIcon, 
  Instagram, 
  Heart, 
  Sparkles, 
  RefreshCw,
  Share2
} from 'lucide-react';
import { MediaType } from '../types';

interface MediaRendererProps {
  mediaUrl: string;
  mediaType: MediaType;
  title: string;
  className?: string;
}

// ============================================================================
// Custom Hook: useInstagramEmbed
// ============================================================================
export function useInstagramEmbed(triggerDependency?: any) {
  const [isLoaded, setIsLoaded] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean((window as any).instgrm?.Embeds);
  });
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const processExistingEmbeds = () => {
      try {
        if ((window as any).instgrm?.Embeds) {
          (window as any).instgrm.Embeds.process();
          if (isMounted) {
            setIsLoaded(true);
            setLoadError(null);
          }
        }
      } catch (err) {
        console.warn('[useInstagramEmbed] Error processing embeds:', err);
      }
    };

    if ((window as any).instgrm?.Embeds) {
      processExistingEmbeds();
      return;
    }

    const scriptId = 'instagram-platform-embed-script';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.src = 'https://www.instagram.com/embed.js';
      scriptElement.async = true;
      scriptElement.defer = true;

      scriptElement.onload = () => {
        if (!isMounted) return;
        setIsLoaded(true);
        setLoadError(null);
        processExistingEmbeds();
      };

      scriptElement.onerror = (e) => {
        if (!isMounted) return;
        setLoadError('Failed to load Instagram embed platform script.');
        console.error('[useInstagramEmbed] Failed to load embed.js:', e);
      };

      document.body.appendChild(scriptElement);
    } else {
      const onLoad = () => {
        if (isMounted) {
          setIsLoaded(true);
          setLoadError(null);
          processExistingEmbeds();
        }
      };
      scriptElement.addEventListener('load', onLoad);
      const interval = setInterval(() => {
        if ((window as any).instgrm?.Embeds) {
          clearInterval(interval);
          onLoad();
        }
      }, 200);

      return () => {
        isMounted = false;
        clearInterval(interval);
        scriptElement?.removeEventListener('load', onLoad);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [triggerDependency]);

  return { isLoaded, loadError };
}

// ============================================================================
// Media Source Parser with Safe URL Analysis
// ============================================================================
export function parseMediaSource(url: string | undefined | null, declaredType: MediaType): {
  type: 'image' | 'video' | 'youtube' | 'vimeo' | 'instagram' | 'audio';
  src: string;
  embedUrl?: string;
  instagramShortcode?: string;
  isReel?: boolean;
} {
  if (!url || typeof url !== 'string') {
    return { type: declaredType === 'video' ? 'video' : declaredType === 'audio' ? 'audio' : 'image', src: '' };
  }

  const cleanUrl = url.trim();

  // 1. Instagram Post & Reel detection with shortcode extraction
  try {
    const igMatch = cleanUrl.match(/(?:instagram\.com\/(?:p|reel|tv|reels)\/)([\w-]+)/i);
    if (igMatch && igMatch[1]) {
      const isReel = cleanUrl.includes('/reel/') || cleanUrl.includes('/reels/');
      const shortcode = igMatch[1];
      return {
        type: 'instagram',
        src: `https://www.instagram.com/p/${shortcode}/`,
        instagramShortcode: shortcode,
        isReel,
        embedUrl: `https://www.instagram.com/p/${shortcode}/embed/captioned/`
      };
    }
  } catch {
    // Fallthrough on regex error
  }

  // 2. YouTube detection & embed parsing (Shorts, Watch URLs, youtu.be, embed)
  try {
    const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'youtube',
        src: cleanUrl,
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?enablejsapi=1&rel=0&modestbranding=1`
      };
    }
  } catch {
    // Fallthrough
  }

  // 3. Vimeo detection
  try {
    const vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/)(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'vimeo',
        src: cleanUrl,
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      };
    }
  } catch {
    // Fallthrough
  }

  // 4. Audio detection
  if (
    declaredType === 'audio' ||
    /\.(mp3|wav|ogg|aac|m4a)(\?.*)?$/i.test(cleanUrl)
  ) {
    return { type: 'audio', src: cleanUrl };
  }

  // 5. Video detection
  if (
    declaredType === 'video' ||
    /\.(mp4|webm|mov|mkv|ogv)(\?.*)?$/i.test(cleanUrl)
  ) {
    return { type: 'video', src: cleanUrl };
  }

  // 6. Default Image
  return { type: 'image', src: cleanUrl };
}

// ============================================================================
// Safe Instagram Official Embed Component
// ============================================================================
const InstagramEmbedBlock: React.FC<{
  permalink: string;
  shortcode: string;
  title: string;
  isReel?: boolean;
}> = ({ permalink, shortcode, title, isReel }) => {
  const [embedRenderFailed, setEmbedRenderFailed] = useState(false);
  const blockquoteRef = useRef<HTMLQuoteElement>(null);
  const { isLoaded, loadError } = useInstagramEmbed(shortcode);

  useEffect(() => {
    try {
      if (isLoaded && (window as any).instgrm?.Embeds) {
        (window as any).instgrm.Embeds.process();
      }
    } catch (e) {
      console.warn('Failed executing Instagram Embeds.process():', e);
      setEmbedRenderFailed(true);
    }
  }, [isLoaded, shortcode]);

  return (
    <div className="w-full flex flex-col items-center justify-center bg-gray-950/90 rounded-2xl border border-gray-800/80 overflow-hidden shadow-xl p-3 sm:p-4 my-1">
      {/* Top Meta Bar */}
      <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-gray-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5 shadow-sm">
            <div className="w-full h-full bg-gray-950 rounded-[6px] flex items-center justify-center text-pink-400">
              <Instagram className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-xs font-bold text-white tracking-tight">
            Instagram {isReel ? 'Reel' : 'Post'}
          </span>
        </div>

        <a
          href={permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 text-[11px] font-semibold border border-pink-500/30 transition hover:scale-105 active:scale-95"
        >
          <span>View on Instagram</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Official Instagram blockquote structure */}
      <div className="w-full flex justify-center overflow-auto max-h-[540px] rounded-xl">
        <blockquote
          ref={blockquoteRef}
          className="instagram-media"
          data-instgrm-captioned
          data-instgrm-permalink={permalink}
          data-instgrm-version="14"
          style={{
            background: '#030712',
            border: '0',
            borderRadius: '14px',
            margin: '0 auto',
            maxWidth: '540px',
            minWidth: '280px',
            padding: '0',
            width: '99.375%',
            display: 'block'
          }}
        >
          <div style={{ padding: '16px' }} className="text-center text-gray-400 text-xs">
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="w-4 h-4 border-2 border-pink-500/40 border-t-pink-500 rounded-full animate-spin" />
              <span className="text-gray-300 font-medium">Loading official Instagram embed...</span>
            </div>
            <a
              href={permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:underline font-semibold block mt-2"
            >
              {title || 'View this post on Instagram'}
            </a>
          </div>
        </blockquote>
      </div>
    </div>
  );
};

// ============================================================================
// Main MediaRenderer Component with Error Boundary Protection
// ============================================================================
export const MediaRenderer: React.FC<MediaRendererProps> = ({
  mediaUrl,
  mediaType,
  title,
  className = 'w-full h-52 sm:h-56'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fallback placeholder image on broken/missing URLs
  const fallbackImage = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';

  try {
    const parsed = parseMediaSource(mediaUrl, mediaType);

    // 1. Official Instagram Post & Reel Web Embed
    if (parsed.type === 'instagram' && parsed.instagramShortcode) {
      return (
        <InstagramEmbedBlock
          permalink={parsed.src}
          shortcode={parsed.instagramShortcode}
          title={title}
          isReel={parsed.isReel}
        />
      );
    }

    // 2. YouTube & Vimeo Video Embeds
    if (parsed.type === 'youtube' || parsed.type === 'vimeo') {
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gray-950 border border-gray-800 ${className}`}>
          <iframe
            src={parsed.embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0 rounded-2xl"
            loading="lazy"
          />
        </div>
      );
    }

    // 3. Direct HTML5 Video Player with Fallback & Controls
    if (parsed.type === 'video') {
      if (hasError) {
        return (
          <div className={`relative overflow-hidden rounded-2xl bg-gray-950 border border-gray-800 flex flex-col items-center justify-center p-6 text-center group ${className}`}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
              <VideoIcon className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-gray-300 line-clamp-1">{title}</p>
            <p className="text-[11px] text-gray-500 mt-1">Video link available</p>
            {mediaUrl && (
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-medium border border-emerald-500/30 transition"
              >
                <span>Watch Video</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        );
      }

      return (
        <div className={`relative overflow-hidden rounded-2xl bg-black border border-gray-800 group ${className}`}>
          <video
            src={mediaUrl}
            playsInline
            controls
            preload="metadata"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover rounded-2xl"
          >
            <source src={mediaUrl} type="video/mp4" />
            <source src={mediaUrl} type="video/webm" />
            <source src={mediaUrl} type="video/ogg" />
          </video>
        </div>
      );
    }

    // 4. Audio Player UI
    if (parsed.type === 'audio') {
      return (
        <div className={`p-5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-2xl border border-gray-800 flex flex-col justify-between shadow-inner ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-md shrink-0">
              <Music className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{title}</p>
              <p className="text-[11px] text-purple-300/80">Tech Podcast / Audio Demo</p>
            </div>
          </div>

          <audio
            src={mediaUrl}
            controls
            className="w-full h-10 accent-purple-500 rounded-xl mt-3"
            onError={() => setHasError(true)}
          />
        </div>
      );
    }

    // 5. Default: Image Viewer with graceful fallback
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gray-950 border border-gray-800 group/img ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-700" />
          </div>
        )}

        <img
          src={hasError || !mediaUrl ? fallbackImage : mediaUrl}
          alt={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover/img:scale-105"
        />

        {hasError && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-md rounded-md text-[10px] text-gray-400 border border-gray-700/50 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Cover Preview</span>
          </div>
        )}
      </div>
    );
  } catch (renderError) {
    console.error('[MediaRenderer] Safe render catch triggered:', renderError);
    return (
      <div className={`p-4 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 ${className}`}>
        <AlertCircle className="w-6 h-6 text-amber-400" />
        <p className="text-xs font-semibold text-white">{title || 'Media Item'}</p>
        {mediaUrl && (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Open Link</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }
};
