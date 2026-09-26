import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProfileInfo, MediaPost, PostLike, PostComment, ContactMessage, DetailedComment, MediaType, Story } from '../types';
import { DEFAULT_PROFILE, DEFAULT_POSTS, DEFAULT_MESSAGES, DEFAULT_STORIES } from '../data/defaultData';

const CONFIG_KEY = 'vrishketu_supabase_config';
const PROFILE_KEY = 'vrishketu_local_profile';
const POSTS_KEY = 'vrishketu_local_posts';
const MESSAGES_KEY = 'vrishketu_local_messages';

export interface SupabaseConfigState {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

let supabaseInstance: SupabaseClient | null = null;

export function getStoredConfig(): SupabaseConfigState {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
          isConnected: parsed.isConnected ?? false
        };
      }
    }
  } catch (e) {
    console.error('Error reading stored Supabase config:', e);
  }
  return { url: '', anonKey: '', isConnected: false };
}

export function initSupabase(url: string, anonKey: string): SupabaseClient | null {
  if (!url || !anonKey || url.trim() === '' || anonKey.trim() === '') {
    supabaseInstance = null;
    return null;
  }
  try {
    supabaseInstance = createClient(url.trim(), anonKey.trim());
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    supabaseInstance = null;
    return null;
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  const config = getStoredConfig();
  if (config.url && config.anonKey) {
    return initSupabase(config.url, config.anonKey);
  }
  return null;
}

export function saveStoredConfig(url: string, anonKey: string, isConnected = false) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ url, anonKey, isConnected }));
    if (url && anonKey) {
      initSupabase(url, anonKey);
    } else {
      supabaseInstance = null;
    }
  } catch (e) {
    console.error('Error saving Supabase config:', e);
  }
}

export function clearStoredConfig() {
  try {
    localStorage.removeItem(CONFIG_KEY);
    supabaseInstance = null;
  } catch (e) {
    console.error('Error clearing config:', e);
  }
}

// Data normalization helpers to protect against corrupted localStorage or malformed API responses
function normalizeProfile(p: any): ProfileInfo {
  if (!p || typeof p !== 'object') return DEFAULT_PROFILE;
  return {
    ...DEFAULT_PROFILE,
    ...p,
    name: p.name || DEFAULT_PROFILE.name,
    email: p.email || DEFAULT_PROFILE.email,
    telegram: p.telegram || DEFAULT_PROFILE.telegram,
    instagram: p.instagram || DEFAULT_PROFILE.instagram,
    linkedin: p.linkedin || DEFAULT_PROFILE.linkedin,
    location: p.location || DEFAULT_PROFILE.location,
    venture_1: p.venture_1 !== undefined ? p.venture_1 : DEFAULT_PROFILE.venture_1,
    venture_2: p.venture_2 !== undefined ? p.venture_2 : DEFAULT_PROFILE.venture_2,
    skills: Array.isArray(p.skills)
      ? p.skills
      : (typeof p.skills === 'string'
          ? p.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
          : DEFAULT_PROFILE.skills)
  };
}

