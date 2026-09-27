import { GitHubRepo, InstagramItem, LinkedInPost, SocialSyncConfig } from '../types';
import { 
  DEFAULT_SOCIAL_CONFIG, 
  DEFAULT_GITHUB_REPOS, 
  DEFAULT_INSTAGRAM_ITEMS, 
  DEFAULT_LINKEDIN_POSTS 
} from '../data/defaultSocialData';
import { getSupabaseClient } from './supabase';

const SOCIAL_CONFIG_KEY = 'vrishketu_social_sync_config';
const GITHUB_CACHE_KEY = 'vrishketu_github_repos_cache';
const GITHUB_USER_CACHE_KEY = 'vrishketu_github_user_cache';
const INSTAGRAM_CACHE_KEY = 'vrishketu_instagram_items_cache';
const LINKEDIN_CACHE_KEY = 'vrishketu_linkedin_posts_cache';

// Request timeout in milliseconds to prevent infinite hanging
const API_TIMEOUT_MS = 8000;

/**
 * Fetch with automatic AbortSignal timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = API_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timer);
    return response;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}

// ======================== SOCIAL CONFIG ========================

export function getSocialSyncConfig(): SocialSyncConfig {
  try {
    const raw = localStorage.getItem(SOCIAL_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SOCIAL_CONFIG,
        ...parsed
      };
    }
  } catch (e) {
    console.error('Error reading social sync config:', e);
  }
  return DEFAULT_SOCIAL_CONFIG;
}

export function saveSocialSyncConfig(config: Partial<SocialSyncConfig>): SocialSyncConfig {
  try {
    const current = getSocialSyncConfig();
    const updated: SocialSyncConfig = {
      ...current,
      ...config
    };
    localStorage.setItem(SOCIAL_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving social sync config:', e);
    return getSocialSyncConfig();
  }
}

// ======================== GITHUB API SYNC ========================

export interface GitHubUserProfile {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

export function isSampleSocialItem(id: string | number): boolean {
  if (typeof id === 'number') {
    return id >= 101 && id <= 105;
  }
  return id.startsWith('ig_00') || id.startsWith('li_00');
}

export function getStoredGitHubRepos(): GitHubRepo[] {
  const cfg = getSocialSyncConfig();
  try {
    const raw = localStorage.getItem(GITHUB_CACHE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (cfg.hide_sample_posts) {
          return parsed.filter(r => !isSampleSocialItem(r.id));
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored GitHub repos:', e);
  }
  return cfg.hide_sample_posts 
    ? DEFAULT_GITHUB_REPOS.filter(r => !isSampleSocialItem(r.id)) 
    : DEFAULT_GITHUB_REPOS;
}

export function saveStoredGitHubRepos(repos: GitHubRepo[]) {
  try {
    localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(repos));
  } catch (e) {
    console.error('Error saving GitHub repos to storage:', e);
  }

  // Also try syncing to Supabase if connected
  const supabase = getSupabaseClient();
  if (supabase && repos.length > 0) {
    (async () => {
      try {
        await supabase
          .from('github_repos')
          .upsert(
            repos.map(r => ({
              id: r.id,
              name: r.name,
              full_name: r.full_name,
              html_url: r.html_url,
              description: r.description,
              fork: r.fork,
              pushed_at: r.pushed_at,
              language: r.language,
              stargazers_count: r.stargazers_count,
              topics: r.topics
            })),
            { onConflict: 'id' }
          );
      } catch (err) {
        console.log('Supabase github_repos sync skipped:', err);
      }
    })();
  }
}

/**
 * Clean and normalize GitHub username from inputs like:
 * "@vrishketu-ray", "https://github.com/vrishketu-ray", "vrish1234"
 */
export function cleanGitHubUsername(input: string): string {
  if (!input) return 'vrish1234';
  let cleaned = input.trim().replace(/^@/, '');
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
  cleaned = cleaned.split('/')[0].trim();
  return cleaned || 'vrish1234';
}

