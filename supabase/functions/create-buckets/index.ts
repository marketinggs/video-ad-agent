
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create the video-references bucket if it doesn't exist
    const { data: videoBucketData, error: videoBucketError } = await supabaseAdmin
      .storage
      .createBucket('video-references', {
        public: true,
        fileSizeLimit: 104857600, // 100MB
        allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime']
      });
    
    // Create the reference-materials bucket if it doesn't exist
    const { data: refBucketData, error: refBucketError } = await supabaseAdmin
      .storage
      .createBucket('reference-materials', {
        public: true,
        fileSizeLimit: 20971520, // 20MB
        allowedMimeTypes: ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      });

    // Check for errors
    if (videoBucketError && !videoBucketError.message.includes('already exists')) {
      throw videoBucketError;
    }
    
    if (refBucketError && !refBucketError.message.includes('already exists')) {
      throw refBucketError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Storage buckets created or verified",
        videoBucket: videoBucketData || "already exists",
        refBucket: refBucketData || "already exists"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-buckets function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