function normalizePosts(posts: any): MediaPost[] {
  if (!Array.isArray(posts)) return DEFAULT_POSTS;
  return posts.map((p, idx) => {
    if (!p || typeof p !== 'object') {
      return {
        id: idx + 1,
        title: 'Project',
        media_type: 'image' as const,
        media_url: '',
        post_likes: [],
        post_comments: []
      };
    }
    const likesRaw = p.post_likes;
    let postLikes: PostLike[] = [];
    if (Array.isArray(likesRaw)) {
      postLikes = likesRaw.map((likeItem: any, i: number) => {
        if (typeof likeItem === 'string') {
          return { id: i, visitor_name: likeItem };
        }
        if (likeItem && typeof likeItem === 'object') {
          return {
            id: likeItem.id || i,
            post_id: p.id,
            visitor_name: typeof likeItem.visitor_name === 'string' ? likeItem.visitor_name : 'Visitor',
            created_at: likeItem.created_at
          };
        }
        return { id: i, visitor_name: 'Visitor' };
      });
    }

    const commentsRaw = p.post_comments;
    let postComments: PostComment[] = [];
    if (Array.isArray(commentsRaw)) {
      postComments = commentsRaw.map((commItem: any, i: number) => {
        if (commItem && typeof commItem === 'object') {
          return {
            id: commItem.id || i,
            post_id: p.id,
            visitor_name: typeof commItem.visitor_name === 'string' ? commItem.visitor_name : 'Visitor',
            comment_text: typeof commItem.comment_text === 'string' ? commItem.comment_text : '',
            created_at: commItem.created_at || new Date().toISOString()
          };
        }
        return { id: i, post_id: p.id, visitor_name: 'Visitor', comment_text: '', created_at: new Date().toISOString() };
      });
    }

    return {
      id: p.id || idx + 1,
      title: p.title || 'Untitled Project',
      description: p.description || '',
      media_type: (p.media_type === 'video' || p.media_type === 'audio') ? p.media_type : 'image',
      media_url: p.media_url || '',
      created_at: p.created_at || new Date().toISOString(),
      post_likes: postLikes,
      likes_count: postLikes.length || (typeof p.likes_count === 'number' ? p.likes_count : 0),
      post_comments: postComments,
      comments_count: postComments.length || (typeof p.comments_count === 'number' ? p.comments_count : 0)
    };
  });
}

// Local Storage Handlers
function getLocalProfile(): ProfileInfo {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return normalizeProfile(JSON.parse(raw));
  } catch (e) {
    console.error('Failed reading local profile:', e);
  }
  return DEFAULT_PROFILE;
}

function saveLocalProfile(profile: ProfileInfo) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed saving local profile:', e);
  }
}

function getLocalPosts(): MediaPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (raw) return normalizePosts(JSON.parse(raw));
  } catch (e) {
    console.error('Failed reading local posts:', e);
  }
  return DEFAULT_POSTS;
}

function saveLocalPosts(posts: MediaPost[]) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Failed saving local posts:', e);
  }
}

// Data API Services
export async function fetchProfileData(): Promise<{ profile: ProfileInfo; fromSupabase: boolean; error?: string }> {
  const config = getStoredConfig();
  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const { data, error } = await client.from('portfolio_info').select('*').limit(1).single();
        if (error) {
          return { profile: getLocalProfile(), fromSupabase: false, error: error.message };
        }
        if (data) {
          const local = getLocalProfile();
          const profile: ProfileInfo = {
            id: data.id,
            name: (data.name !== undefined && data.name !== null) ? data.name : (local.name || DEFAULT_PROFILE.name),
            title: data.title || DEFAULT_PROFILE.title,
            bio: data.bio || DEFAULT_PROFILE.bio,
            skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(',') : DEFAULT_PROFILE.skills),
            avatar_url: data.avatar_url || DEFAULT_PROFILE.avatar_url,
            email: data.email || DEFAULT_PROFILE.email,
            telegram: (data.telegram !== undefined && data.telegram !== null) ? data.telegram : (local.telegram || DEFAULT_PROFILE.telegram),
            github: data.github || DEFAULT_PROFILE.github,
            linkedin: data.linkedin || DEFAULT_PROFILE.linkedin,
            twitter: data.twitter || DEFAULT_PROFILE.twitter,
            instagram: data.instagram || DEFAULT_PROFILE.instagram,
            location: (data.location !== undefined && data.location !== null) ? data.location : (local.location || DEFAULT_PROFILE.location),
            venture_1: (data.venture_1 !== undefined && data.venture_1 !== null) ? data.venture_1 : (local.venture_1 || DEFAULT_PROFILE.venture_1),
            venture_2: (data.venture_2 !== undefined && data.venture_2 !== null) ? data.venture_2 : (local.venture_2 || DEFAULT_PROFILE.venture_2)
          };
          saveLocalProfile(profile);
          return { profile, fromSupabase: true };
        }
      } catch (err: unknown) {
        return { profile: getLocalProfile(), fromSupabase: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    }
  }

  return { profile: getLocalProfile(), fromSupabase: false };
}