/**
 * Fetch public repositories from GitHub API with rate limit handling,
 * timeout protection, and smart fallback username support.
 */
export async function fetchLiveGitHubRepos(username: string, allowFallback: boolean = true): Promise<{
  success: boolean;
  repos: GitHubRepo[];
  source: 'api' | 'cache' | 'default';
  error?: string;
  actualUsername?: string;
}> {
  const cleanUsername = cleanGitHubUsername(username);
  const candidateUsernames = [cleanUsername];
  
  // If user entered vrishketu-ray or variant, also queue vrish1234 (actual verified active handle)
  if (cleanUsername !== 'vrish1234' && (cleanUsername.includes('vrish') || cleanUsername.includes('ray'))) {
    candidateUsernames.push('vrish1234');
  }

  for (const targetUser of candidateUsernames) {
    try {
      const res = await fetchWithTimeout(
        `https://api.github.com/users/${encodeURIComponent(targetUser)}/repos?sort=updated&per_page=100`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        },
        7000
      );

      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData)) {
          const mappedRepos: GitHubRepo[] = rawData.map((item: any) => ({
            id: item.id,
            name: item.name,
            full_name: item.full_name,
            html_url: item.html_url,
            description: item.description || null,
            fork: !!item.fork,
            created_at: item.created_at,
            updated_at: item.updated_at,
            pushed_at: item.pushed_at,
            homepage: item.homepage || null,
            size: item.size || 0,
            stargazers_count: item.stargazers_count || 0,
            watchers_count: item.watchers_count || 0,
            language: item.language || null,
            forks_count: item.forks_count || 0,
            open_issues_count: item.open_issues_count || 0,
            topics: Array.isArray(item.topics) ? item.topics : [],
            is_featured: false
          }));

          saveStoredGitHubRepos(mappedRepos);
          saveSocialSyncConfig({ 
            github_username: targetUser,
            github_last_synced: new Date().toISOString() 
          });

          return { 
            success: true, 
            repos: mappedRepos, 
            source: 'api',
            actualUsername: targetUser,
            error: mappedRepos.length === 0 ? `0 public repositories found for @${targetUser} on GitHub.` : undefined
          };
        }
      } else if (res.status === 403) {
        // Rate limit reached
        const cached = getStoredGitHubRepos();
        return { 
          success: true, 
          repos: cached, 
          source: 'cache',
          error: 'GitHub API rate limit active. Using cached repository data.'
        };
      }
      // If 404, loop will try next candidate (e.g. vrish1234)
    } catch (err: any) {
      console.warn(`Error querying GitHub API for @${targetUser}:`, err?.message || err);
    }
  }

  // If network failed completely or no candidates found, return cache safely
  const cached = getStoredGitHubRepos();
  return { 
    success: cached.length > 0, 
    repos: cached, 
    source: 'cache',
    error: cached.length > 0 ? undefined : `Could not reach GitHub for @${cleanUsername}.`
  };
}

