import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maximum video size (50MB for Gemini's limit)
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const DETAILED_ANALYSIS_PROMPT = `
Analyze the following video advertisement in depth. Provide insights on the following aspects:

Visual Elements: Describe the key visual components of the ad, such as color schemes, camera angles, lighting, and overall cinematography. How do these elements contribute to the ad's message and mood?

Messaging: What is the core message of the ad? How is this message communicated through both visuals and spoken words (if applicable)? Discuss how the visuals complement the spoken or written elements.

Symbolism and Imagery: Identify any symbolic imagery used in the ad. What do these symbols represent, and how do they enhance the emotional or persuasive impact of the ad?

Pacing and Editing: Discuss the pacing and editing style. How do these aspects affect the overall flow of the ad, and how do they influence the viewer's engagement or emotional response?

Target Audience Appeal: Analyze how the visuals, messaging, and overall style of the ad appeal to its intended audience. What techniques or visual cues are used to attract and resonate with the viewer?

Call to Action and Persuasion: Evaluate the effectiveness of the ad's call to action. How is it presented, and does it compel the viewer to take the desired action?

Overall Impact: Assess the overall effectiveness of the ad in conveying its message, creating an emotional connection, and achieving its purpose (e.g., brand awareness, product promotion).

Format your response with clear section headers for each aspect.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl } = await req.json();
    
    if (!videoUrl) {
      throw new Error("No video URL provided");
    }
    
    console.log("Processing video:", videoUrl);

    // Fetch video data
    console.log("Fetching video data...");
    const videoResponse = await fetch(videoUrl);
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }

    const videoData = await videoResponse.arrayBuffer();
    console.log("Video size:", videoData.byteLength, "bytes");

    // Check video size
    if (videoData.byteLength > MAX_VIDEO_SIZE) {
      throw new Error(`Video file too large. Maximum size is ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`);
    }

    // Convert to base64
    const base64Video = btoa(String.fromCharCode(...new Uint8Array(videoData)));
    console.log("Video converted to base64");

    // Initialize Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error("Gemini API key is not configured");
      throw new Error("API key not configured");
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    console.log("Analyzing video content with Gemini API");
    
    // Analyze video content
    const result = await model.generateContent([
      DETAILED_ANALYSIS_PROMPT,
      {
        inlineData: {
          mimeType: "video/mp4",
          data: base64Video
        }
      }
    ]);

    const analysis = result.response.text();
    console.log("Analysis complete, length:", analysis.length);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-video function:', error);
    
    // Return fallback analysis with specific error information
    return new Response(
      JSON.stringify({ 
        error: error.message,
        usingFallback: true,
        analysis: generateFallbackAnalysis(),
        details: {
          message: error.message,
          type: error.name,
          stack: error.stack
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to generate a structured fallback analysis
function generateFallbackAnalysis() {
  return `
# Video Analysis

## Visual Elements
The video appears to use a professional color palette with balanced lighting and a mix of medium and close-up shots. The cinematography creates a polished, trustworthy atmosphere that enhances the brand's professional image.

## Messaging
The core message appears focused on product benefits and value proposition, presented through a combination of visual demonstrations and explanatory narration that reinforce the key selling points.

## Symbolism and Imagery
The imagery likely uses common symbols of success, quality, or innovation that resonate with viewers and create positive associations with the brand or product.

## Pacing and Editing
The editing maintains a balanced pace that keeps viewer engagement while allowing enough time for key points to register. Transitions appear to be smooth, creating a cohesive viewing experience.

## Target Audience Appeal
The visual style and presentation suggest targeting a specific demographic through relatable scenarios and pain points addressed by the product/service.

## Call to Action and Persuasion
The video likely concludes with a clear call to action that builds on the established value proposition, making next steps obvious for interested viewers.

## Overall Impact
This appears to be an effective advertisement that balances emotional appeal with practical information, likely achieving its marketing objectives.

*Note: This is a fallback analysis since the video couldn't be analyzed automatically. For more accurate insights, please try again with a different video format or contact support.*
`;
}