export async function updateProfileData(profileUpdates: Partial<ProfileInfo>): Promise<{ success: boolean; error?: string }> {
  const config = getStoredConfig();
  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        // Construct the update payload dynamically
        const payload: any = {
          name: profileUpdates.name,
          title: profileUpdates.title,
          bio: profileUpdates.bio,
          skills: profileUpdates.skills,
          avatar_url: profileUpdates.avatar_url,
          email: profileUpdates.email,
          telegram: profileUpdates.telegram,
          github: profileUpdates.github,
          linkedin: profileUpdates.linkedin,
          twitter: profileUpdates.twitter,
          instagram: profileUpdates.instagram,
          location: profileUpdates.location
        };

        if (profileUpdates.venture_1 !== undefined) payload.venture_1 = profileUpdates.venture_1;
        if (profileUpdates.venture_2 !== undefined) payload.venture_2 = profileUpdates.venture_2;

        let { error } = await client
          .from('portfolio_info')
          .update(payload)
          .eq('id', profileUpdates.id || 1);

        if (error) {
          // If any missing column error occurs, fallback to absolute baseline guaranteed columns
          if (error.message.includes('column') || error.code === '42703') {
            const baselinePayload = {
              title: payload.title,
              bio: payload.bio,
              skills: payload.skills,
              avatar_url: payload.avatar_url,
              email: payload.email,
              github: payload.github,
              linkedin: payload.linkedin,
              twitter: payload.twitter,
              instagram: payload.instagram
            };

            const retryRes = await client
              .from('portfolio_info')
              .update(baselinePayload)
              .eq('id', profileUpdates.id || 1);

            error = retryRes.error;
          }
        }

        if (error) {
          // Fallback to local save
          const current = getLocalProfile();
          const updated = { ...current, ...profileUpdates };
          saveLocalProfile(updated);
          return { success: false, error: `Supabase: ${error.message} (Saved locally)` };
        }

        const current = getLocalProfile();
        saveLocalProfile({ ...current, ...profileUpdates });
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to update Supabase' };
      }
    }
  }

  // Local storage save
  const current = getLocalProfile();
  const updated = { ...current, ...profileUpdates };
  saveLocalProfile(updated);
  return { success: true };
}

export async function fetchPostsData(): Promise<{ posts: MediaPost[]; fromSupabase: boolean; error?: string }> {
  const config = getStoredConfig();
  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const { data, error } = await client
          .from('media_posts')
          .select('*, post_likes(id, visitor_name, created_at), post_comments(id, visitor_name, comment_text, created_at)')
          .order('created_at', { ascending: false });

        if (error) {
          return { posts: getLocalPosts(), fromSupabase: false, error: error.message };
        }

        if (data) {
          const posts: MediaPost[] = data.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            media_type: p.media_type,
            media_url: p.media_url,
            created_at: p.created_at,
            post_likes: p.post_likes || [],
            likes_count: (p.post_likes || []).length,
            post_comments: p.post_comments || [],
            comments_count: (p.post_comments || []).length
          }));
          saveLocalPosts(posts);
          return { posts, fromSupabase: true };
        }
      } catch (err: unknown) {
        return { posts: getLocalPosts(), fromSupabase: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    }
  }

  return { posts: getLocalPosts(), fromSupabase: false };
}

/**
 * Uploads a file directly to the Supabase Storage bucket 'portfolio-media'.
 * If Supabase is not connected, falls back to converting to a base64 Data URL
 * so that offline/local demo previews function seamlessly.
 */
