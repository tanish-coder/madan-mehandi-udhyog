import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://evbuchyepfjaxkeekxdm.supabase.co';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2YnVjaHllcGZqYXhrZWVreGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzNTc1OTksImV4cCI6MjExMDkzMzU5OX0.0AAYwjOvchdHRpZh5p1xYIyrw0AzOWomXq07xp9RxtU';

// Capture Google OAuth redirect hash/query BEFORE Supabase SDK strips it from the URL
if (typeof window !== 'undefined') {
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  if (
    hash.includes('access_token=') ||
    search.includes('code=') ||
    search.includes('google_callback=true')
  ) {
    try {
      localStorage.setItem('mmu_google_oauth_pending', String(Date.now()));
    } catch (_) {}
  }
}

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
