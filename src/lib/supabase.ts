import { createClient } from '@supabase/supabase-js';

// Server-side supabase client for Astro pages
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);
