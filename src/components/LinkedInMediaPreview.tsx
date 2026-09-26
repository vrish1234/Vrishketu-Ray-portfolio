import React, { useState } from 'react';
import { 
  ExternalLink, 
  ArrowUpRight, 
  Globe, 
  BookOpen, 
  FileText, 
  FolderGit2, 
  Linkedin, 
  Image as ImageIcon, 
  Maximize2, 
  X,
  Sparkles,
  Share2
} from 'lucide-react';
import { RichLinkMetadata, URL_REGEX, HASHTAG_REGEX } from '../lib/linkedinMediaParser';
import { Language } from '../types';

interface LinkPreviewCardProps {
  metadata: RichLinkMetadata;
  language: Language;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ metadata, language }) => {
  const [imageError, setImageError] = useState(false);

  // Select domain-specific icon
  const getDomainIcon = () => {
    switch (metadata.type) {
      case 'github':
        return <FolderGit2 className="w-4 h-4 text-purple-400" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-400" />;
      case 'article':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      default:
        return <Globe className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <a
      href={metadata.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block my-3 rounded-2xl overflow-hidden bg-gray-950/80 hover:bg-gray-950 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
      title={`${metadata.title} - ${metadata.url}`}
    >
      {/* Visual Thumbnail Banner */}
      {metadata.imageUrl && !imageError && (
        <div className="relative w-full h-44 sm:h-52 bg-gray-900 overflow-hidden">
          <img
            src={metadata.imageUrl}
            alt={metadata.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
          
          {/* Site Badge over image */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-900/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-semibold shadow-md">
            {getDomainIcon()}
            <span>{metadata.siteName}</span>
          </div>

          <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/80 group-hover:text-white group-hover:bg-blue-600 transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Content Details */}
      <div className="p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <div className="flex items-center gap-1.5 truncate">
            {imageError && getDomainIcon()}
            <span className="text-blue-400 font-semibold uppercase tracking-wider">{metadata.displayDomain}</span>
          </div>
          <span className="text-[10px] text-gray-500 font-medium group-hover:text-blue-400 transition-colors flex items-center gap-1">
            <span>{language === 'hi' ? 'लिंक खोलें' : 'Open Link'}</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>

        <h5 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
          {metadata.title}
        </h5>

        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {metadata.description}
        </p>
      </div>
    </a>
  );
};

interface ImageAttachmentProps {
  imageUrl: string;
  altText?: string;
  language: Language;
}

export const ImageAttachment: React.FC<ImageAttachmentProps> = ({ imageUrl, altText, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <>
      <div className="relative my-3 rounded-2xl overflow-hidden bg-black/60 border border-gray-800 hover:border-blue-500/40 transition-all duration-300 group cursor-pointer">
        <img
          src={imageUrl}
          alt={altText || 'LinkedIn Post Attachment'}
          onError={() => setHasError(true)}
          className="w-full max-h-[420px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
          onClick={() => setIsOpen(true)}
        />

        {/* Hover Click-to-Enlarge Pill */}
        <div 
          onClick={() => setIsOpen(true)}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs font-medium opacity-90 group-hover:opacity-100 transition-opacity"
        >
          <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
          <span>{language === 'hi' ? 'बड़ा देखें' : 'View Full Image'}</span>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-gray-900 text-gray-300 hover:text-white border border-gray-700 transition"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={imageUrl}
              alt={altText || 'Full View'}
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl border border-gray-800"
            />

            <div className="mt-3 flex items-center justify-between w-full text-xs text-gray-400">
              <span>{altText || 'LinkedIn Media Attachment'}</span>
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{language === 'hi' ? 'मूल छवि खोलें' : 'Open Original'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface FormattedPostContentProps {
  content: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  language?: Language;
}

export const FormattedPostContent: React.FC<FormattedPostContentProps> = ({ 
  content, 
  isExpanded = true, 
  onToggleExpand,
  language = 'hi'
}) => {
  // Regex that captures both URLs and Hashtags
  const TOKEN_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])|(#[a-zA-Z0-9_\u0900-\u097F]+)/g;

  // Split and render tokens
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_REGEX.exec(content)) !== null) {
    const matchStart = match.index;
    const matchEnd = match.index + match[0].length;

    // Add plain text before match
    if (matchStart > lastIndex) {
      parts.push(content.substring(lastIndex, matchStart));
    }

    const token = match[0];
    if (token.startsWith('http://') || token.startsWith('https://')) {
      // URL Token
      parts.push(
        <a
          key={`url-${matchStart}`}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline underline-offset-2 break-all font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {token}
        </a>
      );
    } else if (token.startsWith('#')) {
      // Hashtag Token
      parts.push(
        <span
          key={`tag-${matchStart}`}
          className="inline-block text-blue-400 font-semibold hover:text-blue-300 transition-colors mx-0.5 cursor-pointer hover:underline"
        >
          {token}
        </span>
      );
    }

    lastIndex = matchEnd;
  }

  // Add trailing plain text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  const isLong = content.length > 180 || content.split('\n').length > 3;

  return (
    <div className="space-y-1.5">
      <div 
        className={`text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-line space-y-2 transition-all duration-300 ${
          !isExpanded ? 'line-clamp-3 overflow-hidden' : 'line-clamp-none'
        }`}
      >
        {parts.length > 0 ? parts : content}
      </div>

      {isLong && onToggleExpand && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 pt-0.5 cursor-pointer"
        >
          <span>
            {isExpanded 
              ? (language === 'hi' ? 'कम पढ़ें...' : 'View less') 
              : (language === 'hi' ? 'पूरा विवरण पढ़ें...' : 'View more...')}
          </span>
        </button>
      )}
    </div>
  );
};
