import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://supabasekong-db.stratilla.com';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjU4MDI0MCwiZXhwIjo0OTI4MjUzODQwLCJyb2xlIjoiYW5vbiJ9.uzQvm2v_4GmwBVgdkhvg3MHyCinajp9AVQZlOxYCYb0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
