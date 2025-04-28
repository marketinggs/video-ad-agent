
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

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
    const { analysis, programInfo } = await req.json();

    // Validate request data
    if (!analysis || !programInfo) {
      throw new Error('Missing required data: analysis and programInfo are required');
    }

    console.log('Generating scripts with data:', { analysis, programInfo });

    // Initialize Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate marketing video scripts based on this analysis: ${analysis}
                   Program Information:
                   Name: ${programInfo.name}
                   Description: ${programInfo.description}
                   Target Audience: ${programInfo.targetAudience}
                   
                   Generate three versions of different lengths with hooks.
                   Format your response as a JSON object with this exact structure:
                   {
                     "versions": [
                       {
                         "length": "20",
                         "script": "main script content",
                         "hooks": ["hook1", "hook2", "hook3"]
                       },
                       {
                         "length": "30",
                         "script": "main script content",
                         "hooks": ["hook1", "hook2", "hook3"]
                       },
                       {
                         "length": "45",
                         "script": "main script content",
                         "hooks": ["hook1", "hook2", "hook3"]
                       }
                     ]
                   }
                   
                   IMPORTANT: Return ONLY the JSON object. Do not include any additional text or explanation.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    // Parse the generated text as JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.log('Raw response:', generatedText);
      throw new Error('Failed to parse script data');
    }

    // Validate the structure matches our ScriptVersion type
    if (!Array.isArray(parsedContent?.versions)) {
      console.error('Invalid script format:', parsedContent);
      throw new Error('Invalid script format');
    }

    // Ensure each version has the required fields
    parsedContent.versions = parsedContent.versions.map(version => ({
      length: version.length,
      script: version.script,
      hooks: Array.isArray(version.hooks) ? version.hooks.slice(0, 3) : []
    }));

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-scripts function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate scripts',
        details: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
