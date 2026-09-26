import { LinkedInPost } from '../types';

export interface RichLinkMetadata {
  url: string;
  domain: string;
  displayDomain: string;
  title: string;
  description: string;
  imageUrl?: string;
  siteName: string;
  type: 'article' | 'github' | 'linkedin' | 'media' | 'general';
}

export interface ExtractedMedia {
  imageUrls: string[];
  articleLinks: RichLinkMetadata[];
  linkedInUrl?: string;
}

// Regex to capture standard HTTP/HTTPS URLs
export const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;

// Regex to test if a URL points to an image file or known image CDN
export const IMAGE_URL_REGEX = /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i;

// Regex for hashtags in English and Hindi/Devanagari
export const HASHTAG_REGEX = /(#[a-zA-Z0-9_\u0900-\u097F]+)/g;

/**
 * Validates if a URL is an image
 */
export function isImageUrl(url: string): boolean {
  if (!url) return false;
  if (IMAGE_URL_REGEX.test(url)) return true;
  if (url.includes('images.unsplash.com') || url.includes('i.imgur.com') || url.includes('res.cloudinary.com')) {
    return true;
  }
  return false;
}

/**
 * Checks if a URL is a LinkedIn post or profile link
 */
export function isLinkedInUrl(url: string): boolean {
  if (!url) return false;
  return /linkedin\.com\/(posts|feed\/update|pulse|in)\//i.test(url);
}

/**
 * Extracts domain name cleanly from a URL
 */
export function extractDomain(urlStr: string): { domain: string; displayDomain: string } {
  try {
    const parsed = new URL(urlStr);
    const domain = parsed.hostname.toLowerCase();
    const displayDomain = domain.replace(/^www\./, '');
    return { domain, displayDomain };
  } catch {
    return { domain: 'web', displayDomain: 'web' };
  }
}

/**
 * Intelligent parser that extracts rich metadata from a URL and optional context
 */
export function parseRichLinkMetadata(
  url: string,
  contextTitle?: string,
  contextSnippet?: string
): RichLinkMetadata {
  const { domain, displayDomain } = extractDomain(url);

  // GitHub Repo or Issue Link
  if (domain.includes('github.com')) {
    const parts = url.replace(/https?:\/\/github\.com\//, '').split('/');
    const repoName = parts.slice(0, 2).join(' / ') || 'GitHub Repository';
    return {
      url,
      domain,
      displayDomain: 'github.com',
      title: contextTitle || repoName,
      description: contextSnippet || 'Explore open-source codebase, branches, pull requests, and releases on GitHub.',
      imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80',
      siteName: 'GitHub',
      type: 'github'
    };
  }

  // LinkedIn Post / Article / Profile Link
  if (domain.includes('linkedin.com')) {
    return {
      url,
      domain,
      displayDomain: 'linkedin.com',
      title: contextTitle || 'View Discussion & Professional Updates on LinkedIn',
      description: contextSnippet || 'Read comments, reactions, and professional insights directly from Vrishketu Ray on LinkedIn.',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      siteName: 'LinkedIn',
      type: 'linkedin'
    };
  }

  // Dev.to or Technical Blog Link
  if (domain.includes('dev.to') || domain.includes('medium.com') || domain.includes('hashnode.dev')) {
    return {
      url,
      domain,
      displayDomain,
      title: contextTitle || (displayDomain === 'dev.to' ? 'Technical Architecture Article on DEV' : 'Engineering Blog Post'),
      description: contextSnippet || 'In-depth software engineering breakdown, benchmarks, and architectural design patterns.',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      siteName: displayDomain.toUpperCase(),
      type: 'article'
    };
  }

  // Mukt Vishwavidyalaya or AI-Edura Project Link
  if (domain.includes('mukt-vishwavidyalaya') || domain.includes('ai-edura') || domain.includes('ugrasena')) {
    return {
      url,
      domain,
      displayDomain,
      title: contextTitle || 'Mukt Vishwavidyalaya - AI EdTech Initiative',
      description: contextSnippet || 'Democratizing quality higher education and technical skills across India through open-source AI mentoring.',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      siteName: 'Project Showcase',
      type: 'article'
    };
  }

  // General Web Link
  const fallbackTitle = contextTitle || `Resource on ${displayDomain}`;
  return {
    url,
    domain,
    displayDomain,
    title: fallbackTitle,
    description: contextSnippet || `Read the full publication and shared resources on ${displayDomain}.`,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    siteName: displayDomain,
    type: 'general'
  };
}

/**
 * Regex parser that examines a LinkedIn post's content and metadata,
 * extracting all images, article URLs, and rich preview cards.
 */
export function extractPostMediaAndLinks(post: LinkedInPost): ExtractedMedia {
  const imageUrls: string[] = [];
  const articleLinks: RichLinkMetadata[] = [];
  const seenUrls = new Set<string>();

  // 1. Check explicit post.image_url
  if (post.image_url && post.image_url.trim()) {
    imageUrls.push(post.image_url.trim());
    seenUrls.add(post.image_url.trim());
  }

  // 2. Check explicit post.article_url
  if (post.article_url && post.article_url.trim() && !seenUrls.has(post.article_url.trim())) {
    const meta = parseRichLinkMetadata(
      post.article_url.trim(),
      post.article_title,
      undefined
    );
    articleLinks.push(meta);
    seenUrls.add(post.article_url.trim());
  }

  // 3. Scan post.content for embedded URLs using regex
  const matchedUrls = post.content.match(URL_REGEX);
  if (matchedUrls) {
    for (const rawUrl of matchedUrls) {
      const cleanUrl = rawUrl.trim();
      if (!cleanUrl || seenUrls.has(cleanUrl)) continue;

      if (isImageUrl(cleanUrl)) {
        imageUrls.push(cleanUrl);
        seenUrls.add(cleanUrl);
      } else {
        const meta = parseRichLinkMetadata(cleanUrl);
        articleLinks.push(meta);
        seenUrls.add(cleanUrl);
      }
    }
  }

  return {
    imageUrls,
    articleLinks,
    linkedInUrl: post.post_url
  };
}
