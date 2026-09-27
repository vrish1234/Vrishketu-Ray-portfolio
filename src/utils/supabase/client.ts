// utils/supabase/client.ts
// Standard Supabase Browser Client initialized from process.env / Next.js Vercel environment variables

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

// Safe environment variable extractor for Vercel Next.js & Direct URL Parameters
const supabaseUrl = 
  getUrlParam('supabase_url') ||
  getUrlParam('url') ||
  (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_SUPABASE_URL) ||
  '';

const supabaseAnonKey = 
  getUrlParam('supabase_anon_key') ||
  getUrlParam('supabase_key') ||
  getUrlParam('anon_key') ||
  getUrlParam('key') ||
  (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

let client: SupabaseClient | null = null;

export function createClientComponentClient(): SupabaseClient | null {
  if (client) return client;
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  client = createClient(supabaseUrl.trim(), supabaseAnonKey.trim());
  return client;
}

export const supabase = createClientComponentClient();