export async function fetchLiveGitHubProfile(username: string): Promise<GitHubUserProfile | null> {
  const cleanUsername = cleanGitHubUsername(username);
  const candidates = [cleanUsername, 'vrish1234'];

  for (const user of candidates) {
    try {
      const res = await fetchWithTimeout(`https://api.github.com/users/${encodeURIComponent(user)}`, {}, 5000);
      if (res.ok) {
        const data = await res.json();
        const profile: GitHubUserProfile = {
          login: data.login,
          name: data.name || data.login,
          avatar_url: data.avatar_url,
          bio: data.bio || '',
          public_repos: data.public_repos || 0,
          followers: data.followers || 0,
          following: data.following || 0,
          html_url: data.html_url
        };
        try {
          localStorage.setItem(GITHUB_USER_CACHE_KEY, JSON.stringify(profile));
        } catch {}
        return profile;
      }
    } catch (err) {
      console.warn(`Failed to fetch GitHub profile info for @${user}:`, err);
    }
  }

  try {
    const cached = localStorage.getItem(GITHUB_USER_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}

  return null;
}

// ======================== INSTAGRAM SYNC ========================

export function extractInstagramShortcode(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  const match = clean.match(/(?:instagram\.com\/(?:p|reel|tv|reels)\/)([\w-]+)/i);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export function getInstagramEmbedUrl(url: string | undefined | null, shortcode?: string): string | null {
  const code = shortcode || extractInstagramShortcode(url);
  if (code) {
    return `https://www.instagram.com/p/${code}/embed/`;
  }
  return null;
}

export function getStoredInstagramItems(): InstagramItem[] {
  const cfg = getSocialSyncConfig();
  try {
    const raw = localStorage.getItem(INSTAGRAM_CACHE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const enriched = parsed.map((item: any) => {
          const sc = item.shortcode || extractInstagramShortcode(item.permalink) || extractInstagramShortcode(item.media_url);
          return {
            ...item,
            shortcode: sc || undefined
          };
        });
        if (cfg.hide_sample_posts) {
          return enriched.filter((item: InstagramItem) => !isSampleSocialItem(item.id));
        }
        return enriched;
      }
    }
  } catch (e) {
    console.error('Error reading stored Instagram items:', e);
  }
  return cfg.hide_sample_posts ? [] : DEFAULT_INSTAGRAM_ITEMS;
}

export function saveStoredInstagramItems(items: InstagramItem[]) {
  try {
    localStorage.setItem(INSTAGRAM_CACHE_KEY, JSON.stringify(items));
    saveSocialSyncConfig({ instagram_last_synced: new Date().toISOString() });
  } catch (e) {
    console.error('Error saving Instagram items to storage:', e);
  }

  // Also sync to Supabase if connected
  const supabase = getSupabaseClient();
  if (supabase && items.length > 0) {
    (async () => {
      try {
        await supabase
          .from('instagram_items')
          .upsert(
            items.map(item => ({
              id: item.id,
              caption: item.caption,
              media_type: item.media_type,
              media_url: item.media_url,
              thumbnail_url: item.thumbnail_url,
              permalink: item.permalink,
              timestamp: item.timestamp,
              is_reel: item.is_reel,
              like_count: item.like_count,
              comments_count: item.comments_count
            })),
            { onConflict: 'id' }
          );
      } catch (err) {
        console.log('Supabase instagram_items sync skipped:', err);
      }
    })();
  }
}

export async function fetchLiveInstagramMedia(accessToken?: string): Promise<{
  success: boolean;
  items: InstagramItem[];
  source: 'api' | 'cache';
  error?: string;
}> {
  if (accessToken && accessToken.trim()) {
    try {
      const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${encodeURIComponent(accessToken.trim())}`;
      const res = await fetchWithTimeout(url, {}, 7000);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          const mapped: InstagramItem[] = json.data.map((item: any) => ({
            id: item.id,
            caption: item.caption || '',
            media_type: item.media_type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
            media_url: item.media_url || item.thumbnail_url || '',
            thumbnail_url: item.thumbnail_url || item.media_url,
            permalink: item.permalink || `https://instagram.com/p/${item.id}`,
            timestamp: item.timestamp || new Date().toISOString(),
            is_reel: item.media_type === 'VIDEO',
            shortcode: extractInstagramShortcode(item.permalink) || item.id
          }));
          saveStoredInstagramItems(mapped);
          return { success: true, items: mapped, source: 'api' };
        }
      }
    } catch (e: any) {
      console.warn('Meta Graph API fetch error:', e?.message || e);
    }
  }

  const cached = getStoredInstagramItems();
  return { success: true, items: cached, source: 'cache' };
}

