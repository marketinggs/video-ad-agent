
import { ScriptVersion, GeneratedScripts } from "@/types/scriptTypes";
import { supabase } from "@/integrations/supabase/client";

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

    if (error) {
      console.error("Function invocation error:", error);
      throw new Error(error.message || 'Failed to generate scripts');
    }

    if (!data?.versions || !Array.isArray(data.versions)) {
      console.error("Invalid response structure:", data);
      throw new Error('Invalid response format from script generation');
    }

    // Validate and format the response
    const formattedVersions: ScriptVersion[] = data.versions.map(version => ({
      length: version.length as "20" | "30" | "45",
      script: version.script,
      hooks: Array.isArray(version.hooks) ? version.hooks : []
    }));

    return { versions: formattedVersions };
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}
