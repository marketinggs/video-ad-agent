
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { analyzeReferenceAndGenerateScripts } from "@/services/aiService";
import { Program, GeneratedScripts } from "@/types/scriptTypes";

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

  const handleGenerateScripts = async () => {
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

      // Call the AI service to analyze the reference and generate scripts
      const scripts = await analyzeReferenceAndGenerateScripts({
        referenceText,
        programInfo: {
          name: selectedProgram.name,
          description: selectedProgram.description,
          highlights: selectedProgram.highlights,
          sellingPoints: selectedProgram.sellingPoints,
          targetAudience: selectedProgram.targetAudience,
        },
        modelId,
      });

      // Pass the generated scripts to the parent component
      onScriptsGenerated(scripts);
      toast.success("Scripts generated successfully!");
    } catch (error: any) {
      console.error("Error generating scripts:", error);
      toast.error(`An error occurred: ${error.message || "Failed to generate scripts"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleGenerateScripts}
        disabled={isGenerating || !programId || !modelId || !referenceText}
        className="w-full bg-primary hover:bg-primary-600 text-white"
      >
        {isGenerating ? "Generating Scripts..." : "Generate Scripts"}
      </Button>
    </div>
  );
};

export default ScriptGenerator;
