
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with proper error handling
// Note: In a real app, these would come from environment variables
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

// Create client with safeguards
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Verify client is created properly
if (!supabase) {
  console.error("Failed to initialize Supabase client");
}

// Database schema should have:
// - programs table: id, name, description, highlights, selling_points, target_audience
// - generated_scripts table: id, program_id, reference_file_path, versions (JSON containing script versions)
