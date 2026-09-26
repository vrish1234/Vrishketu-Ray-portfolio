export type MediaType = 'image' | 'video' | 'audio';

export interface PostLike {
  id?: string | number;
  post_id?: string | number;
  visitor_name: string;
  created_at?: string;
}

export interface PostComment {
  id?: string | number;
  post_id?: string | number;
  visitor_name: string;
  comment_text: string;
  created_at?: string;
}

export interface MediaPost {
  id: string | number;
  title: string;
  description?: string;
  media_type: MediaType;
  media_url: string;
  created_at?: string;
  post_likes?: PostLike[];
  likes_count?: number;
  post_comments?: PostComment[];
  comments_count?: number;
  is_featured?: boolean;
  is_hidden?: boolean;
}

export interface ProfileInfo {
  id?: number | string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  avatar_url?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  telegram?: string;
  location?: string;
  venture_1?: string;
  venture_2?: string;
}

export interface ContactMessage {
  id: string | number;
  sender_name: string;
  sender_email: string;
  message: string;
  created_at?: string;
  read?: boolean;
}

export interface DetailedComment {
  id: string | number;
  post_id: string | number;
  post_title: string;
  visitor_name: string;
  comment_text: string;
  created_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export interface Story {
  id: string | number;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  created_at: string;
  title?: string;
  category?: string;
  is_active?: boolean;
}

export type Language = 'hi' | 'en';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
  is_featured?: boolean;
}

export interface InstagramItem {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL';
  media_url: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  thumbnail_url?: string;
  like_count?: number;
  comments_count?: number;
  is_reel?: boolean;
  is_story?: boolean;
}

export interface LinkedInPost {
  id: string;
  author_name: string;
  author_title: string;
  author_avatar?: string;
  content: string;
  post_url: string;
  published_at: string;
  likes_count?: number;
  comments_count?: number;
  image_url?: string;
  article_url?: string;
  article_title?: string;
}

export interface SocialSyncConfig {
  github_username: string;
  github_auto_sync: boolean;
  github_last_synced?: string;
  instagram_username: string;
  instagram_auto_sync: boolean;
  instagram_last_synced?: string;
  linkedin_profile_url: string;
  linkedin_auto_sync: boolean;
  linkedin_last_synced?: string;
  hide_sample_posts?: boolean;
  user_only_mode?: boolean;
}

export type ProjectsSubTab = 'all' | 'github' | 'instagram' | 'linkedin';
