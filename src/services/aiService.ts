
import { ScriptVersion, GeneratedScripts } from "@/types/scriptTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

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
    console.log("Invoking generate-scripts function with:", {
      textLength: referenceText.length,
      modelId,
      programName: programInfo.name
    });

    // Make sure required fields are present
    if (!programInfo.targetAudience) {
      programInfo.targetAudience = "General audience"; // Set default
    }

    // Call the edge function with improved error handling
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

    console.log("Edge function response:", data);

    // Check if data contains an error property but still has versions
    if (data?.error && data?.versions) {
      console.warn("Edge function returned an error but also provided fallback versions:", data.error);
      toast.warning(`Note: ${data.error}. Using fallback scripts.`);
      
      // Continue with the fallback versions
      const formattedVersions: ScriptVersion[] = data.versions.map(version => ({
        length: version.length as "20" | "30" | "45",
        script: version.script,
        hooks: Array.isArray(version.hooks) ? version.hooks : []
      }));

      return { versions: formattedVersions };
    }

    // Check for error without versions
    if (data?.error && !data?.versions) {
      console.error("Edge function returned an error with no fallback versions:", data.error);
      throw new Error(data.error || 'Error generating scripts');
    }

    // Validate response structure
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
