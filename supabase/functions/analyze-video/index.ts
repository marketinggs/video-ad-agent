
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    
    // Initialize Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error("Gemini API key is not configured");
      return new Response(
        JSON.stringify({ 
          error: "API key not configured", 
          usingFallback: true,
          analysis: "This is a fallback analysis since the Gemini API key is not configured. Please contact support to enable advanced video analysis."
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    console.log("Analyzing video content with Gemini API");
    
    // Analyze video content
    try {
      const result = await model.generateContent([
        "Analyze this video content and provide a detailed description including: main topics, key points, tone, style, and target audience. Format the response in a way that can be used to generate marketing scripts.",
        {
          inlineData: {
            mimeType: "video/mp4",
            data: videoUrl
          }
        }
      ]);

      const analysis = result.response.text();
      console.log("Analysis complete, length:", analysis.length);

      return new Response(
        JSON.stringify({ analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error("Gemini API error:", apiError);
      
      // Fallback response for testing when video analysis fails
      const fallbackAnalysis = 
        "This is a fallback analysis. The video appears to be a marketing presentation " +
        "focused on product features and benefits. The tone is professional and informative, " +
        "targeting business professionals. The content highlights key selling points including " +
        "product quality, ease of use, and value proposition. The video uses a combination of " +
        "direct presentation and testimonials to build credibility.";
      
      console.log("Returning fallback analysis due to API error");
      
      return new Response(
        JSON.stringify({ 
          analysis: fallbackAnalysis,
          error: apiError.message,
          usingFallback: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in analyze-video function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        usingFallback: true,
        analysis: "There was an error processing your video. Here's a generic analysis you can use as a placeholder until the issue is resolved."
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
