
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { analyzeReferenceAndGenerateScripts } from "@/services/aiService";
import { Program, GeneratedScripts } from "@/types/scriptTypes";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScriptGeneratorProps {
  programId: string | null;
  modelId: string | null;
  referenceText: string | null;
  programs: Program[];
  onScriptsGenerated: (scripts: GeneratedScripts) => void;
}

const ScriptGenerator = ({
  programId,
  modelId,
  referenceText,
  programs,
  onScriptsGenerated,
}: ScriptGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateScripts = async () => {
    // Reset previous errors
    setError(null);
    
    // Validate inputs
    if (!programId) {
      toast.error("Please select a program");
      return;
    }

    if (!modelId) {
      toast.error("Please select an AI model");
      return;
    }

    if (!referenceText) {
      toast.error("Please upload a reference file");
      return;
    }

    setIsGenerating(true);

    try {
      // Find the selected program
      const selectedProgram = programs.find((p) => p.id === programId);

      if (!selectedProgram) {
        throw new Error("Selected program not found");
      }

      console.log("Starting script generation with program:", selectedProgram.name);
      
      // Ensure all required fields are present
      const programInfo = {
        name: selectedProgram.name,
        description: selectedProgram.description || "No description provided",
        highlights: selectedProgram.highlights || [],
        sellingPoints: selectedProgram.sellingPoints || [],
        targetAudience: selectedProgram.targetAudience || "General audience",
      };

      // Call the AI service to analyze the reference and generate scripts
      const scripts = await analyzeReferenceAndGenerateScripts({
        referenceText,
        programInfo,
        modelId,
      });

      // Pass the generated scripts to the parent component
      onScriptsGenerated(scripts);
      toast.success("Scripts generated successfully!");
    } catch (error: any) {
      console.error("Error generating scripts:", error);
      
      // Set error state and display error message
      setError(error.message || "Failed to generate scripts");
      
      // Show different toast based on error message
      if (error.message.includes("Edge Function")) {
        toast.error("Server error: The script generation service is currently unavailable. Please try again later.");
      } else {
        toast.error(`An error occurred: ${error.message || "Failed to generate scripts"}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive" className="text-sm">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={handleGenerateScripts}
        disabled={isGenerating || !programId || !modelId || !referenceText}
        className="w-full bg-primary hover:bg-primary-600 text-white"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Scripts...
          </>
        ) : (
          "Generate Scripts"
        )}
      </Button>
      
      {isGenerating && (
        <p className="text-xs text-center text-muted-foreground">
          This may take up to 30 seconds depending on the content length
        </p>
      )}
    </div>
  );
};

export default ScriptGenerator;