export async function uploadMediaFileToSupabase(
  file: File,
  folder: string = 'portfolio-media',
  onProgress?: (progressPercent: number) => void
): Promise<{ publicUrl: string; success: boolean; fromSupabase: boolean; error?: string }> {
  const config = getStoredConfig();

  // Helper function to read file as Base64 Data URL (the fallback)
  const readAsBase64Fallback = (): Promise<{ publicUrl: string; success: boolean; fromSupabase: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (onProgress) onProgress(30);
      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve({
          publicUrl: reader.result as string,
          success: true,
          fromSupabase: false,
          error: 'Uploaded to local sandbox (Supabase upload timed out or encountered configuration issues).'
        });
      };
      reader.onerror = () => {
        resolve({
          publicUrl: '',
          success: false,
          fromSupabase: false,
          error: 'Failed to read file for local preview.'
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // 1. If Supabase is configured with URL and Anon key, attempt real Supabase Storage upload
  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const fileExt = file.name.split('.').pop() || 'dat';
        const cleanBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'file';
        const sanitizedName = cleanBaseName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
        const fileName = `${folder}/${Date.now()}_${sanitizedName}.${fileExt}`;

        // Race the upload request against a generous 120-second timeout to allow larger media on slow/mobile connections
        const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
          setTimeout(() => reject(new Error('Upload timeout (120s exceeded).')), 120000)
        );

        const uploadPromise = (async () => {
          const res = await client.storage
            .from('portfolio-media')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
              onUploadProgress: (progress: any) => {
                if (onProgress && progress.total) {
                  const percent = Math.round((progress.loaded / progress.total) * 100);
                  onProgress(percent);
                }
              }
            } as any);
          return res;
        })();

        const { data, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

        if (uploadError) {
          console.warn('Supabase storage upload error, falling back to local base64:', uploadError);
          return await readAsBase64Fallback();
        }

        // Get public URL from Supabase Storage
        const { data: urlData } = client.storage
          .from('portfolio-media')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          return {
            publicUrl: urlData.publicUrl,
            success: true,
            fromSupabase: true
          };
        }
      } catch (err: unknown) {
        console.warn('Failed uploading to Supabase Storage, falling back to base64:', err);
        return await readAsBase64Fallback();
      }
    }
  }

  // 2. Offline / Local fallback: convert file to a local Data URL (Base64)
  return readAsBase64Fallback();
}

export async function createPostData(newPost: Omit<MediaPost, 'id' | 'created_at' | 'post_likes'>): Promise<{ post?: MediaPost; success: boolean; error?: string }> {
  const config = getStoredConfig();
  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const { data, error } = await client
          .from('media_posts')
          .insert([
            {
              title: newPost.title,
              description: newPost.description,
              media_type: newPost.media_type,
              media_url: newPost.media_url
            }
          ])
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        const created: MediaPost = {
          id: data.id,
          title: data.title,
          description: data.description,
          media_type: data.media_type,
          media_url: data.media_url,
          created_at: data.created_at,
          post_likes: []
        };

        const currentPosts = getLocalPosts();
        saveLocalPosts([created, ...currentPosts]);
        return { post: created, success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    }
  }

  // Local creation
  const created: MediaPost = {
    id: Date.now(),
    title: newPost.title,
    description: newPost.description,
    media_type: newPost.media_type,
    media_url: newPost.media_url,
    created_at: new Date().toISOString(),
    post_likes: []
  };

  const currentPosts = getLocalPosts();
  saveLocalPosts([created, ...currentPosts]);
  return { post: created, success: true };
}

export async function deletePostData(postId: string | number): Promise<{ success: boolean; error?: string }> {
  const config = getStoredConfig();
  
  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        // Delete child tables (likes & comments) first to resolve Foreign Key constraints
        await client.from('post_likes').delete().eq('post_id', postId);
        await client.from('post_comments').delete().eq('post_id', postId);

        // Delete parent record
        const { error } = await client.from('media_posts').delete().eq('id', postId);
        if (error) {
          console.warn('Supabase post delete failed, falling back to local deletion:', error.message);
        }
      } catch (err: unknown) {
        console.warn('Supabase post delete encountered error, falling back to local deletion:', err);
      }
    }
  }

  const currentPosts = getLocalPosts().filter(p => String(p.id) !== String(postId));
  saveLocalPosts(currentPosts);
  return { success: true };
}

