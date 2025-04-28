
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase URL and admin key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    // Create a Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check and create buckets if they don't exist
    const buckets = ['reference-materials', 'video-references'];
    
    for (const bucketName of buckets) {
      try {
        // Check if bucket exists
        const { data: existingBucket, error: getBucketError } = await supabase
          .storage
          .getBucket(bucketName);
          
        if (getBucketError && getBucketError.message !== 'Bucket not found') {
          console.error(`Error checking bucket ${bucketName}:`, getBucketError);
        }
        
        // Create bucket if it doesn't exist
        if (!existingBucket) {
          console.log(`Creating bucket: ${bucketName}`);
          
          const { error: createBucketError } = await supabase
            .storage
            .createBucket(bucketName, {
              public: true,
              fileSizeLimit: bucketName === 'video-references' ? 104857600 : 10485760, // 100MB for video, 10MB for others
              allowedMimeTypes: bucketName === 'video-references' 
                ? ['video/mp4', 'video/webm', 'video/quicktime'] 
                : ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            });
          
          if (createBucketError) {
            // If the error is about the bucket already existing, that's fine
            if (createBucketError.message?.includes('already exists')) {
              console.log(`Bucket ${bucketName} already exists`);
            } else {
              console.error(`Error creating bucket ${bucketName}:`, createBucketError);
            }
          } else {
            console.log(`Created bucket: ${bucketName}`);
          }
        } else {
          console.log(`Bucket ${bucketName} already exists`);
        }
      } catch (bucketError) {
        console.error(`Error processing bucket ${bucketName}:`, bucketError);
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Storage buckets verified' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating storage buckets:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to create or verify storage buckets' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
