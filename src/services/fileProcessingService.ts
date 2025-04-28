
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

/**
 * Maximum allowed file size for video uploads (100MB)
 */
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Uploads a file to Supabase storage and returns the file path
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    // Check file size for videos
    if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE) {
      throw new Error(`Video file too large. Maximum size is ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`);
    }

    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    // Use different buckets based on file type
    const bucketName = file.type.startsWith('video/') ? 'video-references' : 'reference-materials';
    const filePath = `uploads/${fileName}`;
    
    // Upload the file to Supabase storage
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
    
    if (error) throw error;
    
    // Return the file path with bucket information for easy reference
    return `${bucketName}:${filePath}`;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}

/**
 * Gets a public URL for a file in Supabase storage
 */
export function getFileUrl(filePathWithBucket: string): string {
  const [bucketName, filePath] = filePathWithBucket.split(':');
  
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * Analyzes a video file using the analyze-video edge function
 * @param filePath The file path in storage
 * @param isDetailedAnalysis Whether to perform a detailed analysis
 * @returns The analysis text
 */
export async function analyzeVideo(filePath: string): Promise<string> {
  try {
    // Get the public URL for the video
    const videoUrl = getFileUrl(filePath);
    
    toast.info("Analyzing video content. This may take a moment...");
    
    // Call the analyze-video edge function
    const { data, error } = await supabase.functions.invoke('analyze-video', {
      body: { videoUrl }
    });
    
    if (error) throw error;
    
    if (data.usingFallback) {
      toast.warning("Using fallback analysis. The video may be in an unsupported format or too large.");
    }
    
    // Store the analysis in the database
    await storeVideoAnalysis(filePath, data.analysis);
    
    return data.analysis;
  } catch (error) {
    console.error("Video analysis error:", error);
    toast.error(`Analysis failed: ${error.message || "Unknown error"}`);
    throw error;
  }
}

/**
 * Stores video analysis in the database
 */
async function storeVideoAnalysis(videoPath: string, analysisText: string): Promise<void> {
  const { error } = await supabase
    .from('video_analyses')
    .insert({
      video_path: videoPath,
      analysis_text: analysisText,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });
  
  if (error) {
    console.error("Error storing video analysis:", error);
  }
}

/**
 * Extracts text content from a file
 */
export async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (file.type === 'text/plain') {
      // Read text file
      return await file.text();
    } else if (file.name.endsWith('.docx')) {
      // In a real app, you'd use a library like mammoth.js to extract text from docx
      // For now, we'll simulate it
      return "This is simulated text extracted from a DOCX file. In a real application, you would use a library like mammoth.js to extract the actual text content.";
    } else if (file.type.startsWith('video/')) {
      // For video files, upload and analyze
      const filePath = await uploadFile(file);
      // Return the analysis from the video
      return await analyzeVideo(filePath);
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  } catch (error) {
    console.error("Text extraction error:", error);
    throw error;
  }
}
