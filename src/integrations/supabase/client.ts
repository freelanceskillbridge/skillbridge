import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced configuration with proper auth settings
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // CRITICAL: Use PKCE for better security
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null;
        const item = localStorage.getItem(key);
        // Parse JSON if it's stored as JSON
        try {
          return item ? JSON.parse(item) : null;
        } catch {
          return item;
        }
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return;
        // Store as JSON string
        localStorage.setItem(key, JSON.stringify(value));
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
      },
    },
    // Cookie options for better session management
    cookieOptions: {
      name: 'sb-token',
      lifetime: 60 * 60 * 8, // 8 hours
      domain: '',
      path: '/',
      sameSite: 'lax'
    },
    // Debug mode in development
    debug: import.meta.env.DEV,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
  },
  db: {
    schema: 'public',
  },
});