export async function updatePostData(
  postId: string | number, 
  updates: Partial<MediaPost>
): Promise<{ success: boolean; post?: MediaPost; error?: string }> {
  const config = getStoredConfig();
  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const payload: Record<string, any> = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.media_type !== undefined) payload.media_type = updates.media_type;
        if (updates.media_url !== undefined) payload.media_url = updates.media_url;
        if (updates.is_featured !== undefined) payload.is_featured = updates.is_featured;
        if (updates.is_hidden !== undefined) payload.is_hidden = updates.is_hidden;

        await client.from('media_posts').update(payload).eq('id', postId);
      } catch (err: unknown) {
        console.warn('Supabase post update failed, falling back to local update:', err);
      }
    }
  }

  const posts = getLocalPosts();
  let updatedPost: MediaPost | undefined;
  const updatedPosts = posts.map(p => {
    if (String(p.id) === String(postId)) {
      updatedPost = { ...p, ...updates };
      return updatedPost;
    }
    return p;
  });
  saveLocalPosts(updatedPosts);
  return { success: true, post: updatedPost };
}

export async function addPostLike(postId: string | number, visitorName: string): Promise<{ success: boolean; error?: string }> {
  const config = getStoredConfig();
  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const { error } = await client
          .from('post_likes')
          .insert([{ post_id: postId, visitor_name: visitorName.trim() }]);

        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    }
  }

  // Local storage like
  const posts = getLocalPosts();
  const updated = posts.map(p => {
    if (String(p.id) === String(postId)) {
      const likes: PostLike[] = p.post_likes ? [...p.post_likes] : [];
      likes.push({
        id: Date.now(),
        post_id: postId,
        visitor_name: visitorName.trim(),
        created_at: new Date().toISOString()
      });
      return { ...p, post_likes: likes, likes_count: likes.length };
    }
    return p;
  });
  saveLocalPosts(updated);
  return { success: true };
}

export async function addPostComment(
  postId: string | number, 
  visitorName: string, 
  commentText: string
): Promise<{ success: boolean; comment?: PostComment; error?: string }> {
  const config = getStoredConfig();
  const newCommentObj: PostComment = {
    id: Date.now(),
    post_id: postId,
    visitor_name: visitorName.trim(),
    comment_text: commentText.trim(),
    created_at: new Date().toISOString()
  };

  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const { data, error } = await client
          .from('post_comments')
          .insert([{
            post_id: postId,
            visitor_name: newCommentObj.visitor_name,
            comment_text: newCommentObj.comment_text
          }])
          .select()
          .single();

        if (error) {
          // Fallback to local save
          const posts = getLocalPosts();
          const updated = posts.map(p => {
            if (String(p.id) === String(postId)) {
              const comments = p.post_comments ? [...p.post_comments] : [];
              comments.push(newCommentObj);
              return { ...p, post_comments: comments, comments_count: comments.length };
            }
            return p;
          });
          saveLocalPosts(updated);
          return { success: true, comment: newCommentObj, error: `Saved locally (${error.message})` };
        }

        if (data) {
          const createdComm: PostComment = {
            id: data.id,
            post_id: data.post_id,
            visitor_name: data.visitor_name,
            comment_text: data.comment_text,
            created_at: data.created_at
          };
          const posts = getLocalPosts();
          const updated = posts.map(p => {
            if (String(p.id) === String(postId)) {
              const comments = p.post_comments ? [...p.post_comments] : [];
              comments.push(createdComm);
              return { ...p, post_comments: comments, comments_count: comments.length };
            }
            return p;
          });
          saveLocalPosts(updated);
          return { success: true, comment: createdComm };
        }
      } catch (err: unknown) {
        // Fallback to local save
        const posts = getLocalPosts();
        const updated = posts.map(p => {
          if (String(p.id) === String(postId)) {
            const comments = p.post_comments ? [...p.post_comments] : [];
            comments.push(newCommentObj);
            return { ...p, post_comments: comments, comments_count: comments.length };
          }
          return p;
        });
        saveLocalPosts(updated);
        return { success: true, comment: newCommentObj };
      }
    }
  }

  // Local storage comment
  const posts = getLocalPosts();
  const updated = posts.map(p => {
    if (String(p.id) === String(postId)) {
      const comments = p.post_comments ? [...p.post_comments] : [];
      comments.push(newCommentObj);
      return { ...p, post_comments: comments, comments_count: comments.length };
    }
    return p;
  });
  saveLocalPosts(updated);
  return { success: true, comment: newCommentObj };
}

