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
  modelId,
}: AnalyzeReferenceProps): Promise<GeneratedScripts> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-scripts', {
      body: { 
        analysis: referenceText,
        programInfo
      }
    });

    if (error) throw error;

    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}
