
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { demoGeneratedScripts } from "@/data/demoData";

interface ScriptGeneratorProps {
  programId: string | null;
  modelId: string | null;
  fileUploaded: boolean;
  onScriptsGenerated: (scripts: any) => void;
}

const ScriptGenerator = ({ 
  programId, 
  modelId, 
  fileUploaded,
  onScriptsGenerated 
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

    if (!fileUploaded) {
      toast.error("Please upload a reference file");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 2500));
      
      // In a real application, we would call an API here
      // For demo purposes, we're using mock data
      const scripts = demoGeneratedScripts[programId];
      
      if (scripts) {
        onScriptsGenerated(scripts);
        toast.success("Scripts generated successfully!");
      } else {
        toast.error("Failed to generate scripts for this program");
      }
    } catch (error) {
      console.error("Error generating scripts:", error);
      toast.error("An error occurred while generating scripts");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      <Button 
        onClick={handleGenerateScripts} 
        disabled={isGenerating || !programId || !modelId || !fileUploaded}
        className="w-full bg-primary hover:bg-primary-600 text-white"
      >
        {isGenerating ? "Generating Scripts..." : "Generate Scripts"}
      </Button>
    </div>
  );
};

export default ScriptGenerator;
