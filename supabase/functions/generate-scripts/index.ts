
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis, programInfo } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a video script writer. Generate engaging marketing scripts in JSON format with the following structure:
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
            }`
          },
          {
            role: 'user',
            content: `Create marketing scripts based on this video analysis: ${analysis}
                     Program Information:
                     Name: ${programInfo.name}
                     Description: ${programInfo.description}
                     Target Audience: ${programInfo.targetAudience}
                     Generate three versions: 20 seconds, 30 seconds, and 45 seconds.
                     Include 3 different hook options for each version.
                     IMPORTANT: Return ONLY the JSON object with no additional text or explanation.`
          }
        ]
      })
    });

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse script data');
    }

    // Validate the structure matches our ScriptVersion type
    if (!Array.isArray(parsedContent?.versions)) {
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
        error: 'Failed to generate scripts',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
