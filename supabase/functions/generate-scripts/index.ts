
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
    const requestBody = await req.json();
    console.log("Request received:", JSON.stringify(requestBody));
    
    const { analysis, programInfo } = requestBody;

    // Check for required fields with user-friendly messages
    if (!analysis) {
      return new Response(
        JSON.stringify({ error: "Missing analysis content" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!programInfo) {
      return new Response(
        JSON.stringify({ error: "Missing program information" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for API key with multiple fallback options
    // Try all possible case variations of the key name
    let apiKey = Deno.env.get('GEMINI_API_KEY') || 
                 Deno.env.get('Gemini_API_KEY') || 
                 Deno.env.get('GEMINI_API_key');
    
    if (!apiKey) {
      console.error("API key not found in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "API key not configured", 
          versions: [
            {
              length: "20",
              script: "This is a fallback script since the API key is not properly configured.",
              hooks: ["Fallback hook 1", "Fallback hook 2", "Fallback hook 3"]
            }
          ] 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("API key found, initializing Gemini...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.6,  // Lowered for more consistent outputs
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,  // Ensure we have enough tokens for the response
      }
    });

    // Create a more structured prompt with explicit JSON formatting instructions
    const prompt = `
    Create marketing video scripts for this program:
    
    ANALYSIS: ${analysis.substring(0, 3000)} 
    
    PROGRAM:
    Name: ${programInfo.name || 'Untitled Program'}
    Description: ${programInfo.description || 'No description provided'}
    Target Audience: ${programInfo.targetAudience || 'General audience'}
    
    Instructions:
    1. Generate THREE script versions of lengths 20, 30, and 45 seconds
    2. For each version, include 3 catchy hooks
    3. Format your response as a valid JSON object following this EXACT structure:
    {
      "versions": [
        {
          "length": "20",
          "script": "Script content here",
          "hooks": ["Hook 1", "Hook 2", "Hook 3"]
        },
        {
          "length": "30",
          "script": "Script content here",
          "hooks": ["Hook 1", "Hook 2", "Hook 3"]
        },
        {
          "length": "45",
          "script": "Script content here",
          "hooks": ["Hook 1", "Hook 2", "Hook 3"]
        }
      ]
    }
    
    IMPORTANT: Return ONLY valid, parseable JSON. Do not include any other text outside the JSON structure.`;

    console.log("Sending prompt to Gemini API...");
    
    try {
      const result = await model.generateContent(prompt);
      
      if (!result || !result.response) {
        console.error("Empty response from Gemini API");
        throw new Error("Empty response from AI provider");
      }
      
      const generatedText = result.response.text();
      console.log("Received response from Gemini, length:", generatedText.length);
      
      // Try to extract JSON from the response if it's wrapped in markdown or other text
      let jsonContent = generatedText;
      
      // Look for JSON content between triple backticks if present
      const jsonMatch = generatedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1].trim();
        console.log("Extracted JSON content from markdown code block");
      }
      
      // Parse JSON with error handling
      let parsedContent;
      try {
        parsedContent = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError.message);
        console.log("Problematic JSON content:", jsonContent);
        
        // Try to force a valid JSON structure for common AI response issues
        // This handles cases where the AI adds explanations before/after JSON
        try {
          // Look for content that starts with { and ends with }
          const jsonObjectMatch = jsonContent.match(/{[\s\S]*}/);
          if (jsonObjectMatch) {
            parsedContent = JSON.parse(jsonObjectMatch[0]);
            console.log("Extracted JSON object using regex");
          } else {
            throw new Error("Could not extract valid JSON");
          }
        } catch (secondError) {
          console.error("Second parse attempt failed:", secondError.message);
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      // Validate and normalize the response structure
      if (!parsedContent.versions || !Array.isArray(parsedContent.versions)) {
        console.error("Invalid response structure - missing versions array");
        throw new Error("Invalid response format from AI provider");
      }
      
      // Ensure each version has the required fields
      const formattedVersions = parsedContent.versions.map(version => ({
        length: (version.length || "20").toString(),
        script: version.script || "Script content unavailable",
        hooks: Array.isArray(version.hooks) ? 
          version.hooks.slice(0, 3) : 
          ["Hook 1", "Hook 2", "Hook 3"]
      }));
      
      // Ensure we have exactly three versions
      while (formattedVersions.length < 3) {
        const lengths = ["20", "30", "45"];
        formattedVersions.push({
          length: lengths[formattedVersions.length],
          script: "Generated script placeholder",
          hooks: ["Hook 1", "Hook 2", "Hook 3"]
        });
      }
      
      const finalResponse = {
        versions: formattedVersions.slice(0, 3)
      };
      
      console.log("Successfully processed response");
      
      return new Response(
        JSON.stringify(finalResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (aiError) {
      console.error("AI processing error:", aiError);
      
      // Provide a graceful fallback response
      const fallbackResponse = {
        versions: [
          {
            length: "20",
            script: "This is a fallback script due to an AI processing error.",
            hooks: ["Fallback hook 1", "Fallback hook 2", "Fallback hook 3"]
          },
          {
            length: "30",
            script: "This is a slightly longer fallback script due to an AI processing error.",
            hooks: ["Fallback hook 1", "Fallback hook 2", "Fallback hook 3"]
          },
          {
            length: "45",
            script: "This is the longest fallback script due to an AI processing error. Please try again with different content or contact support if this issue persists.",
            hooks: ["Fallback hook 1", "Fallback hook 2", "Fallback hook 3"]
          }
        ],
        error: aiError.message
      };
      
      return new Response(
        JSON.stringify(fallbackResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-scripts function:', error);
    
    // Enhanced error response with a valid structure that the frontend can handle
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate scripts',
        errorType: error.constructor.name,
        errorDetails: error.stack,
        versions: [
          {
            length: "20",
            script: "Error fallback script. Please try again.",
            hooks: ["Error occurred", "Please try again", "Contact support"]
          }
        ]
      }),
      { 
        status: 200,  // Return 200 so frontend doesn't completely break
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
