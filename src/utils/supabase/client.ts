// utils/supabase/client.ts
// Standard Supabase Browser Client initialized from process.env / Next.js Vercel environment variables & fallback

import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getUrlParam(key: string): string {
  if (typeof window === 'undefined') return '';
  try {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.substring(window.location.hash.indexOf('?')) : '');
    return params.get(key) || hashParams.get(key) || '';
  } catch {
    return '';
  }
}

function getStoredLocal(): { url: string; anonKey: string } {
  if (typeof window === 'undefined') return { url: '', anonKey: '' };
  try {
    const raw = localStorage.getItem('vrishketu_supabase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { url: parsed.url || '', anonKey: parsed.anonKey || '' };
    }
  } catch {
    // ignore
  }
  return { url: '', anonKey: '' };
}

const local = getStoredLocal();

// Safe environment variable extractor for Vercel Next.js & Direct URL Parameters
const supabaseUrl = 
  getUrlParam('supabase_url') ||
  getUrlParam('url') ||
  (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_SUPABASE_URL) ||
  local.url ||
  '';

const supabaseAnonKey = 
  getUrlParam('supabase_anon_key') ||
  getUrlParam('supabase_key') ||
  getUrlParam('anon_key') ||
  getUrlParam('key') ||
  (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY) ||
  local.anonKey ||
  '';

let client: SupabaseClient | null = null;

export function createClientComponentClient(): SupabaseClient | null {
  if (client) return client;
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  client = createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
  return client;
}

export const supabase = createClientComponentClient();