export function addInstagramItem(item: Omit<InstagramItem, 'id' | 'timestamp'>): InstagramItem {
  const current = getStoredInstagramItems();
  const shortcode = item.shortcode || extractInstagramShortcode(item.permalink) || extractInstagramShortcode(item.media_url) || undefined;
  
  const newItem: InstagramItem = {
    ...item,
    id: `ig_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    shortcode
  };
  const updated = [newItem, ...current];
  saveStoredInstagramItems(updated);
  return newItem;
}

export function updateInstagramItem(id: string, updates: Partial<InstagramItem>): InstagramItem | null {
  const current = getStoredInstagramItems();
  let found: InstagramItem | null = null;
  const updated = current.map(item => {
    if (item.id === id) {
      found = { ...item, ...updates };
      return found;
    }
    return item;
  });
  if (found) {
    saveStoredInstagramItems(updated);
  }
  return found;
}

export function deleteInstagramItem(id: string): boolean {
  const current = getStoredInstagramItems();
  const filtered = current.filter(item => item.id !== id);
  saveStoredInstagramItems(filtered);
  return true;
}

// ======================== LINKEDIN SYNC ========================

export function getStoredLinkedInPosts(): LinkedInPost[] {
  const cfg = getSocialSyncConfig();
  try {
    const raw = localStorage.getItem(LINKEDIN_CACHE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (cfg.hide_sample_posts) {
          return parsed.filter(post => !isSampleSocialItem(post.id));
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored LinkedIn posts:', e);
  }
  return cfg.hide_sample_posts ? [] : DEFAULT_LINKEDIN_POSTS;
}

export function saveStoredLinkedInPosts(posts: LinkedInPost[]) {
  try {
    localStorage.setItem(LINKEDIN_CACHE_KEY, JSON.stringify(posts));
    saveSocialSyncConfig({ linkedin_last_synced: new Date().toISOString() });
  } catch (e) {
    console.error('Error saving LinkedIn posts to storage:', e);
  }

  // Also sync to Supabase if connected
  const supabase = getSupabaseClient();
  if (supabase && posts.length > 0) {
    (async () => {
      try {
        await supabase
          .from('linkedin_posts')
          .upsert(
            posts.map(post => ({
              id: post.id,
              author_name: post.author_name,
              author_title: post.author_title,
              author_avatar: post.author_avatar,
              content: post.content,
              post_url: post.post_url,
              published_at: post.published_at,
              likes_count: post.likes_count,
              comments_count: post.comments_count,
              article_title: post.article_title,
              article_url: post.article_url,
              image_url: post.image_url
            })),
            { onConflict: 'id' }
          );
      } catch (err) {
        console.log('Supabase linkedin_posts sync skipped:', err);
      }
    })();
  }
}

export async function fetchLiveLinkedInPosts(accessToken?: string): Promise<{
  success: boolean;
  posts: LinkedInPost[];
  source: 'api' | 'cache';
  error?: string;
}> {
  if (accessToken && accessToken.trim()) {
    try {
      const res = await fetchWithTimeout(
        'https://api.linkedin.com/v2/ugcPosts?q=authors',
        {
          headers: {
            'Authorization': `Bearer ${accessToken.trim()}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        },
        7000
      );
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.elements)) {
          const mapped: LinkedInPost[] = json.elements.map((el: any) => ({
            id: el.id,
            author_name: 'Vrishketu Ray',
            author_title: 'EdTech Entrepreneur & Full-Stack Architect',
            author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            content: el.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
            post_url: `https://www.linkedin.com/feed/update/${el.id}`,
            published_at: new Date(el.created?.time || Date.now()).toISOString(),
            likes_count: 0,
            comments_count: 0
          }));
          saveStoredLinkedInPosts(mapped);
          return { success: true, posts: mapped, source: 'api' };
        }
      }
    } catch (e: any) {
      console.warn('LinkedIn API fetch error:', e?.message || e);
    }
  }

  const cached = getStoredLinkedInPosts();
  return { success: true, posts: cached, source: 'cache' };
}

