
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Note: In a real app, these would come from environment variables
export const supabase = createClient(
  'https://your-supabase-url.supabase.co',  // Replace with your Supabase URL
  'your-supabase-anon-key'                  // Replace with your Supabase anon key
);

// Database schema should have:
// - programs table: id, name, description, highlights, selling_points, target_audience
// - generated_scripts table: id, program_id, reference_file_path, versions (JSON containing script versions)
