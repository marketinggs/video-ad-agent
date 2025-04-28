
import { ScriptVersion, GeneratedScripts } from "@/types/scriptTypes";

// API key should be stored in environment variables or Supabase Edge Functions
// For demo purposes, we'll use a placeholder
const API_KEY = "your-openai-api-key";

interface AnalyzeReferenceProps {
  referenceText: string;
  programInfo: {
    name: string;
    description: string;
    highlights: string[];
    sellingPoints: string[];
    targetAudience: string;
  };
  modelId: string;
}

export async function analyzeReferenceAndGenerateScripts({
  referenceText,
  programInfo,
  modelId
}: AnalyzeReferenceProps): Promise<GeneratedScripts> {
  try {
    // Choose the model based on selection
    const model = modelId === "chatgpt" ? "gpt-4o" : "claude-3-sonnet-20240229";
    
    // Create the prompt for the AI
    const prompt = `
      You are a video script expert. Analyze this reference script/transcript:
      
      ${referenceText}
      
      Now, create new video ad scripts for the following educational program:
      
      Program: ${programInfo.name}
      Description: ${programInfo.description}
      Highlights: ${programInfo.highlights.join(', ')}
      Selling Points: ${programInfo.sellingPoints.join(', ')}
      Target Audience: ${programInfo.targetAudience}
      
      Create 3 lengths of scripts with similar tone, style, and structure as the reference:
      1. 20-second version (approximately 40-50 words)
      2. 30-second version (approximately 70-85 words)
      3. 45-second version (approximately 110-130 words)
      
      For each script length, also provide 3 alternative hook options (attention-grabbing opening lines).
      
      Format your response as a JSON object with this structure:
      {
        "versions": [
          {
            "length": "20",
            "script": "Full script text here",
            "hooks": ["Hook option 1", "Hook option 2", "Hook option 3"]
          },
          // repeat for 30 and 45 second versions
        ]
      }
    `;

    // Call the OpenAI API or Claude API based on modelId
    if (modelId === "chatgpt") {
      // OpenAI API call
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: "You are a video script expert." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      // Parse the response to extract the JSON object
      const content = data.choices[0].message.content;
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse AI response");
      
      const scripts = JSON.parse(jsonMatch[0]) as GeneratedScripts;
      return scripts;
    } else {
      // Claude API call (similar to OpenAI but with Claude's endpoint)
      // In a real app, you'd implement the Claude API call here
      throw new Error("Claude API integration not implemented");
    }
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}
