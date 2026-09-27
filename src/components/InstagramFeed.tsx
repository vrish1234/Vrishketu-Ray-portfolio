import React, { useState, useRef, useEffect } from 'react';
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
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  X,
  Maximize2,
  AlertCircle,
  Camera,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { InstagramItem, Language } from '../types';
import { extractInstagramShortcode } from '../lib/socialSync';

interface InstagramFeedProps {
  items: InstagramItem[];
  username: string;
  onSync: () => Promise<void>;
  isSyncing: boolean;
  language: Language;
  lastSynced?: string;
  onOpenConnectModal?: () => void;
  isLoading?: boolean;
  onUpdateItem?: (id: string, updates: Partial<InstagramItem>) => void;
  onDeleteItem?: (id: string) => void;
}

// Helper to determine if a URL points to a direct image file or data URI
function isDirectImage(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  if (clean.startsWith('data:image/')) return true;
  if (clean.startsWith('blob:')) return true;
  // If it's a full Instagram post link (e.g. instagram.com/p/... or /reel/...), it's NOT a direct image file!
  if (/instagram\.com\/(?:p|reel|tv|reels)\//i.test(clean)) return false;
  // Common image extensions or CDN patterns
  if (/\.(jpeg|jpg|png|webp|avif|gif)(\?.*)?$/i.test(clean)) return true;
  if (clean.includes('cdninstagram.com') || clean.includes('fbcdn.net') || clean.includes('unsplash.com')) return true;
  return true;
}

// Lightbox modal component for viewing high-resolution album pictures
const ImageLightboxModal: React.FC<{
  images: string[];
  initialIndex: number;
  onClose: () => void;
  caption?: string;
  permalink?: string;
  language: Language;
}> = ({ images, initialIndex, onClose, caption, permalink, language }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
      if (e.key === 'ArrowRight') setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between z-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-pink-600/30 text-pink-300 border border-pink-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? `एल्बम फ़ोटो ${currentIndex + 1} / ${images.length}` : `Photo ${currentIndex + 1} of ${images.length}`}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {permalink && (
            <a
              href={permalink}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-200 hover:text-white transition"
              title="Open on Instagram"
            >
              <ExternalLink className="w-4 h-4 text-pink-400" />
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div 
        className="relative flex-1 w-full max-w-4xl flex items-center justify-center my-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={caption || `Album photo ${currentIndex + 1}`}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-pink-600 text-white backdrop-blur-md transition shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-pink-600 text-white backdrop-blur-md transition shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="w-full max-w-3xl text-center space-y-2 z-10" onClick={(e) => e.stopPropagation()}>
        {caption && (
          <p className="text-xs text-gray-300 line-clamp-2 max-w-xl mx-auto px-4">
            {caption}
          </p>
        )}

        {/* Thumbnails strip */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 max-w-md mx-auto">
            {images.map((img, idx) => (
              <button
                key={`thumb-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                  currentIndex === idx ? 'border-pink-500 scale-105 ring-2 ring-pink-500/40' : 'border-gray-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img 
                  src={img} 
                  alt="" 
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover" 
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Photo / Album Uploader Drawer for a specific post
const AttachPhotosDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  item: InstagramItem;
  onSavePhotos: (photos: string[]) => void;
  language: Language;
}> = ({ isOpen, onClose, item, onSavePhotos, language }) => {
  const [photoList, setPhotoList] = useState<string[]>(() => {
    if (item.album_images && item.album_images.length > 0) return [...item.album_images];
    if (item.media_url && isDirectImage(item.media_url)) return [item.media_url];
    return [];
  });
  const [newUrlInput, setNewUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          setPhotoList(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrlInput.trim()) return;
    setPhotoList(prev => [...prev, newUrlInput.trim()]);
    setNewUrlInput('');
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotoList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSavePhotos(photoList);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-pink-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-5 sm:p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'hi' ? 'ओरिजिनल एल्बम फ़ोटो जोड़ें / अपडेट करें' : 'Attach Original Album Photos'}
              </h4>
              <p className="text-[11px] text-gray-400">
                {language === 'hi' ? 'अपनी गैलरी से असली फोटो चुनें ताकि पोस्ट बिल्कुल इंस्टाग्राम जैसी दिखे' : 'Select your authentic post photos to display in album format'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Buttons */}
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 active:scale-98 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{language === 'hi' ? '📱 मोबाइल/कंप्यूटर गैलरी से फ़ोटो चुनें' : '📱 Pick Photos from Gallery / Device'}</span>
          </button>

          {/* Add Image URL alternative */}
          <form onSubmit={handleAddUrl} className="flex gap-2">
            <input
              type="url"
              value={newUrlInput}
              onChange={(e) => setNewUrlInput(e.target.value)}
              placeholder="Or paste direct image URL (https://...)"
              className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-pink-300 rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" />
              <span>{language === 'hi' ? 'जोड़ें' : 'Add'}</span>
            </button>
          </form>
        </div>

        {/* Selected Photos Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-pink-400" />
              <span>{language === 'hi' ? `एल्बम फ़ोटो (${photoList.length}):` : `Album Photos (${photoList.length}):`}</span>
            </span>
            {photoList.length > 0 && (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{language === 'hi' ? 'एल्बम पिक्स तैयार' : 'Ready for album view'}</span>
              </span>
            )}
          </div>

          {photoList.length === 0 ? (
            <div className="border border-dashed border-gray-800 rounded-2xl p-6 text-center text-xs text-gray-500 space-y-1">
              <p>{language === 'hi' ? 'अभी कोई फ़ोटो नहीं चुनी गई।' : 'No photos selected yet.'}</p>
              <p className="text-[11px] text-gray-600">
                {language === 'hi' ? 'गैलरी बटन दबाकर अपनी असली तस्वीरें चुनें।' : 'Click the button above to pick original photos.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1 bg-gray-950 rounded-2xl border border-gray-800/80">
              {photoList.map((photo, idx) => (
                <div key={`p-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-800">
                  <img
                    src={photo}
                    alt=""
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-pink-300">
                    #{idx + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600/90 text-white opacity-80 hover:opacity-100 transition cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold cursor-pointer"
          >
            {language === 'hi' ? 'रद्द करें' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/20 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'एल्बम सहेजें' : 'Save Album'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Interactive Single Instagram Card Component
const InstagramCard: React.FC<{
  item: InstagramItem;
  cleanUsername: string;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  playingVideoId: string | null;
  togglePlay: (id: string, videoEl: HTMLVideoElement | null) => void;
  handleShare: (permalink: string, id: string) => void;
  copiedId: string | null;
  isExpanded: boolean;
  toggleExpand: (id: string) => void;
  language: Language;
  onOpenLightbox: (images: string[], index: number, caption?: string, permalink?: string) => void;
  onUpdateItem?: (id: string, updates: Partial<InstagramItem>) => void;
  onDeleteItem?: (id: string) => void;
}> = ({
  item,
  cleanUsername,
  isMuted,
  setIsMuted,
  playingVideoId,
  togglePlay,
  handleShare,
  copiedId,
  isExpanded,
  toggleExpand,
  language,
  onOpenLightbox,
  onUpdateItem,
  onDeleteItem
}) => {
  // Determine shortcode
  const shortcode = item.shortcode || extractInstagramShortcode(item.permalink) || extractInstagramShortcode(item.media_url);

  // Determine album photos
  const albumPhotos: string[] = React.useMemo(() => {
    if (item.album_images && item.album_images.length > 0) {
      return item.album_images;
    }
    if (item.media_url && isDirectImage(item.media_url)) {
      return [item.media_url];
    }
    if (item.thumbnail_url && isDirectImage(item.thumbnail_url)) {
      return [item.thumbnail_url];
    }
    return [];
  }, [item.album_images, item.media_url, item.thumbnail_url]);

  const hasPhotos = albumPhotos.length > 0;
  const isVideo = item.is_reel || item.media_type === 'REEL' || item.media_type === 'VIDEO';

  // State: whether user prefers 'album' view or 'embed' view
  // If no direct photos exist and a shortcode exists, default to 'embed' so user gets live Instagram post immediately!
  const [viewMode, setViewMode] = useState<'album' | 'embed'>(() => {
    if (hasPhotos) return 'album';
    if (shortcode) return 'embed';
    return 'album';
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isAttachDrawerOpen, setIsAttachDrawerOpen] = useState(false);

  // If image fails to load and shortcode is available, automatically fall back to official embed
  const handleImageError = () => {
    setImageLoadError(true);
    if (shortcode) {
      setViewMode('embed');
    }
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex(prev => (prev < albumPhotos.length - 1 ? prev + 1 : 0));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : albumPhotos.length - 1));
  };

  const handleSavePhotos = (photos: string[]) => {
    if (onUpdateItem) {
      onUpdateItem(item.id, {
        album_images: photos,
        media_type: photos.length > 1 ? 'CAROUSEL_ALBUM' : 'IMAGE',
        media_url: photos[0] || item.media_url
      });
      setViewMode('album');
      setImageLoadError(false);
    }
  };

  const isLongCaption = (item.caption || '').length > 120;
  const canonicalPermalink = item.permalink || (shortcode ? `https://www.instagram.com/p/${shortcode}/` : `https://instagram.com/${cleanUsername}`);

  return (
    <div
      className={`bg-gray-900 border rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 ${
        isExpanded 
          ? 'border-pink-500/60 shadow-pink-500/10 ring-1 ring-pink-500/20' 
          : 'border-gray-800 hover:border-pink-500/30'
      }`}
    >
      {/* Top Card Bar with View Mode Switcher */}
      <div className="px-4 py-2.5 bg-gray-950/90 border-b border-gray-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
            <Instagram className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-bold text-gray-300 font-mono">
            @{cleanUsername}
          </span>
        </div>

        {/* View Toggle (Album vs Live Embed) */}
        <div className="flex items-center gap-1.5">
          {hasPhotos && (
            <button
              onClick={() => setViewMode('album')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'album'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-gray-800/80 text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>{language === 'hi' ? `एल्बम (${albumPhotos.length})` : `Album (${albumPhotos.length})`}</span>
            </button>
          )}

          {shortcode && (
            <button
              onClick={() => setViewMode('embed')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'embed'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-800/80 text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{language === 'hi' ? 'लाइव इंस्टाग्राम' : 'Live IG'}</span>
            </button>
          )}

          <button
            onClick={() => setIsAttachDrawerOpen(true)}
            className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-pink-400 hover:text-pink-300 transition cursor-pointer"
            title={language === 'hi' ? 'ओरिजिनल फोटो अपलोड करें' : 'Attach/Edit Photos'}
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Media Stage */}
      <div className="relative aspect-[4/5] sm:aspect-square bg-black overflow-hidden flex items-center justify-center group">
        {/* CASE 1: Live Instagram Embed Iframe */}
        {viewMode === 'embed' && shortcode ? (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <iframe
              src={`https://www.instagram.com/p/${shortcode}/embed/`}
              className="w-full h-full border-0 rounded-none"
              title={`Instagram Post ${shortcode}`}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
            {/* Overlay button to switch back or add photos */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <span className="px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-pink-300 border border-pink-500/30">
                Live Instagram Frame
              </span>
              <button
                onClick={() => setIsAttachDrawerOpen(true)}
                className="pointer-events-auto px-2 py-1 rounded-lg bg-black/80 hover:bg-pink-600 text-white text-[10px] font-semibold backdrop-blur-md border border-white/20 transition cursor-pointer"
              >
                📸 {language === 'hi' ? 'एल्बम फोटो जोड़ें' : 'Add Album Pics'}
              </button>
            </div>
          </div>
        ) : isVideo && item.media_url && !item.media_url.includes('instagram.com/p/') ? (
          /* CASE 2: Native Video Reel */
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

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
              {playingVideoId !== item.id && (
                <div 
                  className="w-14 h-14 rounded-full bg-pink-600/80 backdrop-blur-md text-white flex items-center justify-center shadow-2xl pointer-events-auto cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                  onClick={() => {
                    const el = document.getElementById(`ig-video-${item.id}`) as HTMLVideoElement;
                    togglePlay(item.id, el);
                  }}
                >
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              )}
            </div>

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
        ) : hasPhotos && !imageLoadError ? (
          /* CASE 3: Album Pics Carousel Format */
          <div 
            className="relative w-full h-full overflow-hidden cursor-zoom-in"
            onClick={() => onOpenLightbox(albumPhotos, currentSlideIndex, item.caption, canonicalPermalink)}
          >
            <img
              src={albumPhotos[currentSlideIndex]}
              alt={item.caption || `Instagram Post Photo ${currentSlideIndex + 1}`}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={handleImageError}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />

            {/* Album Header Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-pink-300 text-[10px] font-bold border border-pink-500/30 flex items-center gap-1.5 shadow-lg">
                <Layers className="w-3 h-3 text-pink-400" />
                <span>
                  {albumPhotos.length > 1 
                    ? `${language === 'hi' ? 'एल्बम' : 'ALBUM'} ${currentSlideIndex + 1} / ${albumPhotos.length}` 
                    : (language === 'hi' ? 'ओरिजिनल फोटो' : 'ORIGINAL PHOTO')}
                </span>
              </span>
            </div>

            {/* Fullscreen Magnify Trigger */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox(albumPhotos, currentSlideIndex, item.caption, canonicalPermalink);
                }}
                className="p-2 rounded-full bg-black/70 backdrop-blur-md text-white hover:text-pink-300 border border-white/10 transition hover:scale-110 shadow-lg cursor-pointer"
                title="Fullscreen Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Slider Navigation Arrows (only if multi-photo album) */}
            {albumPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-pink-600 text-white backdrop-blur-md transition shadow-xl hover:scale-110 active:scale-95 cursor-pointer z-10"
                  title="Previous Photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-pink-600 text-white backdrop-blur-md transition shadow-xl hover:scale-110 active:scale-95 cursor-pointer z-10"
                  title="Next Photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dot Pagination */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-auto">
                  {albumPhotos.map((_, dotIdx) => (
                    <button
                      key={`dot-${dotIdx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlideIndex(dotIdx);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlideIndex === dotIdx 
                          ? 'w-6 bg-pink-500 shadow-sm shadow-pink-500/50' 
                          : 'w-2 bg-white/50 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* CASE 4: No Direct Photos or Image Failed -> Beautiful Fallback with Shortcode Embed or Upload Button */
          <div className="w-full h-full bg-gradient-to-br from-gray-950 via-gray-900 to-black p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Camera className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-xs">
              <h5 className="text-white font-bold text-sm">
                {language === 'hi' ? 'ओरिजिनल एल्बम फ़ोटो जोड़ें' : 'Attach Original Album Photos'}
              </h5>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {language === 'hi' 
                  ? 'इंस्टाग्राम सीधे इमेज लिंक ब्लॉक करता है। गैलरी से अपनी असली तस्वीरें चुनें ताकि यह एल्बम फॉर्मेट में दिखे।' 
                  : 'Instagram restricts hotlinking. Upload your original photos to showcase them in the album format.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs pt-1">
              <button
                onClick={() => setIsAttachDrawerOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 active:scale-98 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'गैलरी से असली फ़ोटो लगाएं' : 'Pick Photos from Gallery'}</span>
              </button>

              {shortcode && (
                <button
                  onClick={() => setViewMode('embed')}
                  className="w-full py-2 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-pink-300 text-[11px] font-semibold transition flex items-center justify-center gap-1.5 border border-gray-700 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'लाइव इंस्टाग्राम एम्बेड लोड करें' : 'Load Official Instagram Embed'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content and Engagement Bar */}
      <div className="p-4 sm:p-5 space-y-3 bg-gray-900/90 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Likes, Comments & Date */}
          <div className="flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold font-mono">
                <Heart className="w-4 h-4 fill-rose-500/20 text-rose-400" />
                <span>{item.like_count || 234}</span>
              </span>

              <span className="flex items-center gap-1.5 text-blue-400 font-semibold font-mono">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span>{item.comments_count || 29}</span>
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
                  <span>{language === 'hi' ? 'मीडिया प्रारूप:' : 'Format:'}</span>
                </span>
                <span className="font-mono text-[10px] text-pink-300 font-bold uppercase">
                  {albumPhotos.length > 1 
                    ? `Carousel Album (${albumPhotos.length} Photos)` 
                    : isVideo ? 'Reel / MP4 Video' : 'Original Photo'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 border-t border-gray-800">
                <div className="text-gray-400">
                  <span className="block text-gray-500">{language === 'hi' ? 'शॉर्टकोड' : 'Shortcode'}</span>
                  <span className="text-gray-300 truncate block">{shortcode || item.id}</span>
                </div>
                <div className="text-gray-400">
                  <span className="block text-gray-500">{language === 'hi' ? 'एल्बम पिक्स' : 'Album Pics'}</span>
                  <span className="text-emerald-400 block font-bold">{albumPhotos.length} {language === 'hi' ? 'तस्वीरें' : 'photos'}</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px]">
                <button
                  onClick={() => setIsAttachDrawerOpen(true)}
                  className="text-pink-400 hover:text-pink-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>{language === 'hi' ? 'एल्बम फोटो बदलें / जोड़ें' : 'Edit Album Photos'}</span>
                </button>

                {onDeleteItem && (
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === 'hi' ? 'हटाएं' : 'Delete'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
          <button
            onClick={() => handleShare(canonicalPermalink, item.id)}
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
            >
              <span>{isExpanded ? (language === 'hi' ? 'संक्षिप्त' : 'Less') : (language === 'hi' ? 'विवरण' : 'Details')}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3 text-pink-400" /> : <ChevronDown className="w-3 h-3 text-pink-400" />}
            </button>

            <a
              href={canonicalPermalink}
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

      {/* Attach / Edit Photos Modal */}
      <AttachPhotosDrawer
        isOpen={isAttachDrawerOpen}
        onClose={() => setIsAttachDrawerOpen(false)}
        item={item}
        onSavePhotos={handleSavePhotos}
        language={language}
      />
    </div>
  );
};

export const InstagramFeed: React.FC<InstagramFeedProps> = ({
  items,
  username,
  onSync,
  isSyncing,
  language,
  lastSynced,
  onOpenConnectModal,
  isLoading = false,
  onUpdateItem,
  onDeleteItem
}) => {
  const [filterType, setFilterType] = useState<'all' | 'reels' | 'images'>('all');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Lightbox State
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: string[];
    initialIndex: number;
    caption?: string;
    permalink?: string;
  }>({
    isOpen: false,
    images: [],
    initialIndex: 0
  });

  const cleanUsername = username.replace(/^@/, '');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 items-start">
          {[1, 2, 3, 4].map(idx => (
            <div
              key={`ig-skeleton-${idx}`}
              className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div className="relative aspect-[4/5] sm:aspect-square bg-gray-950 animate-shimmer" />
              <div className="p-4 sm:p-5 space-y-3 bg-gray-900/90">
                <div className="h-4 w-28 bg-gray-800 rounded animate-shimmer" />
                <div className="h-3.5 w-full bg-gray-800/60 rounded animate-shimmer" />
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

  const handleOpenLightbox = (images: string[], index: number, caption?: string, permalink?: string) => {
    setLightboxState({
      isOpen: true,
      images,
      initialIndex: index,
      caption,
      permalink
    });
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
                  {language === 'hi' ? 'इंस्टाग्राम एल्बम फ़ोटो, लाइव पोस्ट्स व रील्स' : 'Instagram Album Photos & Live Posts'}
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  @{cleanUsername}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {language === 'hi'
                  ? 'आपकी ओरिजिनल इंस्टाग्राम पोस्ट्स को आकर्षक एल्बम पिक्स फॉर्मेट और लाइव एम्बेड में प्रस्तुत करता है'
                  : 'Displays your authentic Instagram posts in attractive album carousel format and official live embeds'}
              </p>
            </div>
          </div>

          {/* Sync Trigger, Quick Add & External Instagram Link */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {onOpenConnectModal && (
              <button
                onClick={onOpenConnectModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 text-xs font-semibold transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-pink-400" />
                <span>{language === 'hi' ? 'नई एल्बम / पोस्ट जोड़ें' : 'Add Album / Post'}</span>
              </button>
            )}

            <button
              onClick={onSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white text-xs font-semibold border border-gray-700 transition shadow-sm hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
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
              <span>{language === 'hi' ? 'इंस्टाग्राम प्रोफाइल' : 'Instagram Profile'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {language === 'hi' ? `सभी पोस्ट्स (${items.length})` : `All Updates (${items.length})`}
          </button>
          <button
            onClick={() => setFilterType('images')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'images'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            <span>{language === 'hi' ? 'एल्बम पिक्स व फ़ोटो' : 'Album Pics & Photos'}</span>
          </button>
          <button
            onClick={() => setFilterType('reels')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'reels'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'hi' ? 'रील्स (Reels)' : 'Reels'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Instagram Cards */}
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
                  ? 'अपनी इंस्टाग्राम पोस्ट का लिंक जोड़ें या गैलरी से ओरिजिनल फोटो अपलोड करें।' 
                  : 'Add your Instagram post link or upload original photos to display them in album format.'}
              </p>
            </div>

            {onOpenConnectModal && (
              <div className="pt-2">
                <button
                  onClick={onOpenConnectModal}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-lg shadow-pink-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'hi' ? 'मेरी इंस्टाग्राम पोस्ट जोड़ें' : 'Add My Instagram Post'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredItems.map(item => (
            <InstagramCard
              key={item.id}
              item={item}
              cleanUsername={cleanUsername}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              playingVideoId={playingVideoId}
              togglePlay={togglePlay}
              handleShare={handleShare}
              copiedId={copiedId}
              isExpanded={expandedIds.has(item.id)}
              toggleExpand={toggleExpand}
              language={language}
              onOpenLightbox={handleOpenLightbox}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
            />
          ))
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxState.isOpen && (
        <ImageLightboxModal
          images={lightboxState.images}
          initialIndex={lightboxState.initialIndex}
          onClose={() => setLightboxState(prev => ({ ...prev, isOpen: false }))}
          caption={lightboxState.caption}
          permalink={lightboxState.permalink}
          language={language}
        />
      )}
    </div>
  );
};
