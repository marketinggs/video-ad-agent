
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

    // Enhanced input validation with detailed error messages
    if (!analysis || typeof analysis !== 'string') {
      throw new Error('Invalid analysis: must be a non-empty string');
    }

    if (!programInfo || typeof programInfo !== 'object') {
      throw new Error('Invalid programInfo: must be an object with required fields');
    }

    const requiredFields = ['name', 'description', 'targetAudience'];
    for (const field of requiredFields) {
      if (!programInfo[field]) {
        throw new Error(`Missing required field in programInfo: ${field}`);
      }
    }

    console.log('Input validation passed, generating scripts with data:', {
      analysisLength: analysis.length,
      programName: programInfo.name
    });

    // Initialize Gemini with proper error handling
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Gemini API key not configured in environment');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });

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
                   
                   IMPORTANT: Return ONLY the JSON object. Do not include any additional text.`;

    console.log('Calling Gemini API for content generation');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    console.log('Received response from Gemini, parsing content');

    // Parse and validate the generated content
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.log('Raw response:', generatedText);
      throw new Error('Failed to parse generated content as JSON');
    }

    // Validate response structure
    if (!parsedContent?.versions || !Array.isArray(parsedContent.versions)) {
      console.error('Invalid response structure:', parsedContent);
      throw new Error('Invalid script format: missing versions array');
    }

    // Ensure each version has the required fields and format
    parsedContent.versions = parsedContent.versions.map(version => {
      if (!version.length || !version.script || !Array.isArray(version.hooks)) {
        console.error('Invalid version structure:', version);
        throw new Error('Invalid version format: missing required fields');
      }

      return {
        length: version.length.toString(),
        script: version.script,
        hooks: Array.isArray(version.hooks) ? version.hooks.slice(0, 3) : []
      };
    });

    console.log('Successfully generated and validated scripts');

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-scripts function:', error);
    
    // Enhanced error response with more details
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate scripts',
        type: error.constructor.name,
        details: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