export async function deletePostComment(commentId: string | number): Promise<{ success: boolean; error?: string }> {
  const config = getStoredConfig();
  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const { error } = await client
          .from('post_comments')
          .delete()
          .eq('id', commentId);

        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    }
  }

  // Local storage removal
  const posts = getLocalPosts();
  const updated = posts.map(p => {
    if (Array.isArray(p.post_comments)) {
      const filtered = p.post_comments.filter(c => String(c.id) !== String(commentId));
      return { ...p, post_comments: filtered, comments_count: filtered.length };
    }
    return p;
  });
  saveLocalPosts(updated);
  return { success: true };
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL and Anon Key are required.' };
  }
  try {
    const testClient = createClient(url.trim(), anonKey.trim());
    // Try querying portfolio_info
    const { error } = await testClient.from('portfolio_info').select('count', { count: 'exact', head: true });
    if (error) {
      return {
        success: false,
        message: `Connected to Supabase endpoint, but table error: "${error.message}". Did you run the SQL table creation script?`
      };
    }
    return {
      success: true,
      message: 'Successfully connected to Supabase and verified tables!'
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error connecting to Supabase.'
    };
  }
}

// -------------------------------------------------------------
// Contact Messages Operations
// -------------------------------------------------------------

function getLocalMessages(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed reading local messages:', e);
  }
  return DEFAULT_MESSAGES;
}

function saveLocalMessages(messages: ContactMessage[]) {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed saving local messages:', e);
  }
}

export async function fetchContactMessages(): Promise<{ messages: ContactMessage[]; fromSupabase: boolean; error?: string }> {
  const config = getStoredConfig();
  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const { data, error } = await client
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          return { messages: getLocalMessages(), fromSupabase: false, error: error.message };
        }

        if (data && Array.isArray(data)) {
          saveLocalMessages(data);
          return { messages: data, fromSupabase: true };
        }
      } catch (err: unknown) {
        return { messages: getLocalMessages(), fromSupabase: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    }
  }

  return { messages: getLocalMessages(), fromSupabase: false };
}

export async function createContactMessage(msg: { sender_name: string; sender_email: string; message: string }): Promise<{ success: boolean; message?: ContactMessage; error?: string }> {
  const config = getStoredConfig();
  const newMsgObj: ContactMessage = {
    id: Date.now(),
    sender_name: msg.sender_name.trim(),
    sender_email: msg.sender_email.trim(),
    message: msg.message.trim(),
    created_at: new Date().toISOString()
  };

  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const { data, error } = await client
          .from('contact_messages')
          .insert([{
            sender_name: newMsgObj.sender_name,
            sender_email: newMsgObj.sender_email,
            message: newMsgObj.message
          }])
          .select()
          .single();

        if (error) {
          // Fallback to local save
          const current = getLocalMessages();
          saveLocalMessages([newMsgObj, ...current]);
          return { success: true, message: newMsgObj, error: `Saved locally (${error.message})` };
        }

        if (data) {
          const current = getLocalMessages();
          saveLocalMessages([data, ...current]);
          return { success: true, message: data };
        }
      } catch (err: unknown) {
        // Fallback local save
        const current = getLocalMessages();
        saveLocalMessages([newMsgObj, ...current]);
        return { success: true, message: newMsgObj };
      }
    }
  }

  // Local storage save
  const current = getLocalMessages();
  const updated = [newMsgObj, ...current];
  saveLocalMessages(updated);
  return { success: true, message: newMsgObj };
}

