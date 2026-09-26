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

export type Language = 'hi' | 'en';
