import { GitHubRepo, InstagramItem, LinkedInPost, SocialSyncConfig } from '../types';
import { 
  DEFAULT_SOCIAL_CONFIG, 
  DEFAULT_GITHUB_REPOS, 
  DEFAULT_INSTAGRAM_ITEMS, 
  DEFAULT_LINKEDIN_POSTS 
} from '../data/defaultSocialData';

const SOCIAL_CONFIG_KEY = 'vrishketu_social_sync_config';
const GITHUB_CACHE_KEY = 'vrishketu_github_repos_cache';
const GITHUB_USER_CACHE_KEY = 'vrishketu_github_user_cache';
const INSTAGRAM_CACHE_KEY = 'vrishketu_instagram_items_cache';
const LINKEDIN_CACHE_KEY = 'vrishketu_linkedin_posts_cache';

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
  return cfg.hide_sample_posts ? [] : DEFAULT_GITHUB_REPOS;
}

export function saveStoredGitHubRepos(repos: GitHubRepo[]) {
  try {
    localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(repos));
  } catch (e) {
    console.error('Error saving GitHub repos to storage:', e);
  }
}

export async function fetchLiveGitHubRepos(username: string, allowFallback: boolean = false): Promise<{
  success: boolean;
  repos: GitHubRepo[];
  source: 'api' | 'cache' | 'default';
  error?: string;
}> {
  const cleanUsername = username.trim().replace(/^@/, '');
  if (!cleanUsername) {
    return { success: false, repos: getStoredGitHubRepos(), source: 'cache', error: 'Invalid username' };
  }

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=updated&per_page=100`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

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
          github_username: cleanUsername,
          github_last_synced: new Date().toISOString() 
        });

        return { 
          success: true, 
          repos: mappedRepos, 
          source: 'api',
          error: mappedRepos.length === 0 ? `0 public repositories found for @${cleanUsername} on GitHub.` : undefined
        };
      }
    } else if (res.status === 404) {
      const existing = allowFallback ? getStoredGitHubRepos() : [];
      if (!allowFallback) saveStoredGitHubRepos([]);
      return { 
        success: false, 
        repos: existing, 
        source: 'cache',
        error: `GitHub user @${cleanUsername} was not found on GitHub. Please check the spelling.`
      };
    } else if (res.status === 403) {
      return { 
        success: false, 
        repos: getStoredGitHubRepos(), 
        source: 'cache',
        error: 'GitHub API rate limit reached. Displaying cached repository data.'
      };
    }
  } catch (err: any) {
    console.warn('Network error while querying GitHub API:', err);
  }

  return { success: false, repos: getStoredGitHubRepos(), source: 'cache', error: 'Network error connecting to GitHub' };
}

export async function fetchLiveGitHubProfile(username: string): Promise<GitHubUserProfile | null> {
  const cleanUsername = username.trim().replace(/^@/, '');
  if (!cleanUsername) return null;

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`);
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
    console.warn('Failed to fetch GitHub profile info:', err);
  }

  try {
    const cached = localStorage.getItem(GITHUB_USER_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}

  return null;
}

// ======================== INSTAGRAM SYNC ========================

export function getStoredInstagramItems(): InstagramItem[] {
  const cfg = getSocialSyncConfig();
  try {
    const raw = localStorage.getItem(INSTAGRAM_CACHE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (cfg.hide_sample_posts) {
          return parsed.filter(item => !isSampleSocialItem(item.id));
        }
        return parsed;
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
}

export function addInstagramItem(item: Omit<InstagramItem, 'id' | 'timestamp'>): InstagramItem {
  const current = getStoredInstagramItems();
  const newItem: InstagramItem = {
    ...item,
    id: `ig_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString()
  };
  const updated = [newItem, ...current];
  saveStoredInstagramItems(updated);
  return newItem;
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

export async function syncAllPlatforms(configOverride?: Partial<SocialSyncConfig>): Promise<{
  success: boolean;
  githubCount: number;
  instagramCount: number;
  linkedinCount: number;
  message: string;
}> {
  const config = configOverride ? saveSocialSyncConfig(configOverride) : getSocialSyncConfig();
  
  // 1. Sync GitHub Live
  const githubRes = await fetchLiveGitHubRepos(config.github_username);
  
  // 2. Read Instagram & LinkedIn items
  const igItems = getStoredInstagramItems();
  const liPosts = getStoredLinkedInPosts();

  saveSocialSyncConfig({
    github_last_synced: new Date().toISOString(),
    instagram_last_synced: new Date().toISOString(),
    linkedin_last_synced: new Date().toISOString()
  });

  return {
    success: true,
    githubCount: githubRes.repos.length,
    instagramCount: igItems.length,
    linkedinCount: liPosts.length,
    message: `All platforms synchronized! Found ${githubRes.repos.length} GitHub repos, ${igItems.length} Instagram media posts, and ${liPosts.length} LinkedIn updates.`
  };
}