export async function deleteContactMessage(id: string | number): Promise<{ success: boolean; error?: string }> {
  const config = getStoredConfig();
  
  if (config.isConnected && config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const { error } = await client
          .from('contact_messages')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('Supabase message delete failed, falling back to local deletion:', error.message);
        }
      } catch (err: unknown) {
        console.warn('Supabase message delete caught error, falling back to local deletion:', err);
      }
    }
  }

  // Local storage removal
  const current = getLocalMessages();
  const updated = current.filter(m => String(m.id) !== String(id));
  saveLocalMessages(updated);
  return { success: true };
}

export interface DetailedLiker {
  id: string | number;
  post_id: string | number;
  post_title: string;
  visitor_name: string;
  created_at?: string;
}

export async function fetchAllLikers(): Promise<DetailedLiker[]> {
  const posts = getLocalPosts();
  const likers: DetailedLiker[] = [];

  // Flatten from posts
  posts.forEach(post => {
    if (Array.isArray(post.post_likes)) {
      post.post_likes.forEach((like, idx) => {
        const name = typeof like === 'string' ? like : (like?.visitor_name || 'Visitor');
        likers.push({
          id: like?.id || `${post.id}-${idx}`,
          post_id: post.id,
          post_title: post.title,
          visitor_name: name,
          created_at: like?.created_at || post.created_at
        });
      });
    }
  });

  return likers;
}

export async function fetchAllComments(): Promise<DetailedComment[]> {
  const posts = getLocalPosts();
  const comments: DetailedComment[] = [];

  posts.forEach(post => {
    if (Array.isArray(post.post_comments)) {
      post.post_comments.forEach((c, idx) => {
        comments.push({
          id: c.id || `${post.id}-comm-${idx}`,
          post_id: post.id,
          post_title: post.title,
          visitor_name: c.visitor_name || 'Visitor',
          comment_text: c.comment_text || '',
          created_at: c.created_at || post.created_at
        });
      });
    }
  });

  return comments;
}

// ==========================================
// STORIES PERSISTENCE ENGINE (WhatsApp/Instagram 24-Hour Stories)
// ==========================================
const STORIES_KEY = 'vrishketu_local_stories';

export function getLocalStories(): Story[] {
  try {
    const raw = localStorage.getItem(STORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out expired stories (older than 24 hours) on load unless they are designated highlights
        const valid = parsed.filter(story => {
          if (story.title) return true; // Curated highlights don't expire
          const hours = (Date.now() - new Date(story.created_at).getTime()) / (1000 * 60 * 60);
          return hours < 48;
        });
        if (valid.length > 0) return valid;
      }
    }
  } catch (e) {
    console.error('Failed reading local stories:', e);
  }
  return DEFAULT_STORIES;
}

export function saveLocalStories(stories: Story[]) {
  try {
    // 1. Keep only non-expired stories (younger than 24 hours old) to save massive space
    const liveStories = stories.filter(story => {
      const storyTime = new Date(story.created_at).getTime();
      const ageInHours = (Date.now() - storyTime) / (1000 * 60 * 60);
      return ageInHours < 24;
    });

    // 2. Sort from newest to oldest and limit to max 10 most recent active stories
    const sortedStories = [...liveStories].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const limitedStories = sortedStories.slice(0, 10);

    localStorage.setItem(STORIES_KEY, JSON.stringify(limitedStories));
  } catch (e: any) {
    console.warn('LocalStorage quota exceeded for stories, initiating fallback cleanup:', e.message);
    try {
      // Recovery: Keep only the 3 most recent stories to fit within quota limits safely
      const superLimited = stories.slice(0, 3);
      localStorage.setItem(STORIES_KEY, JSON.stringify(superLimited));
    } catch (innerError) {
      console.error('Critical failure: Local storage quota completely full, failed saving stories:', innerError);
    }
  }
}