export function addLinkedInPost(post: Omit<LinkedInPost, 'id' | 'published_at'>): LinkedInPost {
  const current = getStoredLinkedInPosts();
  const newPost: LinkedInPost = {
    ...post,
    id: `li_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    published_at: new Date().toISOString()
  };
  const updated = [newPost, ...current];
  saveStoredLinkedInPosts(updated);
  return newPost;
}

export function deleteLinkedInPost(id: string): boolean {
  const current = getStoredLinkedInPosts();
  const filtered = current.filter(item => item.id !== id);
  saveStoredLinkedInPosts(filtered);
  return true;
}

// ======================== CLEANUP / RESTORE SAMPLE DATA ========================

export function clearAllSampleData(): {
  clearedRepos: number;
  clearedIg: number;
  clearedLi: number;
} {
  const repos = getStoredGitHubRepos().filter(r => !isSampleSocialItem(r.id));
  const igs = getStoredInstagramItems().filter(item => !isSampleSocialItem(item.id));
  const lis = getStoredLinkedInPosts().filter(post => !isSampleSocialItem(post.id));

  saveStoredGitHubRepos(repos);
  saveStoredInstagramItems(igs);
  saveStoredLinkedInPosts(lis);
  saveSocialSyncConfig({ hide_sample_posts: true, user_only_mode: true });

  return {
    clearedRepos: repos.length,
    clearedIg: igs.length,
    clearedLi: lis.length
  };
}

export function restoreSampleData() {
  saveStoredGitHubRepos(DEFAULT_GITHUB_REPOS);
  saveStoredInstagramItems(DEFAULT_INSTAGRAM_ITEMS);
  saveStoredLinkedInPosts(DEFAULT_LINKEDIN_POSTS);
  saveSocialSyncConfig({ hide_sample_posts: false, user_only_mode: false });
}

// ======================== UNIFIED GLOBAL SYNC ========================

/**
 * Robust master sync function that synchronizes GitHub, Instagram, and LinkedIn.
 * Guaranteed to NEVER hang indefinitely thanks to timeout protection and Promise.allSettled.
 */
export async function syncAllPlatforms(configOverride?: Partial<SocialSyncConfig>): Promise<{
  success: boolean;
  githubCount: number;
  instagramCount: number;
  linkedinCount: number;
  message: string;
  errors: string[];
}> {
  const config = configOverride ? saveSocialSyncConfig(configOverride) : getSocialSyncConfig();
  const errors: string[] = [];

  // Wrap all sync operations in Promise.allSettled with timeout
  const [githubResult, instagramResult, linkedInResult] = await Promise.allSettled([
    fetchLiveGitHubRepos(config.github_username || 'vrish1234'),
    fetchLiveInstagramMedia(),
    fetchLiveLinkedInPosts()
  ]);

  let githubRepos = getStoredGitHubRepos();
  if (githubResult.status === 'fulfilled') {
    if (githubResult.value.repos) {
      githubRepos = githubResult.value.repos;
    }
    if (githubResult.value.error) {
      errors.push(`GitHub: ${githubResult.value.error}`);
    }
  } else {
    errors.push(`GitHub sync error: ${githubResult.reason?.message || 'Network timeout'}`);
  }

  let instagramItems = getStoredInstagramItems();
  if (instagramResult.status === 'fulfilled') {
    if (instagramResult.value.items) {
      instagramItems = instagramResult.value.items;
    }
  }

  let linkedInPosts = getStoredLinkedInPosts();
  if (linkedInResult.status === 'fulfilled') {
    if (linkedInResult.value.posts) {
      linkedInPosts = linkedInResult.value.posts;
    }
  }

  const nowIso = new Date().toISOString();
  saveSocialSyncConfig({
    github_last_synced: nowIso,
    instagram_last_synced: nowIso,
    linkedin_last_synced: nowIso
  });

  return {
    success: true,
    githubCount: githubRepos.length,
    instagramCount: instagramItems.length,
    linkedinCount: linkedInPosts.length,
    message: `Synchronized: ${githubRepos.length} GitHub repos, ${instagramItems.length} Instagram media, ${linkedInPosts.length} LinkedIn updates.`,
    errors
  };
}