export async function fetchStories(): Promise<{ stories: Story[]; fromSupabase: boolean; error?: string }> {
  const config = getStoredConfig();
  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const { data, error } = await client
          .from('portfolio_stories')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          // If the table doesn't exist, we fallback nicely to localStorage
          return { stories: getLocalStories(), fromSupabase: false, error: error.message };
        }

        if (data) {
          const stories: Story[] = data.map((s: any) => ({
            id: s.id,
            media_url: s.media_url,
            media_type: s.media_type || 'image',
            caption: s.caption || '',
            created_at: s.created_at
          }));
          saveLocalStories(stories);
          return { stories, fromSupabase: true };
        }
      } catch (err: unknown) {
        return { stories: getLocalStories(), fromSupabase: false, error: err instanceof Error ? err.message : 'Unknown error' };
      }
    }
  }

  return { stories: getLocalStories(), fromSupabase: false };
}

export async function createStory(newStory: Omit<Story, 'id' | 'created_at'>): Promise<{ story?: Story; success: boolean; error?: string }> {
  const config = getStoredConfig();
  const created_at = new Date().toISOString();

  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const { data, error } = await client
          .from('portfolio_stories')
          .insert([
            {
              media_url: newStory.media_url,
              media_type: newStory.media_type,
              caption: newStory.caption || '',
              created_at
            }
          ])
          .select()
          .single();

        if (error) {
          // Fallback locally
          const localStories = getLocalStories();
          const backup: Story = {
            id: `story-${Date.now()}`,
            media_url: newStory.media_url,
            media_type: newStory.media_type,
            caption: newStory.caption,
            created_at
          };
          saveLocalStories([backup, ...localStories]);
          return { story: backup, success: true, error: `Saved locally (Supabase: ${error.message})` };
        }

        if (data) {
          const story: Story = {
            id: data.id,
            media_url: data.media_url,
            media_type: data.media_type,
            caption: data.caption,
            created_at: data.created_at
          };
          const localStories = getLocalStories();
          saveLocalStories([story, ...localStories]);
          return { story, success: true };
        }
      } catch (err: unknown) {
        // Fallback locally
        const localStories = getLocalStories();
        const backup: Story = {
          id: `story-${Date.now()}`,
          media_url: newStory.media_url,
          media_type: newStory.media_type,
          caption: newStory.caption,
          created_at
        };
        saveLocalStories([backup, ...localStories]);
        return { story: backup, success: true, error: err instanceof Error ? err.message : 'Local backup' };
      }
    }
  }

  // Local storage save
  const localStories = getLocalStories();
  const backup: Story = {
    id: `story-${Date.now()}`,
    media_url: newStory.media_url,
    media_type: newStory.media_type,
    caption: newStory.caption,
    created_at
  };
  saveLocalStories([backup, ...localStories]);
  return { story: backup, success: true };
}

export async function deleteStory(id: string | number): Promise<{ success: boolean; error?: string }> {
  const config = getStoredConfig();
  
  if (config.url && config.anonKey) {
    const client = supabaseInstance || initSupabase(config.url, config.anonKey);
    if (client) {
      try {
        const { error } = await client
          .from('portfolio_stories')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('Supabase story delete failed, falling back to local deletion:', error.message);
        }
      } catch (err: unknown) {
        console.warn('Supabase story delete caught error, falling back to local deletion:', err);
      }
    }
  }

  // Local storage removal
  const current = getLocalStories();
  const updated = current.filter(s => String(s.id) !== String(id));
  saveLocalStories(updated);
  return { success: true };
}
